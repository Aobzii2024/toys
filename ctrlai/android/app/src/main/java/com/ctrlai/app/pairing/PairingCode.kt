package com.ctrlai.app.pairing

import kotlin.random.Random

/**
 * 配对码工具。生成 6 位数字配对码，与服务器校验逻辑保持一致。
 */
object PairingCode {
    fun generate(): String {
        return (Random.nextInt(100000, 1000000)).toString()
    }

    fun isValid(code: String): Boolean {
        return code.length == 6 && code.all { it.isDigit() }
    }
}
