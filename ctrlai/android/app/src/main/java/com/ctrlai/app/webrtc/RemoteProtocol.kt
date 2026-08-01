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
    val text: String? = null,
    val transferId: String? = null,
    val fileName: String? = null,
    val mimeType: String? = null,
    val size: Long = 0L,
    val chunkIndex: Int = 0,
    val totalChunks: Int = 0,
    val dataBase64: String? = null,
)

object RemoteProtocol {
    const val TYPE_TOUCH = "touch"
    const val TYPE_SWIPE = "swipe"
    const val TYPE_KEY = "key"
    const val TYPE_TEXT = "text"
    const val TYPE_CLIPBOARD = "clipboard"
    const val TYPE_FILE_START = "file-start"
    const val TYPE_FILE_CHUNK = "file-chunk"
    const val TYPE_FILE_END = "file-end"

    val json = Json { ignoreUnknownKeys = true }

    fun encode(event: RemoteInputEvent): String {
        return json.encodeToString(RemoteInputEvent.serializer(), event)
    }

    fun decode(text: String): RemoteInputEvent {
        return json.decodeFromString(RemoteInputEvent.serializer(), text)
    }
}
