
package com.example.marketintelligence.ui.fno

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.marketintelligence.domain.engine.EngineRouter
import com.example.marketintelligence.domain.engine.LiveIntelligenceBus
import com.example.marketintelligence.domain.usecase.FnoWorkflowUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FnoViewModel @Inject constructor(
    private val fnoWorkflowUseCase: FnoWorkflowUseCase,
    private val engineRouter: EngineRouter, // To get the active mentor
    private val intelligenceBus: LiveIntelligenceBus // To post the signal
) : ViewModel() {

    private val _uiState = MutableStateFlow(FnoUiState())
    val uiState = _uiState.asStateFlow()

    init { selectAsset("NIFTY 50") }

    fun selectAsset(asset: String) {
        _uiState.update { it.copy(isLoading = true, selectedAsset = asset, generatedSignal = null, mentorExplanation = null, errorMessage = null) }
        
        viewModelScope.launch {
            val result = fnoWorkflowUseCase.generateSignal(asset)
            result.fold(
                onSuccess = { signal ->
                    // 1. Post the live signal to the central bus
                    intelligenceBus.postFnoSignal(signal)

                    // 2. Get the active mentor and ask it for an explanation
                    val activeMentor = engineRouter.activeMentorEngine.first()
                    val explanation = activeMentor.explainSignal(signal)
                    
                    // 3. Update the UI with both the signal and the explanation
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            marketRegime = signal.marketRegime,
                            generatedSignal = signal,
                            mentorExplanation = explanation
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false, errorMessage = error.message) }
                }
            )
        }
    }
}
