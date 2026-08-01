package com.keepmee.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keepmee.app.data.Categories
import com.keepmee.app.data.Transaction
import com.keepmee.app.ui.theme.Ink
import com.keepmee.app.ui.theme.KeepYellow
import com.keepmee.app.ui.theme.LightGrey
import com.keepmee.app.ui.util.DateUtils
import com.keepmee.app.ui.util.formatMoney
import com.keepmee.app.ui.util.signMoney
import com.keepmee.app.ui.viewmodel.AppViewModel
import androidx.compose.ui.unit.Dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun HomeScreen(vm: AppViewModel, padding: PaddingValues) {
    var showRecord by remember { mutableStateOf(false) }
    var showAi by remember { mutableStateOf(false) }
    var showEditCat by remember { mutableStateOf(false) }
    var editingTransaction by remember { mutableStateOf<Transaction?>(null) }

    val all by vm.transactions.collectAsStateWithLifecycle()

    Box(modifier = Modifier.fillMaxSize().padding(padding)) {
        Column(modifier = Modifier.fillMaxSize()) {
            MonthHeaderCard(all)
            TransactionList(all = all, onEdit = { editingTransaction = it; showRecord = true })
        }

        if (showRecord) {
            RecordScreen(
                vm = vm,
                editTarget = editingTransaction,
                onClose = { showRecord = false; editingTransaction = null },
                onOpenAi = { showRecord = false; showAi = true },
                onEditCategory = { showRecord = false; showEditCat = true }
            )
        }
        if (showAi) {
            AiRecordScreen(vm = vm, onClose = { showAi = false })
        }
        if (showEditCat) {
            EditCategoryScreen(vm = vm, onClose = { showEditCat = false })
        }
    }
}

@Composable
private fun MonthHeaderCard(all: List<Transaction>) {
    val now = System.currentTimeMillis()
    val monthStart = DateUtils.startOfMonth(now)
    val monthEnd = DateUtils.nextMonth(monthStart)
    val monthTx = all.filter { it.timestamp in monthStart until monthEnd }
    val income = monthTx.filter { !it.isExpense }.sumOf { it.amount }
    val expense = monthTx.filter { it.isExpense }.sumOf { it.amount }
    val balance = income - expense

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(KeepYellow)
            .padding(horizontal = 20.dp, vertical = 18.dp)
    ) {
        Text(DateUtils.formatMonth(now), fontSize = 13.sp, color = Ink.copy(alpha = 0.7f))
        Spacer(Modifier.height(6.dp))
        Text(
            "本月结余 ¥${formatMoney(balance)}",
            fontSize = 30.sp,
            fontWeight = FontWeight.Bold,
            color = Ink
        )
        Spacer(Modifier.height(14.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            SummaryItem("收入", income, Modifier.weight(1f))
            SummaryItem("支出", expense, Modifier.weight(1f))
        }
    }
}

@Composable
private fun SummaryItem(label: String, amount: Double, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Text(label, fontSize = 13.sp, color = Ink.copy(alpha = 0.7f))
        Spacer(Modifier.height(2.dp))
        Text("¥${formatMoney(amount)}", fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = Ink)
    }
}

@Composable
private fun TransactionList(
    all: List<Transaction>,
    onEdit: (Transaction) -> Unit
) {
    if (all.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("还没有记账记录", fontSize = 16.sp, color = Color(0xFF9E9E9E))
                Spacer(Modifier.height(4.dp))
                Text("点击下方首页按钮开始记账", fontSize = 13.sp, color = Color(0xFFBDBDBD))
            }
        }
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 90.dp)
    ) {
        val grouped = all.groupBy { DateUtils.startOfDay(it.timestamp) }
        val sortedDays = grouped.keys.sortedByDescending { it }
        sortedDays.forEach { day ->
            val dayTx = grouped[day]!!
            item(key = "day_$day") {
                val income = dayTx.filter { !it.isExpense }.sumOf { it.amount }
                val expense = dayTx.filter { it.isExpense }.sumOf { it.amount }
                Column(modifier = Modifier.fillMaxWidth().background(Color.White)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(DateUtils.formatDay(day), fontSize = 14.sp, color = Color(0xFF616161), fontWeight = FontWeight.Medium)
                        Spacer(Modifier.weight(1f))
                        Text("收 ¥${formatMoney(income)}", fontSize = 12.sp, color = Color(0xFF616161))
                        Spacer(Modifier.width(8.dp))
                        Text("支 ¥${formatMoney(expense)}", fontSize = 12.sp, color = Color(0xFF616161))
                    }
                    HorizontalDivider(color = Color(0xFFF0F0F0))
                }
            }
            items(dayTx, key = { it.id }) { t ->
                TransactionRow(t, onClick = { onEdit(t) })
                HorizontalDivider(color = Color(0xFFF5F5F5))
            }
        }
    }
}

@Composable
fun TransactionRow(t: Transaction, onClick: () -> Unit) {
    val cat = Categories.byName(t.category, t.isExpense)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(LightGrey, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                cat?.icon ?: Icons.Outlined.Star,
                contentDescription = t.category,
                tint = Ink,
                modifier = Modifier.size(22.dp)
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(t.category, fontSize = 15.sp, color = Ink, fontWeight = FontWeight.Medium)
            if (t.note.isNotBlank()) {
                Text(t.note, fontSize = 12.sp, color = Color(0xFF9E9E9E), maxLines = 1)
            }
        }
        Text(
            signMoney(t.amount, t.isExpense),
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (t.isExpense) Color(0xFF333333) else Color(0xFF2E7D32)
        )
    }
}
