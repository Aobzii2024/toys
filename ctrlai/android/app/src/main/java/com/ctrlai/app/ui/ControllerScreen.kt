package com.ctrlai.app.ui

import android.accessibilityservice.AccessibilityService
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ControllerScreen(
    state: MainUiState,
    onDisconnect: () -> Unit,
    onConnect: (String) -> Unit = {},
    onResetConnection: () -> Unit = {},
    onTap: (Float, Float) -> Unit = { _, _ -> },
    onSwipe: (Float, Float, Float, Float, Long) -> Unit = { _, _, _, _, _ -> },
    onKey: (Int) -> Unit = {},
    onSendClipboard: (String) -> Unit = {},
    onSendFile: (Uri) -> Unit = {},
    onToggleFullScreen: () -> Unit = {},
) {
    var pairCode by remember { mutableStateOf("") }
    val connection = state.connectionState
    val clipboard = LocalClipboardManager.current
    val filePicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        uri?.let(onSendFile)
    }

    if (connection == ConnectionState.Connected && state.isFullScreenMode) {
        Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.surface)) {
            RemoteVideoPreview(
                videoTrack = state.remoteVideoTrack,
                modifier = Modifier.fillMaxSize(),
                onTap = onTap,
                onSwipe = onSwipe,
            )
            OutlinedButton(
                onClick = onToggleFullScreen,
                modifier = Modifier.align(Alignment.TopEnd).padding(16.dp),
                shape = RoundedCornerShape(14.dp),
            ) {
                Text("退出全屏")
            }
        }
        return
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(24.dp))
        Text(
            text = "远程控制",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )

        Spacer(modifier = Modifier.height(32.dp))

        Box(
            modifier = Modifier
                .size(88.dp)
                .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(28.dp)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Filled.Videocam,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(44.dp),
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        when (connection) {
            ConnectionState.Idle -> {
                Text(
                    text = "输入对方手机显示的 6 位配对码",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = pairCode,
                    onValueChange = { input -> pairCode = input.filter { it.isDigit() }.take(6) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("配对码") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    textStyle = MaterialTheme.typography.headlineSmall.copy(
                        letterSpacing = 8.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                    ),
                )
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = { onConnect(pairCode) },
                    enabled = pairCode.length == 6,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                ) {
                    Text("连接设备", fontSize = 16.sp)
                }
                if (state.errorMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = state.errorMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center,
                    )
                }
            }

            ConnectionState.Connecting -> {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(16.dp))
                Text("正在连接对方设备…", style = MaterialTheme.typography.bodyLarge)
            }

            ConnectionState.Connected -> {
                Text(
                    text = "已连接 ${state.remoteName ?: ""}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "正在实时查看对方屏幕",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(modifier = Modifier.height(24.dp))
                RemoteVideoPreview(
                    videoTrack = state.remoteVideoTrack,
                    modifier = Modifier.fillMaxWidth().height(320.dp),
                    onTap = onTap,
                    onSwipe = onSwipe,
                )
                Spacer(modifier = Modifier.height(16.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = { onKey(AccessibilityService.GLOBAL_ACTION_BACK) },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                    ) { Text("返回") }
                    OutlinedButton(
                        onClick = { onKey(AccessibilityService.GLOBAL_ACTION_HOME) },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                    ) { Text("主页") }
                    OutlinedButton(
                        onClick = { onKey(AccessibilityService.GLOBAL_ACTION_RECENTS) },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                    ) { Text("任务") }
                }
                Spacer(modifier = Modifier.height(12.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = onToggleFullScreen,
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                    ) { Text("全屏") }
                    OutlinedButton(
                        onClick = { onSendClipboard(clipboard.getText()?.text?.toString().orEmpty()) },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                    ) { Text("剪贴板") }
                }
                Spacer(modifier = Modifier.height(12.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = { filePicker.launch(arrayOf("*/*")) },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                    ) { Text("发送文件") }
                    OutlinedButton(
                        onClick = onDisconnect,
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                    ) { Text("断开") }
                }
                if (state.transferStatus != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(state.transferStatus, style = MaterialTheme.typography.bodyMedium)
                }
            }

            ConnectionState.Failed -> {
                Text(
                    text = "连接失败",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.error,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = state.errorMessage ?: "请检查配对码是否正确",
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                )
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = onResetConnection,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                ) {
                    Text("返回重试", fontSize = 16.sp)
                }
            }
        }
    }
}
