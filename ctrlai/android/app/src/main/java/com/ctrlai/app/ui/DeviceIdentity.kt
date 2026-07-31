package com.ctrlai.app.ui

import android.content.Context
import android.os.Build
import android.provider.Settings
import java.security.MessageDigest

/** 设备身份工具：生成稳定设备 ID 与展示名。 */
object DeviceIdentity {
    private const val ANDROID_ID_PREFIX = "ctrlai-"

    fun deviceId(context: Context): String {
        val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
            ?: "unknown"
        val digest = MessageDigest.getInstance("SHA-256")
            .digest(androidId.toByteArray())
            .joinToString("") { "%02x".format(it) }
            .take(12)
        return ANDROID_ID_PREFIX + digest
    }

    fun deviceName(context: Context): String {
        return "${Build.MANUFACTURER} ${Build.MODEL}"
    }
}
