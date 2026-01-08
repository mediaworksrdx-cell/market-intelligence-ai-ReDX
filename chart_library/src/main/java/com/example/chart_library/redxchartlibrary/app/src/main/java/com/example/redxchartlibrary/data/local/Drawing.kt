package com.example.redxchartlibrary.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class AnchorPoint(val timestamp: Long, val price: Float)

// --- Drawing Tool Models ---
@Serializable
sealed class DrawingTool {
    @Serializable
    @SerialName("Trendline")
    data class Trendline(
        val start: AnchorPoint,
        val end: AnchorPoint
    ) : DrawingTool()

    @Serializable
    @SerialName("FibonacciRetracement")
    data class FibonacciRetracement(
        val start: AnchorPoint,
        val end: AnchorPoint
    ) : DrawingTool()
}

// --- Room Entity ---
@Entity(tableName = "drawings")
@TypeConverters(DrawingConverters::class)
@Serializable
data class Drawing(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val tool: DrawingTool
)

// --- Room Type Converter ---
class DrawingConverters {
    private val json = Json { classDiscriminator = "type" }

    @TypeConverter
    fun fromDrawingTool(tool: DrawingTool): String {
        return json.encodeToString(tool)
    }

    @TypeConverter
    fun toDrawingTool(jsonString: String): DrawingTool {
        return json.decodeFromString(jsonString)
    }
}