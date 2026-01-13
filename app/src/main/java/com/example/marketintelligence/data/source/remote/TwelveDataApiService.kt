
package com.example.marketintelligence.data.source.remote

import com.example.marketintelligence.data.model.OptionChainData
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.http.GET
import retrofit2.http.Query

// ... (Existing QuoteResponse data class)
@Serializable
data class QuoteResponse(val symbol: String, val close: String, val change: String, @SerialName("percent_change") val percentChange: String)


interface TwelveDataApiService {
    @GET("quote")
    suspend fun getQuote(
        @Query("symbol") symbol: String,
        @Query("apikey") apiKey: String
    ): QuoteResponse

    /**
     * NEW ENDPOINT: Fetches option chain data.
     */
    @GET("options/chain")
    suspend fun getOptionChain(
        @Query("symbol") symbol: String,
        @Query("apikey") apiKey: String
    ): OptionChainData
}
