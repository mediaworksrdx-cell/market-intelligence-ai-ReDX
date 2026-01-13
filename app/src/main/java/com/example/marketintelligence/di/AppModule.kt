
package com.example.marketintelligence.di

import com.example.marketintelligence.data.repository.*
import com.example.marketintelligence.data.source.remote.* // Wildcard import to include GeminiService
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
// ... (other imports)

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    // ... (rest of the file is the same, Hilt will find GeminiService in its new package)
}
