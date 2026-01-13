
package com.example.marketintelligence.ui.portfolio

import com.example.marketintelligence.data.model.MarketType
import com.example.marketintelligence.domain.model.Holding

data class PortfolioUiState(
    val selectedMarket: MarketType = MarketType.INDIA,
    val holdings: List<Holding> = emptyList(),
    val totalCurrentValue: Double = 0.0,
    val totalInvestedValue: Double = 0.0,
    val totalPnl: Double = 0.0,
    val todayPnl: Double = 0.0,
    val isLoading: Boolean = true,
    val errorMessage: String? = null // New error state
)
