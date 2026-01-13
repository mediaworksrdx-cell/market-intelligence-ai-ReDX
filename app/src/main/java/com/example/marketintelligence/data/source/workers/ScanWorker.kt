
package com.example.marketintelligence.data.source.workers

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.marketintelligence.data.repository.NotificationRepository
import com.example.marketintelligence.data.repository.WatchlistRepository
import com.example.marketintelligence.domain.ScanStockUseCase
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first

@HiltWorker
class ScanWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val watchlistRepository: WatchlistRepository,
    private val scanStockUseCase: ScanStockUseCase,
    private val notificationRepository: NotificationRepository
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val watchlist = watchlistRepository.watchlist.first()
        if (watchlist.isEmpty()) {
            return Result.success() // Nothing to do
        }

        try {
            watchlist.forEach { symbol ->
                scanStockUseCase(symbol, "4h").first().getOrNull()?.let { result ->
                    if (result.confidence > 70) {
                        // In a real app, you'd create a system notification here
                        // For now, we save it to our in-app notification center
                        // val notification = NotificationEntity(...)
                        // notificationRepository.saveNotification(notification)
                    }
                }
            }
        } catch (e: Exception) {
            return Result.retry() // Something went wrong, try again later
        }

        return Result.success()
    }
}
