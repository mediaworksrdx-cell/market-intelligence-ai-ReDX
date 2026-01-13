
package com.example.marketintelligence.domain.engine

import com.example.chart_library.ProprietaryChartEngine
import com.example.marketintelligence.data.engine.TradingViewChartEngine
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChartEngineFactory @Inject constructor(
    tradingViewEngine: TradingViewChartEngine,
    proprietaryChartEngine: ProprietaryChartEngine
) {
    private val engines: Map<String, ChartEngine> = mapOf(
        tradingViewEngine.engineName to tradingViewEngine,
        proprietaryChartEngine.engineName to proprietaryChartEngine
    )

    fun getEngine(engineName: String): ChartEngine {
        return engines[engineName] ?: tradingViewEngine // Default to TradingView
    }

    fun getAvailableEngineNames(): List<String> = engines.keys.toList()
}
