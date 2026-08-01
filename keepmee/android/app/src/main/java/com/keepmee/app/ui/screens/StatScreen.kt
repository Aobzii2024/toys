package com.keepmee.app.ui.screens

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keepmee.app.data.Transaction
import com.keepmee.app.ui.theme.Ink
import com.keepmee.app.ui.theme.LightGrey
import com.keepmee.app.ui.util.DateUtils
import com.keepmee.app.ui.util.formatMoney
import com.keepmee.app.ui.viewmodel.AppViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

private val pieColors = listOf(
    Color(0xFFFFD33D), Color(0xFFFF8A65), Color(0xFF81C784),
    Color(0xFF64B5F6), Color(0xFF9575CD), Color(0xFFF06292),
    Color(0xFF4DB6AC), Color(0xFFFFB74D), Color(0xFFA1887F),
    Color(0xFF90A4AE), Color(0xFFE57373), Color(0xFF7986CB)
)

@Composable
fun StatScreen(vm: AppViewModel, padding: PaddingValues) {
    val all by vm.transactions.collectAsStateWithLifecycle()
    var cursor by remember { mutableLongStateOf(System.currentTimeMillis()) }
    var isExpense by remember { mutableStateOf(true) }

    val start = DateUtils.startOfMonth(cursor)
    val end = DateUtils.nextMonth(start)
    val monthTx = all.filter { it.timestamp in start until end }
    val filtered = monthTx.filter { it.isExpense == isExpense }
    val total = filtered.sumOf { it.amount }
    val grouped = filtered.groupBy { it.category }
        .mapValues { it.value.sumOf { t -> t.amount } }
        .entries.sortedByDescending { it.value }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(DateUtils.formatMonth(cursor), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Ink)
            Spacer(Modifier.weight(1f))
            StatChip("支出", isExpense) { isExpense = true }
            Spacer(Modifier.width(8.dp))
            StatChip("收入", !isExpense) { isExpense = false }
        }

        if (total <= 0) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("本月暂无${if (isExpense) "支出" else "收入"}记录", color = Color(0xFF9E9E9E))
            }
            return
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 90.dp)
        ) {
            item {
                PieChart(grouped.map { it.value }, total)
                Spacer(Modifier.height(8.dp))
                Text(
                    "${if (isExpense) "支出" else "收入"}合计 ¥${formatMoney(total)}",
                    fontSize = 15.sp,
                    color = Ink,
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)
                )
                Spacer(Modifier.height(8.dp))
            }
            grouped.forEachIndexed { index, entry ->
                item(key = entry.key) {
                    LegendRow(entry.key, entry.value, total, index)
                }
            }
        }
    }
}

@Composable
private fun StatChip(text: String, active: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clickable(onClick = onClick)
            .background(
                if (active) Ink else Color.Transparent,
                RoundedCornerShape(16.dp)
            )
            .padding(horizontal = 18.dp, vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text,
            fontSize = 13.sp,
            color = if (active) Color.White else Color(0xFF9E9E9E)
        )
    }
}

@Composable
private fun PieChart(values: List<Double>, total: Double) {
    val strokeWidth = 26.dp
    Canvas(
        modifier = Modifier
            .size(200.dp)
            .padding(8.dp)
    ) {
        val diameter = size.minDimension
        val stroke = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
        var startAngle = -90f
        val totalSum = values.sum().takeIf { it > 0 } ?: return@Canvas

        values.forEachIndexed { index, value ->
            val sweep = (value / totalSum * 360).toFloat()
            drawArc(
                color = pieColors[index % pieColors.size],
                startAngle = startAngle,
                sweepAngle = sweep,
                useCenter = false,
                topLeft = Offset(strokeWidth.toPx() / 2, strokeWidth.toPx() / 2),
                size = Size(diameter - strokeWidth.toPx(), diameter - strokeWidth.toPx()),
                style = stroke
            )
            startAngle += sweep
        }
    }
}

@Composable
private fun LegendRow(category: String, amount: Double, total: Double, index: Int) {
    val percent = (amount / total * 100).toInt()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(pieColors[index % pieColors.size], CircleShape)
        )
        Spacer(Modifier.width(10.dp))
        Text(category, fontSize = 14.sp, color = Ink, modifier = Modifier.weight(1f))
        Text("$percent%", fontSize = 13.sp, color = Color(0xFF9E9E9E))
        Spacer(Modifier.width(12.dp))
        Text("¥${formatMoney(amount)}", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Ink)
    }
}
