
package com.example.marketintelligence.domain.repository

import kotlinx.coroutines.flow.Flow

interface SettingsRepository {
    val selectedScannerEngine: Flow<String>
    val selectedMentorEngine: Flow<String>
    val selectedChartEngine: Flow<String>

    suspend fun setScannerEngine(name: String)
    suspend fun setMentorEngine(name: String)
    suspend fun setChartEngine(name: String)
}
