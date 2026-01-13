
import React, { useState, useEffect } from 'react';
import { MarketType, FOSymbolData, FutureContract, StrategyDefinition, OptionChainData } from '../types';
import { 
  MOCK_FO_DATA_IN, STRATEGIES, ALL_ASSETS 
} from '../constants';
import { getQuote, mapSymbolToFinnhub } from '../services/finnhub';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, ReferenceLine, Cell } from 'recharts';

interface FOAnalyticsProps {
  market: MarketType;
}

export const FOAnalytics: React.FC<FOAnalyticsProps> = ({ market }) => {
  const [activeTab, setActiveTab] = useState<'COCKPIT' | 'CHAIN' | 'FUTURES' | 'STRATEGY'>('COCKPIT');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState(market === 'IN' ? 'NIFTY 50' : 'SPY');
  const [symbolData, setSymbolData] = useState<FOSymbolData>(MOCK_FO_DATA_IN);
  const [optionChain, setOptionChain] = useState<OptionChainData[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyDefinition | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showChainGreeks, setShowChainGreeks] = useState(false);
  const [showBasketModal, setShowBasketModal] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // --- Dynamic Data Generators (For US Real-time Simulation) ---
  const generateDynamicChain = (spot: number): OptionChainData[] => {
    const step = spot > 1000 ? 50 : spot > 100 ? 5 : 1;
    const atm = Math.round(spot / step) * step;
    const chain: OptionChainData[] = [];
    
    // Generate 7 strikes centered on ATM
    for(let i = -3; i <= 3; i++) {
        const strike = parseFloat((atm + (i * step)).toFixed(2));
        const dist = (spot - strike) / strike;
        
        // Basic Option Math Simulation
        const ttm = 30 / 365; // ~30 days
        const iv = 0.15 + (Math.abs(dist) * 0.5); // Smile
        const callIntrinsic = Math.max(0, spot - strike);
        const putIntrinsic = Math.max(0, strike - spot);
        const timeValue = spot * iv * Math.sqrt(ttm) * 0.4;
        
        chain.push({
            strike,
            callOI: Math.floor(Math.random() * 50000) + 10000,
            callLTP: parseFloat((callIntrinsic + timeValue).toFixed(2)),
            callChange: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
            callIV: parseFloat((iv * 100).toFixed(1)),
            callGreeks: { delta: 0.5 + (dist * 2), gamma: 0.02, theta: -0.1, vega: 0.15 },
            putOI: Math.floor(Math.random() * 50000) + 10000,
            putLTP: parseFloat((putIntrinsic + timeValue).toFixed(2)),
            putChange: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
            putIV: parseFloat((iv * 100).toFixed(1)),
            putGreeks: { delta: -0.5 + (dist * 2), gamma: 0.02, theta: -0.1, vega: 0.15 }
        });
    }
    return chain;
  };

  const generateFutures = (spot: number): FutureContract[] => {
     return [
        { expiry: 'Near Month', ltp: parseFloat((spot * 1.002).toFixed(2)), changePercent: 0.45, changeOI: '+12k', volume: '1.2M', vwap: spot, basis: parseFloat((spot * 0.002).toFixed(2)) },
        { expiry: 'Next Month', ltp: parseFloat((spot * 1.005).toFixed(2)), changePercent: 0.32, changeOI: '+5k', volume: '450k', vwap: spot, basis: parseFloat((spot * 0.005).toFixed(2)) },
        { expiry: 'Far Month', ltp: parseFloat((spot * 1.009).toFixed(2)), changePercent: 0.15, changeOI: '+1k', volume: '120k', vwap: spot, basis: parseFloat((spot * 0.009).toFixed(2)) },
     ];
  };

  // Sync data with market and selected symbol
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchData = async () => {
        if (market === 'US') {
            const mapped = mapSymbolToFinnhub(selectedSymbol, 'US');
            const quote = await getQuote(mapped);
            if (quote && quote.c) {
                const currentPrice = quote.c;
                const changeP = quote.dp;
                
                // Update Header Data
                setSymbolData({
                    symbol: selectedSymbol,
                    exchange: 'NYSE/ARCA', // Alpaca source
                    price: currentPrice,
                    changePercent: parseFloat(changeP.toFixed(2)),
                    pcr: 0.95, // Calculated/Simulated
                    pcrSignal: changeP > 0 ? 'Bullish' : 'Bearish',
                    maxPain: Math.round(currentPrice),
                    iv: 14.5,
                    ivRank: 55,
                    ivPercentile: 60,
                    trend: changeP > 0 ? 'Bullish' : 'Bearish',
                    bias: changeP > 0 ? 'Long' : 'Short',
                    buildup: changeP > 0 ? 'Long Buildup' : 'Short Buildup',
                    lotSize: selectedSymbol === 'SPY' ? 1 : 100,
                    contracts: generateFutures(currentPrice)
                });
                
                // Update Chain
                setOptionChain(generateDynamicChain(currentPrice));
                setIsLive(true);
            }
        } else {
            // Use MOCK for IN (Free Tier limits)
            setSymbolData(MOCK_FO_DATA_IN);
            // Assuming MOCK_FO_DATA_IN has a corresponding chain in a real app, 
            // but for this refactor we rely on the mocked chain from constants if implied
            // Here we just re-generate purely for consistent UI behavior in this component
            setOptionChain(generateDynamicChain(MOCK_FO_DATA_IN.price));
            setIsLive(false);
        }
    };

    fetchData();
    if (market === 'US') {
        interval = setInterval(fetchData, 5000); // Poll real-time every 5s
    }

    return () => clearInterval(interval);
  }, [market, selectedSymbol]);

  // Reset selected symbol if market changes
  useEffect(() => {
    setSelectedSymbol(market === 'IN' ? 'NIFTY 50' : 'SPY');
  }, [market]);

  const handleSearchSelect = (sym: string) => {
    setSelectedSymbol(sym);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const toggleWatchlist = () => {
    if (watchlist.includes(selectedSymbol)) {
      setWatchlist(watchlist.filter(s => s !== selectedSymbol));
    } else {
      setWatchlist([...watchlist, selectedSymbol]);
    }
  };

  const currency = market === 'IN' ? '₹' : '$';

  // Filter assets for search
  const filteredAssets = ALL_ASSETS.filter(asset => {
    const marketMatch = asset.market === market || asset.market === 'GLOBAL';
    const textMatch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return marketMatch && textMatch;
  });

  // Helper to format large numbers
  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
  };
  
  // -- RENDERERS --

  const renderTopBar = () => (
    <div className="flex flex-col space-y-3 mb-4 sticky top-0 bg-[#09090b] z-20 pb-2 border-b border-gray-800">
       
       {/* Section Header */}
       <div className="flex items-center space-x-3 pt-2">
          <div className="p-2 bg-[#00C805]/20 rounded-lg text-[#00C805] shadow-[0_0_15px_rgba(0,200,5,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 5 5 5-5 5 5 5-5"/><path d="m3 13 5 5 5-5 5 5 5-5"/><path d="m3 23 5-5 5 5 5 5"/></svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Futures & Options</h1>
       </div>

       <div className="flex justify-between items-center bg-[#121212] p-2 rounded-lg border border-gray-800/50">
          <div>
             <div className="flex items-center space-x-2 text-sm">
                <span className="font-bold text-white text-base tracking-tight">{selectedSymbol}</span>
                <span className="text-[9px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 font-mono border border-gray-700">{symbolData.exchange}</span>
                {isLive && <span className="text-[9px] text-[#00C805] font-black animate-pulse">● LIVE</span>}
             </div>
             <div className="flex items-center space-x-3 text-xs mt-0.5">
                <span className="font-mono text-gray-300 font-bold">{currency}{(symbolData.price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                <span className={`font-bold font-mono ${symbolData.changePercent >= 0 ? 'text-[#00C805]' : 'text-red-500'}`}>
                   {symbolData.changePercent >= 0 ? '▲' : '▼'} {Math.abs(symbolData.changePercent)}%
                </span>
             </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={toggleWatchlist}
              className={`p-2 rounded-lg border transition-all ${watchlist.includes(selectedSymbol) ? 'bg-[#00C805]/10 border-[#00C805] text-[#00C805]' : 'bg-[#18181b] border-gray-800 text-gray-400 hover:border-gray-600'}`}
            >
               {watchlist.includes(selectedSymbol) ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
               )}
            </button>
            <button 
              onClick={() => setShowBasketModal(true)}
              className="px-3 py-2 rounded-lg bg-[#00C805] text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center shadow-[0_0_10px_rgba(0,200,5,0.4)] hover:bg-green-400 transition-colors"
            >
               Basket
            </button>
          </div>
       </div>

       {/* Smart Search */}
       <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#00C805] transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          </div>
          <input 
            type="text" 
            placeholder={`Search Stocks, Indices, Crypto...`}
            className="w-full bg-[#09090b] border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-xs font-mono focus:outline-none focus:border-[#00C805] transition-all focus:bg-[#121212] text-white"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
            onFocus={() => setShowSearchDropdown(true)}
          />
          {showSearchDropdown && searchQuery && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-[#09090b] border border-gray-800 rounded-lg shadow-2xl overflow-hidden animate-slide-up z-30 max-h-60 overflow-y-auto">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map(asset => (
                     <div key={asset.symbol} onClick={() => handleSearchSelect(asset.symbol)} className="p-3 text-xs hover:bg-gray-900 cursor-pointer border-b border-gray-900 last:border-0 flex justify-between items-center group">
                        <div className="flex items-center space-x-2">
                           <span className="font-bold text-gray-300 group-hover:text-[#00C805] font-mono">{asset.symbol}</span>
                           <span className={`text-[9px] px-1 rounded border ${asset.type === 'CRYPTO' ? 'border-orange-500/30 text-orange-400' : asset.type === 'INDEX' ? 'border-blue-500/30 text-blue-400' : 'border-gray-700 text-gray-500'}`}>
                              {asset.type}
                           </span>
                        </div>
                        <span className="text-[9px] text-gray-600">{asset.name}</span>
                     </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-gray-500">No assets found</div>
                )}
             </div>
          )}
       </div>

       {/* Tab Navigation */}
       <div className="flex p-1 bg-[#121212] rounded-lg border border-gray-800/50 space-x-1">
         {[
           {id: 'COCKPIT', label: 'Cockpit'},
           {id: 'CHAIN', label: 'Option Chain'},
           {id: 'FUTURES', label: 'Futures'},
           {id: 'STRATEGY', label: 'Strategies'},
         ].map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-[#27272a] text-white shadow-sm border border-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
            >
               {tab.label}
            </button>
         ))}
       </div>
    </div>
  );

  const renderCockpit = () => (
    <div className="space-y-4 animate-fade-in">
       {/* 1. Institutional Dashboard Grid */}
       <div className="grid grid-cols-2 gap-3">
          {/* Bias Card */}
          <div className="col-span-1 bg-[#121212] p-3 rounded-xl border border-gray-800/60 relative overflow-hidden group">
             <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl rounded-full opacity-20 ${symbolData.trend.includes('Bull') ? 'bg-green-500' : 'bg-red-500'}`}></div>
             <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">DIRECTIONAL BIAS</p>
             <div className="flex items-end space-x-2">
               <div className={`text-xl font-black tracking-tighter ${symbolData.trend.includes('Bull') ? 'text-green-500' : 'text-red-500'}`}>
                 {symbolData.bias.toUpperCase()}
               </div>
               <div className="text-[9px] text-gray-400 mb-1.5 font-mono">CONF: 82%</div>
             </div>
             <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${symbolData.trend.includes('Bull') ? 'bg-green-500' : 'bg-red-500'}`} style={{width: '82%'}}></div>
             </div>
          </div>

          {/* Max Pain */}
          <div className="col-span-1 bg-[#121212] p-3 rounded-xl border border-gray-800/60">
             <div className="flex justify-between items-start">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">MAX PAIN</p>
                <span className="text-[9px] text-yellow-500 font-mono bg-yellow-500/10 px-1 rounded">28 NOV</span>
             </div>
             <p className="text-xl font-mono font-bold text-white mt-1">{symbolData.maxPain}</p>
             <p className="text-[9px] text-gray-500 mt-1">Gamma Pin Risk</p>
          </div>

          {/* Advanced PCR */}
          <div className="col-span-1 bg-[#121212] p-3 rounded-xl border border-gray-800/60">
             <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">PCR RATIO</p>
             <div className="flex items-baseline space-x-2 mt-1">
                <p className={`text-xl font-mono font-bold ${symbolData.pcr > 1 ? 'text-green-400' : 'text-red-400'}`}>{symbolData.pcr}</p>
                <span className="text-[9px] text-gray-400">{symbolData.pcrSignal}</span>
             </div>
             <div className="w-full bg-gray-800 h-1.5 mt-2 rounded-full overflow-hidden flex">
                <div className="bg-red-500 h-full" style={{width: '40%'}}></div>
                <div className="bg-green-500 h-full" style={{width: '60%'}}></div>
             </div>
          </div>

          {/* IV Rank */}
          <div className="col-span-1 bg-[#121212] p-3 rounded-xl border border-gray-800/60">
             <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">IV RANK</p>
             <div className="flex items-baseline space-x-1 mt-1">
                <p className="text-xl font-mono font-bold text-blue-400">{symbolData.ivRank}</p>
                <span className="text-[9px] text-gray-600">/ 100</span>
             </div>
             <p className="text-[9px] text-gray-500 mt-1">Percentile: <span className="text-white font-mono">{symbolData.ivPercentile}%</span></p>
          </div>
       </div>

       {/* 2. Jolt Alerts (Advanced) */}
       <div className="border-t border-gray-800/50 pt-4">
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <h3 className="text-xs font-black text-gray-200 uppercase tracking-widest">Institutional Jolts</h3>
            </div>
            <span className="text-[9px] text-gray-500 font-mono">LIVE FEED</span>
         </div>
         <div className="space-y-2">
            <div className="bg-[#121212] border border-red-900/30 p-2.5 rounded-lg flex justify-between items-center group hover:border-red-500/50 transition-all">
               <div>
                  <div className="flex items-center space-x-2">
                     <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-1 rounded">UNWINDING</span>
                     <span className="text-xs font-bold text-gray-300 font-mono">23800 CE</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">-1.2M OI in 15m • High Volume</p>
               </div>
               <div className="text-right">
                  <span className="block text-xs font-mono font-bold text-red-500">-15%</span>
                  <span className="text-[9px] text-gray-600">OI Chg</span>
               </div>
            </div>
            <div className="bg-[#121212] border border-blue-900/30 p-2.5 rounded-lg flex justify-between items-center group hover:border-blue-500/50 transition-all">
               <div>
                  <div className="flex items-center space-x-2">
                     <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-1 rounded">IV SPIKE</span>
                     <span className="text-xs font-bold text-gray-300 font-mono">ATM PE</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Vega Expansion • Event Risk</p>
               </div>
               <div className="text-right">
                  <span className="block text-xs font-mono font-bold text-blue-500">+4.2</span>
                  <span className="text-[9px] text-gray-600">IV Chg</span>
               </div>
            </div>
         </div>
       </div>

       {/* 3. Trend Strength Meter */}
       <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between mb-3">
             <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">MOMENTUM METER</p>
             <p className="text-[10px] text-green-500 font-mono font-bold">STRONG BULLISH</p>
          </div>
          <div className="relative pt-2">
             <div className="flex mb-1 items-center justify-between text-[9px] font-bold text-gray-600 font-mono uppercase">
                <span>Oversold</span>
                <span>Neutral</span>
                <span>Overbought</span>
             </div>
             <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
                <div className="w-1/3 bg-gradient-to-r from-red-900 to-red-600 opacity-50"></div>
                <div className="w-1/3 bg-gray-700 opacity-30"></div>
                <div className="w-1/3 bg-gradient-to-r from-green-600 to-green-400"></div>
             </div>
             {/* Indicator Triangle */}
             <div className="absolute top-5 left-[85%] transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-white"></div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderFutures = () => (
    <div className="space-y-4 animate-fade-in">
       <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Term Structure</h3>
          <span className="text-[9px] bg-gray-900 text-gray-400 px-2 py-1 rounded border border-gray-800 font-mono">LOT: {symbolData.lotSize}</span>
       </div>
       <div className="space-y-2">
          {symbolData.contracts.map((contract, i) => (
             <div key={i} className="bg-[#121212] rounded-lg border border-gray-800/60 p-3 hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white bg-gray-800 px-1.5 py-0.5 rounded font-mono border border-gray-700">{contract.expiry}</span>
                      {i === 0 && <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">NEAR</span>}
                   </div>
                   <div className="text-right">
                      <span className="text-sm font-bold text-white font-mono">{currency}{contract.ltp.toLocaleString()}</span>
                      <span className={`text-[10px] ml-2 font-mono ${contract.changePercent >= 0 ? 'text-[#00C805]' : 'text-red-500'}`}>
                         {contract.changePercent >= 0 ? '+' : ''}{contract.changePercent}%
                      </span>
                   </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[9px] border-t border-gray-800/50 pt-2">
                   <div>
                      <span className="text-gray-600 block uppercase">OI Chg</span>
                      <span className="text-gray-300 font-mono">{contract.changeOI}</span>
                   </div>
                   <div className="text-center">
                      <span className="text-gray-600 block uppercase">Volume</span>
                      <span className="text-gray-300 font-mono">{contract.volume}</span>
                   </div>
                   <div className="text-center">
                      <span className="text-gray-600 block uppercase">VWAP</span>
                      <span className="text-blue-400 font-mono">{contract.vwap}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-gray-600 block uppercase">Prem/Disc</span>
                      <span className={`font-mono font-bold ${contract.basis >= 0 ? 'text-green-500' : 'text-red-500'}`}>{contract.basis > 0 ? '+' : ''}{contract.basis}</span>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderChain = () => (
    <div className="animate-fade-in pb-20">
       <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center space-x-2">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Institutional Chain</h3>
             <span className="text-[9px] text-gray-600 font-mono">{symbolData.exchange} LIVE</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-900 p-1 rounded-md border border-gray-800">
             <span className="text-[9px] text-gray-400 font-bold uppercase px-1">Greeks</span>
             <button 
               className={`w-9 h-5 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none ${showChainGreeks ? 'bg-[#00C805]' : 'bg-gray-700'}`}
               onClick={() => setShowChainGreeks(!showChainGreeks)}
             >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-200 ease-in-out ${showChainGreeks ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
             </button>
          </div>
       </div>
       
       {/* Responsive Chain Grid */}
       <div className="bg-[#09090b] border border-gray-800 rounded-lg overflow-hidden shadow-inner flex flex-col">
          <div className="overflow-x-auto no-scrollbar">
             {/* Min width ensures it doesn't break on extremely small screens, but w-full tries to fit */}
             <div className={`min-w-[100%] ${showChainGreeks ? 'min-w-[600px]' : 'min-w-[340px]'} w-full`}>
                 {/* Header */}
                 <div className={`grid ${showChainGreeks ? 'grid-cols-9' : 'grid-cols-7'} bg-[#121212] text-[9px] md:text-[10px] font-black text-gray-500 uppercase py-2 text-center sticky top-0 z-10 border-b border-gray-800 items-center whitespace-nowrap`}>
                    {/* Left Side (Calls) */}
                    {showChainGreeks && <div className="text-blue-500">Delta</div>}
                    {showChainGreeks && <div className="text-blue-500">Theta</div>}
                    {!showChainGreeks && <div className="text-gray-600">IV</div>}
                    <div className="text-green-600">OI</div>
                    <div>LTP</div>
                    
                    {/* Center */}
                    <div className="text-gray-300">Strike</div>
                    
                    {/* Right Side (Puts) */}
                    <div>LTP</div>
                    <div className="text-red-600">OI</div>
                    {!showChainGreeks && <div className="text-gray-600">IV</div>}
                    {showChainGreeks && <div className="text-red-500">Theta</div>}
                    {showChainGreeks && <div className="text-red-500">Delta</div>}
                 </div>

                 {/* Rows */}
                 <div className="divide-y divide-gray-800/50">
                    {optionChain.map((row, i) => (
                       <div key={i} className={`grid ${showChainGreeks ? 'grid-cols-9' : 'grid-cols-7'} text-[10px] md:text-[11px] py-2 items-center text-center hover:bg-white/5 cursor-pointer transition-colors group whitespace-nowrap ${row.strike === Math.round(symbolData.price/5)*5 || row.strike === Math.round(symbolData.price) ? 'bg-yellow-900/10' : ''}`}>
                          {/* Call Side */}
                          {showChainGreeks && <div className="text-gray-500 font-mono hidden sm:block">{row.callGreeks.delta.toFixed(2)}</div>}
                          {showChainGreeks && <div className="text-gray-500 font-mono hidden sm:block">{row.callGreeks.theta.toFixed(1)}</div>}
                          {showChainGreeks && <div className="text-gray-500 font-mono sm:hidden">{row.callGreeks.delta.toFixed(1)}</div>}
                          {showChainGreeks && <div className="text-gray-500 font-mono sm:hidden">{row.callGreeks.theta.toFixed(0)}</div>}

                          {!showChainGreeks && <div className="text-gray-600 font-mono tracking-tighter">{row.callIV}</div>}
                          
                          <div className="font-mono text-[#00C805] font-bold tracking-tighter">
                             {formatCompact(row.callOI)}
                          </div>
                          
                          <div className="text-white font-bold font-mono group-hover:text-[#00C805] tracking-tighter">{row.callLTP}</div>
                          
                          {/* Center Strike */}
                          <div className={`font-bold font-mono py-0.5 rounded mx-1 border text-center ${Math.abs(row.strike - symbolData.price) < (symbolData.price * 0.002) ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                             {row.strike}
                          </div>
                          
                          {/* Put Side */}
                          <div className="text-white font-bold font-mono group-hover:text-[#00C805] tracking-tighter">{row.putLTP}</div>
                          
                          <div className="font-mono text-red-500 font-bold tracking-tighter">
                             {formatCompact(row.putOI)}
                          </div>

                          {!showChainGreeks && <div className="text-gray-600 font-mono tracking-tighter">{row.putIV}</div>}
                          
                          {showChainGreeks && <div className="text-gray-500 font-mono hidden sm:block">{row.putGreeks.theta.toFixed(1)}</div>}
                          {showChainGreeks && <div className="text-gray-500 font-mono hidden sm:block">{row.putGreeks.delta.toFixed(2)}</div>}
                          {showChainGreeks && <div className="text-gray-500 font-mono sm:hidden">{row.putGreeks.theta.toFixed(0)}</div>}
                          {showChainGreeks && <div className="text-gray-500 font-mono sm:hidden">{row.putGreeks.delta.toFixed(1)}</div>}
                       </div>
                    ))}
                 </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderStrategies = () => (
    <div className="space-y-4 animate-fade-in">
       {selectedStrategy ? (
          <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden animate-slide-up">
             <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                <div>
                   <button onClick={() => setSelectedStrategy(null)} className="text-[10px] text-[#00C805] font-bold mb-2 flex items-center uppercase tracking-wider hover:text-green-400">
                      ← Strategy List
                   </button>
                   <h3 className="font-bold text-lg text-white">{selectedStrategy.name}</h3>
                   <div className="flex space-x-2 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${selectedStrategy.risk === 'High' ? 'bg-red-900/30 text-red-500 border border-red-900' : selectedStrategy.risk === 'Low' ? 'bg-green-900/30 text-green-500 border border-green-900' : 'bg-yellow-900/30 text-yellow-500 border border-yellow-900'}`}>
                         {selectedStrategy.risk} Risk
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-gray-800 text-gray-400 border border-gray-700">
                         {selectedStrategy.type}
                      </span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Est. ROI</p>
                   <p className="text-2xl font-mono font-bold text-[#00C805] tracking-tighter">{selectedStrategy.roi}</p>
                </div>
             </div>
             
             {/* Payoff Chart */}
             <div className="h-[220px] w-full p-4 bg-[#09090b]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={selectedStrategy.payoffData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                         <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C805" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#00C805" stopOpacity={0}/>
                         </linearGradient>
                         <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <XAxis dataKey="price" tick={{fontSize: 9, fill: '#666'}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{fontSize: 9, fill: '#666'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#18181b', borderColor: '#333', fontSize: '10px', borderRadius: '6px'}}
                        itemStyle={{color: '#fff'}}
                      />
                      <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="pnl" stroke="#00C805" strokeWidth={2} fill="url(#colorPnL)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             
             {/* Strategy Stats */}
             <div className="p-4 grid grid-cols-2 gap-3 bg-[#121212]">
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                   <p className="text-[9px] text-gray-500 uppercase font-bold">Max Profit</p>
                   <p className="text-sm font-mono font-bold text-green-500">{selectedStrategy.maxProfit}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                   <p className="text-[9px] text-gray-500 uppercase font-bold">Max Loss</p>
                   <p className="text-sm font-mono font-bold text-red-500">{selectedStrategy.maxLoss}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                   <p className="text-[9px] text-gray-500 uppercase font-bold">Breakeven</p>
                   <p className="text-sm font-mono font-bold text-white">{selectedStrategy.breakeven}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                   <p className="text-[9px] text-gray-500 uppercase font-bold">Prob. of Profit</p>
                   <div className="flex items-center space-x-2">
                     <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00C805]" style={{width: `${selectedStrategy.profitProb}%`}}></div>
                     </div>
                     <p className="text-sm font-mono font-bold text-[#00C805]">{selectedStrategy.profitProb}%</p>
                   </div>
                </div>
             </div>
             
             <button className="w-full py-3 bg-[#00C805] hover:bg-green-600 text-black font-bold uppercase tracking-wide text-xs transition-colors">
                Execute Strategy
             </button>
          </div>
       ) : (
          <div className="grid grid-cols-1 gap-3">
             {STRATEGIES.map((strat) => (
                <div key={strat.id} onClick={() => setSelectedStrategy(strat)} className="bg-[#121212] p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition-all cursor-pointer group flex justify-between items-center relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-800 group-hover:bg-[#00C805] transition-colors"></div>
                   <div className="pl-3">
                      <h3 className="font-bold text-sm text-white group-hover:text-[#00C805] transition-colors">{strat.name}</h3>
                      <p className="text-[10px] text-gray-500 mt-1">{strat.description}</p>
                   </div>
                   <div className="text-right">
                      <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider ${strat.type === 'Bullish' ? 'bg-green-900/20 text-green-500' : strat.type === 'Bearish' ? 'bg-red-900/20 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                         {strat.type}
                      </span>
                   </div>
                </div>
             ))}
          </div>
       )}
    </div>
  );

  const renderScannerSection = () => (
     <div className="mt-8 pt-6 border-t border-gray-800/50 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
             <span className="w-2 h-2 bg-[#00C805] rounded-full mr-2 animate-pulse"></span>
             Live Buildup Scanner
           </h3>
           <span className="text-[9px] bg-gray-900 text-gray-500 px-2 py-1 rounded border border-gray-800 font-mono">REAL-TIME</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
           {/* Long Buildup Card */}
           <div className="bg-[#121212] p-4 rounded-xl border border-green-500/20 shadow-[0_4px_20px_rgba(0,200,5,0.05)]">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-green-500 font-black text-xs uppercase tracking-wider">Long Buildup</h4>
                 <span className="text-[9px] text-gray-500 font-mono">OI + PRICE UP</span>
              </div>
              <div className="space-y-3">
                 {['RELIANCE', 'INFY', 'SBIN'].map((s, idx) => (
                    <div key={s} className="flex justify-between items-center text-xs border-b border-gray-800/50 pb-2 last:border-0 last:pb-0">
                       <div>
                          <span className="text-white font-bold block">{s}</span>
                          <span className="text-[9px] text-gray-500">Vol: 2.5M</span>
                       </div>
                       <div className="text-right">
                          <span className="text-green-500 font-mono font-bold block">+4.2%</span>
                          <span className="text-[9px] text-green-500/70">OI Chg</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           {/* Short Covering Card */}
           <div className="bg-[#121212] p-4 rounded-xl border border-yellow-500/20">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-yellow-500 font-black text-xs uppercase tracking-wider">Short Covering</h4>
                 <span className="text-[9px] text-gray-500 font-mono">OI DOWN + PRICE UP</span>
              </div>
              <div className="space-y-3">
                 {['TCS', 'HDFCBANK'].map(s => (
                    <div key={s} className="flex justify-between items-center text-xs border-b border-gray-800/50 pb-2 last:border-0 last:pb-0">
                       <div>
                          <span className="text-white font-bold block">{s}</span>
                          <span className="text-[9px] text-gray-500">Vol: 1.2M</span>
                       </div>
                       <div className="text-right">
                          <span className="text-yellow-500 font-mono font-bold block">-2.1%</span>
                          <span className="text-[9px] text-yellow-500/70">OI Chg</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Short Buildup */}
           <div className="bg-[#121212] p-4 rounded-xl border border-red-500/20">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-red-500 font-black text-xs uppercase tracking-wider">Short Buildup</h4>
                 <span className="text-[9px] text-gray-500 font-mono">OI UP + PRICE DOWN</span>
              </div>
              <div className="space-y-3">
                 {['TATAMOTORS'].map(s => (
                    <div key={s} className="flex justify-between items-center text-xs border-b border-gray-800/50 pb-2 last:border-0 last:pb-0">
                       <div>
                          <span className="text-white font-bold block">{s}</span>
                          <span className="text-[9px] text-gray-500">Vol: 3.1M</span>
                       </div>
                       <div className="text-right">
                          <span className="text-red-500 font-mono font-bold block">+6.5%</span>
                          <span className="text-[9px] text-red-500/70">OI Chg</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
     </div>
  );

  return (
    <div className="p-4 space-y-4 pb-28 font-sans bg-[#09090b] min-h-screen relative">
      {renderTopBar()}
      
      <div className="min-h-[300px]">
        {activeTab === 'COCKPIT' && renderCockpit()}
        {activeTab === 'CHAIN' && renderChain()}
        {activeTab === 'FUTURES' && renderFutures()}
        {activeTab === 'STRATEGY' && renderStrategies()}
      </div>

      {/* Persistent Scanner Section at Bottom */}
      {renderScannerSection()}

      {/* Basket Info Modal */}
      {showBasketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowBasketModal(false)}>
           <div className="bg-[#18181b] border border-gray-700 rounded-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h2 className="text-xl font-bold text-white">Basket Orders</h2>
                    <p className="text-xs text-gray-400 mt-1">Multi-Leg Execution</p>
                 </div>
                 <button onClick={() => setShowBasketModal(false)} className="text-gray-500 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>
              
              <div className="space-y-4">
                 <div className="bg-[#09090b] p-3 rounded-lg border border-gray-800">
                    <p className="text-sm text-gray-300 leading-relaxed">
                       <span className="text-[#00C805] font-bold">What is a Basket?</span><br/>
                       A basket allows you to place multiple F&O orders simultaneously. This is essential for executing hedging strategies (like Iron Condors) with minimal slippage.
                    </p>
                 </div>

                 <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Saved Baskets</h3>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between p-3 bg-[#121212] rounded-lg border border-gray-800 hover:border-gray-600 cursor-pointer">
                          <div>
                             <p className="font-bold text-sm text-white">Nifty Hedged Bull</p>
                             <p className="text-[10px] text-gray-500">4 Legs • Margin Benefit</p>
                          </div>
                          <button className="px-3 py-1 bg-blue-600/20 text-blue-500 text-[10px] font-bold rounded uppercase">Execute</button>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-[#121212] rounded-lg border border-gray-800 hover:border-gray-600 cursor-pointer">
                          <div>
                             <p className="font-bold text-sm text-white">BankNifty Expiry</p>
                             <p className="text-[10px] text-gray-500">2 Legs • Straddle</p>
                          </div>
                          <button className="px-3 py-1 bg-blue-600/20 text-blue-500 text-[10px] font-bold rounded uppercase">Execute</button>
                       </div>
                    </div>
                 </div>
                 
                 <button className="w-full py-3 mt-2 bg-[#00C805] text-black font-bold rounded-xl uppercase tracking-wider text-xs hover:bg-green-400 transition-colors">
                    Create New Basket
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
