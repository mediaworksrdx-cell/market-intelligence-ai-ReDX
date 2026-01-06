
package com.example.marketintelligence.domain.usecase

import com.example.marketintelligence.data.model.MarketType
import com.example.marketintelligence.data.repository.StockQuote
import com.example.marketintelligence.data.source.local.TransactionEntity
import com.example.marketintelligence.domain.model.Holding
import javax.inject.Inject

class CalculatePortfolioUseCase @Inject constructor() {

    operator fun invoke(
        transactions: List<TransactionEntity>,
        quotes: Map<String, StockQuote>
    ): List<Holding> {
        val holdingsMap = mutableMapOf<String, Holding>()
        transactions.groupBy { it.symbol }.forEach { (symbol, txs) ->
            val quantity = txs.sumOf { if (it.type == "BUY") it.quantity else -it.quantity }
            if (quantity > 0) {
                val invested = txs.filter { it.type == "BUY" }.sumOf { it.price * it.quantity }
                val avgPrice = invested / txs.filter { it.type == "BUY" }.sumOf { it.quantity }
                
                quotes[symbol]?.let { quote ->
                    val currentValue = quote.price * quantity
                    val totalPnl = currentValue - invested
                    val todayPnl = (quote.change) * quantity
                    
                    val market = when {
                        symbol.endsWith(".NS") -> MarketType.INDIA
                        symbol.startsWith("CG:") -> MarketType.CRYPTO
                        else -> MarketType.USA
                    }
                    
                    holdingsMap[symbol] = Holding(symbol, quantity, avgPrice, invested, currentValue, totalPnl, todayPnl, market)
                }
            }
        }
        return holdingsMap.values.toList()
    }
}
