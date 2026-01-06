
// API CONFIGURATION
const TD_API_KEY = 'c0faad0f62774c7d9e38797702418356'; // Twelve Data
const CG_API_BASE = 'https://api.coingecko.com/api/v3';

// Alpaca API Keys (US Market Data)
const ALPACA_KEY = 'PKEA2JEYOVKGZJQLCJPZEWUVBK';
const ALPACA_SECRET = '7RZpCxFJ1BM6oH2QxAusJgWbfMDRiwrxGJseS7fa9RBy';

export interface FinnhubNews {
  id: string | number;
  headline: string;
  datetime: number;
  source: string;
  url: string;
  summary: string;
}

export interface FinnhubIPO {
  symbol: string;
  name: string;
  ipoDate: string;
  price: string;
  numberOfShares: number;
}

export interface FinnhubEconomicEvent {
  actual: string;
  country: string;
  estimate: string;
  event: string;
  impact: string;
  time: string;
  unit: string;
}

// Utility: Check if US Market is Open (9:30 AM - 4:00 PM ET)
export const isUSMarketOpen = (): boolean => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric'
    });
    
    const parts = formatter.formatToParts(now);
    const partMap: Record<string, string> = {};
    parts.forEach(({type, value}) => partMap[type] = value);
    
    const day = partMap.weekday; // "Sun", "Mon", etc.
    const hour = parseInt(partMap.hour, 10);
    const minute = parseInt(partMap.minute, 10);
    
    // Weekend check
    if (day === 'Sun' || day === 'Sat') return false;
    
    // Market Hours: 09:30 - 16:00
    const totalMinutes = hour * 60 + minute;
    return totalMinutes >= 570 && totalMinutes < 960;
  } catch (e) {
    // Fallback to open if timezone check fails
    return true; 
  }
};

// Map internal symbols to External APIs
export const mapSymbolToFinnhub = (symbol: string, market: 'IN' | 'US' | 'GLOBAL'): string => {
  if (!symbol) return '';
  
  if (symbol.startsWith('CG:')) {
    return symbol.replace('CG:', '').toLowerCase();
  }
  
  // US Indices -> Liquid ETFs (Supported by both Twelve Data & Alpaca)
  if (symbol === '^GSPC' || symbol === 'S&P 500' || symbol === 'ES (S&P 500)') return 'SPY';
  if (symbol === '^DJI' || symbol === 'DOW JONES') return 'DIA';
  if (symbol === '^IXIC' || symbol === 'NASDAQ') return 'QQQ';
  
  return symbol;
};

// Fetch Batch Quotes (Unified Provider Logic)
export const getBatchQuotes = async (symbols: string[]) => {
  const results: Record<string, any> = {};
  
  // Segregate Symbols
  // Crypto: Lowercase, no dots, excluding known stock tickers that might look like words
  const cryptoIds = symbols.filter(s => s === s.toLowerCase() && !s.includes('.') && !['spy','dia','qqq','aapl','msft','nvda','tsla','amd','googl','amzn','meta','nflx'].includes(s));
  const stockSymbols = symbols.filter(s => !cryptoIds.includes(s));

  const inSymbols = stockSymbols.filter(s => s.includes('.NS'));
  // Strictly route non-NS stock symbols to Alpaca for US market
  const usSymbols = stockSymbols.filter(s => !s.includes('.NS'));

  // 1. Alpaca (US Stocks) - Real-time IEX Data
  if (usSymbols.length > 0) {
    // Explicit Confirmation Log
    console.log(`[Alpaca API] 📡 Sending SNAPSHOT Request for: ${usSymbols.join(', ')}`);
    
    try {
      const resp = await fetch(`https://data.alpaca.markets/v2/stocks/snapshots?symbols=${usSymbols.join(',')}`, {
        headers: {
          'APCA-API-KEY-ID': ALPACA_KEY,
          'APCA-API-SECRET-KEY': ALPACA_SECRET,
          'Accept': 'application/json'
        }
      });
      
      if (resp.ok) {
        const data = await resp.json();
        console.log(`[Alpaca API] ✅ Success. Received data for ${Object.keys(data).length} symbols.`);
        
        // Alpaca Response: { "AAPL": { "latestTrade": { "p": 150 }, "prevDailyBar": { "c": 149 } } }
        Object.keys(data).forEach(sym => {
           const item = data[sym];
           if (item) {
              // Prefer latestTrade, fallback to prevDailyBar
              const price = item.latestTrade?.p || item.prevDailyBar?.c || 0;
              const prevClose = item.prevDailyBar?.c || price;
              const change = price - prevClose;
              const percent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
              
              if (price > 0) {
                results[sym] = { 
                   c: price, 
                   d: change, 
                   dp: percent 
                };
              }
           }
        });
      } else {
        console.error(`[Alpaca API] ❌ Error: ${resp.status} - ${resp.statusText}`);
        const errorText = await resp.text();
        console.error(`[Alpaca API] Details:`, errorText);
      }
    } catch (e) { 
      console.error("[Alpaca API] ⚠️ Network Request Failed", e); 
    }
  }

  // 2. Twelve Data (Indian Stocks) - Free Tier
  if (inSymbols.length > 0) {
    try {
      const symString = inSymbols.join(',');
      const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symString}&apikey=${TD_API_KEY}`);
      const data = await response.json();
      
      const processItem = (item: any) => {
        if (item.symbol) {
           results[item.symbol] = { 
             c: parseFloat(item.close || item.c), 
             d: parseFloat(item.change || item.d), 
             dp: parseFloat(item.percent_change || item.dp) 
           };
        }
      };

      if (data.symbol) {
        processItem(data);
      } else {
        Object.values(data).forEach((item: any) => {
           if (item.symbol) processItem(item);
        });
      }
    } catch (e) {
      console.warn("Twelve Data Batch Error", e);
    }
  }

  // 3. CoinGecko (Crypto)
  if (cryptoIds.length > 0) {
    try {
      const ids = cryptoIds.join(',');
      const response = await fetch(`${CG_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
      const data = await response.json();
      
      cryptoIds.forEach(id => {
        if (data[id]) {
           const price = data[id].usd;
           const changePercent = data[id].usd_24h_change || 0;
           const change = price * (changePercent / 100);
           results[id] = { c: price, d: change, dp: changePercent };
        }
      });
    } catch (e) {
      console.warn("CG Batch Error", e);
    }
  }

  return results;
};

export const getQuote = async (symbol: string) => {
   const quotes = await getBatchQuotes([symbol]);
   return quotes[symbol];
};

export const searchSymbols = async (query: string) => {
   const promises = [];

   // 1. Twelve Data Search (Stocks/Indices)
   promises.push(
      fetch(`https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${TD_API_KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.data && Array.isArray(data.data)) {
               return data.data.map((item: any) => ({
                 description: item.instrument_name,
                 displaySymbol: item.symbol,
                 symbol: item.symbol,
                 type: item.instrument_type === 'Common Stock' ? 'STOCK' : item.instrument_type.toUpperCase()
               }));
            }
            return [];
        })
        .catch(() => [])
   );

   // 2. CoinGecko Search (Crypto)
   promises.push(
      fetch(`${CG_API_BASE}/search?query=${query}`)
        .then(res => res.json())
        .then(data => {
            if (data.coins && Array.isArray(data.coins)) {
               // Limit to top 5
               return data.coins.slice(0, 5).map((item: any) => ({
                 description: item.name,
                 displaySymbol: item.symbol, // BTC
                 symbol: `CG:${item.id}`,   // CG:bitcoin
                 type: 'CRYPTO'
               }));
            }
            return [];
        })
        .catch(() => [])
   );

   const [tdResults, cgResults] = await Promise.all(promises);
   return [...cgResults, ...tdResults];
};

// WebSocket Class (Primary for Twelve Data / Crypto)
export class FinnhubWS {
  private ws: WebSocket | null = null;
  private onMessage: (data: any[]) => void;
  private symbols: string[] = [];
  private keepAliveInterval: any;

  constructor(onMessage: (data: any[]) => void) {
    this.onMessage = onMessage;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes?apikey=${TD_API_KEY}`);

    this.ws.onopen = () => {
      if (this.symbols.length > 0) {
        this.subscribe(this.symbols);
      }
      this.keepAliveInterval = setInterval(() => {
         if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: 'heartbeat' }));
         }
      }, 10000);
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.event === 'price') {
           this.onMessage([{ s: response.symbol, p: response.price }]);
        }
      } catch (e) {}
    };

    this.ws.onclose = () => {
       clearInterval(this.keepAliveInterval);
    };
  }

  public subscribe(symbols: string[]) {
    this.symbols = symbols;
    if (this.ws?.readyState === WebSocket.OPEN && symbols.length > 0) {
       const symString = symbols.join(',');
       this.ws.send(JSON.stringify({ action: 'subscribe', params: { symbols: symString } }));
    }
  }

  public close() {
    this.ws?.close();
    clearInterval(this.keepAliveInterval);
  }
}

// --- Mock Data Providers for Auxiliary Features ---
export const getMarketNews = async (category: string): Promise<FinnhubNews[]> => {
    return [
       { id: 1, headline: "Fed maintains cautious stance on rate cuts", datetime: Date.now()/1000 - 3600, source: "Bloomberg", url: "#", summary: "..." },
       { id: 2, headline: "Tech sector leads market rally on AI earnings", datetime: Date.now()/1000 - 7200, source: "Reuters", url: "#", summary: "..." },
       { id: 3, headline: "Global markets react to new trade data", datetime: Date.now()/1000 - 10800, source: "CNBC", url: "#", summary: "..." },
       { id: 4, headline: "Crypto volatility spikes ahead of halving", datetime: Date.now()/1000 - 14400, source: "Coindesk", url: "#", summary: "..." },
    ];
};

export const getIPOCalendar = async (): Promise<FinnhubIPO[]> => {
   return [
      { symbol: "RDX", name: "Redix AI Tech", ipoDate: "2024-12-15", price: "45-50", numberOfShares: 15000000 },
      { symbol: "STRM", name: "StreamFlow", ipoDate: "2024-12-22", price: "22-25", numberOfShares: 8000000 },
   ];
};

export const getEconomicCalendar = async (): Promise<FinnhubEconomicEvent[]> => {
    return [
       { event: "Non-Farm Payrolls", country: "US", actual: "250K", estimate: "200K", impact: "high", time: "18:00", unit: "K" },
       { event: "CPI YoY", country: "US", actual: "3.2%", estimate: "3.1%", impact: "high", time: "18:00", unit: "%" },
       { event: "FOMC Minutes", country: "US", actual: "-", estimate: "-", impact: "high", time: "19:00", unit: "" },
    ];
};
