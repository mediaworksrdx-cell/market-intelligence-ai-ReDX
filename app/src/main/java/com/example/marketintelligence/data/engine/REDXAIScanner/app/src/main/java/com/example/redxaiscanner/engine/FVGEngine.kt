package com.example.redxaiscanner.engine

import com.example.redxaiscanner.domain.model.Candle
import java.math.BigDecimal

class FVGEngine {

    companion object {
        const val VERSION = "1.0.0"
    }

    /**
     * Analyzes a list of candles to detect Fair Value Gaps (FVGs) or imbalances.
     *
     * @param candles A list of normalized OHLCV candles, ordered from oldest to newest.
     * @return A list of [FVGResult] objects for all detected FVGs.
     */
    fun analyze(candles: List<Candle>): List<FVGResult> {
        if (candles.size < 3) {
            return emptyList()
        }

        val results = mutableListOf<FVGResult>()

        // Iterate through the candles using a 3-bar sliding window
        for (i in 0..candles.size - 3) {
            val first = candles[i]
            val second = candles[i + 1] // The displacement candle
            val third = candles[i + 2]

            // Check for Bearish FVG (gap between 1st candle's low and 3rd candle's high)
            if (first.low > third.high) {
                val bodySize = (second.open - second.close).abs()
                if (bodySize > BigDecimal.ZERO) { // Ensure there is some displacement
                    val fvg = createFVGResult(
                        direction = FVGDireciton.BEARISH,
                        top = first.low,
                        bottom = third.high,
                        strengthCandle = second,
                        patternWindow = listOf(first, second, third),
                        futureCandles = candles.subList(i + 3, candles.size)
                    )
                    results.add(fvg)
                }
            }

            // Check for Bullish FVG (gap between 1st candle's high and 3rd candle's low)
            if (first.high < third.low) {
                val bodySize = (second.close - second.open).abs()
                 if (bodySize > BigDecimal.ZERO) { // Ensure there is some displacement
                    val fvg = createFVGResult(
                        direction = FVGDireciton.BULLISH,
                        top = third.low,
                        bottom = first.high,
                        strengthCandle = second,
                        patternWindow = listOf(first, second, third),
                        futureCandles = candles.subList(i + 3, candles.size)
                    )
                    results.add(fvg)
                }
            }
        }
        return results
    }

    private fun createFVGResult(
        direction: FVGDireciton,
        top: BigDecimal,
        bottom: BigDecimal,
        strengthCandle: Candle,
        patternWindow: List<Candle>,
        futureCandles: List<Candle>
    ): FVGResult {
        
        // Calculate strength (e.g., based on the body-to-wick ratio of the displacement candle)
        val bodySize = (strengthCandle.close - strengthCandle.open).abs()
        val totalRange = (strengthCandle.high - strengthCandle.low).abs()
        val strength = if (totalRange > BigDecimal.ZERO) {
            (bodySize / totalRange).toDouble().coerceIn(0.0, 1.0)
        } else {
            0.0
        }
        
        // Check for mitigation
        var isMitigated = false
        var mitigationTimestamp = patternWindow.last().timestamp
        for (futureCandle in futureCandles) {
            val touchesTop = futureCandle.high >= bottom && futureCandle.low <= top
            val touchesBottom = futureCandle.low <= top && futureCandle.high >= bottom
            if (touchesTop || touchesBottom) {
                isMitigated = true
                mitigationTimestamp = futureCandle.timestamp
                break // Stop checking once the gap is filled
            }
        }

        return FVGResult(
            direction = direction,
            top = top,
            bottom = bottom,
            strength = strength,
            isMitigated = isMitigated,
            startTimestamp = patternWindow.first().timestamp,
            endTimestamp = mitigationTimestamp
        )
    }
}