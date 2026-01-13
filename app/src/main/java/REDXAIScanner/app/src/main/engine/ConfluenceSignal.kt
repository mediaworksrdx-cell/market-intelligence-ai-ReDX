package com.example.redxaiscanner.engine

/**
 * Represents a high-probability trading signal where analyses from multiple engines and timeframes align.
 * This is the final output of the confluence process, ready for presentation or execution.
 *
 * @param symbol The market symbol (e.g., "BTCUSDT").
 * @param timeframe The primary timeframe where the setup occurred (e.g., 1H).
 * @param higherTimeframeBias The market bias from the higher timeframe (e.g., 4H), providing structural context.
 * @param confidenceScore A normalized score (0.0 to 1.0) representing the strength of the confluence.
 * @param smcSignal The core SMC event that anchors the signal (e.g., the specific Order Block).
 * @param patternSignal The chart pattern that supports the signal, if any.
 * @param fvgSignal The FVG/imbalance that supports the signal, if any.
 * @param versions A map of all engine names to their versions, creating a deterministic audit trail.
 * @param integrityHash A hash of the candle data that produced this signal, ensuring data integrity.
 */
data class ConfluenceSignal(
    val symbol: String,
    val timeframe: String,
    val higherTimeframeBias: MarketBias,
    val confidenceScore: Double,
    val smcSignal: Any,
    val patternSignal: PatternResult? = null,
    val fvgSignal: FVGResult? = null,
    val versions: Map<String, String>,
    val integrityHash: String
)