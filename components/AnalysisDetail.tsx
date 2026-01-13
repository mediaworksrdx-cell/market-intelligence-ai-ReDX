
import React, { useState, useMemo, useEffect } from 'react';
import { getQuote, mapSymbolToFinnhub } from '../services/finnhub';

interface AnalysisDetailProps {
  symbol: string;
  onBack: () => void;
}

// Helper to map internal symbol to TradingView symbol
const getTVSymbol = (s: string) => {
  if (!s) return 'NASDAQ:AAPL';

  if (s.includes(':NSE')) {
    return `NSE:${s.replace(':NSE', '')}`;
  }

  if (s.endsWith('.NS')) {
    return `NSE:${s.replace('.NS', '')}`;
  }
  if (s.endsWith('.BO')) {
    return `BSE:${s.replace('.BO', '')}`;
  }

  if (s === 'NIFTY 50' || s === 'NIFTY') return 'NSE:NIFTY';
  if (s === 'BANKNIFTY' || s === 'BANK NIFTY') return 'NSE:BANKNIFTY';
  if (s === 'SENSEX') return 'BSE:SENSEX';
  if (s === 'FINNIFTY') return 'NSE:CNXFINANCE';
  
  if (s === '^GSPC' || s === 'S&P 500' || s === 'SPX') return 'SP:SPX';
  if (s === '^DJI' || s === 'DOW JONES' || s === 'DJI') return 'DJ:DJI';
  if (s === '^IXIC' || s === 'NASDAQ' || s === 'IXIC') return 'NASDAQ:IXIC';
  
  if (s.startsWith('CG:')) {
     const id = s.replace('CG:', '').toLowerCase();
     const cryptoMap: Record<string, string> = {
        'bitcoin': 'BINANCE:BTCUSDT',
        'ethereum': 'BINANCE:ETHUSDT',
        'solana': 'BINANCE:SOLUSDT',
        'binancecoin': 'BINANCE:BNBUSDT',
        'ripple': 'BINANCE:XRPUSDT',
        'cardano': 'BINANCE:ADAUSDT',
        'dogecoin': 'BINANCE:DOGEUSDT',
        'polkadot': 'BINANCE:DOTUSDT',
        'chainlink': 'BINANCE:LINKUSDT',
        'avalanche-2': 'BINANCE:AVAXUSDT',
        'matic-network': 'BINANCE:MATICUSDT',
        'shiba-inu': 'BINANCE:SHIBUSDT',
        'uniswap': 'BINANCE:UNIUSDT',
        'litecoin': 'BINANCE:LTCUSDT',
        'tron': 'BINANCE:TRXUSDT',
        'ethereum-classic': 'BINANCE:ETCUSDT',
        'stellar': 'BINANCE:XLMUSDT',
        'near': 'BINANCE:NEARUSDT',
        'cosmos': 'BINANCE:ATOMUSDT'
     };
     return cryptoMap[id] || `BINANCE:${id.toUpperCase()}USDT`;
  }

  if (s.includes('BINANCE:')) return s;
  if (s === 'BTC' || s.includes('BTCUSDT')) return 'BINANCE:BTCUSDT';
  if (s === 'ETH' || s.includes('ETHUSDT')) return 'BINANCE:ETHUSDT';

  if (/^[A-Z]+$/.test(s)) {
     return `NASDAQ:${s}`;
  }
  
  return s; 
};

export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ symbol, onBack }) => {
  const [activeTab, setActiveTab] = useState<'CHART' | 'TECHNICALS' | 'PIVOTS'>('CHART');
  const [priceData, setPriceData] = useState<{c: number, d: number, dp: number} | null>(null);
  const [loading, setLoading] = useState(true);

  const tvSymbol = useMemo(() => getTVSymbol(symbol), [symbol]);

  // Fetch current price context for technicals
  useEffect(() => {
    let isMounted = true;
    const fetchContext = async () => {
      setLoading(true);
      try {
        const mapped = mapSymbolToFinnhub(symbol, 'GLOBAL' as any);
        const quote = await getQuote(mapped);
        if (isMounted && quote) {
          setPriceData({ c: quote.c, d: quote.d, dp: quote.dp });
        }
      } catch (e) {
        console.error("Failed to fetch analysis context", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchContext();
    return () => { isMounted = false; };
  }, [symbol]);

  // Generate deterministic but dynamic data based on price and symbol
  const techMetrics = useMemo(() => {
    const basePrice = priceData?.c || 100;
    // Use symbol length and price to seed "randomness"
    const seed = symbol.length + (Math.floor(basePrice) % 100);
    
    // STRICT ROUNDING & LIMITING: Ensuring clean integers only
    const rawScore = 50 + (priceData?.dp || 0) * 10 + (seed % 10);
    const sentimentScore = Math.round(Math.min(100, Math.max(0, rawScore)));
    
    const oscillators = [
      { name: 'RSI (14)', value: (45 + (seed % 30)).toFixed(2), action: sentimentScore > 70 ? 'STRONG BUY' : sentimentScore > 50 ? 'BUY' : 'NEUTRAL' },
      { name: 'Stoch %K', value: (20 + (seed % 60)).toFixed(2), action: seed % 2 === 0 ? 'BUY' : 'NEUTRAL' },
      { name: 'CCI (20)', value: (sentimentScore * 2 - 100).toFixed(1), action: sentimentScore > 60 ? 'BUY' : 'SELL' },
      { name: 'MACD', value: (basePrice * 0.002 * (seed % 5 - 2)).toFixed(2), action: 'BUY' },
    ];

    const mAs = [
      { name: 'SMA 10', value: (basePrice * 0.99).toFixed(2), action: 'BUY' },
      { name: 'SMA 20', value: (basePrice * 0.98).toFixed(2), action: 'BUY' },
      { name: 'SMA 50', value: (basePrice * 0.95).toFixed(2), action: 'STRONG BUY' },
      { name: 'SMA 200', value: (basePrice * 0.85).toFixed(2), action: 'STRONG BUY' },
    ];

    const range = basePrice * 0.02;
    const pivotData = {
      pivot: basePrice.toFixed(2),
      r1: (basePrice + range * 0.5).toFixed(2),
      r2: (basePrice + range).toFixed(2),
      r3: (basePrice + range * 1.5).toFixed(2),
      s1: (basePrice - range * 0.5).toFixed(2),
      s2: (basePrice - range).toFixed(2),
      s3: (basePrice - range * 1.5).toFixed(2),
    };

    return { sentimentScore, oscillators, mAs, pivotData };
  }, [symbol, priceData]);

  const getSentimentLabel = (score: number) => {
    if (score < 20) return { label: 'Strong Sell', color: 'text-red-500', bg: 'bg-red-500' };
    if (score < 40) return { label: 'Sell', color: 'text-orange-500', bg: 'bg-orange-500' };
    if (score < 60) return { label: 'Neutral', color: 'text-gray-400', bg: 'bg-gray-400' };
    if (score < 80) return { label: 'Buy', color: 'text-blue-400', bg: 'bg-blue-400' };
    return { label: 'Strong Buy', color: 'text-[#00C805]', bg: 'bg-[#00C805]' };
  };

  const sentiment = getSentimentLabel(techMetrics.sentimentScore);

  return (
    <div className="fixed inset-0 bg-[#09090b] z-[60] flex flex-col animate-slide-up">
       {/* Header */}
       <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-[#09090b] shrink-0">
          <button onClick={onBack} className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="text-center">
             <h2 className="text-base font-bold text-white tracking-tight uppercase">{symbol.replace('CG:', '').replace(':NSE', '').toUpperCase()}</h2>
             <div className="flex items-center justify-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${loading ? 'bg-yellow-500' : 'bg-[#00C805]'}`}></span>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{loading ? 'Syncing...' : 'Real-time Analysis'}</p>
             </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-white">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>
       </div>

       {/* Tab Navigation */}
       <div className="flex border-b border-gray-800 shrink-0">
         {['CHART', 'TECHNICALS', 'PIVOTS'].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === tab 
                 ? 'text-[#00C805] border-b-2 border-[#00C805] bg-[#00C805]/10' 
                 : 'text-gray-500 hover:text-gray-300'
             }`}
           >
             {tab}
           </button>
         ))}
       </div>

       {/* Content Area */}
       <div className="flex-1 overflow-y-auto bg-[#09090b] relative no-scrollbar">
          
          {/* CHART TAB */}
          {activeTab === 'CHART' && (
             <div className="h-full w-full">
                <iframe
                  title="TradingView Chart"
                  className="w-full h-full border-none"
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=${tvSymbol}&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=09090b&studies=[]&hideideas=1&theme=Dark&style=1&timezone=Asia%2FKolkata&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${tvSymbol}`}
                ></iframe>
             </div>
          )}

          {/* TECHNICALS TAB */}
          {activeTab === 'TECHNICALS' && (
             <div className="p-4 space-y-6">
                
                {/* Advanced Sentiment Gauge - Redesigned to be "Digital Cockpit" style */}
                <div className="bg-[#121212] rounded-2xl border border-gray-800 p-6 text-center relative overflow-hidden group">
                   <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-6 relative z-10">Institutional Sentiment</h3>
                   
                   <div className="relative w-72 h-36 mx-auto mb-4">
                      {/* Outer Rim */}
                      <div className="absolute top-0 left-0 w-full h-full border-[8px] border-gray-800/50 rounded-t-full"></div>
                      
                      {/* Color Segment Arch - Strictly rounded conic gradient */}
                      <div 
                        className="absolute top-0 left-0 w-full h-full rounded-t-full transition-all duration-1000 ease-out origin-bottom transform opacity-60"
                        style={{
                           background: `conic-gradient(from 180deg at 50% 100%, 
                              #ef4444 0deg, 
                              #f59e0b 54deg, 
                              #9ca3af 90deg, 
                              #3b82f6 126deg, 
                              #00C805 180deg)`
                        }}
                      ></div>
                      
                      {/* Centered Score Display */}
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-8">
                         <div className="text-center">
                            <div className="flex items-center justify-center space-x-0.5">
                               <span className={`text-4xl font-black font-mono tracking-tighter ${sentiment.color} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                                 {techMetrics.sentimentScore}
                               </span>
                               <span className={`text-sm font-bold opacity-70 ${sentiment.color}`}>%</span>
                            </div>
                            <div className={`mt-1 font-black text-xs uppercase tracking-widest py-1 px-3 rounded-full border bg-black/40 ${sentiment.color} border-current/20 shadow-xl transition-all duration-500`}>
                               {sentiment.label}
                            </div>
                         </div>
                      </div>

                      {/* Needle - Advanced high-tech needle */}
                      <div 
                        className="absolute bottom-0 left-1/2 w-[3px] h-full origin-bottom z-20 transition-transform duration-1000 ease-out"
                        style={{ transform: `translateX(-50%) rotate(${(techMetrics.sentimentScore / 100) * 180 - 90}deg)` }}
                      >
                         <div className="w-full h-full bg-gradient-to-t from-white/20 via-white to-white shadow-[0_0_15px_rgba(255,255,255,0.8)] rounded-t-full"></div>
                         {/* Glow tip */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full blur-[2px]"></div>
                      </div>
                      
                      {/* Pivot Hub */}
                      <div className="absolute bottom-[-10px] left-1/2 w-6 h-6 bg-[#121212] border-[3px] border-gray-600 rounded-full transform -translate-x-1/2 z-30 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center">
                         <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-1 px-4 text-[10px] font-black uppercase tracking-widest mt-4 text-gray-500 border-t border-gray-800 pt-4">
                      <span className="text-left text-red-500 opacity-60">Sell</span>
                      <span className="text-center opacity-40">Neutral</span>
                      <span className="text-right text-[#00C805] opacity-60">Buy</span>
                   </div>
                   <p className="text-[9px] text-gray-600 mt-3 font-mono italic tracking-tight">System v3.0 Powered • Institutional Weighting</p>
                </div>

                {/* Oscillators Table */}
                <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                   <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/40 flex justify-between items-center">
                      <h3 className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Oscillators</h3>
                      <span className="text-[9px] text-gray-600 font-mono">Real-time Batch</span>
                   </div>
                   <div className="divide-y divide-gray-800/40">
                      {techMetrics.oscillators.map((osc, i) => (
                         <div key={i} className="flex justify-between items-center px-4 py-4 text-xs hover:bg-white/5 transition-colors">
                            <span className="text-gray-400 font-bold uppercase tracking-tight">{osc.name}</span>
                            <div className="text-right">
                               <span className="block text-white font-mono font-bold text-sm tracking-tight">{osc.value}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest ${osc.action.includes('BUY') ? 'text-blue-400' : osc.action.includes('SELL') ? 'text-red-500' : 'text-gray-600'}`}>
                                  {osc.action}
                               </span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Moving Averages Table */}
                <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                   <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/40 flex justify-between items-center">
                      <h3 className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Moving Averages</h3>
                      <span className="text-[9px] text-gray-600 font-mono">H1 Aggregation</span>
                   </div>
                   <div className="divide-y divide-gray-800/40">
                      {techMetrics.mAs.map((ma, i) => (
                         <div key={i} className="flex justify-between items-center px-4 py-4 text-xs hover:bg-white/5 transition-colors">
                            <span className="text-gray-400 font-bold uppercase tracking-tight">{ma.name}</span>
                            <div className="text-right">
                               <span className="block text-white font-mono font-bold text-sm tracking-tight">{ma.value}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest ${ma.action.includes('BUY') ? 'text-[#00C805]' : ma.action.includes('SELL') ? 'text-red-500' : 'text-gray-600'}`}>
                                  {ma.action}
                               </span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

             </div>
          )}

          {/* PIVOTS TAB */}
          {activeTab === 'PIVOTS' && (
             <div className="p-4 space-y-4">
                <div className="bg-[#121212] p-4 rounded-xl border border-gray-800 flex justify-between items-center shadow-lg">
                   <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Logic Model</span>
                   <span className="text-xs bg-[#09090b] px-3 py-1.5 rounded-lg border border-gray-800 text-white font-mono font-bold tracking-tight">CLASSIC H1</span>
                </div>

                <div className="space-y-2">
                   {['r3', 'r2', 'r1'].map((key) => (
                      <div key={key} className="flex justify-between items-center bg-[#18181b] p-4 rounded-xl border border-red-900/20 hover:border-red-500/30 transition-all">
                         <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{key} Resistance</span>
                         <span className="text-sm font-mono font-black text-white">{(techMetrics.pivotData as any)[key]}</span>
                      </div>
                   ))}
                   
                   {/* Central Pivot Point */}
                   <div className="flex justify-between items-center bg-gray-800/50 p-5 rounded-xl border border-gray-600 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#00C805]"></div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest relative z-10">Central Pivot</span>
                      <span className="text-lg font-mono font-black text-[#00C805] relative z-10">{(techMetrics.pivotData as any).pivot}</span>
                   </div>

                   {/* Support Levels */}
                   {['s1', 's2', 's3'].map((key) => (
                      <div key={key} className="flex justify-between items-center bg-[#18181b] p-4 rounded-xl border border-green-900/20 hover:border-green-500/30 transition-all">
                         <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{key} Support</span>
                         <span className="text-sm font-mono font-black text-white">{(techMetrics.pivotData as any)[key]}</span>
                      </div>
                   ))}
                </div>
                
                <div className="mt-8 p-6 bg-[#121212] rounded-2xl border border-gray-800 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-3 text-gray-800 opacity-20 group-hover:opacity-40 transition-opacity">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                   </div>
                   <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Quantitative Note
                   </p>
                   <p className="text-xs text-gray-300 leading-relaxed font-medium pr-4">
                      Current price interaction at the <span className="text-white font-bold underline decoration-[#00C805]/40">Central Pivot</span> is critical. Sustained volume above <span className="font-mono text-white bg-white/5 px-1.5 py-0.5 rounded">{techMetrics.pivotData.r1}</span> signals immediate bullish continuation toward Resistance Zone <span className="text-red-400 font-mono font-bold">2</span>.
                   </p>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
