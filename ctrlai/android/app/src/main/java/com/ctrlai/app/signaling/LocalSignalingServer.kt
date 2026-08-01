package com.ctrlai.app.signaling

import io.ktor.server.application.install
import io.ktor.server.cio.CIO
import io.ktor.server.engine.embeddedServer
import io.ktor.server.engine.EmbeddedServer
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.Frame
import io.ktor.websocket.WebSocketSession
import io.ktor.websocket.readText
import kotlinx.coroutines.runBlocking
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

class LocalSignalingServer(
    private val port: Int,
    private val pairCode: String,
) {
    private var engine: EmbeddedServer<*, *>? = null
    private val sockets = ConcurrentHashMap<WebSocketSession, String>()
    private val devices = ConcurrentHashMap<String, Peer>()
    private var session: Session? = null

    fun start() {
        if (engine != null) return
        engine = embeddedServer(CIO, port = port, host = "0.0.0.0") {
            install(WebSockets)
            routing {
                webSocket("/ws") {
                    try {
                        for (frame in incoming) {
                            if (frame is Frame.Text) {
                                handleMessage(this, frame.readText())
                            }
                        }
                    } finally {
                        handleClose(this)
                    }
                }
            }
        }.start(wait = false)
    }

    fun stop() {
        engine?.stop(500, 1_000)
        engine = null
        sockets.clear()
        devices.clear()
        session = null
    }

    private suspend fun handleMessage(socket: WebSocketSession, raw: String) {
        val message = runCatching {
            SignalingJson.json.decodeFromString(SignalingMessage.serializer(), raw)
        }.getOrElse {
            send(socket, SignalingMessage(type = "error", error = "BAD_MESSAGE"))
            return
        }
        when (message.type) {
            "register" -> onRegister(socket, message)
            "connect" -> onConnect(socket, message)
            "offer", "answer", "ice" -> onRelay(socket, message)
            "disconnect" -> handleClose(socket)
            else -> send(socket, SignalingMessage(type = "error", error = "BAD_MESSAGE"))
        }
    }

    private suspend fun onRegister(socket: WebSocketSession, message: SignalingMessage) {
        val deviceId = message.deviceId
        val role = message.role
        if (deviceId.isNullOrBlank() || (role != "controller" && role != "controlled")) {
            send(socket, SignalingMessage(type = "error", error = "BAD_MESSAGE"))
            return
        }
        sockets[socket] = deviceId
        devices[deviceId] = Peer(deviceId = deviceId, role = role, socket = socket, name = message.name)
        send(socket, SignalingMessage(type = "registered", deviceId = deviceId, name = message.name))
        if (role == "controlled") {
            send(socket, SignalingMessage(type = "pair-code", pairCode = pairCode))
        }
    }

    private suspend fun onConnect(socket: WebSocketSession, message: SignalingMessage) {
        val controllerId = sockets[socket]
        if (controllerId.isNullOrBlank() || message.pairCode != pairCode) {
            send(socket, SignalingMessage(type = "error", error = "INVALID_CODE"))
            return
        }
        val controller = devices[controllerId]
        val controlled = devices.values.firstOrNull { it.role == "controlled" }
        if (controller == null || controlled == null) {
            send(socket, SignalingMessage(type = "error", error = "OFFLINE"))
            return
        }
        if (session != null) {
            send(socket, SignalingMessage(type = "error", error = "ROOM_FULL"))
            return
        }
        val activeSession = Session(id = UUID.randomUUID().toString(), controller = controller, controlled = controlled)
        session = activeSession
        send(socket, SignalingMessage(type = "connected", remote = RemoteInfo(controlled.deviceId, controlled.name)))
        send(controlled.socket, SignalingMessage(type = "peer-joined", remote = RemoteInfo(controller.deviceId, controller.name)))
        send(socket, SignalingMessage(type = "session-id", sessionId = activeSession.id))
    }

    private suspend fun onRelay(socket: WebSocketSession, message: SignalingMessage) {
        val deviceId = sockets[socket]
        val activeSession = session
        if (deviceId == null || activeSession == null) {
            send(socket, SignalingMessage(type = "error", error = "UNAUTHORIZED"))
            return
        }
        val target = if (activeSession.controller.deviceId == deviceId) {
            activeSession.controlled.socket
        } else {
            activeSession.controller.socket
        }
        send(target, SignalingMessage(type = message.type, sdp = message.sdp, candidate = message.candidate))
    }

    private fun handleClose(socket: WebSocketSession) {
        val deviceId = sockets.remove(socket) ?: return
        devices.remove(deviceId)
        val activeSession = session ?: return
        val peer = when (deviceId) {
            activeSession.controller.deviceId -> activeSession.controlled.socket
            activeSession.controlled.deviceId -> activeSession.controller.socket
            else -> null
        }
        session = null
        if (peer != null) {
            runBlocking { send(peer, SignalingMessage(type = "disconnect")) }
        }
    }

    private suspend fun send(socket: WebSocketSession, message: SignalingMessage) {
        socket.send(Frame.Text(SignalingJson.json.encodeToString(SignalingMessage.serializer(), message)))
    }

    private data class Peer(
        val deviceId: String,
        val role: String,
        val socket: WebSocketSession,
        val name: String?,
    )

    private data class Session(
        val id: String,
        val controller: Peer,
        val controlled: Peer,
    )
}
