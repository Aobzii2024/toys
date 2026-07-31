package com.ctrlai.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** 远端视频预览占位。真机联调时接入 SurfaceViewRenderer。 */
@Composable
fun RemoteVideoPreview(
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier.clip(androidx.compose.foundation.shape.RoundedCornerShape(20.dp))
            .background(Color(0xFF0E0F13)),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = "屏幕画面预览",
            color = Color(0xFF8A8F98),
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            textAlign = TextAlign.Center,
        )
    }
}
