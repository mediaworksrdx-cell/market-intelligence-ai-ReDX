
package com.example.marketintelligence.data.repository

import com.example.marketintelligence.data.source.remote.RealTimeQuote
import kotlinx.coroutines.flow.Flow

// ... (existing data classes remain)
data class StockQuote(val symbol: String, val price: Double, val change: Double, val changePercent: Double)
data class AssetSearchResult(val symbol: String, val displaySymbol: String, val description: String, val type: String)

interface MarketDataRepository {
    fun getQuote(symbol: String): Flow<Result<StockQuote>>
    fun searchAssets(query: String): Flow<Result<List<AssetSearchResult>>>
    fun getRealTimePriceUpdates(): Flow<RealTimeQuote>

    /**
     * Subscribes to a list of symbols for real-time updates.
     * Replaced with a more intelligent update function.
     */
    fun updateSubscriptions(symbols: List<String>)
}
