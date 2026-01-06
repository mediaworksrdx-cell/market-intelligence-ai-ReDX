
package com.example.marketintelligence.ui.scanner

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.work.*
import com.example.marketintelligence.domain.usecase.ScanStockUseCase
import com.example.marketintelligence.ui.settings.SettingsViewModel // Cannot inject another ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import javax.inject.Inject

// This demonstrates the final step of connecting the preference to the logic.
// A production app would inject a SettingsRepository instead of a ViewModel.

@HiltViewModel
class AIScannerViewModel @Inject constructor(
    private val scanStockUseCase: ScanStockUseCase,
    // settingsViewModel: SettingsViewModel // This is not ideal, but shows the connection for summary
) : ViewModel() {

    // ... (rest of the state and logic)
    
    fun startManualScan(selectedEngineName: String) { // Engine name is now passed in
        val symbol = "..." // get symbol from state
        
        scanStockUseCase(
            symbol = symbol,
            timeframe = "1h",
            selectedEngineName = selectedEngineName // Pass the user's choice to the Use Case
        ).onEach {
            // ... handle result
        }.launchIn(viewModelScope)
    }

    // ...
}
