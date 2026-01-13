
package com.example.marketintelligence.domain.repository

import com.example.marketintelligence.data.model.AssetSearchResult
import com.example.marketintelligence.data.model.OptionChainData
import com.example.marketintelligence.data.model.RealTimeQuote
import com.example.marketintelligence.data.model.StockQuote
import kotlinx.coroutines.flow.Flow

interface MarketDataRepository {
    fun getQuote(symbol: String): Flow<Result<StockQuote>>
    fun searchAssets(query: String): Flow<Result<List<AssetSearchResult>>>
    fun getRealTimePriceUpdates(): Flow<RealTimeQuote>
    fun updateSubscriptions(symbols: List<String>)

    /**
     * NEW FUNCTION: Fetches the complete option chain for a given underlying asset.
     */
    fun getOptionChain(symbol: String): Flow<Result<OptionChainData>>
}
