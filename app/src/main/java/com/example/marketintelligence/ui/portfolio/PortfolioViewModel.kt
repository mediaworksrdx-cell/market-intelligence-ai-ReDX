
package com.example.marketintelligence.ui.portfolio

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.marketintelligence.domain.repository.PortfolioRepository
import com.example.marketintelligence.domain.usecase.CalculatePortfolioUseCase
import com.example.marketintelligence.ui.main.GlobalSettingsViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import javax.inject.Inject

@HiltViewModel
class PortfolioViewModel @Inject constructor(
    private val portfolioRepository: PortfolioRepository,
    private val globalSettingsViewModel: GlobalSettingsViewModel,
    private val calculatePortfolioUseCase: CalculatePortfolioUseCase
    // MarketDataRepository would also be injected to fetch quotes to pass to the use case
) : ViewModel() {

    private val _uiState = MutableStateFlow(PortfolioUiState())
    val uiState = _uiState.asStateFlow()

    init {
        // This ViewModel is now much cleaner. It coordinates fetching data
        // and delegates the complex business logic to the Use Case.
        combine(
            portfolioRepository.getAllTransactions(),
            globalSettingsViewModel.state
        ) { transactions, globalState ->
            _uiState.update { it.copy(isLoading = true, selectedMarket = globalState.selectedMarket) }
            
            // In a real implementation, you'd fetch fresh quotes here.
            val quotes = emptyMap<String, com.example.marketintelligence.data.model.StockQuote>()
            
            val allHoldings = calculatePortfolioUseCase(transactions, quotes)
            val filteredHoldings = allHoldings.filter { it.market == globalState.selectedMarket }
            
            _uiState.update {
                it.copy(
                    holdings = filteredHoldings,
                    totalCurrentValue = filteredHoldings.sumOf { h -> h.currentValue },
                    totalInvestedValue = filteredHoldings.sumOf { h -> h.investedValue },
                    totalPnl = filteredHoldings.sumOf { h -> h.totalPnl },
                    todayPnl = filteredHoldings.sumOf { h -> h.todayPnl },
                    isLoading = false
                )
            }
        }.launchIn(viewModelScope)
    }
}
