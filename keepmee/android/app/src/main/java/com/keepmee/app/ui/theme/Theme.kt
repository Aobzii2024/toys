package com.keepmee.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val KeepYellow = Color(0xFFFFD33D)
val KeepYellowDark = Color(0xFFF5B800)
val Ink = Color(0xFF3E3E3E)
val LightGrey = Color(0xFFF4F4F4)

private val LightColors = lightColorScheme(
    primary = KeepYellowDark,
    onPrimary = Ink,
    primaryContainer = KeepYellow,
    onPrimaryContainer = Ink,
    secondary = Color(0xFF666666),
    background = Color.White,
    surface = Color.White,
    surfaceVariant = LightGrey,
    onSurface = Ink,
    outline = Color(0xFFE0E0E0)
)

private val DarkColors = darkColorScheme(
    primary = KeepYellowDark,
    onPrimary = Ink,
    primaryContainer = Color(0xFF4A3F00),
    onPrimaryContainer = KeepYellow,
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
