
package com.example.marketintelligence.data.model

import kotlinx.serialization.Serializable

@Serializable
data class AIAnalysisResult(
    val symbol: String, val signal: String, val confidence: Int, val alpha_score: Int, val rr_ratio: String,
    val pattern: String?, val pattern_complexity: String, val timeframe: String, val entry_zone: String?,
    val liquidity_zone: String?, val stop_loss: Double?, val target: List<String>?, val risk: String,
    val rationale: String, val market_structure: String, val timestamp: String
)

@Serializable
data class TechnicalAnalysis(
    val summary: String, val rsi: String, val macd: String, val movingAverages: String
)

@Serializable
data class HoldingAnalysis(
    val healthSummary: String,
    val riskAssessment: String,
    val actionableSuggestion: String
)

@Serializable
data class PersonalizedLearningPath(
    val suggestedCourseOrder: List<String>,
    val welcomeMessage: String
)

@Serializable
data class PerformanceReview(
    val overallFeedback: String,
    val identifiedWeakness: String,
    val suggestedNextLesson: String
)
