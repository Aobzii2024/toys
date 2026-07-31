package com.ctrlai.app.webrtc

import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.util.Log
import com.ctrlai.app.capture.ProjectionService
import kotlinx.coroutines.CompletableDeferred
import org.webrtc.AudioSource
import org.webrtc.AudioTrack
import org.webrtc.DataChannel
import org.webrtc.EglBase
import org.webrtc.IceCandidate
import org.webrtc.MediaConstraints
import org.webrtc.MediaStreamTrack
import org.webrtc.PeerConnection
import org.webrtc.PeerConnectionFactory
import org.webrtc.ScreenCapturerAndroid
import org.webrtc.SessionDescription
import org.webrtc.SurfaceTextureHelper
import org.webrtc.VideoTrack

/**
 * WebRTC 会话管理器。负责 PeerConnection 生命周期、屏幕采集、DataChannel。
 * 被控端 startCaptureAndOffer，控制端 createAnswer。
 */
class PeerConnectionManager(
    private val context: Context,
    private val eglBase: EglBase,
) {
    companion object {
        private const val TAG = "PeerConnectionManager"
        private const val MAX_BITRATE_BPS = 3_000_000
    }

    private lateinit var factory: PeerConnectionFactory
    var peerConnection: PeerConnection? = null
        private set

    var dataChannel: DataChannel? = null
        private set

    private var capturer: ScreenCapturerAndroid? = null
    private var videoSource: org.webrtc.VideoSource? = null
    private var audioSource: AudioSource? = null
    private var projectionIntent: Intent? = null

    /** 收到远程 DataChannel 消息的回调 */
    var onDataMessage: ((String) -> Unit)? = null
    var onIceCandidate: ((IceCandidate) -> Unit)? = null
    var onConnectionStateChange: ((PeerConnection.IceConnectionState) -> Unit)? = null
    var onRemoteStreamReady: ((VideoTrack) -> Unit)? = null
    var onLocalStreamReady: ((VideoTrack) -> Unit)? = null

    fun initialize() {
        factory = PeerConnectionFactory.builder().createPeerConnectionFactory()
    }

    fun setProjectionResult(resultCode: Int, data: Intent?) {
        projectionIntent = Intent(data).apply {
            action = ProjectionService.ACTION_SETUP
            putExtra(ProjectionService.EXTRA_RESULT_CODE, resultCode)
            putExtra(ProjectionService.EXTRA_RESULT_DATA, data)
        }
    }

    private fun ensureProjectionActive(): Pair<MediaProjection, MediaProjectionManager> {
        val mpm = context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        val intent = projectionIntent ?: throw IllegalStateException("缺少屏幕采集授权")
        val projection = mpm.getMediaProjection(
            intent.getIntExtra(ProjectionService.EXTRA_RESULT_CODE, 0),
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra(ProjectionService.EXTRA_RESULT_DATA)!!
            } else {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra(ProjectionService.EXTRA_RESULT_DATA)
            },
        )
        return projection to mpm
    }

    private fun createPeerConnection(): PeerConnection {
        val config = org.webrtc.PeerConnection.RTCConfiguration(emptyList())
        config.iceServers = listOf(
            org.webrtc.IceServer.builder("stun:stun.l.google.com:19302").createIceServer(),
        )
        val constraints = MediaConstraints()
        return factory.createPeerConnection(config, constraints, observer())!!
    }

    private fun observer(): PeerConnection.Observer {
        return object : PeerConnection.Observer {
            override fun onIceCandidate(candidate: IceCandidate) {
                onIceCandidate?.invoke(candidate)
            }

            override fun onIceConnectionChange(state: PeerConnection.IceConnectionState) {
                onConnectionStateChange?.invoke(state)
            }

            override fun onAddTrack(receiver: org.webrtc.RtpReceiver, streams: MutableList<MediaStream>) {
                val video = receiver.track() as? VideoTrack
                video?.let { onRemoteStreamReady?.invoke(it) }
            }

            override fun onDataChannel(channel: DataChannel) {
                Log.d(TAG, "onDataChannel")
                channel.registerObserver(channelObserver(channel))
                dataChannel = channel
            }

            override fun onSignalingChange(state: PeerConnection.SignalingState) {}
            override fun onIceGatheringChange(state: PeerConnection.IceGatheringState) {}
            override fun onIceConnectionReceivingChange(receiving: Boolean) {}
            override fun onRemoveStream(stream: MediaStream) {}
            override fun onRenegotiationNeeded() {}
            override fun onAddStream(stream: MediaStream) {}
        }
    }

    private fun channelObserver(channel: DataChannel): DataChannel.Observer {
        return object : DataChannel.Observer {
            override fun onBufferedAmountChange(previousAmount: Long) {}

            override fun onStateChange() {}

            override fun onMessage(buffer: DataChannel.Buffer) {
                if (buffer.data.remaining() > 0) {
                    val bytes = ByteArray(buffer.data.remaining())
                    buffer.data.get(bytes)
                    onDataMessage?.invoke(String(bytes, Charsets.UTF_8))
                }
            }
        }
    }

    /** 被控端：开始屏幕采集并添加媒体轨道 */
    fun startScreenCaptureAndAddTracks(): VideoTrack {
        val (projection, _) = ensureProjectionActive()
        val pc = peerConnection ?: createPeerConnection().also { peerConnection = it }

        videoSource = factory.createVideoSource(false)
        capturer = ScreenCapturerAndroid(projection, object : MediaProjection.Callback() {
            override fun onStop() {
                Log.d(TAG, "projection stopped")
            }
        })
        capturer!!.initialize(SurfaceTextureHelper.create("ScreenCapturerThread", eglBase.eglBaseContext), context)
        capturer!!.startCapture(1280, 720, 30)
        val videoTrack = factory.createVideoTrack("screen", videoSource!!)
        pc.addTrack(videoTrack, emptyList())

        audioSource = factory.createAudioSource(MediaConstraints())
        val audioTrack = factory.createAudioTrack("audio", audioSource!!)
        pc.addTrack(audioTrack, emptyList())

        onLocalStreamReady?.invoke(videoTrack)
        return videoTrack
    }

    /** 创建 DataChannel */
    fun createDataChannel(label: String): DataChannel {
        val pc = peerConnection ?: throw IllegalStateException("PeerConnection 未初始化")
        val init = DataChannel.Init()
        init.ordered = true
        init.id = 1
        val channel = pc.createDataChannel(label, init)
        channel.registerObserver(channelObserver(channel))
        dataChannel = channel
        return channel
    }

    fun setLocalDescription(sdp: SessionDescription): CompletableDeferred<Unit> {
        val result = CompletableDeferred<Unit>()
        peerConnection?.setLocalDescription(object : org.webrtc.SdpObserver {
            override fun onCreateSuccess(desc: SessionDescription) {}
            override fun onSetSuccess() {
                result.complete(Unit)
            }

            override fun onCreateFailure(error: String) {
                result.completeExceptionally(IllegalStateException(error))
            }

            override fun onSetFailure(error: String) {
                result.completeExceptionally(IllegalStateException(error))
            }
        }, sdp)
        return result
    }

    fun setRemoteDescription(sdp: SessionDescription): CompletableDeferred<Unit> {
        val result = CompletableDeferred<Unit>()
        peerConnection?.setRemoteDescription(object : org.webrtc.SdpObserver {
            override fun onCreateSuccess(desc: SessionDescription) {}
            override fun onSetSuccess() {
                result.complete(Unit)
            }

            override fun onCreateFailure(error: String) {}
            override fun onSetFailure(error: String) {
                result.completeExceptionally(IllegalStateException(error))
            }
        }, sdp)
        return result
    }

    fun createOffer(): CompletableDeferred<SessionDescription> {
        val result = CompletableDeferred<SessionDescription>()
        peerConnection?.createOffer(object : org.webrtc.SdpObserver {
            override fun onCreateSuccess(desc: SessionDescription) {
                result.complete(desc)
            }

            override fun onSetSuccess() {}

            override fun onCreateFailure(error: String) {
                result.completeExceptionally(IllegalStateException(error))
            }

            override fun onSetFailure(error: String) {}
        }, MediaConstraints())
        return result
    }

    fun createAnswer(): CompletableDeferred<SessionDescription> {
        val result = CompletableDeferred<SessionDescription>()
        peerConnection?.createAnswer(object : org.webrtc.SdpObserver {
            override fun onCreateSuccess(desc: SessionDescription) {
                result.complete(desc)
            }

            override fun onSetSuccess() {}

            override fun onCreateFailure(error: String) {
                result.completeExceptionally(IllegalStateException(error))
            }

            override fun onSetFailure(error: String) {}
        }, MediaConstraints())
        return result
    }

    fun addIceCandidate(candidate: IceCandidate) {
        peerConnection?.addIceCandidate(candidate)
    }

    fun sendData(text: String) {
        val channel = dataChannel ?: return
        val buffer = DataChannel.Buffer(
            java.nio.ByteBuffer.wrap(text.toByteArray(Charsets.UTF_8)),
            false,
        )
        channel.send(buffer)
    }

    fun dispose() {
        dataChannel?.close()
        dataChannel = null
        capturer?.stopCapture()
        capturer?.dispose()
        capturer = null
        videoSource?.dispose()
        videoSource = null
        audioSource?.dispose()
        audioSource = null
        peerConnection?.close()
        peerConnection = null
    }
}
