package com.example.redxchartlibrary.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface DrawingDao {
    @Query("SELECT * FROM drawings")
    fun getAllDrawings(): Flow<List<Drawing>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDrawing(drawing: Drawing)

    @Update
    suspend fun updateDrawing(drawing: Drawing)

    @Query("DELETE FROM drawings WHERE id = :id")
    suspend fun deleteDrawing(id: Int)
}