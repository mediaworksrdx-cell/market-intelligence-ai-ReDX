
package com.example.marketintelligence.ui.academy

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.marketintelligence.data.model.AiTradeSignal
import com.example.marketintelligence.domain.engine.LiveIntelligenceBus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AcademyUiState(
    val lastFnoSignal: AiTradeSignal? = null, // New field to hold the live signal
    val isLoading: Boolean = false
    // ... other state properties
)

@HiltViewModel
class AcademyViewModel @Inject constructor(
    private val intelligenceBus: LiveIntelligenceBus
) : ViewModel() {

    private val _uiState = MutableStateFlow(AcademyUiState())
    val uiState = _uiState.asStateFlow()

    init {
        // Listen for live F&O signals from the bus
        intelligenceBus.fnoSignalFlow
            .onEach { signal ->
                // When a new signal arrives, update the Academy's state
                _uiState.update { it.copy(lastFnoSignal = signal) }
                // This can now be used to generate contextual suggestions in the UI,
                // e.g., "The last signal was a Bull Call Spread. Review the lesson on vertical spreads?"
            }
            .launchIn(viewModelScope)
    }
}
