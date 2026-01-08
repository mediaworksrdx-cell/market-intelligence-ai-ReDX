package com.example.redxchartlibrary.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
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
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import retrofit2.Retrofit

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
        val contentType = "application/json".toMediaType()
        val json = Json { ignoreUnknownKeys = true }
        
        apiService = Retrofit.Builder()
            .baseUrl("https://dummy.restapiexample.com/")
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(ApiService::class.java)
        
        marketDataClient = MarketDataClient(apiService)
        drawingRepository = DrawingRepository(ChartDatabase.getDatabase(application).drawingDao())
        
        setupDefaultIndicatorsAndAlerts()
        switchContext("BTCUSD", "1m")
        
        observeDrawings()
        listenForMarketData()
    }

    // ... (rest of the ViewModel is unchanged)
}