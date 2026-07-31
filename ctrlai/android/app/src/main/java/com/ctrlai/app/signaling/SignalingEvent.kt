package com.ctrlai.app.signaling

import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.receiveAsFlow

sealed interface SignalingEvent {
    data class Connected(val remote: RemoteInfo) : SignalingEvent
    data class PeerJoined(val remote: RemoteInfo) : SignalingEvent
    data class PairCode(val code: String) : SignalingEvent
    data class Registered(val deviceId: String) : SignalingEvent
    data class SessionId(val sessionId: String) : SignalingEvent
    data class Offer(val sdp: String) : SignalingEvent
    data class Answer(val sdp: String) : SignalingEvent
    data class Ice(val candidate: String) : SignalingEvent
    data class Error(val message: String) : SignalingEvent
    data object Disconnected : SignalingEvent
}

class SignalingEventBus {
    private val channel = Channel<SignalingEvent>(Channel.BUFFERED)
    val events: Flow<SignalingEvent> = channel.receiveAsFlow()

    fun emit(event: SignalingEvent) {
        channel.trySend(event)
    }
}
