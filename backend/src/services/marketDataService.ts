
import axios from 'axios';

// API Keys should be loaded from environment variables (.env file)
const ALPACA_KEY = process.env.ALPACA_KEY;
const ALPACA_SECRET = process.env.ALPACA_SECRET;
// ... other keys

interface StockQuote {
    symbol: string;
    price: number;
}

/**
 * Fetches a quote from the appropriate third-party API based on the symbol.
 * This is the server-side equivalent of the original MarketDataRepositoryImpl.
 */
export const getMarketQuote = async (symbol: string): Promise<StockQuote | null> => {
    console.log(`Fetching market data for ${symbol}`);
    // In a real implementation, you would have the full logic to call
    // Alpaca, Twelve Data, or CoinGecko based on the symbol format.
    // For this example, we'll just implement the Alpaca path.

    if (symbol.endsWith('.NS')) {
        // TODO: Implement Twelve Data call
        return { symbol, price: 3000.00 }; // Dummy price
    } else {
        // Assume US Stock
        const url = `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbol}`;
        const response = await axios.get(url, {
            headers: {
                'APCA-API-KEY-ID': ALPACA_KEY,
                'APCA-API-SECRET-KEY': ALPACA_SECRET,
            }
        });
        
        const snapshot = response.data[symbol];
        if (snapshot && snapshot.latestTrade) {
            return {
                symbol,
                price: snapshot.latestTrade.p,
            };
        }
        return null;
    }
};
