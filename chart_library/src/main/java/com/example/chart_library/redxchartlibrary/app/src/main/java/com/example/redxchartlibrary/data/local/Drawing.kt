package com.example.redxchartlibrary.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.JsonParser

data class AnchorPoint(val timestamp: Long, val price: Float)

// --- Drawing Tool Models ---
sealed class DrawingTool {
    abstract val type: String

    data class Trendline(
        val start: AnchorPoint,
        val end: AnchorPoint
    ) : DrawingTool() {
        override val type: String = "Trendline"
    }

    data class FibonacciRetracement(
        val start: AnchorPoint,
        val end: AnchorPoint
    ) : DrawingTool() {
        override val type: String = "FibonacciRetracement"
    }
}

// --- Room Entity ---
@Entity(tableName = "drawings")
@TypeConverters(DrawingConverters::class)
data class Drawing(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val tool: DrawingTool
)

// --- Room Type Converter ---
class DrawingConverters {
    private val gson = Gson()

    @TypeConverter
    fun fromDrawingTool(tool: DrawingTool): String {
        // Add a 'type' property to the JSON for robust deserialization
        val jsonObject = gson.toJsonTree(tool).asJsonObject
        jsonObject.addProperty("type", tool.type)
        return jsonObject.toString()
    }

    @TypeConverter
    fun toDrawingTool(json: String): DrawingTool {
        val jsonObject = JsonParser.parseString(json).asJsonObject
        val type = jsonObject.get("type")?.asString

        return when (type) {
            "Trendline" -> gson.fromJson(json, DrawingTool.Trendline::class.java)
            "FibonacciRetracement" -> gson.fromJson(json, DrawingTool.FibonacciRetracement::class.java)
            else -> throw IllegalArgumentException("Unknown drawing tool type: $type")
        }
    }
}