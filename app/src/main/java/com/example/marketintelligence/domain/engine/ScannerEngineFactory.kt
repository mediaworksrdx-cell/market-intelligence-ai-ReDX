
package com.example.marketintelligence.domain.engine

import com.example.marketintelligence.data.engine.GeminiScannerEngineImpl
import com.example.marketintelligence.data.engine.ProprietaryScannerEngineImpl
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScannerEngineFactory @Inject constructor(
    private val geminiEngine: GeminiScannerEngineImpl,
    private val proprietaryEngine: ProprietaryScannerEngineImpl
) {
    private val engines: Map<String, ScannerEngine> = mapOf(
        geminiEngine.engineName to geminiEngine,
        proprietaryEngine.engineName to proprietaryEngine
    )

    fun getEngine(engineName: String): ScannerEngine {
        // Return the selected engine, or default to the standard Gemini engine if not found.
        return engines[engineName] ?: geminiEngine
    }

    fun getAvailableEngineNames(): List<String> = engines.keys.toList()
}
