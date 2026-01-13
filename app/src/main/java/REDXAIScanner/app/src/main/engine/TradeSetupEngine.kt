package com.example.redxaiscanner.engine

import com.example.redxaiscanner.config.AppConfig
import com.example.redxaiscanner.domain.model.Candle
import java.math.BigDecimal
import java.math.RoundingMode

class TradeSetupEngine(
    private val appConfig: AppConfig // Injected for risk control
) {
    companion object {
        const val VERSION = "1.1.0" // Version incremented due to new risk logic
    }
    
    // ... (ATR calculation remains the same)

    fun create(signal: ScoredSignal, candles: List<Candle>): TradeSetup? {
        val orderBlock = signal.underlyingSignal.smcSignal as? OrderBlock ?: return null
        
        // ... (Entry and Stop-Loss calculation)
        val entryPrice: BigDecimal = BigDecimal.ZERO // Placeholder for actual calculation
        val stopLossPrice: BigDecimal = BigDecimal.ZERO // Placeholder for actual calculation

        // --- GOVERNANCE CONTROL: Enforce Risk Threshold ---
        val riskPercentage = ((entryPrice - stopLossPrice).abs() / entryPrice) * BigDecimal(100)
        if (riskPercentage > BigDecimal(appConfig.maxStopLossPercentage)) {
            // Log this rejection for auditing
            println("AUDIT REJECTION: Trade setup for ${signal.underlyingSignal.symbol} rejected due to exceeding max risk threshold.")
            return null // Reject the trade
        }

        val riskAmount = (entryPrice - stopLossPrice).abs()
        val riskToRewardRatio = 2.0
        val takeProfit1 = if (orderBlock.direction == FVGDireciton.BULLISH) entryPrice + riskAmount else entryPrice - riskAmount
        val takeProfit2 = if (orderBlock.direction == FVGDireciton.BULLISH) entryPrice + (riskAmount * BigDecimal(riskToRewardRatio)) else entryPrice - (riskAmount * BigDecimal(riskToRewardRatio))
        
        return TradeSetup(
            entryPrice = entryPrice,
            stopLossPrice = stopLossPrice,
            takeProfit1 = takeProfit1,
            takeProfit2 = takeProfit2,
            riskToRewardRatio = "1:${riskToRewardRatio}",
            underlyingSignal = signal,
            versions = signal.underlyingSignal.versions + ("trade_setup_engine" to VERSION)
        )
    }
     private fun calculateATR(candles: List<Candle>): BigDecimal {
        if (candles.size < 2) return BigDecimal.ZERO
        val trueRanges = (1 until candles.size).map {
            val prevClose = candles[it - 1].close
            val high = candles[it].high
            val low = candles[it].low
            maxOf((high - low).abs(), (high - prevClose).abs(), (low - prevClose).abs())
        }
        return trueRanges.reduce { acc, tr -> acc + tr } / BigDecimal(trueRanges.size)
    }
}