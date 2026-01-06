
package com.example.marketintelligence.domain.engine

import com.example.marketintelligence.data.engine.GeminiMentorEngineImpl
import com.example.marketintelligence.data.engine.ProprietaryMentorEngineImpl
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MentorEngineFactory @Inject constructor(
    private val geminiEngine: GeminiMentorEngineImpl,
    private val proprietaryEngine: ProprietaryMentorEngineImpl
) {
    private val engines: Map<String, MentorEngine> = mapOf(
        geminiEngine.engineName to geminiEngine,
        proprietaryEngine.engineName to proprietaryEngine
    )

    fun getEngine(engineName: String): MentorEngine {
        return engines[engineName] ?: geminiEngine
    }

    fun getAvailableEngineNames(): List<String> = engines.keys.toList()
}
