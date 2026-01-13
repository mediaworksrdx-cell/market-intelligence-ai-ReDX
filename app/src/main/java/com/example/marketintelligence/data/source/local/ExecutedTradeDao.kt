
package com.example.marketintelligence.data.source.local

import androidx.room.*
import com.example.marketintelligence.data.model.AiTradeSignal
import com.example.marketintelligence.data.model.ExecutedTradeEntity
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Dao
interface ExecutedTradeDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrade(trade: ExecutedTradeEntity)
}

// This TypeConverter now uses Kotlinx Serialization instead of Gson.
class DatabaseTypeConverters {
    private val json = Json { ignoreUnknownKeys = true } // Configure the serializer

    @TypeConverter
    fun fromAiTradeSignal(signal: AiTradeSignal): String {
        return json.encodeToString(signal)
    }

    @TypeConverter
    fun toAiTradeSignal(jsonString: String): AiTradeSignal {
        return json.decodeFromString<AiTradeSignal>(jsonString)
    }
}
