package com.example.redxaiscanner.engine

import java.math.BigDecimal

data class FVGResult(
    val direction: FVGDireciton,
    val top: BigDecimal,
    val bottom: BigDecimal,
    val strength: Double, // 0.0 to 1.0, based on displacement candle's strength
    val isMitigated: Boolean,
    val startTimestamp: Long, // Timestamp of the first candle in the 3-bar pattern
    val endTimestamp: Long // Timestamp of the candle that potentially mitigated the FVG
)

enum class FVGDireciton {
    BULLISH,
    BEARISH
}