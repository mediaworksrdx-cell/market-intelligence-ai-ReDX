
import React, { useState } from 'react';
import { AppRoute } from '../types';
import { SubscriptionModal } from './SubscriptionModal';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const NavIcon = ({ route, current, icon, label, onClick }: any) => {
  const isActive = route === current;
  return (
    <button 
      onClick={() => onClick(route)}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${isActive ? 'text-[#00C805] scale-110' : 'text-gray-500 hover:text-gray-300'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{name: string} | null>(null);

  const handleLogin = () => {
    setUser({ name: "Trader" });
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-white overflow-hidden font-sans">
      
      {/* Top Header - Glassmorphism */}
      <header className="fixed top-0 w-full h-[60px] bg-[#09090b]/80 backdrop-blur-xl z-50 flex justify-between items-center px-4 border-b border-gray-800/50">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C805] to-green-900 flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(0,200,5,0.2)]">
             AI
           </div>
           <div>
             <h1 className="text-sm font-black tracking-tight text-white uppercase">Market Intelligence</h1>
           </div>
        </div>
        
        <div className="flex items-center space-x-4">
           {/* Notification Bell */}
           <button 
            onClick={() => onNavigate(currentRoute === AppRoute.NOTIFICATIONS ? AppRoute.DASHBOARD : AppRoute.NOTIFICATIONS)} 
            className={`relative p-1.5 rounded-full transition-colors ${currentRoute === AppRoute.NOTIFICATIONS ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
             <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#09090b]"></span>
           </button>
           
           {/* Settings */}
           <button 
            onClick={() => onNavigate(currentRoute === AppRoute.SETTINGS ? AppRoute.DASHBOARD : AppRoute.SETTINGS)} 
            className={`p-1.5 rounded-full transition-colors ${currentRoute === AppRoute.SETTINGS ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
           </button>
           
           {/* Sign Up / Logout Button */}
           {!user ? (
             <button 
               onClick={() => setShowAuthModal(true)}
               className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#00C805] to-[#008f04] p-0.5 font-bold text-white shadow-[0_0_20px_rgba(0,200,5,0.2)] transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00C805] focus:ring-offset-2 focus:ring-offset-gray-900"
             >
               <span className="relative rounded-md bg-black/10 px-3 py-1.5 transition-all duration-75 ease-in group-hover:bg-opacity-0">
                  <span className="flex items-center space-x-1.5">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                     <span className="text-[10px] font-black uppercase tracking-wide text-white">Sign Up</span>
                  </span>
               </span>
             </button>
           ) : (
             <button 
               onClick={handleLogout}
               className="flex items-center space-x-2 bg-[#18181b] border border-gray-800 hover:bg-red-900/20 hover:border-red-500/50 hover:text-red-500 text-gray-400 px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold uppercase"
             >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 overflow-hidden border border-gray-500">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="w-full h-full" />
                </div>
                <span>Logout</span>
             </button>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      {/* Changed: overflow-hidden + relative instead of overflow-y-auto to allow children to handle scrolling */}
      <main className="flex-1 overflow-hidden pt-[60px] pb-[80px] relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-[75px] bg-[#09090b]/90 border-t border-gray-800 flex justify-around items-center px-2 z-50 backdrop-blur-xl pb-2 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <NavIcon 
          route={AppRoute.DASHBOARD} 
          current={currentRoute} 
          onClick={onNavigate} 
          label="Market"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
          }
        />
        <NavIcon 
          route={AppRoute.AI_SCANNER} 
          current={currentRoute} 
          onClick={onNavigate} 
          label="AI Scan"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
          }
        />
        <NavIcon 
          route={AppRoute.FNO} 
          current={currentRoute} 
          onClick={onNavigate} 
          label="F&O"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 5 5 5-5 5 5 5-5"/><path d="m3 13 5 5 5-5 5 5 5-5"/><path d="m3 23 5-5 5 5 5 5"/></svg>
          }
        />
        <NavIcon 
          route={AppRoute.PORTFOLIO} 
          current={currentRoute} 
          onClick={onNavigate} 
          label="Portfolio"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
          }
        />
         <NavIcon 
          route={AppRoute.TRAINING} 
          current={currentRoute} 
          onClick={onNavigate} 
          label="Academy"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          }
        />
      </nav>

      {/* Subscription Modal */}
      {showAuthModal && (
        <SubscriptionModal 
          onClose={() => setShowAuthModal(false)} 
          onLogin={handleLogin} 
        />
      )}
    </div>
  );
};
