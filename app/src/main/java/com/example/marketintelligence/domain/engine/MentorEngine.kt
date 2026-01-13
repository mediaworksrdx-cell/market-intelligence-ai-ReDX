
package com.example.marketintelligence.domain.engine

import com.example.marketintelligence.data.model.AiTradeSignal
import com.example.marketintelligence.data.model.PersonalizedLearningPath
import com.example.marketintelligence.data.model.PerformanceReview

interface MentorEngine : Engine {
    suspend fun generateLearningPath(experience: String, risk: String, goals: List<String>): PersonalizedLearningPath
    suspend fun generatePerformanceReview(tradeHistory: String): PerformanceReview

    /**
     * NEW FUNCTION: Provides a contextual explanation for a generated AI trade signal.
     */
    suspend fun explainSignal(signal: AiTradeSignal): String
}
