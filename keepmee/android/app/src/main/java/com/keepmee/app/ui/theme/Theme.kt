package com.keepmee.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val KeepGreen = Color(0xFF31D2A8)
val KeepGreenDark = Color(0xFF1FA98A)
val Ink = Color(0xFF2E3A3A)
val LightGrey = Color(0xFFF4F6F5)

private val LightColors = lightColorScheme(
    primary = KeepGreenDark,
    onPrimary = Color.White,
    primaryContainer = KeepGreen,
    onPrimaryContainer = Color.White,
    secondary = Color(0xFF666666),
    background = Color(0xFFF7F8FA),
    surface = Color.White,
    surfaceVariant = LightGrey,
    onSurface = Ink,
    outline = Color(0xFFE0E0E0)
)

private val DarkColors = darkColorScheme(
    primary = KeepGreenDark,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF0E3B30),
    onPrimaryContainer = KeepGreen,
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E),
    surfaceVariant = Color(0xFF2A2A2A),
    onSurface = Color(0xFFEEEEEE)
)

@Composable
fun KeepmeeTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content
    )
}
