package com.ctrlai.app.ui

enum class ConnectionState {
    Idle,
    Connecting,
    Connected,
    Failed,
}

data class MainUiState(
    val isControlling: Boolean = false,
    val isControlled: Boolean = false,
    val connectionState: ConnectionState = ConnectionState.Idle,
    val pairCode: String? = null,
    val remoteName: String? = null,
    val isPeerConnected: Boolean = false,
    val errorMessage: String? = null,
)
