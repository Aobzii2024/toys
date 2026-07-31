package com.ctrlai.app.webrtc

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * DataChannel 远程控制协议。
 * 坐标使用 0..1 归一化，被控端根据自身分辨率换算，避免分辨率变化导致坐标偏移。
 */
@Serializable
data class RemoteInputEvent(
    val type: String,
    val action: Int = 0,
    val x: Float = 0f,
    val y: Float = 0f,
    val toX: Float = 0f,
    val toY: Float = 0f,
    val durationMs: Long = 0L,
    val keyCode: Int = 0,
)

object RemoteProtocol {
    const val TYPE_TOUCH = "touch"
    const val TYPE_SWIPE = "swipe"
    const val TYPE_KEY = "key"
    const val TYPE_TEXT = "text"

    val json = Json { ignoreUnknownKeys = true }

    fun encode(event: RemoteInputEvent): String {
        return json.encodeToString(RemoteInputEvent.serializer(), event)
    }

    fun decode(text: String): RemoteInputEvent {
        return json.decodeFromString(RemoteInputEvent.serializer(), text)
    }
}
