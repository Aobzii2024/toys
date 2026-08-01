package com.ctrlai.app.ui

import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Base64
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ctrlai.app.input.RemoteAccessibilityService
import com.ctrlai.app.pairing.PairingCode
import com.ctrlai.app.signaling.IceCandidateCodec
import com.ctrlai.app.signaling.LocalSessionAdvertiser
import com.ctrlai.app.signaling.LocalSessionDiscovery
import com.ctrlai.app.signaling.LocalSignalingServer
import com.ctrlai.app.signaling.SignalingClient
import com.ctrlai.app.signaling.SignalingEvent
import com.ctrlai.app.signaling.SignalingMessage
import com.ctrlai.app.webrtc.PeerConnectionManager
import com.ctrlai.app.webrtc.RemoteInputEvent
import com.ctrlai.app.webrtc.RemoteProtocol
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import org.webrtc.EglBase
import org.webrtc.PeerConnection
import org.webrtc.SessionDescription
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.UUID

/**
 * 主流程 ViewModel。管理模式切换、配对连接与会话状态。
 */
class MainViewModel : ViewModel() {

    companion object {
        private const val TAG = "MainViewModel"
        private const val LOCAL_SIGNALING_PORT = 39271
        private const val DISCOVERY_TIMEOUT_MS = 10_000L
        private const val FILE_CHUNK_SIZE = 24 * 1024
    }

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    private var signalingClient: SignalingClient? = null
    private var localSignalingClient: SignalingClient? = null
    private var relaySignalingClient: SignalingClient? = null
    private var localServer: LocalSignalingServer? = null
    private var advertiser: LocalSessionAdvertiser? = null
    private var peerManager: PeerConnectionManager? = null
    private val eglBase: EglBase = EglBase.create()
    private var context: Context? = null
    private var pendingPairCode: String? = null
    private var currentRole: String? = null
    private var projectionGranted = false
    private var webRtcStarted = false
    private val incomingTransfers = mutableMapOf<String, IncomingTransfer>()

    fun attachContext(context: Context) {
        if (this.context == null) {
            this.context = context.applicationContext
        }
    }

    fun startControlling() {
        currentRole = "controller"
        _uiState.update {
            it.copy(
                isControlling = true,
                isControlled = false,
                connectionState = ConnectionState.Idle,
                errorMessage = null,
            )
        }
    }

    fun updateRelayConfig(signalingUrl: String, turnUrl: String, turnUsername: String, turnPassword: String) {
        _uiState.update {
            it.copy(
                relaySignalingUrl = signalingUrl.trim(),
                turnServerUrl = turnUrl.trim(),
                turnUsername = turnUsername.trim(),
                turnPassword = turnPassword,
            )
        }
    }

    fun startBeingControlled() {
        val appContext = context ?: return
        currentRole = "controlled"
        val pairCode = PairingCode.generate()
        ensurePeerManager()
        _uiState.update {
            it.copy(
                isControlling = false,
                isControlled = true,
                connectionState = ConnectionState.Idle,
                pairCode = pairCode,
                errorMessage = null,
            )
        }
        localServer?.stop()
        localServer = LocalSignalingServer(LOCAL_SIGNALING_PORT, pairCode).also { it.start() }
        advertiser = LocalSessionAdvertiser(appContext).also { it.start(pairCode, LOCAL_SIGNALING_PORT) }
        localSignalingClient = connectSignaling(
            role = "controlled",
            serverUrl = "ws://127.0.0.1:$LOCAL_SIGNALING_PORT/ws",
            pairCode = pairCode,
            replaceActive = true,
        )
        relaySignalingClient = connectSignaling(
            role = "controlled",
            serverUrl = _uiState.value.relaySignalingUrl,
            pairCode = pairCode,
            replaceActive = false,
        )
    }

    fun connect(pairCode: String) {
        if (!PairingCode.isValid(pairCode)) {
            _uiState.update { it.copy(errorMessage = "请输入 6 位数字配对码") }
            return
        }
        _uiState.update { it.copy(connectionState = ConnectionState.Connecting, errorMessage = null) }
        viewModelScope.launch {
            val appContext = context ?: return@launch
            val localUrl = withTimeoutOrNull(DISCOVERY_TIMEOUT_MS) {
                LocalSessionDiscovery(appContext).find(pairCode)
            }.orEmpty()
            val serverUrl = localUrl.ifBlank { _uiState.value.relaySignalingUrl }
            if (serverUrl.isBlank()) {
                _uiState.update {
                    it.copy(
                        connectionState = ConnectionState.Failed,
                        errorMessage = "未发现对应设备，请确认两台手机在同一网络且被控端正在显示配对码",
                    )
                }
                return@launch
            }
            pendingPairCode = pairCode
            connectSignaling(role = "controller", serverUrl = serverUrl, replaceActive = true)
        }
    }

    fun stopControlling() {
        viewModelScope.launch {
            sendDisconnectToAllClients()
        }
        pendingPairCode = null
        teardownWebRtc()
        _uiState.update { it.copy(isControlling = false, connectionState = ConnectionState.Idle) }
    }

    fun stopBeingControlled() {
        viewModelScope.launch {
            sendDisconnectToAllClients()
        }
        stopLocalSession()
        teardownWebRtc()
        _uiState.update { it.copy(isControlled = false, connectionState = ConnectionState.Idle) }
    }

    fun resetControllerConnection() {
        pendingPairCode = null
        _uiState.update { it.copy(connectionState = ConnectionState.Idle, errorMessage = null) }
    }

    /** 屏幕录制授权结果透传，联调时交由 PeerConnectionManager 处理。 */
    fun onProjectionGranted(resultCode: Int, data: Intent) {
        Log.d(TAG, "projection granted: $resultCode")
        projectionGranted = true
        ensurePeerManager().setProjectionResult(resultCode, data)
        maybeStartControlledSession()
    }

    fun toggleFullScreen() {
        _uiState.update { it.copy(isFullScreenMode = !it.isFullScreenMode) }
    }

    fun sendControllerTap(x: Float, y: Float) {
        sendRemoteEvent(RemoteInputEvent(type = RemoteProtocol.TYPE_TOUCH, x = x, y = y))
    }

    fun sendControllerSwipe(fromX: Float, fromY: Float, toX: Float, toY: Float, durationMs: Long) {
        sendRemoteEvent(
            RemoteInputEvent(
                type = RemoteProtocol.TYPE_SWIPE,
                x = fromX,
                y = fromY,
                toX = toX,
                toY = toY,
                durationMs = durationMs,
            ),
        )
    }

    fun sendControllerKey(keyCode: Int) {
        sendRemoteEvent(RemoteInputEvent(type = RemoteProtocol.TYPE_KEY, keyCode = keyCode))
    }

    fun sendControllerClipboard(text: String) {
        sendRemoteEvent(RemoteInputEvent(type = RemoteProtocol.TYPE_CLIPBOARD, text = text))
    }

    fun sendControllerFile(uri: Uri) {
        val appContext = context ?: return
        viewModelScope.launch {
            try {
                val resolver = appContext.contentResolver
                val payload = withContext(Dispatchers.IO) {
                    val bytes = resolver.openInputStream(uri)?.use { it.readBytes() }
                        ?: throw IllegalStateException("无法读取所选文件")
                    val name = queryDisplayName(resolver, uri) ?: "transfer.bin"
                    FilePayload(name = name, mimeType = resolver.getType(uri), bytes = bytes)
                }
                val transferId = UUID.randomUUID().toString()
                val totalChunks = (payload.bytes.size + FILE_CHUNK_SIZE - 1) / FILE_CHUNK_SIZE
                sendRemoteEvent(
                    RemoteInputEvent(
                        type = RemoteProtocol.TYPE_FILE_START,
                        transferId = transferId,
                        fileName = payload.name,
                        mimeType = payload.mimeType,
                        size = payload.bytes.size.toLong(),
                        totalChunks = totalChunks,
                    ),
                )
                var chunkIndex = 0
                var offset = 0
                while (offset < payload.bytes.size) {
                    val end = (offset + FILE_CHUNK_SIZE).coerceAtMost(payload.bytes.size)
                    val chunk = payload.bytes.copyOfRange(offset, end)
                    sendRemoteEvent(
                        RemoteInputEvent(
                            type = RemoteProtocol.TYPE_FILE_CHUNK,
                            transferId = transferId,
                            fileName = payload.name,
                            mimeType = payload.mimeType,
                            chunkIndex = chunkIndex,
                            totalChunks = totalChunks,
                            dataBase64 = Base64.encodeToString(chunk, Base64.NO_WRAP),
                        ),
                    )
                    chunkIndex += 1
                    offset = end
                }
                sendRemoteEvent(
                    RemoteInputEvent(
                        type = RemoteProtocol.TYPE_FILE_END,
                        transferId = transferId,
                        fileName = payload.name,
                        totalChunks = totalChunks,
                    ),
                )
                _uiState.update { it.copy(transferStatus = "已发送 ${payload.name}") }
            } catch (e: Exception) {
                _uiState.update { it.copy(transferStatus = e.message ?: "文件发送失败") }
            }
        }
    }

    private fun connectSignaling(
        role: String,
        serverUrl: String,
        replaceActive: Boolean,
        pairCode: String? = null,
    ): SignalingClient {
        val appContext = context ?: throw IllegalStateException("缺少应用上下文")
        currentRole = role
        val client = SignalingClient(
            serverUrl = serverUrl,
            deviceId = DeviceIdentity.deviceId(appContext),
            deviceName = DeviceIdentity.deviceName(appContext),
            pairCode = pairCode,
        )
        if (replaceActive) {
            signalingClient?.close()
            signalingClient = client
        }

        viewModelScope.launch {
            val flow: Flow<SignalingEvent> = client.events
            flow.collect { event ->
                handleSignalingEvent(event, role, client)
            }
        }
        client.connect(role)
        return client
    }

    private fun handleSignalingEvent(event: SignalingEvent, role: String, client: SignalingClient) {
        when (event) {
            is SignalingEvent.Registered -> {
                val pairCode = pendingPairCode
                if (role == "controller" && pairCode != null) {
                    viewModelScope.launch {
                        client.send(SignalingMessage(type = "connect", pairCode = pairCode))
                    }
                }
            }

            is SignalingEvent.PairCode -> {
                _uiState.update { it.copy(pairCode = event.code) }
                Log.d(TAG, "pair code: ${event.code}")
            }

            is SignalingEvent.Connected -> {
                signalingClient = client
                _uiState.update {
                    it.copy(
                        connectionState = ConnectionState.Connected,
                        remoteName = event.remote.name ?: event.remote.deviceId,
                    )
                }
            }

            is SignalingEvent.PeerJoined -> {
                signalingClient = client
                _uiState.update {
                    it.copy(isPeerConnected = true, remoteName = event.remote.name ?: event.remote.deviceId)
                }
                maybeStartControlledSession()
            }

            is SignalingEvent.Offer -> handleOffer(event.sdp)
            is SignalingEvent.Answer -> handleAnswer(event.sdp)
            is SignalingEvent.Ice -> handleIce(event.candidate)

            is SignalingEvent.Error -> {
                _uiState.update {
                    it.copy(
                        connectionState = if (role == "controller") ConnectionState.Failed else it.connectionState,
                        errorMessage = event.message,
                    )
                }
            }

            is SignalingEvent.Disconnected -> {
                _uiState.update {
                    it.copy(
                        isPeerConnected = false,
                        remoteVideoTrack = null,
                        connectionState = ConnectionState.Idle,
                    )
                }
                teardownWebRtc()
            }

            else -> Unit
        }
    }

    private fun ensurePeerManager(): PeerConnectionManager {
        val appContext = context ?: throw IllegalStateException("缺少应用上下文")
        return peerManager ?: PeerConnectionManager(appContext, eglBase, buildIceServers()).also { manager ->
            manager.initialize()
            manager.onIceCandidate = { candidate ->
                viewModelScope.launch {
                    signalingClient?.send(
                        SignalingMessage(
                            type = "ice",
                            candidate = IceCandidateCodec.encode(candidate),
                        ),
                    )
                }
            }
            manager.onRemoteStreamReady = { track ->
                _uiState.update { it.copy(remoteVideoTrack = track) }
            }
            manager.onDataMessage = { text -> handleDataMessage(text) }
            manager.onConnectionStateChange = { state ->
                _uiState.update {
                    it.copy(
                        connectionState = when (state) {
                            PeerConnection.IceConnectionState.NEW -> ConnectionState.Connecting
                            PeerConnection.IceConnectionState.CONNECTED,
                            PeerConnection.IceConnectionState.COMPLETED -> ConnectionState.Connected
                            PeerConnection.IceConnectionState.FAILED,
                            PeerConnection.IceConnectionState.DISCONNECTED,
                            PeerConnection.IceConnectionState.CLOSED -> ConnectionState.Failed
                            else -> it.connectionState
                        },
                    )
                }
            }
            peerManager = manager
        }
    }

    private fun buildIceServers(): List<PeerConnection.IceServer> {
        val state = _uiState.value
        if (state.turnServerUrl.isBlank()) return emptyList()
        val builder = PeerConnection.IceServer.builder(state.turnServerUrl)
        if (state.turnUsername.isNotBlank() || state.turnPassword.isNotBlank()) {
            builder.setUsername(state.turnUsername)
            builder.setPassword(state.turnPassword)
        }
        return listOf(builder.createIceServer())
    }

    private fun maybeStartControlledSession() {
        if (currentRole != "controlled" || !projectionGranted || webRtcStarted) return
        if (!_uiState.value.isPeerConnected) return
        val client = signalingClient ?: return
        val manager = ensurePeerManager()
        webRtcStarted = true
        viewModelScope.launch {
            try {
                manager.ensurePeerConnection()
                manager.createDataChannel("ctrlai")
                manager.startScreenCaptureAndAddTracks()
                val offer = manager.createOffer().await()
                manager.setLocalDescription(offer).await()
                client.send(SignalingMessage(type = "offer", sdp = offer.description))
                _uiState.update { it.copy(connectionState = ConnectionState.Connecting) }
            } catch (e: Exception) {
                webRtcStarted = false
                _uiState.update { it.copy(connectionState = ConnectionState.Failed, errorMessage = e.message) }
            }
        }
    }

    private fun handleOffer(sdp: String) {
        if (currentRole != "controller") return
        val client = signalingClient ?: return
        val manager = ensurePeerManager()
        viewModelScope.launch {
            try {
                manager.ensurePeerConnection()
                manager.setRemoteDescription(SessionDescription(SessionDescription.Type.OFFER, sdp)).await()
                val answer = manager.createAnswer().await()
                manager.setLocalDescription(answer).await()
                client.send(SignalingMessage(type = "answer", sdp = answer.description))
            } catch (e: Exception) {
                _uiState.update { it.copy(connectionState = ConnectionState.Failed, errorMessage = e.message) }
            }
        }
    }

    private fun handleAnswer(sdp: String) {
        if (currentRole != "controlled") return
        val manager = peerManager ?: return
        viewModelScope.launch {
            runCatching {
                manager.setRemoteDescription(SessionDescription(SessionDescription.Type.ANSWER, sdp)).await()
            }
        }
    }

    private fun handleIce(candidateText: String) {
        val manager = peerManager ?: return
        runCatching { manager.addIceCandidate(IceCandidateCodec.decode(candidateText)) }
    }

    private fun handleDataMessage(text: String) {
        val event = runCatching { RemoteProtocol.decode(text) }.getOrNull() ?: return
        when (event.type) {
            RemoteProtocol.TYPE_TOUCH,
            RemoteProtocol.TYPE_SWIPE,
            RemoteProtocol.TYPE_KEY,
            RemoteProtocol.TYPE_TEXT,
            RemoteProtocol.TYPE_CLIPBOARD -> RemoteAccessibilityService.instance()?.applyRemoteEvent(event)

            RemoteProtocol.TYPE_FILE_START -> {
                val transferId = event.transferId ?: return
                incomingTransfers[transferId] = IncomingTransfer(
                    fileName = event.fileName ?: "received.bin",
                    mimeType = event.mimeType,
                    totalChunks = event.totalChunks,
                )
                _uiState.update { it.copy(transferStatus = "接收 ${event.fileName ?: "文件"}") }
            }

            RemoteProtocol.TYPE_FILE_CHUNK -> {
                val transferId = event.transferId ?: return
                val transfer = incomingTransfers[transferId] ?: return
                val chunk = event.dataBase64?.let { Base64.decode(it, Base64.NO_WRAP) } ?: return
                transfer.buffer.write(chunk)
                _uiState.update { it.copy(transferStatus = "接收中 ${transfer.fileName}") }
            }

            RemoteProtocol.TYPE_FILE_END -> {
                val transferId = event.transferId ?: return
                val transfer = incomingTransfers.remove(transferId) ?: return
                persistIncomingTransfer(transfer)
            }
        }
    }

    private fun persistIncomingTransfer(transfer: IncomingTransfer) {
        val appContext = context ?: return
        viewModelScope.launch(Dispatchers.IO) {
            val file = File(appContext.cacheDir, sanitizeFileName(transfer.fileName))
            file.writeBytes(transfer.buffer.toByteArray())
            _uiState.update { it.copy(transferStatus = "已保存 ${file.name}") }
        }
    }

    private fun sendRemoteEvent(event: RemoteInputEvent) {
        val manager = peerManager ?: return
        manager.sendData(RemoteProtocol.encode(event))
    }

    private fun queryDisplayName(resolver: ContentResolver, uri: Uri): String? {
        val cursor = resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null) ?: return null
        cursor.use {
            if (!it.moveToFirst()) return null
            return it.getString(0)
        }
    }

    private fun sanitizeFileName(name: String): String {
        return name.replace(Regex("[^A-Za-z0-9._-]"), "_")
    }

    private fun stopLocalSession() {
        advertiser?.stop()
        advertiser = null
        localServer?.stop()
        localServer = null
        localSignalingClient?.close()
        localSignalingClient = null
        relaySignalingClient?.close()
        relaySignalingClient = null
        signalingClient = null
    }

    private suspend fun sendDisconnectToAllClients() {
        val message = SignalingMessage(type = "disconnect")
        runCatching { signalingClient?.send(message) }
        runCatching { localSignalingClient?.send(message) }
        runCatching { relaySignalingClient?.send(message) }
    }

    private fun teardownWebRtc() {
        webRtcStarted = false
        projectionGranted = false
        incomingTransfers.clear()
        peerManager?.dispose()
        peerManager = null
        _uiState.update { it.copy(remoteVideoTrack = null, transferStatus = null, isFullScreenMode = false) }
    }

    private data class IncomingTransfer(
        val fileName: String,
        val mimeType: String?,
        val totalChunks: Int,
        val buffer: ByteArrayOutputStream = ByteArrayOutputStream(),
    )

    private data class FilePayload(
        val name: String,
        val mimeType: String?,
        val bytes: ByteArray,
    )

    override fun onCleared() {
        signalingClient?.close()
        stopLocalSession()
        teardownWebRtc()
        eglBase.release()
        super.onCleared()
    }
}
