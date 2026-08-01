package com.ctrlai.app.pairing

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PairingCodeTest {

    @Test
    fun generate_returnsSixDigitCode() {
        val code = PairingCode.generate()

        assertTrue(code.length == 6)
        assertTrue(code.all { it.isDigit() })
    }

    @Test
    fun isValid_acceptsSixDigitNumericCode() {
        assertTrue(PairingCode.isValid("123456"))
    }

    @Test
    fun isValid_rejectsNonNumericCode() {
        assertFalse(PairingCode.isValid("12a456"))
    }
}
