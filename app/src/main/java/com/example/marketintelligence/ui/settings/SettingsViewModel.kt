
package com.example.marketintelligence.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.marketintelligence.domain.repository.SettingsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository
    // Factories are no longer needed here
) : ViewModel() {
    
    // This ViewModel is now much cleaner. It just reads the available options
    // and tells the repository what the user has selected.

    // --- Biometrics Logic (would also be in the repository) ---
    
    // --- Engine Selection Logic ---
    val availableScannerEngines: List<String> = listOf("Standard (Gemini)", "Proprietary Engine") // In a real app, get this from the router/factory
    val selectedScannerEngine = settingsRepository.selectedScannerEngine
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "")
    fun setScannerEngine(name: String) = viewModelScope.launch { settingsRepository.setScannerEngine(name) }

    // ... (Similar logic for Mentor and Chart engines)
}
