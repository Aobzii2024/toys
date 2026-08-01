package com.keepmee.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.PhotoCamera
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keepmee.app.data.Categories
import com.keepmee.app.data.Category
import com.keepmee.app.data.Transaction
import com.keepmee.app.ui.theme.Ink
import com.keepmee.app.ui.theme.KeepGreen
import com.keepmee.app.ui.viewmodel.AppViewModel
import com.keepmee.app.ui.util.formatMoney
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.launch

@Composable
fun RecordScreen(
    vm: AppViewModel,
    editTarget: Transaction? = null,
    onClose: () -> Unit,
    onOpenAi: () -> Unit,
    onEditCategory: () -> Unit
) {
    var isExpense by remember { mutableStateOf(editTarget?.isExpense ?: true) }
    var selectedCategory by remember { mutableStateOf(editTarget?.category) }
    var amountText by remember { mutableStateOf(editTarget?.amount?.let { formatMoney(it) } ?: "") }
    var note by remember { mutableStateOf(editTarget?.note ?: "") }
    val scope = rememberCoroutineScope()
    val customIncomes by vm.customIncomes.collectAsStateWithLifecycle()
    val allIncomes = remember(customIncomes) {
        Categories.incomes + customIncomes.map { Category(it, Icons.Outlined.Star, false, com.keepmee.app.ui.theme.KeepGreen, editable = true) }
    }

    val categories = if (isExpense) Categories.expenses else allIncomes

    fun save() {
        val amount = amountText.toDoubleOrNull() ?: return
        val cat = selectedCategory ?: return
        scope.launch {
            if (editTarget != null) {
                vm.updateTransaction(
                    editTarget.copy(
                        amount = amount,
                        category = cat,
                        isExpense = isExpense,
                        note = note.trim()
                    )
                )
            } else {
                vm.addTransaction(
                    amount = amount,
                    category = cat,
                    isExpense = isExpense,
                    note = note.trim()
                )
            }
        }
        onClose()
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.White)) {
        Column(modifier = Modifier.fillMaxSize().imePadding()) {
            // 绿色顶栏：支出/收入切换 + 取消
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.linearGradient(listOf(Color(0xFF3FD8B0), Color(0xFF22B990)))
                    )
                    .padding(horizontal = 12.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TextButton(onClick = { onClose() }) {
                            Text("取消", color = Color.White, fontSize = 16.sp)
                        }
                        Spacer(Modifier.weight(1f))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            TabChip("支出", isExpense) { isExpense = true; selectedCategory = null }
                            Spacer(Modifier.width(24.dp))
                            TabChip("收入", !isExpense) { isExpense = false; selectedCategory = null }
                        }
                        Spacer(Modifier.weight(1f))
                        TextButton(onClick = { onClose() }) {
                            Text("", color = Ink, fontSize = 16.sp)
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                }
            }

            // 金额输入
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (editTarget != null) {
                    IconButton(onClick = {
                        scope.launch { vm.deleteTransaction(editTarget) }
                        onClose()
                    }) {
                        Icon(Icons.Outlined.Delete, contentDescription = "删除", tint = Ink)
                    }
                }
                Text("¥", fontSize = 40.sp, fontWeight = FontWeight.Bold, color = Ink)
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it.filter { c -> c.isDigit() || c == '.' } },
                    placeholder = { Text("0.00") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    textStyle = androidx.compose.ui.text.TextStyle(fontSize = 34.sp, fontWeight = FontWeight.Bold, color = Ink),
                    shape = RoundedCornerShape(8.dp)
                )
            }

            // 分类网格
            LazyVerticalGrid(
                columns = GridCells.Fixed(4),
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(8.dp)
            ) {
                items(categories) { cat ->
                    CategoryCell(
                        cat = cat,
                        selected = selectedCategory == cat.name,
                        onClick = {
                            if (cat.editable) onEditCategory() else selectedCategory = cat.name
                        }
                    )
                }
                items(if (isExpense) listOf<Category>() else listOf(
                    Category("设置", Icons.Outlined.Settings, false, com.keepmee.app.ui.theme.KeepGreen, editable = true)
                )) { cat ->
                    CategoryCell(
                        cat = cat,
                        selected = selectedCategory == cat.name,
                        onClick = {
                            if (cat.editable) onEditCategory() else selectedCategory = cat.name
                        }
                    )
                }
            }

            // 备注与保存
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onOpenAi) {
                    Icon(Icons.Outlined.PhotoCamera, contentDescription = "AI拍照记账", tint = Ink)
                }
                Spacer(Modifier.width(4.dp))
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    placeholder = { Text("备注（可选）") },
                    modifier = Modifier.weight(1f).height(56.dp),
                    singleLine = true
                )
            }

            Button(
                onClick = ::save,
                enabled = selectedCategory != null && amountText.toDoubleOrNull()?.let { it > 0 } == true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
                    .height(52.dp),
                shape = RoundedCornerShape(26.dp),
                colors = ButtonDefaults.buttonColors(containerColor = KeepGreen, contentColor = Color.White)
            ) {
                Text("保存${if (isExpense) "支出" else "收入"} ¥${amountText.ifBlank { "0" }}", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun TabChip(text: String, active: Boolean, onClick: () -> Unit) {
    Text(
        text = text,
        fontSize = 18.sp,
        fontWeight = if (active) FontWeight.Bold else FontWeight.Normal,
        color = if (active) Color.White else Color.White.copy(alpha = 0.6f),
        modifier = Modifier
            .padding(vertical = 4.dp)
            .clickable(onClick = onClick),
        textAlign = TextAlign.Center
    )
    if (active) {
        Box(
            modifier = Modifier
                .width(22.dp)
                .height(3.dp)
                .background(Color.White, RoundedCornerShape(2.dp))
        )
    }
}

@Composable
fun CategoryCell(
    cat: Category,
    selected: Boolean,
    onClick: () -> Unit
) {
    val tileColor = if (selected) KeepGreen else cat.color
    Column(
        modifier = Modifier
            .padding(6.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(50.dp)
                .background(tileColor, RoundedCornerShape(14.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                cat.icon,
                contentDescription = cat.name,
                tint = Color.White,
                modifier = Modifier.size(26.dp)
            )
        }
        Spacer(Modifier.height(4.dp))
        Text(
            cat.name,
            fontSize = 12.sp,
            color = Ink,
            maxLines = 1
        )
    }
}
