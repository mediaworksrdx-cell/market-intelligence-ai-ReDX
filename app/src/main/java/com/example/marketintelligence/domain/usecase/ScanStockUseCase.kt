
package com.example.marketintelligence.domain.usecase

import com.example.marketintelligence.data.model.AIAnalysisResult
import com.example.marketintelligence.domain.engine.EngineRouter
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import javax.inject.Inject

class ScanStockUseCase @Inject constructor(
    private val engineRouter: EngineRouter
) {
    operator fun invoke(
        symbol: String,
        timeframe: String
    ): Flow<Result<AIAnalysisResult>> {
        // Reactively get the latest active engine and perform the scan.
        return engineRouter.activeScannerEngine.flatMapLatest { activeEngine ->
            activeEngine.scan(symbol, timeframe)
        }
    }
}
