package com.ctrlai.app.ui

import android.content.Context
import android.provider.Settings
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ctrlai.app.input.RemoteAccessibilityService

@Composable
fun MainScreen(
    viewModel: MainViewModel = viewModel(),
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val accessibilityEnabled by remember { mutableStateOf(isAccessibilityEnabled(context)) }
    CtrlAiTheme {
        Scaffold { padding ->
            Box(modifier = Modifier.padding(padding).fillMaxSize()) {
                when {
                    state.isControlling -> ControllerScreen(
                        state = state,
                        onDisconnect = viewModel::stopControlling,
                    )
                    state.isControlled -> ControlledScreen(
                        state = state,
                        onStop = viewModel::stopBeingControlled,
                        onProjectionGranted = viewModel::onProjectionGranted,
                        accessibilityEnabled = accessibilityEnabled,
                    )
                    else -> ModeSelectScreen(
                        onControllerClick = viewModel::startControlling,
                        onControlledClick = viewModel::startBeingControlled,
                    )
                }
            }
        }
    }
}

private fun isAccessibilityEnabled(context: Context): Boolean {
    val enabled = Settings.Secure.getString(
        context.contentResolver,
        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
    ) ?: return false
    return enabled.split(':').any { it.contains(RemoteAccessibilityService::class.java.name) }
}
