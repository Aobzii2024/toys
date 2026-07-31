package com.ctrlai.app.ui

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ctrlai.app.signaling.SignalingClient
import com.ctrlai.app.signaling.SignalingEvent
import com.ctrlai.app.signaling.SignalingMessage
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * 主流程 ViewModel。管理模式切换、配对连接与会话状态。
 * 真实联调时与 PeerConnectionManager 联编完成 WebRTC 协商。
 */
class MainViewModel : ViewModel() {

    companion object {
        private const val TAG = "MainViewModel"
        private const val SERVER_URL = "ws://192.168.1.100:8080/ws"
    }

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    private var signalingClient: SignalingClient? = null
    private var context: Context? = null

    fun attachContext(context: Context) {
        if (this.context == null) {
            this.context = context.applicationContext
        }
    }

    fun startControlling() {
        _uiState.update { it.copy(isControlling = true, isControlled = false, connectionState = ConnectionState.Idle) }
        connectSignaling(role = "controller")
    }

    fun startBeingControlled() {
        _uiState.update { it.copy(isControlling = false, isControlled = true, connectionState = ConnectionState.Idle) }
        connectSignaling(role = "controlled")
    }

    fun connect(pairCode: String) {
        if (pairCode.length != 6) return
        _uiState.update { it.copy(connectionState = ConnectionState.Connecting, errorMessage = null) }
        viewModelScope.launch {
            signalingClient?.send(
                SignalingMessage(type = "connect", pairCode = pairCode),
            )
        }
    }

    fun stopControlling() {
        viewModelScope.launch {
            signalingClient?.send(SignalingMessage(type = "disconnect"))
        }
        _uiState.update { it.copy(isControlling = false, connectionState = ConnectionState.Idle) }
    }

    fun stopBeingControlled() {
        viewModelScope.launch {
            signalingClient?.send(SignalingMessage(type = "disconnect"))
        }
        _uiState.update { it.copy(isControlled = false, connectionState = ConnectionState.Idle) }
    }

    /** 屏幕录制授权结果透传，联调时交由 PeerConnectionManager 处理。 */
    fun onProjectionGranted(resultCode: Int, data: Intent) {
        Log.d(TAG, "projection granted: $resultCode")
    }

    private fun connectSignaling(role: String) {
        val appContext = context ?: return
        val client = SignalingClient(
            serverUrl = SERVER_URL,
            deviceId = DeviceIdentity.deviceId(appContext),
            deviceName = DeviceIdentity.deviceName(appContext),
        )
        signalingClient?.close()
        signalingClient = client

        viewModelScope.launch {
            val flow: Flow<SignalingEvent> = client.events
            flow.collect { event ->
                handleSignalingEvent(event, role)
            }
        }
        client.connect(role)
    }

    private fun handleSignalingEvent(event: SignalingEvent, role: String) {
        when (event) {
            is SignalingEvent.PairCode -> {
                _uiState.update { it.copy(pairCode = event.code) }
                Log.d(TAG, "pair code: ${event.code}")
            }
            is SignalingEvent.Connected -> {
                _uiState.update {
                    it.copy(
                        connectionState = ConnectionState.Connected,
                        remoteName = event.remote.name ?: event.remote.deviceId,
                    )
                }
            }
            is SignalingEvent.PeerJoined -> {
                _uiState.update {
                    it.copy(isPeerConnected = true, remoteName = event.remote.name ?: event.remote.deviceId)
                }
            }
            is SignalingEvent.Error -> {
                _uiState.update {
                    it.copy(
                        connectionState = if (role == "controller") ConnectionState.Failed else it.connectionState,
                        errorMessage = event.message,
                    )
                }
            }
            is SignalingEvent.Disconnected -> {
                _uiState.update { it.copy(isPeerConnected = false) }
            }
            else -> Unit
        }
    }

    override fun onCleared() {
        signalingClient?.close()
        super.onCleared()
    }
}
