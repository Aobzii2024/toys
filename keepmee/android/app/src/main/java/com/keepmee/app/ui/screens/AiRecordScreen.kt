package com.keepmee.app.ui.screens

import android.graphics.Bitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AddPhotoAlternate
import androidx.compose.material.icons.outlined.PhotoCamera
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keepmee.app.ui.theme.Ink
import com.keepmee.app.ui.theme.KeepYellow
import com.keepmee.app.ui.viewmodel.AppViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.launch

@Composable
fun AiRecordScreen(vm: AppViewModel, onClose: () -> Unit) {
    val uiState by vm.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    var selectedImage by remember { mutableStateOf<Bitmap?>(null) }
    var previewData by remember { mutableStateOf(vm.consumePendingAiResult()) }
    var parsing by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    val cameraLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            selectedImage = bitmap
            previewData = null
            parsing = true
            vm.parseReceiptImage(bitmap)
        }
    }

    val pickLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            val bitmap = runCatching {
                val contentResolver = context.contentResolver
                contentResolver.openInputStream(uri)?.use { ins ->
                    android.graphics.BitmapFactory.decodeStream(ins)
                }
            }.getOrNull()
            if (bitmap != null) {
                selectedImage = bitmap
                previewData = null
                parsing = true
                vm.parseReceiptImage(bitmap)
            }
        }
    }

    LaunchedEffect(uiState) {
        when (val s = uiState) {
            is com.keepmee.app.ui.viewmodel.UiState.Loading -> parsing = true
            is com.keepmee.app.ui.viewmodel.UiState.Success -> {
                parsing = false
                val p = vm.consumePendingAiResult()
                if (p != null) {
                    previewData = p
                    snackbar.showSnackbar(s.message)
                }
            }
            is com.keepmee.app.ui.viewmodel.UiState.Error -> {
                parsing = false
                snackbar.showSnackbar(s.message)
            }
            else -> {}
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.White)) {
        Column(
            modifier = Modifier.fillMaxSize().padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "AI 拍照记账",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Ink,
                    modifier = Modifier.weight(1f)
                )
                androidx.compose.material3.TextButton(onClick = onClose) {
                    Text("关闭", color = Color(0xFF9E9E9E))
                }
            }

            Spacer(Modifier.height(16.dp))

            // 图片预览区域
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                val image = selectedImage ?: previewData?.image
                if (image != null) {
                    Image(
                        bitmap = image.asImageBitmap(),
                        contentDescription = "待识别图片",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Fit
                    )
                } else {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Outlined.AddPhotoAlternate,
                            contentDescription = null,
                            tint = Color(0xFFBDBDBD),
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(Modifier.height(8.dp))
                        Text("拍摄或选择收据/账单图片", color = Color(0xFFBDBDBD), fontSize = 14.sp)
                    }
                }
                if (parsing) {
                    Box(
                        modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.4f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = KeepYellow)
                            Spacer(Modifier.height(8.dp))
                            Text("AI 识别中...", color = Color.White, fontSize = 14.sp)
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = { cameraLauncher.launch(null) },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = KeepYellow, contentColor = Ink)
                ) {
                    Icon(Icons.Outlined.PhotoCamera, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text("拍照")
                }
                OutlinedButton(
                    onClick = {
                        pickLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                    },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Icon(Icons.Outlined.AddPhotoAlternate, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text("相册")
                }
            }

            // 识别结果预览
            previewData?.let { p ->
                Spacer(Modifier.height(20.dp))
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(KeepYellow.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                        .padding(16.dp)
                ) {
                    Text(
                        if (p.isExpense) "支出 ${p.category}" else "收入 ${p.category}",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Ink
                    )
                    Spacer(Modifier.height(4.dp))
                    Text("金额 ¥${p.amount}", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Ink)
                    if (p.note.isNotBlank()) {
                        Spacer(Modifier.height(4.dp))
                        Text("备注：${p.note}", fontSize = 13.sp, color = Color(0xFF616161))
                    }
                    Spacer(Modifier.height(12.dp))
                    Button(
                        onClick = {
                            scope.launch {
                                vm.addTransaction(
                                    amount = p.amount.toDoubleOrNull() ?: 0.0,
                                    category = p.category,
                                    isExpense = p.isExpense,
                                    note = p.note
                                )
                                previewData = null
                                selectedImage = null
                                onClose()
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(46.dp),
                        shape = RoundedCornerShape(23.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = KeepYellow, contentColor = Ink)
                    ) {
                        Text("确认并保存", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        SnackbarHost(hostState = snackbar, modifier = Modifier.align(Alignment.BottomCenter))
    }
}
