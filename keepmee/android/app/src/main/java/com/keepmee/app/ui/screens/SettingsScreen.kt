package com.keepmee.app.ui.screens

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CloudDownload
import androidx.compose.material.icons.outlined.CloudUpload
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.PhotoCamera
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keepmee.app.ai.AiConfig
import com.keepmee.app.ui.theme.Ink
import com.keepmee.app.ui.theme.KeepYellow
import com.keepmee.app.ui.viewmodel.AppViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun SettingsScreen(vm: AppViewModel, padding: PaddingValues) {
    val config by vm.aiConfig.collectAsStateWithLifecycle()
    val state = vm.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }

    var baseUrl by remember { mutableStateOf(config.baseUrl) }
    var apiKey by remember { mutableStateOf(config.apiKey) }
    var model by remember { mutableStateOf(config.model) }
    var showImportDialog by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }

    LaunchedEffect(state.value) {
        when (val s = state.value) {
            is com.keepmee.app.ui.viewmodel.UiState.Success -> snackbar.showSnackbar(s.message)
            is com.keepmee.app.ui.viewmodel.UiState.Error -> snackbar.showSnackbar(s.message)
            else -> {}
        }
    }

    val exportLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("application/json")
    ) { uri: Uri? ->
        uri?.let { vm.exportTo(it) }
    }

    val importLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let { vm.importFrom(it, merge = true) }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            "设置",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Ink,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)
        )

        // 视觉AI 配置
        Text(
            "视觉 AI 自动记账",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = Ink,
            modifier = Modifier.padding(horizontal = 20.dp)
        )
        Text(
            "配置后，拍照或从相册选图即可自动识别账单（OpenAI 兼容视觉接口）。配置项仅保存在本机。",
            fontSize = 12.sp,
            color = Color(0xFF9E9E9E),
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .background(Color.White, RoundedCornerShape(12.dp))
                .padding(14.dp)
        ) {
            OutlinedTextField(
                value = baseUrl,
                onValueChange = { baseUrl = it },
                label = { Text("接口 BaseURL") },
                placeholder = { Text("https://api.openai.com/v1") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(
                value = apiKey,
                onValueChange = { apiKey = it },
                label = { Text("API Key") },
                placeholder = { Text("sk-...") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(
                value = model,
                onValueChange = { model = it },
                label = { Text("视觉模型名") },
                placeholder = { Text("gpt-4o-mini / qwen-vl-plus") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Outlined.PhotoCamera,
                    contentDescription = null,
                    tint = if (config.isConfigured) Color(0xFF2E7D32) else Color(0xFF9E9E9E)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    if (config.isConfigured) "AI 已配置" else "AI 未配置",
                    fontSize = 13.sp,
                    color = if (config.isConfigured) Color(0xFF2E7D32) else Color(0xFF9E9E9E),
                    modifier = Modifier.weight(1f)
                )
                Button(
                    onClick = {
                        vm.saveAiConfig(AiConfig(baseUrl, apiKey, model))
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = KeepYellow, contentColor = Ink)
                ) {
                    Text("保存")
                }
            }
        }

        Spacer(Modifier.height(8.dp))
        HorizontalDivider(color = Color(0xFFF0F0F0))

        // 数据管理
        Text(
            "数据管理",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = Ink,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
        )

        SettingRow(
            icon = Icons.Outlined.CloudUpload,
            title = "导出数据",
            subtitle = "将全部记录导出为 JSON 文件",
            onClick = {
                exportLauncher.launch("keepmee-backup-${System.currentTimeMillis()}.json")
            }
        )
        SettingRow(
            icon = Icons.Outlined.CloudDownload,
            title = "一键导入",
            subtitle = "从 JSON 文件导入（自动去重合并）",
            onClick = { showImportDialog = true }
        )
        SettingRow(
            icon = Icons.Outlined.Delete,
            title = "清空所有数据",
            subtitle = "删除本机全部记账记录",
            onClick = { showDeleteDialog = true }
        )

        Spacer(Modifier.height(8.dp))
        HorizontalDivider(color = Color(0xFFF0F0F0))

        Text(
            "隐私说明",
            fontSize = 12.sp,
            color = Color(0xFF9E9E9E),
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
        )
        Text(
            "· 所有记账数据仅保存在本机数据库，不经过任何服务器\n· 视觉 AI 仅在拍照记账时将图片发送到你配置的接口\n· API Key 仅保存在本机",
            fontSize = 12.sp,
            lineHeight = 20.sp,
            color = Color(0xFF9E9E9E),
            modifier = Modifier.padding(horizontal = 20.dp)
        )
        Spacer(Modifier.height(40.dp))
    }

    if (showImportDialog) {
        AlertDialog(
            onDismissRequest = { showImportDialog = false },
            title = { Text("导入数据") },
            text = { Text("导入会合并文件中的记录（自动去重）。继续请选择 JSON 文件。") },
            confirmButton = {
                TextButton(onClick = {
                    showImportDialog = false
                    importLauncher.launch(arrayOf("application/json"))
                }) { Text("选择文件") }
            },
            dismissButton = {
                TextButton(onClick = { showImportDialog = false }) { Text("取消") }
            }
        )
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("清空数据") },
            text = { Text("将删除本机全部记账记录，此操作不可恢复。建议先导出备份。确定继续吗？") },
            confirmButton = {
                TextButton(onClick = {
                    showDeleteDialog = false
                    vm.clearAll()
                }) { Text("确定清空", color = Color(0xFFC62828)) }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) { Text("取消") }
            }
        )
    }
}

@Composable
private fun SettingRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = Ink)
        Spacer(Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 15.sp, color = Ink, fontWeight = FontWeight.Medium)
            Text(subtitle, fontSize = 12.sp, color = Color(0xFF9E9E9E))
        }
    }
}
