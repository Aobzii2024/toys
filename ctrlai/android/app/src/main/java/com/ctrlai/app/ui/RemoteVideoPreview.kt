package com.ctrlai.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import org.webrtc.EglBase
import org.webrtc.RendererCommon
import org.webrtc.SurfaceViewRenderer
import org.webrtc.VideoTrack

@Composable
fun RemoteVideoPreview(
    videoTrack: VideoTrack?,
    modifier: Modifier = Modifier,
    onTap: (Float, Float) -> Unit = { _, _ -> },
    onSwipe: (Float, Float, Float, Float, Long) -> Unit = { _, _, _, _, _ -> },
) {
    var dragStart by remember { mutableStateOf<Offset?>(null) }
    var dragEnd by remember { mutableStateOf<Offset?>(null) }
    val gestureModifier = Modifier
        .pointerInput(Unit) {
            detectTapGestures { offset ->
                onTap(
                    (offset.x / size.width).coerceIn(0f, 1f),
                    (offset.y / size.height).coerceIn(0f, 1f),
                )
            }
        }
        .pointerInput(Unit) {
            detectDragGestures(
                onDragStart = { offset ->
                    dragStart = offset
                    dragEnd = offset
                },
                onDrag = { change, _ -> dragEnd = change.position },
                onDragEnd = {
                    val start = dragStart
                    val end = dragEnd
                    if (start != null && end != null) {
                        onSwipe(
                            (start.x / size.width).coerceIn(0f, 1f),
                            (start.y / size.height).coerceIn(0f, 1f),
                            (end.x / size.width).coerceIn(0f, 1f),
                            (end.y / size.height).coerceIn(0f, 1f),
                            220L,
                        )
                    }
                    dragStart = null
                    dragEnd = null
                },
                onDragCancel = {
                    dragStart = null
                    dragEnd = null
                },
            )
        }

    Box(
        modifier = modifier.then(gestureModifier).clip(androidx.compose.foundation.shape.RoundedCornerShape(20.dp))
            .background(Color(0xFF0E0F13)),
        contentAlignment = Alignment.Center,
    ) {
        if (videoTrack != null) {
            WebRtcVideoTrack(track = videoTrack, modifier = Modifier.fillMaxSize())
        } else {
            Text(
                text = "等待屏幕画面",
                color = Color(0xFF8A8F98),
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun WebRtcVideoTrack(
    track: VideoTrack,
    modifier: Modifier = Modifier,
) {
    val eglBase = remember { EglBase.create() }
    var renderer by remember { mutableStateOf<SurfaceViewRenderer?>(null) }

    DisposableEffect(track, renderer) {
        val currentRenderer = renderer
        if (currentRenderer != null) {
            track.addSink(currentRenderer)
        }
        onDispose {
            if (currentRenderer != null) {
                track.removeSink(currentRenderer)
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            renderer?.release()
            eglBase.release()
        }
    }

    AndroidView(
        modifier = modifier,
        factory = { context ->
            SurfaceViewRenderer(context).apply {
                init(eglBase.eglBaseContext, null)
                setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
                setEnableHardwareScaler(true)
                renderer = this
            }
        },
    )
}
