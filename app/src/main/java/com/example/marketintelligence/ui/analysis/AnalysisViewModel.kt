
package com.example.marketintelligence.ui.analysis

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.marketintelligence.domain.engine.ChartEngine
import com.example.marketintelligence.domain.engine.EngineRouter
import com.example.marketintelligence.domain.usecase.GetTechnicalAnalysisUseCase
import com.example.marketintelligence.services.TechnicalAnalysis
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AnalysisUiState(
    val symbol: String,
    val technicalAnalysis: TechnicalAnalysis? = null,
    val livePrice: Double? = null,
    val isLoading: Boolean = true,
    val activeChartEngine: ChartEngine? = null // The UI will now get the engine instance directly
)

@HiltViewModel
class AnalysisViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val getTechnicalAnalysisUseCase: GetTechnicalAnalysisUseCase,
    private val engineRouter: EngineRouter,
    // ... MarketDataRepository for price updates
) : ViewModel() {

    // ... (rest of the logic is similar)
    private val symbol: String = checkNotNull(savedStateHandle["symbol"])
    private val _uiState = MutableStateFlow(AnalysisUiState(symbol = symbol))
    val uiState = _uiState.asStateFlow()

    init {
        // Observe the active chart engine from the router
        engineRouter.activeChartEngine
            .onEach { engine ->
                _uiState.update { it.copy(activeChartEngine = engine) }
            }
            .launchIn(viewModelScope)
        
        // ... (fetchAnalysis and subscribeToLivePrice logic remains)
    }
}
