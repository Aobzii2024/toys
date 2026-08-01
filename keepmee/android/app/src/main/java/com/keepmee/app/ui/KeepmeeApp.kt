package com.keepmee.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.keepmee.app.data.Transaction
import com.keepmee.app.ui.screens.AiRecordScreen
import com.keepmee.app.ui.screens.BillScreen
import com.keepmee.app.ui.screens.EditCategoryScreen
import com.keepmee.app.ui.screens.HomeScreen
import com.keepmee.app.ui.screens.RecordScreen
import com.keepmee.app.ui.screens.SettingsScreen
import com.keepmee.app.ui.screens.StatScreen
import com.keepmee.app.ui.theme.Ink
import com.keepmee.app.ui.theme.KeepGreen
import com.keepmee.app.ui.theme.LightGrey
import com.keepmee.app.ui.viewmodel.AppViewModel

private data class TabSpec(val label: String, val icon: ImageVector)

private val tabs = listOf(
    TabSpec("首页", Icons.Outlined.Home),
    TabSpec("账单", Icons.Outlined.Receipt),
    TabSpec("统计", Icons.Outlined.BarChart),
    TabSpec("设置", Icons.Outlined.Settings),
)

@Composable
fun KeepmeeApp() {
    val vm: AppViewModel = viewModel()
    var selected by rememberSaveable { mutableIntStateOf(0) }
    var showRecord by rememberSaveable { mutableStateOf(false) }
    var showAi by rememberSaveable { mutableStateOf(false) }
    var showEditCat by rememberSaveable { mutableStateOf(false) }
    var editingTransaction by rememberSaveable { mutableStateOf<Transaction?>(null) }

    Box(modifier = Modifier.fillMaxWidth()) {
        Scaffold(
            containerColor = Color(0xFFF7F8FA),
            bottomBar = {
                SharkBottomBar(
                    selected = selected,
                    onSelect = { selected = it },
                    onAdd = {
                        editingTransaction = null
                        showRecord = true
                    }
                )
            }
        ) { padding ->
            when (selected) {
                0 -> HomeScreen(vm, padding, onEdit = { editingTransaction = it; showRecord = true })
                1 -> BillScreen(vm, padding)
                2 -> StatScreen(vm, padding)
                else -> SettingsScreen(vm, padding)
            }
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
private fun SharkBottomBar(
    selected: Int,
    onSelect: (Int) -> Unit,
    onAdd: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .height(62.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // 左侧两个 tab
        (0..1).forEach { index ->
            BottomTabItem(
                tab = tabs[index],
                selected = selected == index,
                modifier = Modifier.weight(1f),
                onClick = { onSelect(index) }
            )
        }

        // 中央凸起记账按钮
        Box(
            modifier = Modifier
                .width(72.dp)
                .clickable(onClick = onAdd),
            contentAlignment = Alignment.TopCenter
        ) {
            Box(
                modifier = Modifier
                    .padding(top = 4.dp)
                    .size(56.dp)
                    .shadow(8.dp, CircleShape)
                    .background(
                        Brush.linearGradient(listOf(KeepGreen, Color(0xFF24C896))),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Outlined.Add,
                    contentDescription = "记账",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
            }
        }

        // 右侧两个 tab
        (2..3).forEach { index ->
            BottomTabItem(
                tab = tabs[index],
                selected = selected == index,
                modifier = Modifier.weight(1f),
                onClick = { onSelect(index) }
            )
        }
    }
}

@Composable
private fun BottomTabItem(
    tab: TabSpec,
    selected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Column(
        modifier = modifier
            .clickable(onClick = onClick)
            .padding(top = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            tab.icon,
            contentDescription = tab.label,
            tint = if (selected) KeepGreen else Color(0xFF9E9E9E),
            modifier = Modifier.size(24.dp)
        )
        Spacer(Modifier.height(2.dp))
        Text(
            tab.label,
            fontSize = 11.sp,
            color = if (selected) KeepGreen else Color(0xFF9E9E9E)
        )
    }
}
