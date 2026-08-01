package com.ctrlai.app.input

import org.junit.Assert.assertEquals
import org.junit.Test

class RemoteAccessibilityServiceTest {

    @Test
    fun normalizePoint_clampsToScreenBounds() {
        val (x, y) = RemoteAccessibilityService.normalizePoint(1.5f, -0.2f, 1080, 2400)

        assertEquals(1079, x)
        assertEquals(0, y)
    }
}
