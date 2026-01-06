
package com.example.marketintelligence.data.source.local

import androidx.room.*
import com.example.marketintelligence.data.model.AiTradeSignal
import com.example.marketintelligence.data.model.ExecutedTradeEntity
import com.google.gson.Gson

@Dao
interface ExecutedTradeDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrade(trade: ExecutedTradeEntity)
}

// Type converter to store the complex AiTradeSignal object as a JSON string in the database
class DatabaseTypeConverters {
    private val gson = Gson()

    @TypeConverter
    fun fromAiTradeSignal(signal: AiTradeSignal): String {
        return gson.toJson(signal)
    }

    @TypeConverter
    fun toAiTradeSignal(json: String): AiTradeSignal {
        return gson.fromJson(json, AiTradeSignal::class.java)
    }
}
