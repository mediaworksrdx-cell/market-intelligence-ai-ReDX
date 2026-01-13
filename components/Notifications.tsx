
import React, { useState, useEffect } from 'react';
import { NotificationItem, AppRoute } from '../types';
import { getMarketNews, getIPOCalendar, getEconomicCalendar, FinnhubNews, FinnhubIPO, FinnhubEconomicEvent } from '../services/finnhub';

const formatNewsTime = (timestamp: number) => {
   const now = Date.now() / 1000;
   const diff = now - timestamp;
   if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
   if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
   return `${Math.floor(diff/86400)}d ago`;
};

const AIAlertCard: React.FC<{ alert: NotificationItem; onNavigate: (route: AppRoute, params?: any) => void }> = ({ alert, onNavigate }) => {
   if (!alert.aiResult) return null;
   const { symbol, pattern, confidence, signal, entry_zone, target } = alert.aiResult;
   
   return (
      <div className="bg-[#18181b] rounded-xl border border-gray-800 p-4 relative overflow-hidden animate-slide-up">
         <div className={`absolute top-0 left-0 w-1 h-full ${signal === 'BULLISH' ? 'bg-[#00C805]' : 'bg-red-500'}`}></div>
         <div className="pl-2">
            <div className="flex justify-between items-start mb-2">
               <div>
                  <div className="flex items-center space-x-2">
                     <h3 className="text-lg font-bold text-white">{symbol.replace('CG:', '').toUpperCase()}</h3>
                     <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${signal === 'BULLISH' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {signal} BIAS
                     </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{pattern}</p>
               </div>
               <div className="text-right">
                  <span className="text-[10px] text-gray-500">{alert.time}</span>
                  <div className="flex items-center justify-end mt-1">
                     <span className={`text-xs font-bold ${confidence > 80 ? 'text-purple-400' : 'text-blue-400'}`}>{confidence}%</span>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3 bg-[#09090b] p-3 rounded-lg border border-gray-800/50">
               <div>
                  <p className="text-[9px] text-gray-500 uppercase font-black">Observation Level</p>
                  <p className="text-xs font-mono font-bold text-blue-400">{entry_zone}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] text-gray-500 uppercase font-black">Resistance Zone</p>
                  <p className="text-xs font-mono font-bold text-[#00C805]">{target?.[0]}</p>
               </div>
            </div>

            <div className="mt-3">
               <button 
                  onClick={() => onNavigate(AppRoute.ANALYSIS, { symbol })}
                  className="w-full py-2 bg-gray-800 text-white text-[10px] font-black rounded-lg hover:bg-gray-700 transition-colors uppercase tracking-widest border border-gray-700"
               >
                  Verify Analysis
               </button>
            </div>
         </div>
      </div>
   );
};

const CalendarCard: React.FC<{ event: FinnhubEconomicEvent }> = ({ event }) => {
   const isHighImpact = event.impact === 'high' || event.impact === '3';
   const impactColor = isHighImpact ? 'text-red-500 border-red-500/20 bg-red-500/10' : 'text-blue-500 border-blue-500/20 bg-blue-500/10';

   return (
      <div className="bg-[#18181b] rounded-xl border border-gray-800 p-4 flex items-center justify-between group hover:border-gray-600 transition-all">
         <div className="flex items-center space-x-3">
            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border bg-[#09090b] ${isHighImpact ? 'border-red-500/50 text-red-500' : 'border-gray-700 text-gray-400'}`}>
               <span className="text-xs font-bold">{event.time.substring(0,5)}</span>
               <span className="text-[9px] font-bold">{event.country}</span>
            </div>
            <div>
               <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{event.event}</h3>
               <div className="flex items-center space-x-3 mt-1 text-[10px] text-gray-500 font-mono">
                  <span>Act: <b className="text-white">{event.actual || '-'}</b></span>
                  <span>Est: {event.estimate || '-'}</span>
               </div>
            </div>
         </div>
         <div>
            <span className={`px-2 py-1 rounded text-[9px] font-bold border uppercase ${impactColor}`}>
               {event.impact || 'MED'}
            </span>
         </div>
      </div>
   );
};

const IPOCard: React.FC<{ ipo: FinnhubIPO }> = ({ ipo }) => {
   return (
      <div className="bg-[#18181b] rounded-xl border border-gray-800 p-4">
         <div className="flex justify-between items-start mb-2">
            <div>
               <h3 className="text-sm font-bold text-white">{ipo.name}</h3>
               <p className="text-[10px] text-gray-500 font-mono mt-0.5">{ipo.symbol} • {ipo.price || 'TBA'}</p>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-800 text-center">
               <p className="text-[9px] text-gray-500 uppercase">IPO Date</p>
               <p className="text-xs font-bold text-gray-300">{ipo.ipoDate}</p>
            </div>
            <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-800 text-center">
               <p className="text-[9px] text-gray-500 uppercase">Shares</p>
               <p className="text-xs font-bold text-blue-400">{ipo.numberOfShares ? (ipo.numberOfShares/1000000).toFixed(1) + 'M' : 'TBA'}</p>
            </div>
         </div>
      </div>
   );
};

interface NotificationsProps {
   onNavigate: (route: AppRoute, params?: any) => void;
   notifications: NotificationItem[];
}

export const Notifications: React.FC<NotificationsProps> = ({ onNavigate, notifications }) => {
  const [activeTab, setActiveTab] = useState<'AI' | 'NEWS' | 'CALENDAR' | 'IPO'>('AI');
  const [news, setNews] = useState<FinnhubNews[]>([]);
  const [calendar, setCalendar] = useState<FinnhubEconomicEvent[]>([]);
  const [ipos, setIpos] = useState<FinnhubIPO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     const fetchData = async () => {
        setLoading(true);
        try {
           const [newsData, calendarData, ipoData] = await Promise.all([
              getMarketNews('general'),
              getEconomicCalendar(),
              getIPOCalendar()
           ]);
           setNews(newsData);
           setCalendar(calendarData.filter(e => e.country === 'US' || e.country === 'IN'));
           setIpos(ipoData);
        } catch (e) {
           console.error("Failed to fetch notification data", e);
        } finally {
           setLoading(false);
        }
     };
     fetchData();
  }, []);

  const aiSignals = notifications.filter(n => n.type === 'AI_SIGNAL');

  return (
    <div className="p-4 space-y-4 pb-24">
       <div className="flex items-center space-x-3 mt-2">
         <div className="p-2 bg-red-500 bg-opacity-10 rounded-lg text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
         </div>
         <div>
           <h1 className="text-xl font-bold">Intel Feed</h1>
           <p className="text-[10px] text-gray-400 uppercase tracking-widest">Real-time Signals</p>
         </div>
       </div>

       <div className="flex space-x-1 bg-[#121212] p-1 rounded-lg border border-gray-800 overflow-x-auto no-scrollbar">
         {[
            { id: 'AI', label: 'AI Signals', icon: '✨' },
            { id: 'CALENDAR', label: 'Calendar', icon: '📅' },
            { id: 'IPO', label: 'IPO Watch', icon: '🚀' },
            { id: 'NEWS', label: 'News', icon: '📰' }
         ].map(tab => (
            <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex-1 min-w-[80px] py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1 ${activeTab === tab.id ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}
            >
               <span>{tab.icon}</span>
               <span>{tab.label}</span>
            </button>
         ))}
       </div>

       <div className="space-y-4 animate-fade-in min-h-[300px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-6 h-6 border-2 border-[#00C805] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500">Fetching live feed...</p>
             </div>
          ) : (
             <>
               {activeTab === 'AI' && (
                  <div className="space-y-3">
                     {aiSignals.length > 0 ? (
                        aiSignals.map(signal => <AIAlertCard key={signal.id} alert={signal} onNavigate={onNavigate} />)
                     ) : (
                        <div className="text-center py-10 text-gray-600 text-[10px] font-bold uppercase">No active signals found.</div>
                     )}
                  </div>
               )}

               {activeTab === 'CALENDAR' && (
                  <div className="space-y-3">
                     {calendar.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 text-[10px] uppercase font-bold">No events found.</div>
                     ) : (
                        calendar.map((event, idx) => <CalendarCard key={idx} event={event} />)
                     )}
                  </div>
               )}

               {activeTab === 'IPO' && (
                  <div className="space-y-3">
                     {ipos.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 text-[10px] uppercase font-bold">No IPOs found.</div>
                     ) : (
                        ipos.map((ipo, idx) => <IPOCard key={idx} ipo={ipo} />)
                     )}
                  </div>
               )}

               {activeTab === 'NEWS' && (
                  <div className="space-y-3">
                     {news.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 text-[10px] uppercase font-bold">No news found.</div>
                     ) : (
                        news.map((item) => (
                           <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-[#18181b] p-4 rounded-xl border border-gray-800">
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">{item.source.toUpperCase()}</span>
                                 <span className="text-[10px] text-gray-500">{formatNewsTime(item.datetime)}</span>
                              </div>
                              <h3 className="text-sm font-medium text-white line-clamp-2">{item.headline}</h3>
                           </a>
                        ))
                     )}
                  </div>
               )}
             </>
          )}
       </div>
    </div>
  );
};
