package com.example.redxchartlibrary.data.local

import kotlinx.coroutines.flow.Flow

class DrawingRepository(private val drawingDao: DrawingDao) {
    val allDrawings: Flow<List<Drawing>> = drawingDao.getAllDrawings()

    suspend fun insert(drawing: Drawing) {
        drawingDao.insertDrawing(drawing)
    }
}