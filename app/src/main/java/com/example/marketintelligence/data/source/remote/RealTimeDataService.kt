
package com.example.marketintelligence.data.source.remote

import com.example.marketintelligence.BuildConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.*
import javax.inject.Inject
import javax.inject.Singleton

// ... (RealTimeQuote and WebSocketEvent remain the same)
@Serializable data class RealTimeQuote(val symbol: String, val price: Double)
@Serializable private data class WebSocketEvent(val event: String, val symbol: String, val price: Double)


@Singleton
class RealTimeDataService @Inject constructor() {
    private val client = OkHttpClient()
    private var webSocket: WebSocket? = null
    
    private val _priceUpdates = MutableSharedFlow<RealTimeQuote>()
    val priceUpdates = _priceUpdates.asSharedFlow()

    private val serviceScope = CoroutineScope(Dispatchers.IO)
    private val currentSubscriptions = mutableSetOf<String>()

    init { connect() }

    private fun connect() {
        // Corrected BuildConfig typo
        val request = Request.Builder()
            .url("wss://ws.twelvedata.com/v1/quotes/price?apikey=${BuildConfig.TD_API_KEY}")
            .build()
        
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                // Resubscribe to current symbols if connection drops and reconnects
                if (currentSubscriptions.isNotEmpty()) {
                    subscribe(currentSubscriptions.toList())
                }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                serviceScope.launch {
                    try {
                        val event = Json.decodeFromString(WebSocketEvent.serializer(), text)
                        if (event.event == "price") {
                            _priceUpdates.emit(RealTimeQuote(symbol = event.symbol, price = event.price))
                        }
                    } catch (e: Exception) { /* Ignore */ }
                }
            }

            // ... (onClosing, onFailure are the same)
        })
    }

    @Synchronized
    fun updateSubscriptions(newSymbols: List<String>) {
        val newSymbolsSet = newSymbols.toSet()
        val toUnsubscribe = currentSubscriptions - newSymbolsSet
        val toSubscribe = newSymbolsSet - currentSubscriptions

        if (toUnsubscribe.isNotEmpty()) {
            unsubscribe(toUnsubscribe.toList())
        }
        if (toSubscribe.isNotEmpty()) {
            subscribe(toSubscribe.toList())
        }

        currentSubscriptions.clear()
        currentSubscriptions.addAll(newSymbolsSet)
    }

    private fun subscribe(symbols: List<String>) {
        val message = """{"action": "subscribe", "params": {"symbols": "${symbols.joinToString()}"}}"""
        webSocket?.send(message)
    }

    private fun unsubscribe(symbols: List<String>) {
        val message = """{"action": "unsubscribe", "params": {"symbols": "${symbols.joinToString()}"}}"""
        webSocket?.send(message)
    }
}
