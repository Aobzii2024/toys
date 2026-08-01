package com.ctrlai.app.ui

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.CallMade
import androidx.compose.material.icons.automirrored.filled.CallReceived
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ModeSelectScreen(
    state: MainUiState,
    onControllerClick: () -> Unit,
    onControlledClick: () -> Unit,
    onRelayConfigChange: (String, String, String, String) -> Unit = { _, _, _, _ -> },
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(64.dp))

        Text(
            text = "ctrlai",
            style = MaterialTheme.typography.displayMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "安卓到安卓的安全远程控制",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = state.relaySignalingUrl,
            onValueChange = {
                onRelayConfigChange(it, state.turnServerUrl, state.turnUsername, state.turnPassword)
            },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("公网信令地址") },
            placeholder = { Text("wss://example.com/ws") },
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = state.turnServerUrl,
            onValueChange = {
                onRelayConfigChange(state.relaySignalingUrl, it, state.turnUsername, state.turnPassword)
            },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("TURN 地址") },
            placeholder = { Text("turn:example.com:3478") },
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = state.turnUsername,
                onValueChange = {
                    onRelayConfigChange(state.relaySignalingUrl, state.turnServerUrl, it, state.turnPassword)
                },
                modifier = Modifier.weight(1f),
                label = { Text("TURN 用户") },
                singleLine = true,
            )
            OutlinedTextField(
                value = state.turnPassword,
                onValueChange = {
                    onRelayConfigChange(state.relaySignalingUrl, state.turnServerUrl, state.turnUsername, it)
                },
                modifier = Modifier.weight(1f),
                label = { Text("TURN 密码") },
                singleLine = true,
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = if (state.relaySignalingUrl.isBlank()) "当前为局域网/热点模式" else "当前为跨网络中继模式",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.weight(1f))

        ModeCard(
            title = "控制其他设备",
            subtitle = "输入配对码，远程操作对方手机",
            icon = Icons.AutoMirrored.Filled.CallMade,
            iconBackground = MaterialTheme.colorScheme.primary,
            onClick = onControllerClick,
        )

        Spacer(modifier = Modifier.height(16.dp))

        ModeCard(
            title = "让其他设备控制我",
            subtitle = "生成配对码，共享屏幕给对方",
            icon = Icons.AutoMirrored.Filled.CallReceived,
            iconBackground = MaterialTheme.colorScheme.secondary,
            onClick = onControlledClick,
        )

        Spacer(modifier = Modifier.height(48.dp))
    }
}

@Composable
private fun ModeCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconBackground: Color,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        onClick = onClick,
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Box(
                modifier = Modifier.size(52.dp).background(iconBackground, RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(28.dp),
                )
            }
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
