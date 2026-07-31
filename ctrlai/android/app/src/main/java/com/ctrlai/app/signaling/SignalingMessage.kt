package com.ctrlai.app.signaling

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class SignalingMessage(
    val type: String,
    val deviceId: String? = null,
    val role: String? = null,
    val pairCode: String? = null,
    val name: String? = null,
    val sdp: String? = null,
    val candidate: String? = null,
    val error: String? = null,
    val sessionId: String? = null,
    val remote: RemoteInfo? = null,
)

@Serializable
data class RemoteInfo(
    val deviceId: String,
    val name: String? = null,
)

object SignalingJson {
    val json = Json { ignoreUnknownKeys = true }
}
