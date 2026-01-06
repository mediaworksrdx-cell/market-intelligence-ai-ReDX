package com.example.redxaiscanner.engine

import com.example.redxaiscanner.domain.model.Candle
import java.math.BigDecimal

class SMCEngine {

    // Defines how many candles on each side must be lower/higher for a candle to be a swing point.
    private val swingPointLookback = 5

    fun analyze(candles: List<Candle>): SMCAnalysisResult {
        if (candles.size < swingPointLookback * 2 + 1) {
            return SMCAnalysisResult(MarketBias.RANGING, emptyList(), emptyList(), emptyList(), emptyList(), null)
        }

        val swingPoints = findSwingPoints(candles)
        if (swingPoints.size < 2) {
             return SMCAnalysisResult(MarketBias.RANGING, swingPoints, emptyList(), emptyList(), emptyList(), null)
        }
        
        val (bias, structureEvents) = determineStructureAndBias(swingPoints)
        val orderBlocks = findOrderBlocks(candles, structureEvents)
        
        // TODO: Implement liquidity and premium/discount zone detection
        val liquidityZones = emptyList<LiquidityZone>()
        val premiumDiscountZone = null

        return SMCAnalysisResult(
            bias = bias,
            swingPoints = swingPoints,
            structureEvents = structureEvents,
            orderBlocks = orderBlocks,
            liquidityZones = liquidityZones,
            premiumDiscountZone = premiumDiscountZone
        )
    }

    private fun findSwingPoints(candles: List<Candle>): List<SwingPoint> {
        val points = mutableListOf<SwingPoint>()
        for (i in swingPointLookback until candles.size - swingPointLookback) {
            val center = candles[i]
            val leftWindow = candles.subList(i - swingPointLookback, i)
            val rightWindow = candles.subList(i + 1, i + 1 + swingPointLookback)

            val isSwingHigh = leftWindow.all { it.high < center.high } && rightWindow.all { it.high < center.high }
            val isSwingLow = leftWindow.all { it.low > center.low } && rightWindow.all { it.low > center.low }

            if (isSwingHigh) {
                points.add(SwingPoint(SwingType.HIGH, center.high, center.timestamp))
            } else if (isSwingLow) {
                 points.add(SwingPoint(SwingType.LOW, center.low, center.timestamp))
            }
        }
        return points
    }
    
    private fun determineStructureAndBias(swingPoints: List<SwingPoint>): Pair<MarketBias, List<MarketStructureEvent>> {
        val events = mutableListOf<MarketStructureEvent>()
        if (swingPoints.size < 3) return MarketBias.RANGING to events

        var lastHigh = swingPoints.first { it.type == SwingType.HIGH }
        var lastLow = swingPoints.first { it.type == SwingType.LOW }
        
        var isUptrend = lastHigh.price > lastLow.price

        for (point in swingPoints) {
            if (point.type == SwingType.HIGH) {
                if (point.price > lastHigh.price) { // New Higher High
                    if(isUptrend) {
                         events.add(MarketStructureEvent(EventType.BOS, point.timestamp, point.price, lastHigh.timestamp))
                    } else {
                         events.add(MarketStructureEvent(EventType.CHoCH, point.timestamp, point.price, lastHigh.timestamp))
                         isUptrend = true
                    }
                    lastHigh = point
                }
            } else { // Swing Low
                 if (point.price < lastLow.price) { // New Lower Low
                    if(!isUptrend) {
                        events.add(MarketStructureEvent(EventType.BOS, point.timestamp, point.price, lastLow.timestamp))
                    } else {
                        events.add(MarketStructureEvent(EventType.CHoCH, point.timestamp, point.price, lastLow.timestamp))
                        isUptrend = false
                    }
                    lastLow = point
                }
            }
        }
        
        val bias = if (events.isEmpty()) MarketBias.RANGING else if (isUptrend) MarketBias.BULLISH else MarketBias.BEARISH
        return bias to events
    }

    private fun findOrderBlocks(candles: List<Candle>, events: List<MarketStructureEvent>): List<OrderBlock> {
        // Simplified logic: Find the last down-candle before a bullish BOS, or up-candle before a bearish BOS.
        val obs = mutableListOf<OrderBlock>()
        val candleMap by lazy { candles.associateBy { it.timestamp } }

        for (event in events.filter { it.type == EventType.BOS }) {
            val eventCandle = candleMap[event.timestamp] ?: continue
            val candleIndex = candles.indexOf(eventCandle)
            if (candleIndex < 1) continue

            // Bullish BOS: look for the last bearish candle before the move up
            if (eventCandle.close > eventCandle.open) {
                findLastOpposingCandle(candles, candleIndex, isBullishSearch = false)?.let {
                    obs.add(OrderBlock(FVGDireciton.BULLISH, it.high, it.low, it.timestamp))
                }
            } 
            // Bearish BOS: look for the last bullish candle before the move down
            else {
                 findLastOpposingCandle(candles, candleIndex, isBullishSearch = true)?.let {
                    obs.add(OrderBlock(FVGDireciton.BEARISH, it.high, it.low, it.timestamp))
                }
            }
        }
        return obs
    }
    
    private fun findLastOpposingCandle(candles: List<Candle>, startIndex: Int, isBullishSearch: Boolean): Candle? {
        for(i in startIndex downTo 1) {
            val c = candles[i]
            val isBullish = c.close > c.open
            if(isBullish == isBullishSearch) return c
        }
        return null
    }
}