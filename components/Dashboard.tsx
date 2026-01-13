
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MarketType, IndexData, StockData, CryptoData, AppRoute, UserSettings } from '../types';
import { INDICES_IN, INDICES_US, WATCHLIST_INITIAL, CRYPTO_INITIAL } from '../constants';
import { FinnhubWS, getQuote, getBatchQuotes, searchSymbols, mapSymbolToFinnhub, isUSMarketOpen } from '../services/finnhub';

// --- Custom Hook for Price Flash Effect ---
const usePriceFlash = (price: number) => {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price > prevPrice.current) setFlash('up');
    else if (price < prevPrice.current) setFlash('down');
    prevPrice.current = price;
    const timer = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(timer);
  }, [price]);

  return flash;
};

const formatCryptoPrice = (price: number) => {
  if (!price) return '0.00';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 });
};

// --- Sub-Components ---
const IndexCard = ({ idx, onClick, isEditMode, onRemove }: any) => {
  const flash = usePriceFlash(idx.price);
  return (
    <div onClick={onClick} className={`p-3 rounded-lg border relative overflow-hidden group transition-all duration-300 cursor-pointer border-gray-800 bg-[#121212]`}>
      {isEditMode && (
         <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-1 right-1 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 rounded-md p-1.5 z-20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
         </button>
      )}
      <div className={`relative z-10 ${isEditMode ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-start mb-2">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{idx.name}</span>
           <span className={`text-[9px] font-mono px-1 rounded ${idx.changePercent >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {idx.change > 0 ? '+' : ''}{idx.change.toFixed(2)} ({Math.abs(idx.changePercent).toFixed(2)}%)
           </span>
        </div>
        <div className={`text-lg font-mono font-bold tracking-tight transition-colors duration-300 ${flash === 'up' ? 'text-[#00C805]' : flash === 'down' ? 'text-red-500' : 'text-white'}`}>
           {(idx.price || 0).toLocaleString('en-US', {maximumFractionDigits: 2})}
        </div>
      </div>
    </div>
  );
};

const WatchlistRow = ({ stock, onClick, isEditMode, onRemove, currency }: any) => {
  const flash = usePriceFlash(stock.price);
  return (
    <div onClick={onClick} className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all duration-300 group relative overflow-hidden border-gray-800 bg-[#121212] hover:bg-[#18181b] ${isEditMode ? 'border-red-500/20 bg-red-900/5' : ''}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors ${isEditMode ? 'bg-red-500' : 'bg-transparent group-hover:bg-[#00C805]'}`}></div>
      <div className="pl-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-gray-200 font-mono">{stock.symbol.replace('.NS', '').replace(':NSE', '')}</span>
          <span className="text-[9px] text-gray-600 border border-gray-800 px-1 rounded uppercase">EQ</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">{stock.name}</div>
      </div>
      {isEditMode ? (
         <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded border border-red-400 hover:bg-red-600 transition-colors">DELETE</button>
      ) : (
         <div className="text-right">
           <div className={`font-bold text-sm font-mono transition-colors duration-300 ${flash === 'up' ? 'text-[#00C805]' : flash === 'down' ? 'text-red-500' : 'text-white'}`}>
             {currency}{(stock.price || 0).toFixed(2)}
           </div>
           <div className={`text-[10px] font-mono ${stock.changePercent >= 0 ? 'text-[#00C805]' : 'text-red-500'}`}>
              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
           </div>
         </div>
      )}
    </div>
  );
};

const CryptoRow = ({ coin, onClick, isEditMode, onRemove }: any) => {
  const flash = usePriceFlash(coin.price);
  const ticker = coin.symbol.startsWith('CG:') ? coin.symbol.replace('CG:', '').toUpperCase() : coin.symbol.replace('BINANCE:', '').replace('USDT', '');
  const changeStr = Math.abs(coin.change) < 0.01 ? coin.change.toFixed(4) : coin.change.toFixed(2);

  return (
    <div onClick={onClick} className={`p-3 rounded-lg border flex justify-between items-center transition-all duration-300 cursor-pointer border-gray-800 bg-[#121212] hover:bg-[#18181b] ${isEditMode ? 'border-red-500/20 bg-red-900/5' : ''}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-orange-500 font-bold text-[9px] uppercase overflow-hidden">
           {ticker.substring(0,3)}
        </div>
        <div>
          <div className="font-bold text-xs text-white font-mono uppercase">{ticker}</div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider">{coin.name}</div>
        </div>
      </div>
      {isEditMode ? (
         <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded border border-red-400 hover:bg-red-600 transition-colors">DELETE</button>
      ) : (
         <div className="text-right">
           <div className={`font-mono text-xs font-bold transition-colors duration-300 ${flash === 'up' ? 'text-[#00C805]' : flash === 'down' ? 'text-red-500' : 'text-white'}`}>
             ${formatCryptoPrice(coin.price)}
           </div>
           <div className={`text-[9px] font-mono ${coin.changePercent >= 0 ? 'text-[#00C805]' : 'text-red-500'}`}>
              {coin.change > 0 ? '+' : ''}{changeStr} ({Math.abs(coin.changePercent).toFixed(2)}%)
           </div>
         </div>
      )}
    </div>
  );
};

// --- Simulation Helper ---
const simulateTick = (item: any, volatility = 0.001) => {
    // Micro-movements to keep UI alive
    const drift = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = item.price * (1 + drift);
    return {
        ...item,
        price: newPrice,
        change: item.change + (newPrice - item.price),
        changePercent: item.changePercent + (drift * 100)
    };
};

// --- Main Dashboard Component ---
export const Dashboard: React.FC<{ market: MarketType, setMarket: (m: MarketType) => void, onNavigate: (r: AppRoute, p?: any) => void, settings: UserSettings }> = ({ market, setMarket, onNavigate, settings }) => {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [watchlist, setWatchlist] = useState<StockData[]>([]);
  const [crypto, setCrypto] = useState<CryptoData[]>(CRYPTO_INITIAL);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCryptoExpanded, setIsCryptoExpanded] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Live' | 'Simulating' | 'Closed'>('Connecting');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const wsRef = useRef<FinnhubWS | null>(null);

  useEffect(() => {
    const data = market === 'IN' ? INDICES_IN : INDICES_US;
    setIndices(data);
    setWatchlist(WATCHLIST_INITIAL.filter(s => s.market === market));
  }, [market]);

  const handleDataUpdate = useCallback((data: any[]) => {
      if (!Array.isArray(data)) return;
      const priceMap = new Map<string, number>();
      data.forEach(t => t.s && t.p && priceMap.set(t.s, t.p));
      if (priceMap.size === 0) return;

      // Only set to Live if we aren't Closed
      setConnectionStatus(prev => prev === 'Closed' ? 'Closed' : 'Live');
      setLastUpdate(new Date());

      const updateItem = (item: any, marketOverride?: string) => {
        const finnhubSymbol = mapSymbolToFinnhub(item.symbol, (marketOverride || item.market || 'GLOBAL') as any);
        const newPrice = priceMap.get(finnhubSymbol);
        if (newPrice && newPrice !== item.price) {
          const prevClose = item.price - item.change;
          const newChange = newPrice - prevClose;
          return { ...item, price: newPrice, change: newChange, changePercent: prevClose !== 0 ? (newChange / prevClose) * 100 : 0 };
        }
        return item;
      };

      setIndices(prev => prev.map(idx => updateItem(idx, idx.market)));
      setWatchlist(prev => prev.map(item => updateItem(item, item.market)));
  }, []);

  const updateStateWithQuotes = useCallback((quotes: Record<string, any>) => {
      if (!quotes || Object.keys(quotes).length === 0) return;
      
      // Update time but check status later logic
      setLastUpdate(new Date());

      const updateList = (list: any[], m: string) => list.map(item => {
          const mapped = mapSymbolToFinnhub(item.symbol, m as any);
          if (mapped && quotes[mapped]) {
             const q = quotes[mapped];
             // If price changed significantly from API, update.
             return { ...item, price: q.c || item.price, change: q.d || item.change, changePercent: q.dp || item.changePercent };
          }
          return item;
      });

      setIndices(prev => updateList(prev, market));
      setWatchlist(prev => updateList(prev, market));
      setCrypto(prev => updateList(prev, 'GLOBAL'));
  }, [market]);

  const fetchStocks = async () => {
        const items = [...indices, ...watchlist];
        const symbols = items.map(item => mapSymbolToFinnhub(item.symbol, (item as any).market)).filter(s => !!s);
        if (symbols.length === 0) return;

        try {
          const quotes = await getBatchQuotes(symbols);
          updateStateWithQuotes(quotes);
        } catch (e) { console.warn("Stock Fetch error", e); }
  };

  const fetchCrypto = async () => {
        const symbols = crypto.map(item => mapSymbolToFinnhub(item.symbol, 'GLOBAL')).filter(s => !!s);
        if (symbols.length === 0) return;
        try {
          const quotes = await getBatchQuotes(symbols);
          updateStateWithQuotes(quotes);
        } catch (e) { console.warn("Crypto Fetch error", e); }
  };

  useEffect(() => {
    // Initial Fetch
    fetchStocks();
    fetchCrypto();

    if (wsRef.current) wsRef.current.close();
    
    // Logic: Only subscribe to Indian stocks & Crypto on Twelve Data WS.
    // US Stocks are handled via fast polling (Alpaca) to avoid rate limits/redundancy on Twelve Data.
    const subs = [
       ...indices.filter(i => i.market === 'IN'),
       ...watchlist.filter(w => w.market === 'IN')
    ].map(i => mapSymbolToFinnhub(i.symbol, 'IN')).filter(s => !!s);

    if (subs.length > 0) {
        wsRef.current = new FinnhubWS(handleDataUpdate);
        wsRef.current.subscribe(Array.from(new Set(subs)));
    }

    // Stocks/Indices Polling
    // US Market (Alpaca) -> 3s (Real-time) if open
    // Indian Market (Twelve Data) -> 12s (Rate Limited)
    const usOpen = isUSMarketOpen();
    let pollTime = 12000;
    if (market === 'US') {
       // Faster polling for US market to confirm requests are being sent
       pollTime = usOpen ? 3000 : 10000; 
       if (!usOpen) setConnectionStatus('Closed');
    }

    const stockPoll = setInterval(fetchStocks, pollTime);
    
    // Crypto API Poll
    const cryptoPoll = setInterval(fetchCrypto, 20000);

    // Unified Client-side Simulation (1s)
    // Fills the gap between polls to keep the UI alive
    const simInterval = setInterval(() => {
       const isUS = market === 'US';
       const isOpen = isUS ? isUSMarketOpen() : true; 

       setCrypto(prev => prev.map(c => simulateTick(c, 0.001)));
       
       setIndices(prev => prev.map(i => {
          if (i.market === 'US' && !isOpen) return i; // No Sim if closed
          return simulateTick(i, 0.0005);
       }));
       
       setWatchlist(prev => prev.map(s => {
          if (s.market === 'US' && !isOpen) return s; // No Sim if closed
          return simulateTick(s, 0.0005);
       }));
       
       if (isUS && !isOpen) {
           setConnectionStatus('Closed');
       } else if (Date.now() - lastUpdate.getTime() > 15000) {
           setConnectionStatus('Simulating');
       } else if (connectionStatus === 'Closed') {
           setConnectionStatus('Live');
       }
    }, 1000);

    return () => { 
      if (wsRef.current) wsRef.current.close(); 
      clearInterval(stockPoll); 
      clearInterval(cryptoPoll);
      clearInterval(simInterval);
    };
  }, [market, indices.length, watchlist.length, crypto.length]); 

  useEffect(() => {
     const debounce = setTimeout(async () => {
        if (searchQuery.length > 1) {
           setIsSearching(true);
           setSearchResults(await searchSymbols(searchQuery));
           setIsSearching(false);
        } else setSearchResults([]);
     }, 500);
     return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleAddAsset = async (asset: any) => {
    const isCrypto = asset.type === 'CRYPTO' || asset.symbol.startsWith('CG:');
    const marketType = isCrypto ? 'GLOBAL' : (asset.symbol.includes('.NS') ? 'IN' : 'US');
    const quote = await getQuote(mapSymbolToFinnhub(asset.symbol, marketType as any));
    const newItem = { symbol: asset.symbol, name: asset.description, price: quote?.c || 0, change: quote?.d || 0, changePercent: quote?.dp || 0, market: marketType, type: isCrypto ? 'CRYPTO' : 'STOCK', volume: '0' };
    if (newItem.type === 'CRYPTO') setCrypto(prev => [...prev, newItem as CryptoData]);
    else setWatchlist(prev => [...prev, newItem as StockData]);
    setSearchQuery(''); setShowDropdown(false);
  };

  return (
    <div className="p-4 space-y-5 font-sans pb-24 animate-fade-in">
      <div className="flex justify-between items-end mt-2 mb-2">
         <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center">
               Market Overview
               <span className={`ml-2 w-2 h-2 rounded-full animate-pulse ${connectionStatus === 'Live' ? 'bg-[#00C805]' : connectionStatus === 'Simulating' ? 'bg-yellow-500' : connectionStatus === 'Closed' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center space-x-2">
               {/* Visual Indicator for Data Source */}
               {market === 'US' && (
                  <>
                     <span className="text-purple-400 font-bold">SOURCE: ALPACA</span>
                     <span>•</span>
                  </>
               )}
               <span className={`${connectionStatus === 'Live' ? 'text-green-500' : connectionStatus === 'Simulating' ? 'text-yellow-500' : connectionStatus === 'Closed' ? 'text-red-500' : 'text-blue-500'}`}>{connectionStatus.toUpperCase()} MODE</span>
               <span>•</span>
               <span>{lastUpdate.toLocaleTimeString()}</span>
            </p>
         </div>
         <button onClick={() => setIsEditMode(!isEditMode)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${isEditMode ? 'bg-red-900/20 border-red-500 text-red-500' : 'bg-[#18181b] border-gray-800 text-gray-500 hover:text-white'}`}>
           {isEditMode ? 'DONE' : 'EDIT'}
         </button>
      </div>

      {!isEditMode && (
         <div className="relative z-30">
            <input type="text" placeholder={`Search Instruments...`} className="w-full bg-[#09090b] border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-xs font-mono focus:border-[#00C805] text-white" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} />
            {showDropdown && searchQuery && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-[#09090b] border border-gray-800 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-40">
                  {isSearching ? <div className="p-4 text-center text-xs text-gray-500">Scanning...</div> : searchResults.map(asset => (
                        <div key={asset.symbol} onClick={() => handleAddAsset(asset)} className="p-3 hover:bg-[#18181b] cursor-pointer border-b border-gray-800 last:border-0 flex justify-between items-center group">
                           <div>
                              <div className="flex items-center space-x-2">
                                 <span className="font-bold text-sm text-gray-200">{asset.displaySymbol}</span>
                                 <span className={`text-[9px] px-1.5 rounded border border-gray-700 text-gray-400`}>{asset.type}</span>
                              </div>
                           </div>
                           <span className="text-[9px] text-[#00C805] font-bold">ADD +</span>
                        </div>
                  ))}
               </div>
            )}
         </div>
      )}

      <div className="flex justify-between items-center bg-[#121212] p-1 rounded-lg border border-gray-800/50">
        <div className="flex bg-[#09090b] rounded-md p-0.5 border border-gray-800 w-full">
           <button onClick={() => setMarket('IN')} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase ${market === 'IN' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}>INDIA (NSE)</button>
           <button onClick={() => setMarket('US')} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase ${market === 'US' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}>USA (NYSE)</button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Key Indices</h2>
        <div className="grid grid-cols-2 gap-3">
          {indices.map(idx => <IndexCard key={idx.symbol} idx={idx} onClick={() => !isEditMode && onNavigate(AppRoute.ANALYSIS, { symbol: idx.symbol })} isEditMode={isEditMode} onRemove={() => setIndices(prev => prev.filter(i => i.symbol !== idx.symbol))} />)}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Watchlist</h2>
        <div className="space-y-2">
          {watchlist.map(stock => <WatchlistRow key={stock.symbol} stock={stock} currency={market === 'IN' ? '₹' : '$'} onClick={() => !isEditMode && onNavigate(AppRoute.ANALYSIS, { symbol: stock.symbol })} isEditMode={isEditMode} onRemove={() => setWatchlist(prev => prev.filter(s => s.symbol !== stock.symbol))} />)}
        </div>
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-center mb-3 cursor-pointer group" onClick={() => setIsCryptoExpanded(!isCryptoExpanded)}>
           <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-orange-500">Global Crypto</h2>
           <svg className={`text-gray-600 transform ${isCryptoExpanded ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        {isCryptoExpanded && (
           <div className="grid grid-cols-1 gap-2">
             {crypto.map(coin => <CryptoRow key={coin.symbol} coin={coin} onClick={() => !isEditMode && onNavigate(AppRoute.ANALYSIS, { symbol: coin.symbol })} isEditMode={isEditMode} onRemove={() => setCrypto(prev => prev.filter(c => c.symbol !== coin.symbol))} />)}
           </div>
        )}
      </div>
    </div>
  );
};
