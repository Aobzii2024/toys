package com.ctrlai.app.ui

import org.webrtc.VideoTrack

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
    val remoteVideoTrack: VideoTrack? = null,
    val isFullScreenMode: Boolean = false,
    val transferStatus: String? = null,
    val relaySignalingUrl: String = RemoteRelayDefaults.SIGNALING_URL,
    val turnServerUrl: String = RemoteRelayDefaults.TURN_URL,
    val turnUsername: String = RemoteRelayDefaults.TURN_USERNAME,
    val turnPassword: String = RemoteRelayDefaults.TURN_PASSWORD,
    val errorMessage: String? = null,
)
