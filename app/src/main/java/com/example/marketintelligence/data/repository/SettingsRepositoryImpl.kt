
package com.example.marketintelligence.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.example.marketintelligence.domain.repository.SettingsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SettingsRepositoryImpl @Inject constructor(
    private val dataStore: DataStore<Preferences>
) : SettingsRepository {

    private companion object {
        val SCANNER_ENGINE_KEY = stringPreferencesKey("scanner_engine_preference")
        val MENTOR_ENGINE_KEY = stringPreferencesKey("mentor_engine_preference")
        val CHART_ENGINE_KEY = stringPreferencesKey("chart_engine_preference")
    }

    override val selectedScannerEngine: Flow<String> = dataStore.data.map { it[SCANNER_ENGINE_KEY] ?: "Standard (Gemini)" }
    override val selectedMentorEngine: Flow<String> = dataStore.data.map { it[MENTOR_ENGINE_KEY] ?: "Standard (Gemini)" }
    override val selectedChartEngine: Flow<String> = dataStore.data.map { it[CHART_ENGINE_KEY] ?: "Standard (TradingView)" }

    override suspend fun setScannerEngine(name: String) {
        dataStore.edit { it[SCANNER_ENGINE_KEY] = name }
    }
    override suspend fun setMentorEngine(name: String) {
        dataStore.edit { it[MENTOR_ENGINE_KEY] = name }
    }
    override suspend fun setChartEngine(name: String) {
        dataStore.edit { it[CHART_ENGINE_KEY] = name }
    }
}
