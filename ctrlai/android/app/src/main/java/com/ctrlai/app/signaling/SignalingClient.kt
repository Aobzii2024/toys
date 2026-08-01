package com.ctrlai.app.signaling

import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.plugins.websocket.webSocket
import io.ktor.websocket.Frame
import io.ktor.websocket.WebSocketSession
import io.ktor.websocket.readText
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * 信令客户端：与信令服务器保持持久 WebSocket 连接并自动重连。
 * 同一连接用于注册、配对、SDP/ICE 转发，保证设备绑定关系稳定。
 */
class SignalingClient(
    private val serverUrl: String,
    private val deviceId: String,
    private val deviceName: String,
    private val pairCode: String? = null,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val httpClient = HttpClient(OkHttp) {
        install(WebSockets)
    }
    private val bus = SignalingEventBus()
    val events: kotlinx.coroutines.flow.Flow<SignalingEvent> = bus.events

    private var session: WebSocketSession? = null
    private val sendMutex = Mutex()
    private var socketJob: Job? = null
    private var role: String? = null
    private var manualClosed = false

    val isConnected: Boolean
        get() = session != null

    fun connect(role: String) {
        this.role = role
        manualClosed = false
        socketJob = scope.launch { runLoop() }
    }

    fun close() {
        manualClosed = true
        socketJob?.cancel()
        socketJob = null
        session = null
    }

    private suspend fun runLoop() {
        var backoff = 1000L
        while (scope.isActive && !manualClosed) {
            try {
                httpClient.webSocket(serverUrl) {
                    session = this
                    backoff = 1000L
                    val register = SignalingMessage(
                        type = "register",
                        deviceId = deviceId,
                        role = role,
                        name = deviceName,
                        pairCode = pairCode,
                    )
                    sendRaw(register)

                    for (frame in incoming) {
                        if (frame is Frame.Text) {
                            handleFrame(frame.readText())
                        }
                    }
                }
            } catch (e: Exception) {
                if (!manualClosed) {
                    bus.emit(SignalingEvent.Error("连接中断: ${e.message}"))
                }
            } finally {
                session = null
            }
            if (manualClosed) break
            delay(backoff)
            backoff = (backoff * 2).coerceAtMost(15000)
        }
    }

    suspend fun send(message: SignalingMessage) {
        sendRaw(message)
    }

    private suspend fun sendRaw(message: SignalingMessage) {
        sendMutex.withLock {
            val socket = session ?: return
            try {
                socket.send(Frame.Text(SignalingJson.json.encodeToString(SignalingMessage.serializer(), message)))
            } catch (_: Exception) {
            }
        }
    }

    private fun handleFrame(text: String) {
        val msg = SignalingJson.json.decodeFromString(SignalingMessage.serializer(), text)
        when (msg.type) {
            "pair-code" -> msg.pairCode?.let { bus.emit(SignalingEvent.PairCode(it)) }
            "registered" -> msg.deviceId?.let { bus.emit(SignalingEvent.Registered(it)) }
            "connected" -> msg.remote?.let { bus.emit(SignalingEvent.Connected(it)) }
            "peer-joined" -> msg.remote?.let { bus.emit(SignalingEvent.PeerJoined(it)) }
            "session-id" -> msg.sessionId?.let { bus.emit(SignalingEvent.SessionId(it)) }
            "offer" -> msg.sdp?.let { bus.emit(SignalingEvent.Offer(it)) }
            "answer" -> msg.sdp?.let { bus.emit(SignalingEvent.Answer(it)) }
            "ice" -> msg.candidate?.let { bus.emit(SignalingEvent.Ice(it)) }
            "error" -> bus.emit(SignalingEvent.Error(msg.error ?: "未知错误"))
            "disconnect" -> bus.emit(SignalingEvent.Disconnected)
        }
    }
}
