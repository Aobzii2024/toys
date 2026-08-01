package com.keepmee.app.ui.viewmodel

import android.app.Application
import android.graphics.Bitmap
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.keepmee.app.ai.AiConfig
import com.keepmee.app.ai.AiVisionClient
import com.keepmee.app.ai.SettingsRepository
import com.keepmee.app.data.Categories
import com.keepmee.app.data.Transaction
import com.keepmee.app.data.TransactionRepository
import com.keepmee.app.export.BackupManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface UiState {
    data object Idle : UiState
    data class Loading(val message: String) : UiState
    data class Success(val message: String) : UiState
    data class Error(val message: String) : UiState
}

class AppViewModel(application: Application) : AndroidViewModel(application) {

    private val repo = TransactionRepository.get(application)
    private val settings = SettingsRepository(application)

    val transactions = repo.observeAll().stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    val aiConfig: StateFlow<AiConfig> = settings.aiConfig.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), AiConfig()
    )

    val customIncomes: StateFlow<List<String>> = settings.customIncomes.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private var pendingAiResult: AiParseUiData? = null

    data class AiParseUiData(
        val amount: String,
        val category: String,
        val note: String,
        val isExpense: Boolean,
        val image: Bitmap
    )

    suspend fun addTransaction(
        amount: Double,
        category: String,
        isExpense: Boolean,
        note: String,
        timestamp: Long = System.currentTimeMillis()
    ): Long {
        val id = System.nanoTime().takeIf { it > 0 } ?: System.currentTimeMillis()
        return repo.insert(
            Transaction(id = id, amount = amount, category = category, isExpense = isExpense, note = note, timestamp = timestamp)
        )
    }

    fun updateTransaction(t: Transaction) = viewModelScope.launch {
        repo.update(t)
    }

    fun deleteTransaction(t: Transaction) = viewModelScope.launch {
        repo.delete(t)
    }

    fun clearAll() = viewModelScope.launch {
        repo.replaceAll(emptyList())
        _uiState.value = UiState.Success("已清空所有数据")
    }

    fun saveAiConfig(config: AiConfig) = viewModelScope.launch {
        settings.saveAiConfig(config)
        _uiState.value = UiState.Success("设置已保存")
    }

    fun addCustomIncome(name: String) = viewModelScope.launch {
        settings.addCustomIncome(name)
        _uiState.value = UiState.Success("已添加分类")
    }

    fun removeCustomIncome(name: String) = viewModelScope.launch {
        settings.removeCustomIncome(name)
    }

    fun exportTo(uri: Uri) = viewModelScope.launch {
        _uiState.value = UiState.Loading("正在导出...")
        BackupManager.writeToUri(getApplication(), uri, repo.getAll())
            .onSuccess { _uiState.value = UiState.Success(it) }
            .onFailure { _uiState.value = UiState.Error(it.message ?: "导出失败") }
    }

    fun importFrom(uri: Uri, merge: Boolean) = viewModelScope.launch {
        _uiState.value = UiState.Loading("正在导入...")
        BackupManager.readFromUri(getApplication(), uri)
            .onSuccess { list ->
                if (list.isEmpty()) {
                    _uiState.value = UiState.Error("文件中没有可导入的记录")
                } else {
                    val existing = repo.getAll().toMutableSet()
                    val newItems = list.filter { it !in existing }
                    if (newItems.isEmpty()) {
                        _uiState.value = UiState.Success("数据无变化，已是最新")
                    } else {
                        if (merge) {
                            repo.insertAllWithIds(newItems)
                        } else {
                            repo.replaceAll(newItems)
                        }
                        _uiState.value = UiState.Success("成功导入 ${newItems.size} 条记录")
                    }
                }
            }
            .onFailure { _uiState.value = UiState.Error(it.message ?: "导入失败") }
    }

    fun parseReceiptImage(image: Bitmap) = viewModelScope.launch {
        val config = aiConfig.value
        if (!config.isConfigured) {
            _uiState.value = UiState.Error("视觉AI未配置，请先在设置中填写 BaseURL / API Key / 模型")
            return@launch
        }
        _uiState.value = UiState.Loading("AI 正在识别图片...")
        AiVisionClient(config).parseReceipt(image)
            .onSuccess { result ->
                pendingAiResult = AiParseUiData(
                    amount = if (result.amount % 1.0 == 0.0) result.amount.toInt().toString() else "%.2f".format(result.amount),
                    category = result.category,
                    note = result.note,
                    isExpense = result.isExpense,
                    image = image
                )
                _uiState.value = UiState.Success("识别成功，请确认后保存")
            }
            .onFailure { _uiState.value = UiState.Error(it.message ?: "识别失败") }
    }

    fun consumePendingAiResult(): AiParseUiData? {
        val r = pendingAiResult
        pendingAiResult = null
        return r
    }

    fun resetState() {
        _uiState.value = UiState.Idle
    }
}
