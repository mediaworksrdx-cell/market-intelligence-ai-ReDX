
import { IndexData, StockData, PortfolioItem, OptionChainData, CryptoData, TrainingModule, NotificationItem, FOSymbolData, StrategyDefinition, FutureContract, EconomicEvent, IPOData } from './types';

export const USER_WEBHOOK_ID = 'https://webhook.site/d42tid1r01qorlet357g';

// Updated for Finnhub Symbols (^NSEI, .NS suffix)
export const INDICES_IN: IndexData[] = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50', price: 23567.50, change: 145.20, changePercent: 0.64, market: 'IN' },
  { symbol: 'SENSEX', name: 'SENSEX', price: 71721.50, change: -50.10, changePercent: -0.07, market: 'IN' },
  { symbol: 'BANKNIFTY', name: 'BANK NIFTY', price: 48235.60, change: 310.45, changePercent: 0.65, market: 'IN' },
];

// Finnhub US Indices - Using Tradeable ETFs as proxies for data availability
export const INDICES_US: IndexData[] = [
  { symbol: 'SPY', name: 'S&P 500', price: 0, change: 0, changePercent: 0, market: 'US' },
  { symbol: 'DIA', name: 'DOW JONES', price: 0, change: 0, changePercent: 0, market: 'US' },
  { symbol: 'QQQ', name: 'NASDAQ', price: 0, change: 0, changePercent: 0, market: 'US' },
];

export const WATCHLIST_INITIAL: StockData[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2520.50, change: 25.15, changePercent: 1.01, volume: '2.5M', market: 'IN' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Svcs', price: 3595.75, change: -45.20, changePercent: -1.24, volume: '1.1M', market: 'IN' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1650.00, change: 12.00, changePercent: 0.73, volume: '3.2M', market: 'IN' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.35, change: 2.85, changePercent: 1.62, volume: '45M', market: 'US' },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 365.15, change: -3.20, changePercent: -0.88, volume: '22M', market: 'US' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 485.00, change: 15.50, changePercent: 3.30, volume: '38M', market: 'US' }
];

export const CRYPTO_INITIAL: CryptoData[] = [
  { symbol: 'CG:bitcoin', name: 'Bitcoin', price: 64230.50, change: 1200.50, changePercent: 1.90 },
  { symbol: 'CG:ethereum', name: 'Ethereum', price: 3450.20, change: -25.50, changePercent: -0.73 },
  { symbol: 'CG:solana', name: 'Solana', price: 145.80, change: 5.20, changePercent: 3.70 },
  { symbol: 'CG:binancecoin', name: 'BNB', price: 590.10, change: 8.50, changePercent: 1.45 },
  { symbol: 'CG:ripple', name: 'XRP', price: 0.62, change: -0.01, changePercent: -1.20 },
  { symbol: 'CG:dogecoin', name: 'Dogecoin', price: 0.16, change: 0.02, changePercent: 12.50 },
  { symbol: 'CG:cardano', name: 'Cardano', price: 0.45, change: 0.01, changePercent: 2.10 },
  { symbol: 'CG:avalanche-2', name: 'Avalanche', price: 35.20, change: -1.20, changePercent: -3.30 },
  { symbol: 'CG:polkadot', name: 'Polkadot', price: 7.15, change: 0.10, changePercent: 1.40 },
  { symbol: 'CG:chainlink', name: 'Chainlink', price: 14.50, change: 0.50, changePercent: 3.55 }
];

export const PORTFOLIO_INITIAL: PortfolioItem[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', qty: 50, avgPrice: 2380.00, currentPrice: 2520.50, market: 'IN', type: 'STOCK', aiScore: 85, aiSentiment: 'Strong Accumulation' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Svcs', qty: 30, avgPrice: 3650.00, currentPrice: 3595.75, market: 'IN', type: 'STOCK', aiScore: 45, aiSentiment: 'Correction Likely' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', qty: 100, avgPrice: 1400.00, currentPrice: 1450.25, market: 'IN', type: 'STOCK', aiScore: 72, aiSentiment: 'Bullish Flag' },
  { symbol: 'AAPL', name: 'Apple Inc.', qty: 10, avgPrice: 150.00, currentPrice: 178.35, market: 'US', type: 'STOCK', aiScore: 88, aiSentiment: 'Momentum Strong' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', qty: 5, avgPrice: 420.00, currentPrice: 485.00, market: 'US', type: 'STOCK', aiScore: 95, aiSentiment: 'Hyper Growth' },
  { symbol: 'CG:bitcoin', name: 'Bitcoin', qty: 0.05, avgPrice: 62000, currentPrice: 64500, market: 'US', type: 'CRYPTO', aiScore: 92, aiSentiment: 'Breakout Ready' }
];

// Enhanced Option Chain with Greeks
export const OPTION_CHAIN_MOCK: OptionChainData[] = [
  { strike: 23400, callOI: 45000, callLTP: 215.5, callChange: 15.2, callIV: 12.5, callGreeks: {delta: 0.85, gamma: 0.0012, theta: -12.5, vega: 14.5}, putOI: 125000, putLTP: 45.2, putChange: -12.5, putIV: 14.2, putGreeks: {delta: -0.15, gamma: 0.0012, theta: -8.5, vega: 12.2} },
  { strike: 23450, callOI: 62000, callLTP: 185.0, callChange: 12.1, callIV: 12.2, callGreeks: {delta: 0.72, gamma: 0.0015, theta: -13.2, vega: 15.1}, putOI: 98000, putLTP: 65.8, putChange: -8.4, putIV: 13.8, putGreeks: {delta: -0.28, gamma: 0.0015, theta: -9.1, vega: 13.5} },
  { strike: 23500, callOI: 150000, callLTP: 145.2, callChange: -5.5, callIV: 11.8, callGreeks: {delta: 0.51, gamma: 0.0018, theta: -14.5, vega: 16.2}, putOI: 145000, putLTP: 92.5, putChange: 14.2, putIV: 13.5, putGreeks: {delta: -0.49, gamma: 0.0018, theta: -14.5, vega: 16.2} },
  { strike: 23550, callOI: 85000, callLTP: 110.5, callChange: -10.2, callIV: 11.5, callGreeks: {delta: 0.35, gamma: 0.0015, theta: -13.8, vega: 15.5}, putOI: 65000, putLTP: 125.4, putChange: 22.1, putIV: 13.2, putGreeks: {delta: -0.65, gamma: 0.0015, theta: -10.2, vega: 14.8} },
  { strike: 23600, callOI: 210000, callLTP: 82.0, callChange: -15.8, callIV: 11.2, callGreeks: {delta: 0.22, gamma: 0.0012, theta: -12.1, vega: 13.8}, putOI: 45000, putLTP: 165.2, putChange: 35.5, putIV: 12.9, putGreeks: {delta: -0.78, gamma: 0.0012, theta: -8.5, vega: 11.5} },
  { strike: 23650, callOI: 120000, callLTP: 55.5, callChange: -22.4, callIV: 11.0, callGreeks: {delta: 0.12, gamma: 0.0009, theta: -9.5, vega: 11.2}, putOI: 22000, putLTP: 210.5, putChange: 42.8, putIV: 12.6, putGreeks: {delta: -0.88, gamma: 0.0009, theta: -6.2, vega: 9.5} },
];

export const TRAINING_MODULES: TrainingModule[] = [
  { id: '1', title: 'Market Foundations', duration: '45 mins', locked: false, topics: ['Market Structure', 'Order Types', 'Liquidity'] },
  { id: '2', title: 'Technical Analysis', duration: '2 hours', locked: true, topics: ['Candlestick Patterns', 'Indicators', 'Support/Resistance'] },
  { id: '3', title: 'Trading Psychology', duration: '1.5 hours', locked: true, topics: ['Risk Management', 'Emotional Control', 'Journaling'] },
];

export const MOCK_CALENDAR: EconomicEvent[] = [
  { id: '1', time: '18:00', currency: 'USD', event: 'CPI Inflation Rate YoY', impact: 'HIGH', actual: '3.2%', forecast: '3.1%', previous: '3.4%' },
  { id: '2', time: '19:00', currency: 'USD', event: 'FOMC Meeting Minutes', impact: 'HIGH', actual: '-', forecast: '-', previous: '-' },
  { id: '3', time: '10:30', currency: 'INR', event: 'RBI Interest Rate Decision', impact: 'HIGH', actual: '6.5%', forecast: '6.5%', previous: '6.5%' },
  { id: '4', time: '14:30', currency: 'USD', event: 'Initial Jobless Claims', impact: 'MEDIUM', actual: '215K', forecast: '220K', previous: '218K' },
];

export const MOCK_IPOS: IPOData[] = [
  { symbol: 'HYUNDAI', name: 'Hyundai Motor India', openDate: 'Oct 15', closeDate: 'Oct 17', priceBand: '₹1865 - ₹1960', gmp: 45, gmpPercent: 2.3, status: 'OPEN' },
  { symbol: 'SWIGGY', name: 'Swiggy Limited', openDate: 'Nov 06', closeDate: 'Nov 08', priceBand: '₹371 - ₹390', gmp: 125, gmpPercent: 32.5, status: 'UPCOMING' },
  { symbol: 'NTPCGREEN', name: 'NTPC Green Energy', openDate: 'Nov 12', closeDate: 'Nov 15', priceBand: '₹102 - ₹108', gmp: 8, gmpPercent: 7.4, status: 'UPCOMING' },
];

export const NOTIFICATIONS_MOCK: NotificationItem[] = [
  { 
    id: 'ai1', 
    type: 'AI_SIGNAL', 
    title: 'Bullish Bias on RELIANCE', 
    time: '2 mins ago', 
    read: false,
    aiResult: {
      symbol: 'RELIANCE.NS',
      signal: 'BULLISH',
      pattern: 'Bull Flag',
      confidence: 88,
      alpha_score: 85,
      rr_ratio: '1:3',
      pattern_complexity: 'INTERMEDIATE',
      timeframe: '1h',
      entry_zone: '2530',
      liquidity_zone: '2500',
      target: ['2650'],
      stop_loss: 2480,
      risk: 'LOW',
      rationale: 'Institutional buildup confirmed on H1.',
      market_structure: 'BULLISH_BOS',
      timestamp: '2024-10-20T10:00:00Z'
    }
  },
  { 
    id: 'ai2', 
    type: 'AI_SIGNAL', 
    title: 'Bearish Bias on BANKNIFTY', 
    time: '15 mins ago', 
    read: false,
    aiResult: {
      symbol: 'BANKNIFTY',
      signal: 'BEARISH',
      pattern: 'Double Top',
      confidence: 76,
      alpha_score: 45,
      rr_ratio: '1:2',
      pattern_complexity: 'BASIC',
      timeframe: '1h',
      entry_zone: '48100',
      liquidity_zone: '48500',
      target: ['47500'],
      stop_loss: 48350,
      risk: 'MEDIUM',
      rationale: 'Distribution phase at high.',
      market_structure: 'BEARISH_BOS',
      timestamp: '2024-10-20T10:15:00Z'
    }
  },
  { id: 'cal1', type: 'EVENT', title: 'US CPI Data indicates higher inflation', time: '1 hour ago', eventData: MOCK_CALENDAR[0], read: false },
  { id: 'news1', type: 'NEWS', title: 'RBI keeps repo rate unchanged at 6.5%', time: '2 hours ago', sentiment: 'POSITIVE', read: true },
  { id: 'ipo1', type: 'IPO', title: 'Swiggy IPO GMP surges 30%', time: '4 hours ago', ipoData: MOCK_IPOS[1], read: true },
];

export const UNIVERSE_IN = ['RELIANCE.NS', 'HDFCBANK.NS', 'INFY.NS', 'TCS.NS', 'SBIN.NS', 'ICICIBANK.NS', 'TATAMOTORS.NS'];
export const UNIVERSE_US = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

export const FO_SEARCH_IN = ['NIFTY 50', 'BANKNIFTY', 'RELIANCE.NS', 'INFY.NS', 'TCS.NS', 'SBIN.NS', 'TATAMOTORS.NS', 'HDFCBANK.NS'];
export const FO_SEARCH_US = ['SPY', 'QQQ', 'DIA', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'META', 'AMZN'];

export const FUTURES_DATA_IN: FutureContract[] = [
  { expiry: '28 Nov', ltp: 23587.50, changePercent: 1.2, changeOI: '+185k', volume: '4.5M', vwap: 23560.20, basis: 20.00 },
  { expiry: '26 Dec', ltp: 23622.75, changePercent: 0.9, changeOI: '+92k', volume: '1.2M', vwap: 23610.50, basis: 55.25 },
  { expiry: '30 Jan', ltp: 23668.00, changePercent: 0.7, changeOI: '+48k', volume: '680k', vwap: 23655.00, basis: 100.50 },
];

export const MOCK_FO_DATA_IN: FOSymbolData = {
  symbol: 'NIFTY 50',
  exchange: 'NSE',
  price: 23567.50,
  changePercent: 0.8,
  pcr: 1.05,
  pcrSignal: 'Neutral',
  maxPain: 23500,
  iv: 12.85,
  ivRank: 45,
  ivPercentile: 52,
  trend: 'Bullish',
  bias: 'Long',
  buildup: 'Long Buildup',
  lotSize: 25,
  contracts: FUTURES_DATA_IN
};

export const STRATEGIES: StrategyDefinition[] = [
  { 
    id: 's1', name: 'Long Straddle', type: 'Volatile', description: 'Buy ATM Call & Put. Profit from big move.', 
    risk: 'Medium', profitProb: 38, maxProfit: 'Unlimited', maxLoss: 'Limited (Premium)', breakeven: '±250 pts', roi: '150%+',
    payoffData: [{price: 23200, pnl: 200}, {price: 23300, pnl: 100}, {price: 23400, pnl: -100}, {price: 23500, pnl: -200}, {price: 23600, pnl: -100}, {price: 23700, pnl: 100}, {price: 23800, pnl: 200}]
  },
  { 
    id: 's2', name: 'Short Straddle', type: 'Neutral', description: 'Sell ATM Call & Put. Profit from stability.', 
    risk: 'High', profitProb: 65, maxProfit: 'Premium Received', maxLoss: 'Unlimited', breakeven: '±250 pts', roi: '22%',
    payoffData: [{price: 23200, pnl: -200}, {price: 23300, pnl: -100}, {price: 23400, pnl: 100}, {price: 23500, pnl: 200}, {price: 23600, pnl: 100}, {price: 23700, pnl: -100}, {price: 23800, pnl: -200}]
  },
  { 
    id: 's3', name: 'Iron Condor', type: 'Neutral', description: 'Sell OTM Call/Put + Buy Wings. Range bound.', 
    risk: 'Low', profitProb: 75, maxProfit: 'Fixed Credit', maxLoss: 'Fixed', breakeven: '23200 - 23800', roi: '18%',
    payoffData: [{price: 23100, pnl: -50}, {price: 23200, pnl: 0}, {price: 23300, pnl: 50}, {price: 23400, pnl: 50}, {price: 23500, pnl: 50}, {price: 23600, pnl: 50}, {price: 23700, pnl: 0}, {price: 23800, pnl: -50}]
  },
  { 
    id: 's4', name: 'Bull Call Spread', type: 'Bullish', description: 'Buy ATM Call, Sell OTM Call. Capped upside.', 
    risk: 'Low', profitProb: 48, maxProfit: 'Spread - Cost', maxLoss: 'Cost', breakeven: '23550', roi: '45%',
    payoffData: [{price: 23400, pnl: -50}, {price: 23500, pnl: -25}, {price: 23600, pnl: 25}, {price: 23700, pnl: 75}, {price: 23800, pnl: 75}]
  },
  { 
    id: 's5', name: 'Bear Put Spread', type: 'Bearish', description: 'Buy ATM Put, Sell OTM Put. Capped downside.', 
    risk: 'Low', profitProb: 48, maxProfit: 'Spread - Cost', maxLoss: 'Cost', breakeven: '23450', roi: '45%',
    payoffData: [{price: 23200, pnl: 75}, {price: 23300, pnl: 75}, {price: 23400, pnl: 25}, {price: 23500, pnl: -25}, {price: 23600, pnl: -50}]
  },
  { 
    id: 's6', name: 'Long Strangle', type: 'Volatile', description: 'Buy OTM Call & Put. Cheaper than Straddle.', 
    risk: 'Medium', profitProb: 32, maxProfit: 'Unlimited', maxLoss: 'Premium', breakeven: '±350 pts', roi: '200%+',
    payoffData: [{price: 23200, pnl: 150}, {price: 23300, pnl: 50}, {price: 23400, pnl: -50}, {price: 23500, pnl: -100}, {price: 23600, pnl: -50}, {price: 23700, pnl: 50}, {price: 23800, pnl: 150}]
  },
  { 
    id: 's7', name: 'Short Strangle', type: 'Neutral', description: 'Sell OTM Call & Put. Wide breakevens.', 
    risk: 'High', profitProb: 72, maxProfit: 'Premium', maxLoss: 'Unlimited', breakeven: '±350 pts', roi: '15%',
    payoffData: [{price: 23200, pnl: -150}, {price: 23300, pnl: -50}, {price: 23400, pnl: 50}, {price: 23500, pnl: 100}, {price: 23600, pnl: 50}, {price: 23700, pnl: -50}, {price: 23800, pnl: -150}]
  },
  { 
    id: 's8', name: 'Call Ratio Backspread', type: 'Bullish', description: 'Sell 1 ITM Call, Buy 2 OTM Calls. Big move.', 
    risk: 'High', profitProb: 35, maxProfit: 'Unlimited', maxLoss: 'Variable', breakeven: '23700', roi: 'Unlimited',
    payoffData: [{price: 23400, pnl: 50}, {price: 23500, pnl: 0}, {price: 23600, pnl: -50}, {price: 23700, pnl: 0}, {price: 23800, pnl: 100}, {price: 23900, pnl: 250}]
  }
];

export const ALL_ASSETS = [
  // IN Stocks
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', type: 'STOCK', market: 'IN', price: 980.50, change: 12.5, changePercent: 1.2 },
  { symbol: 'SBIN.NS', name: 'State Bank of India', type: 'STOCK', market: 'IN', price: 750.20, change: -5.5, changePercent: -0.7 },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', type: 'STOCK', market: 'IN', price: 3150.00, change: 45.0, changePercent: 1.4 },
  { symbol: 'ITC.NS', name: 'ITC Limited', type: 'STOCK', market: 'IN', price: 430.50, change: 2.5, changePercent: 0.5 },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', type: 'STOCK', market: 'IN', price: 6800.00, change: -120.0, changePercent: -1.7 },
  { symbol: 'TITAN.NS', name: 'Titan Company', type: 'STOCK', market: 'IN', price: 3250.00, change: 15.0, changePercent: 0.46 },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd', type: 'STOCK', market: 'IN', price: 480.00, change: -2.0, changePercent: -0.4 },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', type: 'STOCK', market: 'IN', price: 2520.50, change: 25.15, changePercent: 1.01 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Svcs', type: 'STOCK', market: 'IN', price: 3595.75, change: -45.20, changePercent: -1.24 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', type: 'STOCK', market: 'IN', price: 1650.00, change: 12.00, changePercent: 0.73 },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', type: 'STOCK', market: 'IN', price: 1450.25, change: 15.00, changePercent: 1.05 },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', type: 'STOCK', market: 'IN', price: 1080.00, change: 8.50, changePercent: 0.80 },

  // US Stocks
  { symbol: 'TSLA', name: 'Tesla Inc', type: 'STOCK', market: 'US', price: 210.50, change: -3.5, changePercent: -1.6 },
  { symbol: 'AMD', name: 'Adv. Micro Devices', type: 'STOCK', market: 'US', price: 175.20, change: 4.5, changePercent: 2.6 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', type: 'STOCK', market: 'US', price: 165.00, change: 1.2, changePercent: 0.7 },
  { symbol: 'AMZN', name: 'Amazon.com', type: 'STOCK', market: 'US', price: 180.50, change: 2.5, changePercent: 1.4 },
  { symbol: 'META', name: 'Meta Platforms', type: 'STOCK', market: 'US', price: 490.00, change: 12.0, changePercent: 2.5 },
  { symbol: 'NFLX', name: 'Netflix Inc', type: 'STOCK', market: 'US', price: 620.00, change: 8.0, changePercent: 1.3 },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCK', market: 'US', price: 178.35, change: 2.85, changePercent: 1.62 },
  { symbol: 'MSFT', name: 'Microsoft Corp', type: 'STOCK', market: 'US', price: 365.15, change: -3.20, changePercent: -0.88 },
  { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'STOCK', market: 'US', price: 485.00, change: 15.50, changePercent: 3.30 },

  // Crypto
  { symbol: 'CG:bitcoin', name: 'Bitcoin', type: 'CRYPTO', market: 'GLOBAL', price: 64230.50, change: 1200.50, changePercent: 1.90 },
  { symbol: 'CG:ethereum', name: 'Ethereum', type: 'CRYPTO', market: 'GLOBAL', price: 3450.20, change: -25.50, changePercent: -0.73 },
  { symbol: 'CG:solana', name: 'Solana', type: 'CRYPTO', market: 'GLOBAL', price: 145.80, change: 5.20, changePercent: 3.70 },
  { symbol: 'CG:binancecoin', name: 'BNB', type: 'CRYPTO', market: 'GLOBAL', price: 590.10, change: 8.50, changePercent: 1.45 },
  { symbol: 'CG:ripple', name: 'XRP', type: 'CRYPTO', market: 'GLOBAL', price: 0.62, change: -0.01, changePercent: -1.20 },
  { symbol: 'CG:dogecoin', name: 'Dogecoin', type: 'CRYPTO', market: 'GLOBAL', price: 0.16, change: 0.02, changePercent: 12.50 },
  { symbol: 'CG:cardano', name: 'Cardano', type: 'CRYPTO', market: 'GLOBAL', price: 0.45, change: 0.01, changePercent: 2.10 },
  { symbol: 'CG:avalanche-2', name: 'Avalanche', price: 35.20, change: -1.20, changePercent: -3.30 },
  { symbol: 'CG:polkadot', name: 'Polkadot', price: 7.15, change: 0.10, changePercent: 1.40 },
  { symbol: 'CG:chainlink', name: 'Chainlink', price: 14.50, change: 0.50, changePercent: 3.55 },

  // Indices
  { symbol: 'NIFTY 50', name: 'Nifty 50', type: 'INDEX', market: 'IN', price: 23567.50, change: 145.20, changePercent: 0.64 },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', type: 'INDEX', market: 'IN', price: 48235.60, change: 310.45, changePercent: 0.65 },
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'INDEX', market: 'US', price: 0, change: 0, changePercent: 0 },
  { symbol: 'DIA', name: 'Dow Jones ETF', type: 'INDEX', market: 'US', price: 0, change: 0, changePercent: 0 },
  { symbol: 'QQQ', name: 'NASDAQ ETF', type: 'INDEX', market: 'US', price: 0, change: 0, changePercent: 0 },
];
