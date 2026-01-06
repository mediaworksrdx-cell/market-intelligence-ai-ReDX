package com.example.redxchartlibrary.ui

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.redxchartlibrary.data.ChartDataCache
import com.example.redxchartlibrary.data.MarketDataClient
import com.example.redxchartlibrary.data.alerts.AlertCondition
import com.example.redxchartlibrary.data.alerts.AlertEngine
import com.example.redxchartlibrary.data.indicators.IndicatorCalculations
import com.example.redxchartlibrary.data.local.ChartDatabase
import com.example.redxchartlibrary.data.local.Drawing
import com.example.redxchartlibrary.data.local.DrawingRepository
import com.example.redxchartlibrary.data.remote.ApiService
import com.example.redxchartlibrary.model.Candle
import com.example.redxchartlibrary.state.ChartState
import com.example.redxchartlibrary.state.Indicator
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.IOException
import kotlin.random.Random

sealed class UiState {
    object Loading : UiState()
    data class Success(val candles: List<Candle>) : UiState()
    data class Error(val message: String) : UiState()
}

class ChartViewModel(application: Application) : AndroidViewModel(application) {

    private val apiService: ApiService
    private val marketDataClient: MarketDataClient
    private val drawingRepository: DrawingRepository
    val alertEngine = AlertEngine()

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    val chartState = ChartState()
    val alertEvents = alertEngine.alertEvents

    init {
        apiService = Retrofit.Builder().baseUrl("https://dummy.restapiexample.com/").build().create(ApiService::class.java)
        marketDataClient = MarketDataClient(apiService)
        drawingRepository = DrawingRepository(ChartDatabase.getDatabase(application).drawingDao())
        
        setupDefaultIndicatorsAndAlerts()
        switchContext("BTCUSD", "1m")
        
        observeDrawings()
        listenForMarketData()
    }
    
    fun startHistoricalReplay() {
        // Clear current data and start the replay
        _uiState.value = UiState.Success(emptyList())
        marketDataClient.startHistoricalReplay(speedMultiplier = 10)
    }

    fun startLiveStream() {
        _uiState.value = UiState.Success(emptyList())
        marketDataClient.startLiveStream()
    }

    private fun listenForMarketData() {
        viewModelScope.launch {
            marketDataClient.candleFlow.collect { newCandle ->
                val currentState = _uiState.value
                if (currentState is UiState.Success) {
                    val currentCandles = currentState.candles.toMutableList()
                    val lastCandle = currentCandles.lastOrNull()

                    val updatedCandles = if (lastCandle != null && lastCandle.timestamp == newCandle.timestamp) {
                        currentCandles.apply { set(size - 1, newCandle) }
                    } else {
                        currentCandles.apply { add(newCandle) }
                    }
                    
                    _uiState.value = UiState.Success(updatedCandles)
                    recalculateAndProcessData(updatedCandles)
                }
            }
        }
    }

    fun switchContext(symbol: String, timeframe: String) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            // For now, we just restart the live stream. A full implementation
            // would fetch historical data for the new context here.
            startLiveStream()
        }
    }
    
    fun saveDrawing(drawing: Drawing) {
        viewModelScope.launch { drawingRepository.insert(drawing) }
    }
    
    private fun observeDrawings() {
        viewModelScope.launch {
            drawingRepository.allDrawings.collect { chartState.drawings = it }
        }
    }

    private fun recalculateAndProcessData(candleList: List<Candle>) {
        if (candleList.isNotEmpty()) {
            chartState.indicators.forEach { indicator ->
                val result = when (indicator) {
                    is Indicator.SMA -> IndicatorCalculations.calculateSMA(candleList, indicator.period)
                    is Indicator.EMA -> IndicatorCalculations.calculateEMA(candleList, indicator.period)
                    is Indicator.RSI -> IndicatorCalculations.calculateRSI(candleList, indicator.period)
                    is Indicator.MACD -> IndicatorCalculations.calculateMACD(candleList, indicator.fastPeriod, indicator.slowPeriod, signalPeriod)
                }
                chartState.indicatorResults[indicator.name] = result
            }
            alertEngine.processData(candleList.last(), chartState.indicatorResults)
        }
    }
    
    private fun setupDefaultIndicatorsAndAlerts() {
        chartState.addIndicator(Indicator.SMA(20))
        chartState.addIndicator(Indicator.RSI(14))
        alertEngine.addCondition(AlertCondition.PriceCrosses(155f))
    }
}