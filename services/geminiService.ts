
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult, MarketType, PriceSimulationPlan } from "../types";

// Global cache to prevent redundant API calls
const planCache = new Map<string, PriceSimulationPlan>();
const pendingRequests = new Set<string>(); // Track active requests to prevent duplicates
let lastErrorTime = 0;
const COOLDOWN_MS = 120000; // 2 minute cooldown on 429 errors to be safer

const SIM_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    simulate: { type: Type.BOOLEAN },
    next_api_call_in_seconds: { type: Type.NUMBER },
    max_price_drift_allowed: { type: Type.STRING },
    simulation_bias: { type: Type.STRING, enum: ['UP', 'DOWN', 'NEUTRAL'] },
    notes: { type: Type.STRING }
  },
  required: ['simulate', 'next_api_call_in_seconds', 'max_price_drift_allowed', 'simulation_bias', 'notes']
};

const getDefaultPlan = (): PriceSimulationPlan => ({
  simulate: true,
  next_api_call_in_seconds: 60,
  max_price_drift_allowed: "0.05%",
  simulation_bias: "NEUTRAL",
  notes: "Local fallback mode active"
});

export const getPriceSimulationPlan = async (
  symbol: string,
  assetType: 'STOCK' | 'INDEX' | 'CRYPTO',
  volatility: number,
  ltp: number
): Promise<PriceSimulationPlan> => {
  if (planCache.has(symbol)) return planCache.get(symbol)!;
  if (pendingRequests.has(symbol)) return getDefaultPlan();
  if (Date.now() - lastErrorTime < COOLDOWN_MS) return getDefaultPlan();

  pendingRequests.add(symbol);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `
      You are "Market Intelligence AI – Price Simulation Controller".
      Generate simulation logic for ${symbol}. 
      STRICT JSON OUTPUT. NO TEXT.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Plan simulation for ${symbol} (${assetType}). LTP: ${ltp}. Vol: ${volatility}%.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: SIM_RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    });

    const plan = JSON.parse(response.text) as PriceSimulationPlan;
    planCache.set(symbol, plan);
    return plan;
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.status === 429) {
      lastErrorTime = Date.now();
      console.warn("Gemini Quota Exhausted. Pausing simulation logic requests.");
    }
    return getDefaultPlan();
  } finally {
    pendingRequests.delete(symbol);
  }
};

const SCAN_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    signal: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
    confidence: { type: Type.NUMBER },
    alpha_score: { type: Type.NUMBER },
    rr_ratio: { type: Type.STRING },
    pattern: { type: Type.STRING, nullable: true },
    pattern_complexity: { type: Type.STRING, enum: ['BASIC', 'INTERMEDIATE', 'INSTITUTIONAL'] },
    timeframe: { type: Type.STRING },
    entry_zone: { type: Type.STRING, nullable: true },
    liquidity_zone: { type: Type.STRING, nullable: true },
    stop_loss: { type: Type.NUMBER, nullable: true },
    target: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      nullable: true 
    },
    risk: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    rationale: { type: Type.STRING },
    market_structure: { type: Type.STRING, enum: ['BULLISH_BOS', 'BEARISH_BOS', 'CHoCH', 'CONSOLIDATION'] }
  },
  required: [
    'signal', 'confidence', 'alpha_score', 'rr_ratio', 'pattern', 
    'pattern_complexity', 'timeframe', 'entry_zone', 'liquidity_zone', 
    'stop_loss', 'target', 'risk', 'rationale', 'market_structure'
  ]
};

export const scanStockWithGemini = async (
  symbol: string, 
  timeframe: string, 
  market: MarketType | string, 
  currentPrice?: number
): Promise<AIAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
      You are "RDX Quantum Intelligence - Institutional Probe".
      Perform high-level institutional market analysis using SMC (Smart Money Concepts) and Classic Chart Patterns.
      
      OBJECTIVE: DETECT DIRECTIONAL BIAS (BULLISH OR BEARISH) OPPORTUNITIES.
      
      RULES FOR PATTERN RECOGNITION (COMPLIANCE MODE):
      
      1. BULLISH BIAS (Signal: BULLISH):
         - SMC: Bullish Order Block (OB), Bullish FVG (Fair Value Gap), Bullish Breaker, Discount Zone Entry.
         - Structure: Higher Highs/Higher Lows, Bullish BOS (Break of Structure), Bullish CHoCH.
         - Liquidity: Sell-side Liquidity Sweep.
         - Patterns: Bull Flag, Inverse Head & Shoulders, Double Bottom, Cup & Handle.

      2. BEARISH BIAS (Signal: BEARISH):
         - SMC: Bearish Order Block (OB), Bearish FVG, Bearish Breaker, Premium Zone Entry.
         - Structure: Lower Highs/Lower Lows, Bearish BOS, Bearish CHoCH.
         - Liquidity: Buy-side Liquidity Sweep.
         - Patterns: Bear Flag, Head & Shoulders, Double Top, Rising Wedge.

      3. NEUTRAL/NO TRADE:
         - Market is in messy consolidation or equilibrium without clear bias.

      Output terminology:
      - Use "Observation Level" instead of "Entry".
      - Use "Risk Zone" instead of "Stop Loss".
      - Use "Resistance Zone" or "Structural Zone" instead of "Target".
      - Use "Analysis" instead of "Call" or "Rationale".
      - Use "Probability" when discussing confidence.
      
      Analyze current structure and provide a high-conviction trade plan if a pattern is valid.
      STRICT OUTPUT: Valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze ${symbol} on ${timeframe}. Price: ${currentPrice || 'Live'}. Identify pattern complexity, market structure (Bullish or Bearish), and liquidity zones. Provide a clear rationale.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: SCAN_RESPONSE_SCHEMA,
        temperature: 0.3,
      },
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      symbol,
      timestamp: new Date().toISOString()
    } as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return {
      symbol,
      signal: "NEUTRAL",
      confidence: 0,
      alpha_score: 0,
      rr_ratio: "1:1",
      pattern: null,
      pattern_complexity: "BASIC",
      timeframe,
      entry_zone: null,
      liquidity_zone: null,
      stop_loss: null,
      target: null,
      risk: "LOW",
      rationale: "Analysis engine timed out. Re-probe requested.",
      market_structure: "CONSOLIDATION",
      timestamp: new Date().toISOString()
    };
  }
};
