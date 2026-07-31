package com.ctrlai.app.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFF3D5AFE),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE0E9FF),
    secondary = Color(0xFF00BFA5),
    background = Color(0xFFF7F8FC),
    surface = Color.White,
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF8FA8FF),
    onPrimary = Color(0xFF00227B),
    primaryContainer = Color(0xFF2444A6),
    secondary = Color(0xFF64D8C0),
    background = Color(0xFF121317),
    surface = Color(0xFF1C1E24),
)

@Composable
fun CtrlAiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = Typography(),
        content = content,
    )
}
