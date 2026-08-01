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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.ArrowDropDown
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.material.icons.outlined.Radar
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keepmee.app.data.Transaction
import com.keepmee.app.ui.theme.Ink
import com.keepmee.app.ui.theme.KeepYellow
import com.keepmee.app.ui.util.DateUtils
import com.keepmee.app.ui.util.formatMoney
import com.keepmee.app.ui.viewmodel.AppViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import java.util.Calendar

@Composable
fun BillScreen(vm: AppViewModel, padding: PaddingValues) {
    val all by vm.transactions.collectAsStateWithLifecycle()
    var cursor by remember { mutableLongStateOf(System.currentTimeMillis()) }
    var yearMode by remember { mutableStateOf(false) }

    val income = all.filter { !it.isExpense }.sumOf { it.amount }
    val expense = all.filter { it.isExpense }.sumOf { it.amount }
    val balance = income - expense

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
    ) {
        BillTopBar(cursor = cursor, yearMode = yearMode) { yearMode = it }
        BillSummaryCard(balance = balance, income = income, expense = expense, yearMode = yearMode)
        MonthlyTable(all = all, cursor = cursor, yearMode = yearMode)
    }
}

@Composable
private fun BillTopBar(
    cursor: Long,
    yearMode: Boolean,
    onModeChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = {}) { Icon(Icons.Outlined.MoreHoriz, contentDescription = "更多", tint = Ink) }
        IconButton(onClick = {}) { Icon(Icons.Outlined.Radar, contentDescription = "视图", tint = Ink) }
        Spacer(Modifier.weight(1f))
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable {}) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    if (yearMode) DateUtils.formatYear(cursor) else DateUtils.formatMonth(cursor),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Ink
                )
                Icon(Icons.Outlined.ArrowDropDown, contentDescription = "切换", tint = Ink)
            }
        }
        Spacer(Modifier.weight(1f))
        Spacer(Modifier.width(80.dp))
    }

    // 月/年分段切换
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            modifier = Modifier
                .background(Color.White, RoundedCornerShape(20.dp))
                .padding(2.dp)
        ) {
            SegmentChip("月账单", !yearMode) { onModeChange(false) }
            SegmentChip("年账单", yearMode) { onModeChange(true) }
        }
    }
}

@Composable
private fun SegmentChip(text: String, active: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .background(
                if (active) Ink else Color.Transparent,
                RoundedCornerShape(18.dp)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 28.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(text, color = if (active) Color.White else Ink, fontSize = 14.sp)
    }
}

@Composable
private fun BillSummaryCard(
    balance: Double,
    income: Double,
    expense: Double,
    yearMode: Boolean
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .background(KeepYellow, RoundedCornerShape(16.dp))
            .padding(18.dp)
    ) {
        Text(if (yearMode) "年结余" else "月结余", fontSize = 13.sp, color = Ink.copy(alpha = 0.7f))
        Spacer(Modifier.height(6.dp))
        Text("¥${formatMoney(balance)}", fontSize = 30.sp, fontWeight = FontWeight.Bold, color = Ink)
        Spacer(Modifier.height(14.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.weight(1f)) {
                Text(if (yearMode) "年收入" else "月收入", fontSize = 12.sp, color = Ink.copy(alpha = 0.7f))
                Text("¥${formatMoney(income)}", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Ink)
            }
            Column(Modifier.weight(1f)) {
                Text(if (yearMode) "年支出" else "月支出", fontSize = 12.sp, color = Ink.copy(alpha = 0.7f))
                Text("¥${formatMoney(expense)}", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Ink)
            }
        }
    }
}

@Composable
private fun MonthlyTable(all: List<Transaction>, cursor: Long, yearMode: Boolean) {
    val year = Calendar.getInstance().apply { timeInMillis = cursor }.get(Calendar.YEAR)

    val months = remember(year) {
        (1..12).map { month ->
            val cal = Calendar.getInstance()
            cal.set(year, month - 1, 1, 0, 0, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val start = cal.timeInMillis
            cal.add(Calendar.MONTH, 1)
            val end = cal.timeInMillis
            val tx = all.filter { it.timestamp in start until end }
            val inc = tx.filter { !it.isExpense }.sumOf { it.amount }
            val exp = tx.filter { it.isExpense }.sumOf { it.amount }
            Triple(month, inc, exp)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .background(Color.White, RoundedCornerShape(12.dp))
            .padding(horizontal = 12.dp, vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TableHeader("月份", Modifier.weight(0.8f))
            TableHeader("月收入", Modifier.weight(1.2f))
            TableHeader("月支出", Modifier.weight(1.2f))
            TableHeader("月结余", Modifier.weight(1.2f))
        }
        HorizontalDivider(color = Color(0xFFF0F0F0))
        months.forEachIndexed { index, (month, inc, exp) ->
            val bal = inc - exp
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { }
                    .padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("${month}月", fontSize = 14.sp, color = Ink, modifier = Modifier.weight(0.8f))
                Text(formatMoney(inc), fontSize = 13.sp, color = Ink.copy(alpha = 0.85f), modifier = Modifier.weight(1.2f))
                Text(formatMoney(exp), fontSize = 13.sp, color = Ink.copy(alpha = 0.85f), modifier = Modifier.weight(1.2f))
                Text(
                    formatMoney(bal),
                    fontSize = 13.sp,
                    color = if (bal >= 0) Color(0xFF2E7D32) else Color(0xFFC62828),
                    modifier = Modifier.weight(1.2f)
                )
            }
        }
    }
}

@Composable
private fun TableHeader(text: String, modifier: Modifier = Modifier) {
    Text(text, fontSize = 12.sp, color = Color(0xFF9E9E9E), modifier = modifier)
}
