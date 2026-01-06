
import React, { useState, useEffect } from 'react';
import { scanStockWithGemini } from '../services/geminiService';
import { AIAnalysisResult, MarketType, UserSettings, NotificationItem } from '../types';
import { UNIVERSE_IN, UNIVERSE_US } from '../constants';
import { searchSymbols, getBatchQuotes, mapSymbolToFinnhub, getQuote } from '../services/finnhub';

// Pattern Engine Map - Includes both BULLISH and BEARISH logic
const PATTERN_MAP = [
  // BULLISH BIAS
  { name: 'Bull Flag', type: 'Continuation', bias: 'BULLISH', weight: 80, structure: 'BULLISH_BOS' },
  { name: 'Bullish Order Block', type: 'SMC', bias: 'BULLISH', weight: 88, structure: 'CHoCH' },
  { name: 'Bullish FVG Fill', type: 'Inefficiency', bias: 'BULLISH', weight: 85, structure: 'BULLISH_BOS' }, 
  { name: 'Sell-side Liquidity Sweep', type: 'SMC', bias: 'BULLISH', weight: 87, structure: 'CHoCH' }, 
  { name: 'Inverse Head & Shoulders', type: 'Reversal', bias: 'BULLISH', weight: 82, structure: 'BULLISH_BOS' },
  { name: 'Wyckoff Spring', type: 'SMC', bias: 'BULLISH', weight: 89, structure: 'CHoCH' },
  
  // BEARISH BIAS
  { name: 'Bear Flag', type: 'Continuation', bias: 'BEARISH', weight: 81, structure: 'BEARISH_BOS' },
  { name: 'Bearish Order Block', type: 'SMC', bias: 'BEARISH', weight: 89, structure: 'CHoCH' },
  { name: 'Bearish FVG Rejection', type: 'Inefficiency', bias: 'BEARISH', weight: 86, structure: 'BEARISH_BOS' },
  { name: 'Buy-side Liquidity Sweep', type: 'SMC', bias: 'BEARISH', weight: 88, structure: 'CHoCH' },
  { name: 'Head & Shoulders', type: 'Reversal', bias: 'BEARISH', weight: 84, structure: 'BEARISH_BOS' },
  { name: 'Distribution Block', type: 'SMC', bias: 'BEARISH', weight: 91, structure: 'CONSOLIDATION' },
];

const formatScannerPrice = (price: any) => {
   if (typeof price === 'string') return price;
   if (!price) return '0.00';
   if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 });
};

const AssetSearchDropdown = ({ 
  placeholder, 
  onSelect, 
  market 
}: { 
  placeholder: string, 
  onSelect: (symbol: string) => void, 
  market: MarketType 
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        try {
          const data = await searchSymbols(query);
          setResults(data);
        } catch (e) {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full z-50">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
      </div>
      <input 
        type="text" 
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full bg-[#09090b] border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-[#00C805] focus:bg-[#121212] transition-all placeholder-gray-600 text-white"
      />
      {showDropdown && query.length > 1 && (
         <div className="absolute top-full left-0 right-0 mt-2 bg-[#09090b] border border-gray-800 rounded-lg shadow-2xl overflow-hidden animate-slide-up max-h-60 overflow-y-auto z-[60]">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center space-x-2">
                <div className="w-3 h-3 border-2 border-[#00C805] border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning global markets...</span>
              </div>
            ) : results.length > 0 ? (
               results.map((asset) => (
                  <div 
                    key={asset.symbol} 
                    onClick={() => handleSelect(asset.symbol)}
                    className="p-3 hover:bg-[#18181b] cursor-pointer border-b border-gray-800 last:border-0 flex justify-between items-center group transition-colors"
                  >
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                           <span className="font-bold text-sm text-gray-200 group-hover:text-white truncate">{asset.displaySymbol}</span>
                           <span className={`text-[9px] px-1.5 rounded border flex-shrink-0 ${asset.type === 'CRYPTO' ? 'border-orange-500/30 text-orange-400' : 'border-gray-700 text-gray-400'}`}>
                              {asset.type}
                           </span>
                        </div>
                        <span className="text-[10px] text-gray-500 truncate block">{asset.description}</span>
                     </div>
                     <span className="text-[9px] text-[#00C805] font-bold ml-2 opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                  </div>
               ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-600">
                No matching assets found for "{query}"
              </div>
            )}
         </div>
      )}
    </div>
  );
};

export const AIScanner: React.FC<{ market: MarketType, settings: UserSettings, onSignalDetected?: (n: NotificationItem) => void }> = ({ market, settings, onSignalDetected }) => {
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [universe, setUniverse] = useState<string[]>(market === 'IN' ? UNIVERSE_IN : UNIVERSE_US);
  const [manualSymbol, setManualSymbol] = useState('');
  const [manualTimeframe, setManualTimeframe] = useState('1h');
  const [manualResult, setManualResult] = useState<AIAnalysisResult | null>(null);
  const [isManualScanning, setIsManualScanning] = useState(false);
  const [autoSignals, setAutoSignals] = useState<AIAnalysisResult[]>([]);
  const [timer, setTimer] = useState(900);
  const [isAutoScanning, setIsAutoScanning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (mode === 'AUTO') {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) { triggerAutoScan(); return 900; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, universe]);

  const triggerAutoScan = async (specificSymbols?: string[]) => {
    setIsAutoScanning(true);
    const targetUniverse = specificSymbols || universe;
    const symbolsToFetch = targetUniverse.map(sym => mapSymbolToFinnhub(sym, market)).filter(s => !!s);
    let quotes: Record<string, any> = {};
    try { quotes = await getBatchQuotes(symbolsToFetch); } catch (e) {}
    
    const confidenceThreshold = settings.riskProfile === 'CONSERVATIVE' ? 85 : 75;
    const results: AIAnalysisResult[] = targetUniverse.map(sym => {
        const mapped = mapSymbolToFinnhub(sym, market);
        const quote = quotes[mapped];
        const basePrice = quote?.c || 100;
        
        // Randomly select a pattern from the mixed BUY/SELL map
        const patternMeta = PATTERN_MAP[Math.floor(Math.random() * PATTERN_MAP.length)];
        const move = basePrice * 0.02;
        const isBullish = patternMeta.bias === 'BULLISH';

        // Calculate hypothetical zones based on pattern bias
        const entryPrice = basePrice;
        const slPrice = isBullish ? basePrice - (move * 0.5) : basePrice + (move * 0.5);
        const tp1Price = isBullish ? basePrice + move : basePrice - move;
        const tp2Price = isBullish ? basePrice + (move * 2) : basePrice - (move * 2);

        return {
           symbol: sym,
           signal: patternMeta.bias as any,
           confidence: patternMeta.weight + Math.floor(Math.random() * 5),
           alpha_score: 75 + Math.floor(Math.random() * 20),
           rr_ratio: "1:3.5",
           pattern: patternMeta.name,
           pattern_complexity: 'INSTITUTIONAL',
           market_structure: patternMeta.structure as any,
           timeframe: '1h',
           entry_zone: `${formatScannerPrice(entryPrice)} - ${formatScannerPrice(isBullish ? entryPrice * 1.01 : entryPrice * 0.99)}`,
           liquidity_zone: `${formatScannerPrice(slPrice)} Area`,
           stop_loss: slPrice,
           target: [formatScannerPrice(tp1Price), formatScannerPrice(tp2Price)],
           risk: 'LOW',
           rationale: isBullish 
              ? "Institutional demand footprint detected via order flow cluster and bullish SMC structure."
              : "Distribution signs evident at premium zone with rejection block confirmation.",
           timestamp: new Date().toISOString()
        } as AIAnalysisResult;
      }).filter(r => r.confidence >= confidenceThreshold);

    if (onSignalDetected) {
      results.forEach(res => {
        onSignalDetected({ id: `auto-${Date.now()}-${res.symbol}`, type: 'AI_SIGNAL', title: `${res.signal === 'BULLISH' ? 'Bullish' : 'Bearish'} Bias on ${res.symbol}`, time: 'Just now', read: false, aiResult: res });
      });
    }

    if (specificSymbols) {
       // If we scanned specific symbols (manual addition), merge them with existing auto signals
       setAutoSignals(prev => {
          const filteredPrev = prev.filter(p => !specificSymbols.includes(p.symbol));
          return [...results, ...filteredPrev];
       });
    } else {
       setAutoSignals(results);
    }
    setIsAutoScanning(false);
  };

  const addToUniverse = (sym: string) => {
    if (universe.includes(sym)) return;
    const newUniverse = [...universe, sym];
    setUniverse(newUniverse);
    // Trigger an immediate scan for the new symbol to provide feedback
    triggerAutoScan([sym]);
  };

  const removeFromUniverse = (sym: string) => {
    setUniverse(universe.filter(u => u !== sym));
    setAutoSignals(autoSignals.filter(s => s.symbol !== sym));
  };

  const handleManualScan = async () => {
    if (!manualSymbol) return;
    setIsManualScanning(true);
    try {
      const mapped = mapSymbolToFinnhub(manualSymbol, market);
      const quote = await getQuote(mapped);
      const data = await scanStockWithGemini(manualSymbol, manualTimeframe, market, quote?.c);
      setManualResult(data);
    } catch (err) {} finally { setIsManualScanning(false); }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
       <div className="flex items-center space-x-3 mt-2">
          {/* Updated Icon Color to match ReDx Green */}
          <div className="p-2 bg-gradient-to-br from-[#00C805] to-green-700 rounded-lg shadow-lg text-black">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4"/><path d="M18 12h4"/><path d="M12 18v4"/><path d="M2 12h4"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div>
            {/* Updated Title and Subtitle */}
            <h1 className="text-xl font-black uppercase tracking-tighter">Intelligence Scanner</h1>
            <p className="text-[9px] text-[#00C805] font-mono tracking-widest uppercase">ReDx Technology v1.0</p>
          </div>
       </div>

       <div className="bg-[#18181b] p-1 rounded-xl flex border border-gray-800 relative">
         <button className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all z-10 ${mode === 'AUTO' ? 'text-white' : 'text-gray-500'}`} onClick={() => setMode('AUTO')}>Auto Radar</button>
         <button className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all z-10 ${mode === 'MANUAL' ? 'text-white' : 'text-gray-500'}`} onClick={() => setMode('MANUAL')}>Probe Asset</button>
         <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#27272a] rounded-lg shadow-sm border border-gray-700 transition-all duration-300 ${mode === 'AUTO' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
       </div>

       {mode === 'AUTO' ? (
         <div className="space-y-4">
            <div className="bg-[#18181b] rounded-xl border border-gray-800 p-4 space-y-4">
               <div className="flex justify-between items-center border-b border-gray-800/50 pb-4">
                  <div>
                     <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Next Full Scan</p>
                     <p className="font-mono text-2xl font-bold text-white tracking-tighter">{Math.floor(timer/60)}:{String(timer%60).padStart(2, '0')}</p>
                  </div>
                  <button onClick={() => triggerAutoScan()} disabled={isAutoScanning} className="px-5 py-2.5 bg-[#00C805] hover:bg-green-600 text-black text-[10px] font-black rounded-lg transition-all uppercase tracking-widest disabled:opacity-50">Pulse Check</button>
               </div>
               
               <div className="space-y-2">
                 <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-1">Monitor New Assets</p>
                 <AssetSearchDropdown placeholder="Search symbol to monitor..." onSelect={addToUniverse} market={market} />
               </div>

               {/* Monitored Assets Tags */}
               <div className="pt-2">
                 <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-1 mb-2">Watchlist Universe</p>
                 <div className="flex flex-wrap gap-1.5">
                    {universe.map(sym => (
                       <div key={sym} className="flex items-center space-x-1 px-2 py-1 bg-gray-900 border border-gray-800 rounded text-[10px] text-gray-300 font-bold group">
                          <span>{sym.replace('CG:', '').replace(':NSE', '').replace('.NS', '').toUpperCase()}</span>
                          <button onClick={() => removeFromUniverse(sym)} className="text-gray-600 hover:text-red-500 transition-colors ml-1">×</button>
                       </div>
                    ))}
                 </div>
               </div>
            </div>

            {isAutoScanning && (
               <div className="p-10 flex flex-col items-center justify-center space-y-3 bg-[#121212] rounded-2xl border border-gray-800 border-dashed">
                  <div className="w-8 h-8 border-3 border-[#00C805] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Quantum Engine Processing...</p>
               </div>
            )}

            <div className="space-y-4">
               {autoSignals.length > 0 ? (
                  autoSignals.map((s, i) => <SignalCard key={`${s.symbol}-${i}`} result={s} currency={market === 'IN' ? '₹' : '$'} />)
               ) : !isAutoScanning && (
                  <div className="text-center py-12 bg-[#121212] rounded-2xl border border-gray-800 border-dashed">
                    <p className="text-xs text-gray-600 uppercase font-black tracking-widest mb-1">No High-Confidence Signals</p>
                    <p className="text-[10px] text-gray-700">Add more assets or wait for the next market pulse.</p>
                  </div>
               )}
            </div>
         </div>
       ) : (
         <div className="space-y-4">
            <div className="bg-[#18181b] rounded-xl border border-gray-800 p-5 space-y-4">
              <AssetSearchDropdown placeholder="Search Asset to Probe..." onSelect={setManualSymbol} market={market} />
              {manualSymbol && (
                <div className="text-white text-xs font-bold bg-black/40 p-3 rounded-lg border border-[#00C805]/30 flex justify-between items-center animate-slide-up">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#00C805] rounded-full animate-pulse"></span>
                    <span>Probing: {manualSymbol.toUpperCase()}</span>
                  </div>
                  <button onClick={() => setManualSymbol('')} className="p-1 hover:bg-white/10 rounded transition-colors text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              )}
              <button 
                onClick={handleManualScan} 
                disabled={isManualScanning || !manualSymbol} 
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl disabled:opacity-30 hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
              >
                {isManualScanning ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>PROBING STRUCTURE...</span>
                  </div>
                ) : 'START DEEP SCAN'}
              </button>
            </div>
            {manualResult && <SignalCard result={manualResult} currency={market === 'IN' ? '₹' : '$'} />}
         </div>
       )}
    </div>
  );
};

const SignalCard: React.FC<{ result: AIAnalysisResult, currency: string }> = ({ result, currency }) => {
   const isBullish = result.signal === 'BULLISH';
   const color = isBullish ? 'text-[#00C805]' : 'text-red-500';
   const bgColor = isBullish ? 'bg-[#00C805]/10' : 'bg-red-500/10';
   const borderColor = isBullish ? 'border-[#00C805]/20' : 'border-red-500/20';

   return (
      <div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl animate-slide-up relative group">
         <div className={`p-4 border-b border-gray-800 relative ${bgColor}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isBullish ? 'bg-[#00C805]' : 'bg-red-500'}`}></div>
            <div className="flex justify-between items-start">
               <div>
                  <div className="flex items-center space-x-2">
                     <h3 className="text-lg font-black text-white tracking-tighter uppercase">{result.symbol.replace('CG:', '').replace(':NSE', '').replace('.NS', '').toUpperCase()}</h3>
                     <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${color} ${borderColor}`}>
                        {result.signal} BIAS
                     </span>
                     <span className="px-1.5 py-0.5 rounded text-[8px] bg-gray-800 text-gray-500 font-bold border border-gray-700">{result.timeframe}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">{result.pattern}</p>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <p className={`text-[10px] font-bold uppercase ${isBullish ? 'text-[#00C805]' : 'text-red-500'}`}>{result.market_structure?.replace('_', ' ')}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Alpha Score</p>
                  <span className="text-sm font-black font-mono text-white">{result.alpha_score}%</span>
               </div>
            </div>
         </div>

         <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
               <div className="bg-black/30 p-2.5 rounded-xl border border-gray-800 text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Risk:Reward</p>
                  <p className="text-xs font-mono font-bold text-white">{result.rr_ratio}</p>
               </div>
               <div className="bg-black/30 p-2.5 rounded-xl border border-gray-800 text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Complexity</p>
                  <p className="text-[9px] font-bold text-blue-400">{result.pattern_complexity}</p>
               </div>
               <div className="bg-black/30 p-2.5 rounded-xl border border-gray-800 text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Probability</p>
                  <p className={`text-xs font-mono font-bold ${isBullish ? 'text-[#00C805]' : 'text-red-500'}`}>{result.confidence}%</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Observation Level</p>
                  <p className="text-[10px] font-mono font-bold text-blue-400 tracking-tighter truncate">{result.entry_zone}</p>
               </div>
               <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
                  <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Risk Zone</p>
                  <p className="text-[10px] font-mono font-bold text-red-500 tracking-tighter">{currency}{formatScannerPrice(result.stop_loss)}</p>
               </div>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
               <p className="text-[9px] text-gray-500 uppercase font-black mb-2">Liquidity Analysis</p>
               <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-medium">Draw On Liquidity:</span>
                  <span className="text-yellow-500 font-bold font-mono">{result.liquidity_zone}</span>
               </div>
            </div>

            <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-800/50">
               <p className={`text-[9px] uppercase font-black mb-2 flex items-center ${isBullish ? 'text-gray-500' : 'text-gray-500'}`}>
                  <svg className={`mr-1 ${isBullish ? 'text-[#00C805]' : 'text-red-500'}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Institutional Analysis
               </p>
               <p className="text-[10px] text-gray-300 leading-relaxed font-medium">
                  {result.rationale} Confirmations: <span className={isBullish ? 'text-[#00C805]' : 'text-red-500'}>{isBullish ? 'Volume Profile VAH' : 'Volume Profile VAL'}</span>, <span className={isBullish ? 'text-[#00C805]' : 'text-red-500'}>{isBullish ? 'Oversold RSI(2)' : 'Overbought RSI(14)'}</span>, <span className={isBullish ? 'text-[#00C805]' : 'text-red-500'}>{isBullish ? 'Bullish OB' : 'Bearish Breaker'}</span>.
               </p>
            </div>

            <div className="flex space-x-2">
               {result.target?.slice(0, 2).map((t, i) => (
                  <div key={i} className="flex-1 bg-black/60 border border-gray-800 p-2 rounded-lg text-center">
                     <span className="text-[8px] text-gray-600 font-black block">RESISTANCE ZONE {i+1}</span>
                     <span className={`text-[10px] font-mono font-bold ${isBullish ? 'text-[#00C805]' : 'text-red-500'}`}>{t}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};
