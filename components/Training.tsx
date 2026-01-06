
import React from 'react';
import { TRAINING_MODULES } from '../constants';

export const Training: React.FC = () => {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
       <div className="flex items-center space-x-3 mt-2">
         <div className="p-2 bg-[#00C805]/10 rounded-lg text-[#00C805] shadow-[0_0_15px_rgba(0,200,5,0.1)]">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
         </div>
         <div>
           <h1 className="text-2xl font-black uppercase tracking-tight">Academy</h1>
           <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Master the markets</p>
         </div>
       </div>

       {/* Progress */}
       <div className="bg-[#18181b] p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between text-sm mb-2">
             <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Course Progress</span>
             <span className="font-bold font-mono text-[#00C805]">12%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-[#00C805] w-[12%] rounded-full shadow-[0_0_10px_rgba(0,200,5,0.5)]"></div>
          </div>
       </div>

       {/* Modules */}
       <div className="space-y-4">
          {TRAINING_MODULES.map((module) => (
             <div key={module.id} className={`bg-[#18181b] rounded-xl border ${module.locked ? 'border-gray-800 opacity-70' : 'border-gray-700'} overflow-hidden`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-800/50">
                   <div>
                      <h3 className="font-bold text-base text-white">{module.title}</h3>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase">{module.duration}</p>
                   </div>
                   {module.locked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                   ) : (
                      <button className="bg-[#00C805] hover:bg-green-600 text-black text-[10px] font-black px-4 py-2 rounded-lg transition-colors uppercase tracking-widest">Start</button>
                   )}
                </div>
                {!module.locked && (
                   <div className="p-4 bg-black/20">
                      <ul className="space-y-2">
                         {module.topics.map((topic, i) => (
                            <li key={i} className="flex items-center text-sm text-gray-400">
                               <div className="w-1.5 h-1.5 bg-[#00C805] rounded-full mr-2"></div>
                               {topic}
                            </li>
                         ))}
                      </ul>
                   </div>
                )}
             </div>
          ))}
       </div>
    </div>
  );
};
