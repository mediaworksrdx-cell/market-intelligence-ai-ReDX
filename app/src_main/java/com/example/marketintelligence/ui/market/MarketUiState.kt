
package com.example.marketintelligence.ui.market

import com.example.marketintelligence.data.model.MarketType

// These data classes now live in their own file for better organization.
data class MarketUiState(
    val selectedMarket: MarketType = MarketType.INDIA,
    val keyIndices: List<IndexData> = emptyList(),
    val watchlist: List<WatchlistItemData> = emptyList(),
    val isLoading: Boolean = true
)

data class IndexData(
    val name: String,
    val value: String,
    val change: String,
    val isPositive: Boolean
)

data class WatchlistItemData(
    val symbol: String,
    val name: String,
    val price: String,
    val change: String,
    val isPositive: Boolean
)
