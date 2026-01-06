
package com.example.marketintelligence.data.model

import kotlinx.serialization.Serializable

data class StockQuote(
    val symbol: String,
    val price: Double,
    val change: Double,
    val changePercent: Double
)

data class AssetSearchResult(
    val symbol: String,
    val displaySymbol: String,
    val description: String,
    val type: String
)

@Serializable
data class RealTimeQuote(
    val symbol: String,
    val price: Double
)
