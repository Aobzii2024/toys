package com.ctrlai.app.webrtc

import org.junit.Assert.assertEquals
import org.junit.Test

class RemoteProtocolTest {

    @Test
    fun encodeAndDecode_preserveTouchEvent() {
        val event = RemoteInputEvent(
            type = RemoteProtocol.TYPE_TOUCH,
            action = 1,
            x = 0.25f,
            y = 0.75f,
        )

        val decoded = RemoteProtocol.decode(RemoteProtocol.encode(event))

        assertEquals(event, decoded)
    }

    @Test
    fun decode_preservesSwipePayload() {
        val event = RemoteInputEvent(
            type = RemoteProtocol.TYPE_SWIPE,
            x = 0.1f,
            y = 0.2f,
            toX = 0.8f,
            toY = 0.9f,
            durationMs = 300L,
        )

        val decoded = RemoteProtocol.decode(RemoteProtocol.encode(event))

        assertEquals(event, decoded)
    }
}
