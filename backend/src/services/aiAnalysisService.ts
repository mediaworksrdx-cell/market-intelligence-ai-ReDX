
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMarketQuote } from './marketDataService';

// This should be loaded from environment variables (.env file)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Performs AI analysis by first fetching the current price and then querying the Gemini API.
 * This is the server-side equivalent of the original ScanStockUseCase.
 */
export const performAiAnalysis = async (symbol: string, timeframe: string) => {
    console.log(`Performing analysis for ${symbol} on timeframe ${timeframe}`);

    // Step 1: Get the latest market price.
    const quote = await getMarketQuote(symbol);
    const currentPrice = quote?.price;

    // Step 2: Use the price to query Gemini.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-preview-0409" });

    const systemInstruction = `You are "RDX Quantum Intelligence - Institutional Probe"...`; // The full prompt from the original app
    const prompt = `Analyze ${symbol} on ${timeframe}. Price: ${currentPrice || 'Live'}. Identify pattern complexity, market structure (Bullish or Bearish), and liquidity zones. Provide a clear rationale. STRICT OUTPUT: Valid JSON.`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        // generationConfig: { responseMimeType: "application/json" } // Not available in this SDK version yet.
    });

    const responseText = result.response.text();
    const analysisJson = JSON.parse(responseText);

    return {
        ...analysisJson,
        symbol, // Ensure the symbol is correctly included in the response
        timestamp: new Date().toISOString()
    };
};
