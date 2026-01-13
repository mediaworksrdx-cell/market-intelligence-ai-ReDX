package com.example.redxaiscanner.config

import com.example.redxaiscanner.BuildConfig

/**
 * Manages the application's configuration.
 *
 * This component is responsible for loading the appropriate configuration based on the
 * current build environment. In a production app, this would be extended to fetch
 * configurations from a remote service, allowing for dynamic updates and rollbacks.
 */
object ConfigManager {

    private val productionConfig = AppConfig(
        environment = "production",
        apiBaseUrl = "https://api.production.com/data",
        isAiValidationEnabled = true, // Enabled by default in production
        signalScoreThreshold = 70
    )

    private val debugConfig = AppConfig(
        environment = "debug",
        apiBaseUrl = "https://api.staging.com/data",
        isAiValidationEnabled = false, // Disabled in debug for easier testing of core engines
        signalScoreThreshold = 50
    )

    /**
     * Provides the currently active application configuration.
     */
    fun getConfig(): AppConfig {
        return if (BuildConfig.DEBUG) {
            debugConfig
        } else {
            productionConfig
        }
    }
}