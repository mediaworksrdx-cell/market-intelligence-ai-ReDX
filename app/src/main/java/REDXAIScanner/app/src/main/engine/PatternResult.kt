package com.example.redxaiscanner.engine

data class PatternResult(
    val patternName: String,
    val patternType: PatternType,
    val strengthScore: Double, // e.g., 0.0 to 1.0
    val startTimestamp: Long,
    val endTimestamp: Long,
    val metadata: Map<String, String> = emptyMap() // For extra details like key levels
)

enum class PatternType {
    REVERSAL,
    CONTINUATION,
    TREND
}