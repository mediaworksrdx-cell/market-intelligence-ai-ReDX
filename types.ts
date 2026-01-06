
export type MarketType = 'IN' | 'US';

export interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market: MarketType;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  market: MarketType;
}

export interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market?: string;
}

export interface PriceSimulationPlan {
  simulate: boolean;
  next_api_call_in_seconds: number;
  max_price_drift_allowed: string; // percentage string
  simulation_bias: 'UP' | 'DOWN' | 'NEUTRAL';
  notes: string;
}

export interface AIAnalysisResult {
  symbol: string;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  alpha_score: number;
  rr_ratio: string;
  pattern: string | null;
  pattern_complexity: 'BASIC' | 'INTERMEDIATE' | 'INSTITUTIONAL';
  timeframe: string;
  entry_zone: string | null;
  liquidity_zone: string | null;
  stop_loss: string | number | null;
  target: string[] | null;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
  market_structure: 'BULLISH_BOS' | 'BEARISH_BOS' | 'CHoCH' | 'CONSOLIDATION';
  timestamp: string;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  market: MarketType;
  type: 'STOCK' | 'CRYPTO' | 'INDEX';
  aiScore: number;
  aiSentiment: string;
}

export interface OptionChainData {
  strike: number;
  callOI: number;
  callLTP: number;
  callChange: number;
  callIV: number;
  callGreeks: { delta: number; gamma: number; theta: number; vega: number };
  putOI: number;
  putLTP: number;
  putChange: number;
  putIV: number;
  putGreeks: { delta: number; gamma: number; theta: number; vega: number };
}

export interface FutureContract {
  expiry: string;
  ltp: number;
  changePercent: number;
  changeOI: string;
  volume: string;
  vwap: number;
  basis: number;
}

export interface FOSymbolData {
  symbol: string;
  exchange: string;
  price: number;
  changePercent: number;
  pcr: number;
  pcrSignal: string;
  maxPain: number;
  iv: number;
  ivRank: number;
  ivPercentile: number;
  trend: string;
  bias: string;
  buildup: string;
  lotSize: number;
  contracts: FutureContract[];
}

export interface StrategyDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  risk: 'Low' | 'Medium' | 'High';
  profitProb: number;
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
  roi: string;
  payoffData: { price: number; pnl: number }[];
}

export interface NotificationItem {
  id: string;
  type: 'AI_SIGNAL' | 'NEWS' | 'EVENT' | 'IPO';
  title: string;
  time: string;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  read: boolean;
  aiResult?: AIAnalysisResult;
  eventData?: any;
  ipoData?: any;
}

export interface UserSettings {
  darkMode: boolean;
  streamerMode: boolean;
  riskProfile: 'AGGRESSIVE' | 'CONSERVATIVE';
  webhookUrl: string;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  AI_SCANNER = 'ai_scanner',
  FNO = 'fno',
  PORTFOLIO = 'portfolio',
  TRAINING = 'training',
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
  ANALYSIS = 'analysis'
}

// Fixed: Added missing interfaces requested by constants.ts
export interface TrainingModule {
  id: string;
  title: string;
  duration: string;
  locked: boolean;
  topics: string[];
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual: string;
  forecast: string;
  previous: string;
}

export interface IPOData {
  symbol: string;
  name: string;
  openDate: string;
  closeDate: string;
  priceBand: string;
  gmp: number;
  gmpPercent: number;
  status: 'OPEN' | 'UPCOMING' | 'CLOSED';
}
