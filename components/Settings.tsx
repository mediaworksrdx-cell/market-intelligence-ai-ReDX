
import React, { useState } from 'react';
import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button 
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C805] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
      checked ? 'bg-[#00C805]' : 'bg-zinc-700'
    }`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const handleResetApp = () => {
    if (confirm('WARNING: This will clear all local data, including your portfolio and preferences. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
       <div className="flex items-center space-x-3 mt-2">
         <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
         </div>
         <h1 className="text-2xl font-bold">Settings</h1>
       </div>
       
       <div className="space-y-4">
         <div className="bg-[#18181b] rounded-xl border border-gray-800 overflow-hidden">
            <h3 className="px-4 py-3 bg-gray-800/30 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
               <span>App Appearance</span>
            </h3>
            <div className="p-4 space-y-5">
               <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-gray-200">OLED Mode</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">True Black background for AMOLED screens</p>
                  </div>
                  <Toggle checked={settings.darkMode} onChange={() => onUpdateSettings({ darkMode: !settings.darkMode })} />
               </div>
               <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-gray-200">Streamer Mode</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Hide P&L and Account Balance values</p>
                  </div>
                  <Toggle checked={settings.streamerMode} onChange={() => onUpdateSettings({ streamerMode: !settings.streamerMode })} />
               </div>
            </div>
         </div>

         <div className="bg-[#18181b] rounded-xl border border-gray-800 overflow-hidden">
            <h3 className="px-4 py-3 bg-gray-800/30 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trading Profile</h3>
            <div className="p-4 space-y-4">
               <div>
                  <p className="font-bold text-sm text-gray-200 mb-3">Risk Tolerance</p>
                  <p className="text-[10px] text-gray-500 mb-2">Adjusts AI Scanner confidence thresholds.</p>
                  <div className="flex bg-[#09090b] p-1 rounded-lg border border-gray-800">
                     <button 
                       onClick={() => onUpdateSettings({ riskProfile: 'AGGRESSIVE' })}
                       className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${settings.riskProfile === 'AGGRESSIVE' ? 'bg-[#00C805] text-black shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                       AGGRESSIVE
                     </button>
                     <button 
                       onClick={() => onUpdateSettings({ riskProfile: 'CONSERVATIVE' })}
                       className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${settings.riskProfile === 'CONSERVATIVE' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                       CONSERVATIVE
                     </button>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="bg-[#18181b] rounded-xl border border-gray-800 overflow-hidden">
            <h3 className="px-4 py-3 bg-gray-800/30 text-[10px] font-bold text-gray-400 uppercase tracking-wider">System</h3>
            <div className="p-4">
               <button 
                  onClick={handleResetApp}
                  className="w-full py-3 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors flex items-center justify-center space-x-2 group"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-shake"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  <span>Reset App Data</span>
               </button>
            </div>
         </div>

         <div className="text-center pt-8 text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C805] to-green-800 flex items-center justify-center text-black font-bold text-[10px] shadow-lg mx-auto mb-2 opacity-50">
               AI
            </div>
            <p className="text-[10px] font-mono tracking-widest uppercase">Market Intelligence AI v1.2.0</p>
            <p className="text-[9px] mt-1">Institutional Build • <span className="text-[#00C805]">Connected</span></p>
         </div>
       </div>
    </div>
  );
};
