
package com.example.marketintelligence.ui.fno

import com.example.marketintelligence.data.model.AiTradeSignal
import com.example.marketintelligence.data.model.MarketRegime

data class FnoUiState(
    val selectedAsset: String = "NIFTY 50",
    val isLoading: Boolean = true,
    val errorMessage: String? = null,
    val marketRegime: MarketRegime = MarketRegime.UNDEFINED,
    val generatedSignal: AiTradeSignal? = null,
    val mentorExplanation: String? = null, // New field for the explanation
    val payoffChartData: List<PayoffPoint> = emptyList()
)
data class PayoffPoint(val priceAtExpiry: Double, val profitLoss: Double)
