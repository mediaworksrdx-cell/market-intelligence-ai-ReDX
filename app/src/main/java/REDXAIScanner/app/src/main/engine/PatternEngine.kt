package com.example.redxaiscanner.engine

import com.example.redxaiscanner.domain.model.Candle
import java.math.BigDecimal

// Update PatternResult to carry its own explanation
data class PatternResult(
    val patternName: String,
    val patternType: PatternType,
    val strengthScore: Double,
    val startTimestamp: Long,
    val endTimestamp: Long,
    val explanation: ExplanationComponent // Added for self-documentation
)

class PatternEngine {
    // ... (analyze function remains the same)

    private fun detectThreeWhiteSoldiers(window: List<Candle>): PatternResult? {
        // ... (Rule checks remain the same)
        val first = window[0]
        val second = window[1]
        val third = window[2]
        // Example check:
        if (!(third.close > second.close && second.close > first.close)) return null

        val strength = 1.0 // Placeholder
        
        // --- Generate Explanation ---
        val explanation = ExplanationComponent(
            componentName = "Chart Pattern",
            reasoning = "A 'Three White Soldiers' bullish reversal pattern was identified.",
            details = mapOf(
                "Pattern Name" to "Three White Soldiers",
                "Rule 1" to "Verified: Three consecutive bullish candles.",
                "Rule 2" to "Verified: Each candle opened within the previous body.",
                "Rule 3" to "Verified: Each candle closed progressively higher.",
                "Strength Score" to "%.2f".format(strength)
            )
        )

        return PatternResult(
            patternName = "Three White Soldiers",
            patternType = PatternType.REVERSAL,
            strengthScore = strength,
            startTimestamp = first.timestamp,
            endTimestamp = third.timestamp,
            explanation = explanation
        )
    }
}