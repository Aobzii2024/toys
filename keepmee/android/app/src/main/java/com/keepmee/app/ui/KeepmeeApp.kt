package com.keepmee.app.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AddCircle
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import com.keepmee.app.ui.screens.BillScreen
import com.keepmee.app.ui.screens.HomeScreen
import com.keepmee.app.ui.screens.StatScreen
import com.keepmee.app.ui.screens.SettingsScreen
import com.keepmee.app.ui.theme.Ink
import com.keepmee.app.ui.theme.KeepYellow
import com.keepmee.app.ui.viewmodel.AppViewModel

enum class Tab(val label: String, val icon: ImageVector) {
    Home("首页", Icons.Outlined.Home),
    Bill("账单", Icons.Outlined.Receipt),
    Stat("统计", Icons.Outlined.BarChart),
    Settings("设置", Icons.Outlined.Settings),
}

@Composable
fun KeepmeeApp() {
    val vm: AppViewModel = viewModel()
    var selected by rememberSaveable { mutableIntStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                Tab.entries.forEachIndexed { index, tab ->
                    val isSelected = selected == index
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { selected = index },
                        icon = {
                            if (tab == Tab.Home) {
                                Icon(
                                    Icons.Outlined.AddCircle,
                                    contentDescription = tab.label,
                                    tint = if (isSelected) Ink else Color(0xFF9E9E9E)
                                )
                            } else {
                                Icon(
                                    tab.icon,
                                    contentDescription = tab.label,
                                    tint = if (isSelected) Ink else Color(0xFF9E9E9E)
                                )
                            }
                        },
                        label = { Text(tab.label, color = if (isSelected) Ink else Color(0xFF9E9E9E)) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Ink,
                            selectedTextColor = Ink,
                            indicatorColor = KeepYellow
                        )
                    )
                }
            }
        }
    ) { padding ->
        when (Tab.entries[selected]) {
            Tab.Home -> HomeScreen(vm, padding)
            Tab.Bill -> BillScreen(vm, padding)
            Tab.Stat -> StatScreen(vm, padding)
            Tab.Settings -> SettingsScreen(vm, padding)
        }
    }
}
