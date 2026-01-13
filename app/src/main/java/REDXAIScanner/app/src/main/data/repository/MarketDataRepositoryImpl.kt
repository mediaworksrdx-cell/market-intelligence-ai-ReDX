package com.example.redxaiscanner.data.repository

import com.example.redxaiscanner.data.datasource.local.CandleDao
import com.example.redxaiscanner.data.datasource.remote.MarketApiService // Assume you create this Retrofit service
import com.example.redxaiscanner.data.mapper.toCandle
import com.example.redxaiscanner.data.mapper.toCandleEntities
import com.example.redxaiscanner.domain.model.Candle
import com.example.redxaiscanner.domain.model.Timeframe
import com.example.redxaiscanner.domain.repository.MarketDataRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.onStart

// A simple placeholder for your remote data source, e.g., a Retrofit service
interface MarketApiService {
    suspend fun getCandles(symbol: String, timeframe: String): com.example.redxaiscanner.data.datasource.remote.MarketDataDto
}


class MarketDataRepositoryImpl(
    private val dao: CandleDao,
    private val api: MarketApiService,
    private val cacheSize: Int = 200 // The number of candles to keep in the rolling cache
) : MarketDataRepository {

    override fun getCandles(
        symbols: List<String>,
        timeframe: Timeframe
    ): Flow<Map<String, List<Candle>>> {
        
        val flows = symbols.map { symbol ->
            // This flow implements a network-bound resource strategy.
            // 1. It starts by fetching from the network.
            // 2. On successful fetch, it updates the local database (cache).
            // 3. It then starts emitting data from the local database.
            // 4. Any updates to the database will be automatically emitted.
            flow {
                try {
                    val remoteData = api.getCandles(symbol, timeframe.interval)
                    val entities = remoteData.toCandleEntities(timeframe.interval)
                    dao.upsertAll(entities)
                    dao.trimCache(symbol, timeframe.interval, cacheSize)
                } catch (e: Exception) {
                    // Handle network errors, e.g., log them.
                    // The flow will continue with cached data if available.
                    e.printStackTrace()
                }
            }.onStart {
                // By combining this with the DB flow, this network fetch
                // is triggered every time a new collector subscribes.
            }.combine(dao.getCandles(symbol, timeframe.interval)) { _, cachedEntities ->
                 // We only care about the data from the DB flow. The network flow just triggers the update.
                symbol to cachedEntities.map { it.toCandle() }
            }
        }
        
        // Combine all individual symbol flows into a single flow that emits a map.
        return combine(flows) { arrayOfPairs ->
            mapOf(*arrayOfPairs)
        }
    }
}