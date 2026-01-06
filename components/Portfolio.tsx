
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PORTFOLIO_INITIAL } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MarketType, PortfolioItem, UserSettings } from '../types';
import { getQuote, getBatchQuotes, searchSymbols, mapSymbolToFinnhub } from '../services/finnhub';

interface PortfolioProps {
  market: MarketType;
  settings: UserSettings;
}

export const Portfolio: React.FC<PortfolioProps> = ({ market, settings }) => {
  // Initialize from LocalStorage or fall back to Initial Constant
  const [allHoldings, setAllHoldings] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem('portfolio_holdings');
      return saved ? JSON.parse(saved) : PORTFOLIO_INITIAL;
    } catch (e) {
      return PORTFOLIO_INITIAL;
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [revealedSymbol, setRevealedSymbol] = useState<string | null>(null);

  // Add Form State
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [addSearchResults, setAddSearchResults] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [qty, setQty] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Persist changes to LocalStorage whenever holdings change
  useEffect(() => {
    localStorage.setItem('portfolio_holdings', JSON.stringify(allHoldings));
  }, [allHoldings]);

  // Helper to mask values
  const formatValue = (val: number, isCurrency = true, showSign = false) => {
     if (settings.streamerMode) return '****';
     const formatted = val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
     const currency = market === 'IN' ? '₹' : '$';
     const sign = showSign && val > 0 ? '+' : '';
     return isCurrency ? `${sign}${currency}${formatted}` : formatted;
  };

  // Live Price Updates (Split Logic)
  const isFetchingRef = useRef(false);
  
  const updatePrices = async (segment: 'STOCKS' | 'CRYPTO') => {
        if (allHoldings.length === 0) return;
        
        // Filter based on segment
        const targetItems = allHoldings.filter(h => 
           segment === 'CRYPTO' ? h.type === 'CRYPTO' : h.type !== 'CRYPTO'
        );
        
        const symbolsToFetch = targetItems.map(h => mapSymbolToFinnhub(h.symbol, h.market)).filter(s => !!s);
        if (symbolsToFetch.length === 0) return;

        try {
            const quotes = await getBatchQuotes(symbolsToFetch);
            if (quotes && Object.keys(quotes).length > 0) {
                setAllHoldings(currentList => currentList.map(h => {
                    const mapped = mapSymbolToFinnhub(h.symbol, h.market);
                    // Only update if we have a quote, preserving other assets
                    if (mapped && quotes[mapped]) {
                       return { ...h, currentPrice: quotes[mapped].c || h.currentPrice };
                    }
                    return h;
                }));
            }
        } catch (error) { console.warn("Portfolio price update failed", error); }
  };

  useEffect(() => {
     // Initial Load
     updatePrices('STOCKS');
     updatePrices('CRYPTO');

     // Stocks Interval: 5s
     const stockInterval = setInterval(() => updatePrices('STOCKS'), 5000);
     // Crypto API Interval: 20s
     const cryptoInterval = setInterval(() => updatePrices('CRYPTO'), 20000);

     // Crypto Micro-Simulation: 2s
     const cryptoSim = setInterval(() => {
        setAllHoldings(prev => prev.map(item => {
           if (item.type !== 'CRYPTO') return item;
           // Add realistic micro-movements (0.05% random walk)
           const volatility = 0.0005; 
           const drift = (Math.random() - 0.5) * 2 * volatility;
           return { ...item, currentPrice: item.currentPrice * (1 + drift) };
        }));
     }, 2000);

     return () => { 
        clearInterval(stockInterval);
        clearInterval(cryptoInterval);
        clearInterval(cryptoSim);
     };
  }, [allHoldings.length]);

  // Live Search for "Add Position"
  useEffect(() => {
     const delayDebounceFn = setTimeout(async () => {
        if (addSearchQuery.length > 1) {
           setIsSearching(true);
           const results = await searchSymbols(addSearchQuery);
           setAddSearchResults(results);
           setIsSearching(false);
        } else {
           setAddSearchResults([]);
        }
     }, 500);
     return () => clearTimeout(delayDebounceFn);
  }, [addSearchQuery]);

  const holdings = useMemo(() => {
    return allHoldings.filter(item => {
      const matchesMarket = item.market === market;
      const matchesFilter = item.symbol.toLowerCase().includes(filterQuery.toLowerCase()) || 
                            item.name.toLowerCase().includes(filterQuery.toLowerCase());
      return matchesMarket && matchesFilter;
    });
  }, [allHoldings, market, filterQuery]);

  const handleSelectAsset = async (asset: any) => {
     setIsSearching(true);
     try {
         let lookupSymbol = asset.symbol;
         // Handle CG prefix for crypto price lookup
         if (asset.symbol.startsWith('CG:')) {
            lookupSymbol = asset.symbol.replace('CG:', '');
         }
         
         const quote = await getQuote(lookupSymbol);
         const currentPrice = quote ? quote.c : 0;
         setSelectedAsset({ ...asset, price: currentPrice });
         setAvgPrice(currentPrice > 0 ? currentPrice.toString() : '');
     } catch (e) { setSelectedAsset({ ...asset, price: 0 }); }
     setAddSearchQuery('');
     setIsSearching(false);
  };

  const handleAddPosition = () => {
     const quantity = parseFloat(qty);
     const average = parseFloat(avgPrice);
     if (!selectedAsset || isNaN(quantity) || quantity <= 0 || isNaN(average) || average < 0) return;
     const newItem: PortfolioItem = {
        symbol: selectedAsset.symbol,
        name: selectedAsset.description || selectedAsset.symbol,
        qty: quantity,
        avgPrice: average,
        currentPrice: selectedAsset.price || average,
        market: selectedAsset.symbol.includes('.NS') || selectedAsset.symbol.includes(':NSE') ? 'IN' : 'US',
        type: selectedAsset.type === 'Crypto' || selectedAsset.symbol.startsWith('CG:') ? 'CRYPTO' : 'STOCK',
        aiScore: Math.floor(Math.random() * 30) + 70, 
        aiSentiment: 'Bullish'
     };
     setAllHoldings(prev => [...prev, newItem]);
     resetAddForm();
  };

  const handleRemovePosition = (symbol: string) => {
    setAllHoldings(prev => prev.filter(item => item.symbol !== symbol));
    setRevealedSymbol(null);
  };

  const resetAddForm = () => {
     setShowAddModal(false);
     setSelectedAsset(null);
     setQty('');
     setAvgPrice('');
     setAddSearchQuery('');
     setAddSearchResults([]);
  };

  const { totalValue, invested, totalPL, percentPL } = useMemo(() => {
    let currentVal = 0;
    let investVal = 0;
    holdings.forEach(item => {
      currentVal += (item.currentPrice || 0) * item.qty;
      investVal += (item.avgPrice || 0) * item.qty;
    });
    const pl = currentVal - investVal;
    const plPercent = investVal > 0 ? (pl / investVal) * 100 : 0;
    return { totalValue: currentVal, invested: investVal, totalPL: pl, percentPL: plPercent.toFixed(2) };
  }, [holdings]);

  const currency = market === 'IN' ? '₹' : '$';
  const pieData = [
    { name: 'Energy', value: 40, color: '#00C805' },
    { name: 'Tech', value: 30, color: '#3B82F6' },
    { name: 'Banking', value: 20, color: '#EAB308' },
    { name: 'Crypto', value: 10, color: '#A855F7' },
  ];

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in" onClick={() => setRevealedSymbol(null)}>
      {/* Header */}
      <div className="flex items-center justify-between mt-2">
         <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#00C805] bg-opacity-10 rounded-lg text-[#00C805]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Investments</h1>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{market === 'IN' ? 'Indian Portfolio' : 'US & Global Portfolio'}</p>
            </div>
         </div>
         <button onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
      </div>
      
      {/* Filter */}
      <div className="relative" onClick={e => e.stopPropagation()}>
         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
         </div>
         <input 
            type="text" 
            placeholder="Filter your holdings..." 
            className="w-full bg-[#18181b] border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-xs font-mono focus:outline-none focus:border-[#00C805] text-white transition-colors"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
         />
      </div>

      {/* P&L Card */}
      <div className="bg-gradient-to-br from-[#18181b] to-gray-900 rounded-xl border border-gray-800 p-5 shadow-lg relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Current Value</p>
              <p className="font-bold text-2xl tracking-tight">{formatValue(totalValue || 0)}</p>
            </div>
            <div className="text-right">
               <div className={`inline-flex items-center px-2 py-1 rounded bg-opacity-20 ${totalPL >= 0 ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}>
                  <span className="font-bold text-sm">{totalPL >= 0 ? '+' : ''}{settings.streamerMode ? '**.**' : percentPL}%</span>
               </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800/50 mt-2">
             <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Invested</p>
                <p className="font-medium text-gray-300 text-sm font-mono">{formatValue(invested || 0)}</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Total P&L</p>
                <p className={`font-bold text-sm font-mono ${totalPL >= 0 ? 'text-[#00C805]' : 'text-[#FF3333]'}`}>
                  {formatValue(totalPL || 0, true, true)}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Allocation */}
      <div className="bg-[#18181b] rounded-xl border border-gray-800 p-4">
         <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Allocation</h3>
         <div className="h-[180px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                     {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{fontSize: '10px', fontFamily: 'monospace'}}/>
                  <Tooltip contentStyle={{backgroundColor: '#18181b', borderColor: '#333', fontSize: '12px'}} itemStyle={{color: '#fff'}}/>
               </PieChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-3 pb-8">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Holdings ({holdings.length})</h3>
        {holdings.length === 0 ? (
           <div className="text-center py-8 text-gray-500 text-xs bg-[#18181b] rounded-xl border border-gray-800 border-dashed">
             {filterQuery ? 'No matching assets found.' : `No holdings in ${market} market.`}
           </div>
        ) : (
          holdings.map((item) => (
             <div 
               key={item.symbol} 
               className="bg-[#18181b] rounded-xl border border-gray-800 overflow-hidden transition-all group relative h-28"
               onClick={(e) => { e.stopPropagation(); setRevealedSymbol(revealedSymbol === item.symbol ? null : item.symbol); }}
             >
                {/* Main Slideable Content */}
                <div 
                  className={`absolute inset-0 p-4 bg-[#18181b] z-20 flex transition-transform duration-300 ease-out ${revealedSymbol === item.symbol ? '-translate-x-20' : 'translate-x-0'}`}
                >
                   <div className="flex-1">
                      <div className="flex items-center space-x-2">
                         <h3 className="font-bold text-sm text-white">{item.symbol.replace(':NSE', '').replace('.NS', '')}</h3>
                         <span className="text-[9px] px-1 bg-gray-800 rounded border border-gray-700 text-gray-400">{item.type}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{item.qty} Qty • Avg {formatValue(item.avgPrice || 0, false)}</p>
                      
                      {/* AI Indicator */}
                      <div className="flex items-center space-x-2 mt-4">
                         <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-green-500" style={{width: `${item.aiScore}%`}}></div>
                         </div>
                         <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">AI Score {item.aiScore}</span>
                      </div>
                   </div>

                   {/* Price Display (Sliding Container) */}
                   <div className="text-right flex flex-col justify-center border-l border-gray-800/50 pl-4 bg-gradient-to-l from-gray-900/10 to-transparent">
                      <p className="font-bold text-sm font-mono text-white whitespace-nowrap">{formatValue((item.currentPrice || 0) * item.qty)}</p>
                      <p className={`text-[10px] font-mono ${((item.currentPrice || 0) - (item.avgPrice || 0)) >= 0 ? 'text-[#00C805]' : 'text-[#FF3333]'}`}>
                         {settings.streamerMode ? '**.**%' : `${((item.avgPrice || 0) > 0 ? (((item.currentPrice || 0) - (item.avgPrice || 0))/(item.avgPrice || 1) * 100).toFixed(2) : '0.00')}%`}
                      </p>
                      <div className="mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <svg className="ml-auto animate-pulse" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                      </div>
                   </div>
                </div>

                {/* Hidden "Liquidate" Action Tray */}
                <div className="absolute top-0 right-0 bottom-0 w-20 z-10 flex flex-col">
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleRemovePosition(item.symbol); }}
                     className="flex-1 bg-red-600 hover:bg-red-500 flex flex-col items-center justify-center text-white transition-colors"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Liquidate</span>
                   </button>
                </div>
             </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={resetAddForm}>
           <div className="bg-[#18181b] w-full max-w-sm rounded-[2rem] border border-gray-800 p-6 shadow-2xl animate-slide-up relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#18181b] z-10 pb-2 border-b border-gray-800">
                 <h2 className="text-xl font-black text-white uppercase tracking-tight">Add Asset</h2>
                 <button onClick={resetAddForm} className="p-2 rounded-full hover:bg-gray-800 text-gray-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>
              
              {!selectedAsset ? (
                 <div className="space-y-4 min-h-[350px]">
                    <div className="relative">
                       <input 
                         type="text" 
                         placeholder="Search Instruments..." 
                         className="w-full bg-[#09090b] border border-gray-700 rounded-xl p-4 text-sm focus:border-[#00C805] focus:outline-none text-white font-mono placeholder-gray-700"
                         value={addSearchQuery}
                         onChange={(e) => setAddSearchQuery(e.target.value)}
                         autoFocus
                       />
                       <div className="absolute right-4 top-4 text-gray-600">
                          {isSearching ? <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full"></div> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>}
                       </div>
                    </div>
                    
                    {addSearchQuery ? (
                       <div className="space-y-2">
                          {addSearchResults.map(asset => {
                             const isAdded = allHoldings.some(h => h.symbol === asset.symbol);
                             return (
                                <div key={asset.symbol} onClick={() => !isAdded && handleSelectAsset(asset)} className={`p-3 rounded-xl border flex justify-between items-center group transition-all ${isAdded ? 'bg-gray-900 border-gray-800 opacity-50' : 'bg-[#09090b] border-gray-800 hover:border-[#00C805] cursor-pointer'}`}>
                                   <div className="flex-1 pr-4">
                                      <div className="flex items-center space-x-2">
                                         <p className="font-bold text-sm text-gray-200">{asset.displaySymbol}</p>
                                         <span className="text-[8px] px-1 bg-gray-800 rounded border border-gray-700 text-gray-500 uppercase">{asset.type}</span>
                                      </div>
                                      <p className="text-[10px] text-gray-500 truncate">{asset.description}</p>
                                   </div>
                                   <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 group-hover:bg-[#00C805] group-hover:text-black transition-colors">
                                      {isAdded ? '✓' : '+'}
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    ) : (
                       <div className="text-center py-12 text-gray-600 space-y-2">
                          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                          </div>
                          <p className="text-xs font-bold uppercase tracking-widest opacity-40">Ready to expand</p>
                       </div>
                    )}
                 </div>
              ) : (
                 <div className="space-y-6 animate-fade-in pb-4">
                    <div className="bg-[#09090b] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Selected</p>
                          <p className="text-lg font-black text-white">{selectedAsset.displaySymbol}</p>
                       </div>
                       <button onClick={() => setSelectedAsset(null)} className="text-[10px] text-[#00C805] font-black uppercase tracking-widest hover:underline">Change</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Quantity</label>
                          <input type="number" placeholder="0" className="w-full bg-[#09090b] border border-gray-800 rounded-xl p-4 text-sm focus:border-[#00C805] focus:outline-none text-white font-mono" value={qty} onChange={(e) => setQty(e.target.value)} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Avg Price</label>
                          <input type="number" placeholder="0.00" className="w-full bg-[#09090b] border border-gray-800 rounded-xl p-4 text-sm focus:border-[#00C805] focus:outline-none text-white font-mono" value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} />
                       </div>
                    </div>
                    <button className="w-full bg-[#00C805] text-black font-black py-5 rounded-2xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-[0_8px_30px_rgba(0,200,5,0.3)]" onClick={handleAddPosition} disabled={!qty || !avgPrice}>Add to Portfolio</button>
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
