package com.keepmee.app.ai

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "settings")

data class AiConfig(
    val baseUrl: String = "",
    val apiKey: String = "",
    val model: String = ""
) {
    val isConfigured: Boolean get() = baseUrl.isNotBlank() && apiKey.isNotBlank() && model.isNotBlank()
}

class SettingsRepository(private val context: Context) {

    private object Keys {
        val BASE_URL = stringPreferencesKey("ai_base_url")
        val API_KEY = stringPreferencesKey("ai_api_key")
        val MODEL = stringPreferencesKey("ai_model")
        val CUSTOM_INCOMES = stringSetPreferencesKey("custom_incomes")
    }

    val aiConfig: Flow<AiConfig> = context.dataStore.data.map { prefs ->
        AiConfig(
            baseUrl = prefs[Keys.BASE_URL] ?: "",
            apiKey = prefs[Keys.API_KEY] ?: "",
            model = prefs[Keys.MODEL] ?: ""
        )
    }

    val customIncomes: Flow<List<String>> = context.dataStore.data.map { prefs ->
        (prefs[Keys.CUSTOM_INCOMES] ?: emptySet()).toList()
    }

    suspend fun saveAiConfig(config: AiConfig) {
        context.dataStore.edit { prefs ->
            prefs[Keys.BASE_URL] = config.baseUrl.trim()
            prefs[Keys.API_KEY] = config.apiKey.trim()
            prefs[Keys.MODEL] = config.model.trim()
        }
    }

    suspend fun addCustomIncome(name: String) {
        context.dataStore.edit { prefs ->
            val set = prefs[Keys.CUSTOM_INCOMES]?.toMutableSet() ?: mutableSetOf()
            set.add(name.trim())
            prefs[Keys.CUSTOM_INCOMES] = set
        }
    }

    suspend fun removeCustomIncome(name: String) {
        context.dataStore.edit { prefs ->
            val set = prefs[Keys.CUSTOM_INCOMES]?.toMutableSet() ?: return@edit
            set.remove(name)
            prefs[Keys.CUSTOM_INCOMES] = set
        }
    }
}
