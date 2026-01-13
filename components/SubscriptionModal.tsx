
import React, { useState, useEffect } from 'react';

interface SubscriptionModalProps {
  onClose: () => void;
  onLogin: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize Google Auth on mount
  useEffect(() => {
     if (typeof window !== 'undefined' && !window.google) {
        // Fallback if script fails to load
        // console.warn("Google GSI script not loaded");
     }
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setAuthError(null);

    // Safely retrieve Client ID from environment variables
    const clientId = (typeof process !== 'undefined' && process.env) ? process.env.GOOGLE_CLIENT_ID : null;

    if (window.google && clientId) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile email',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            try {
              // Fetch user profile to ensure token is valid
              const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              if (userInfo.ok) {
                 // Login successful
                 onLogin();
              } else {
                 setAuthError("Failed to verify Google account.");
                 setIsLoading(false);
              }
            } catch (error) {
              console.error('Google Auth Failed', error);
              setAuthError("Connection failed. Please try again.");
              setIsLoading(false);
            }
          } else {
             setIsLoading(false);
          }
        },
        error_callback: (err: any) => {
            console.error("GSI Error", err);
            setAuthError("Google Sign-In failed.");
            setIsLoading(false);
        }
      });
      client.requestAccessToken();
    } else {
      // Fallback Mock Login (Simulating Auth Delay)
      // This path is taken if no CLIENT_ID is configured or if running locally without one
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in bg-black/80 backdrop-blur-md" onClick={onClose}>
       <div 
         className="w-full max-w-sm rounded-[2rem] border border-gray-800 bg-[#121212] shadow-2xl relative overflow-hidden" 
         onClick={e => e.stopPropagation()}
       >
          {/* Decorative Gradients */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#00C805]/20 to-transparent pointer-events-none"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00C805]/30 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-gray-400 hover:text-white backdrop-blur-sm transition-all"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div className="p-6 pt-10 relative z-0">
             <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00C805] to-[#006002] shadow-[0_0_20px_rgba(0,200,5,0.4)] mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Unlock Institutional AI</h2>
                <p className="text-sm text-gray-400 font-medium">Join 10,000+ traders beating the market.</p>
             </div>

             {/* Features List */}
             <div className="space-y-3 mb-8">
                {[
                   "Real-time AI Pattern Scanning",
                   "Advanced Option Chain & Greeks",
                   "Institutional Volume Alerts",
                   "Unlimited Backtesting Strategies"
                ].map((feature, i) => (
                   <div key={i} className="flex items-center space-x-3 bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00C805]/20 flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00C805" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-sm text-gray-300 font-medium">{feature}</span>
                   </div>
                ))}
             </div>

             {/* Offer Banner */}
             <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#00C805]/10 to-transparent border border-[#00C805]/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#00C805]/5 group-hover:bg-[#00C805]/10 transition-colors"></div>
                <div className="flex justify-between items-center relative z-10">
                   <div>
                      <p className="text-[10px] font-black uppercase text-[#00C805] tracking-widest mb-0.5">LIMITED OFFER</p>
                      <p className="text-white font-bold text-sm">15-Day Free Trial • Elite Plan</p>
                   </div>
                   <div className="text-right">
                      <span className="block text-lg font-black text-white decoration-double">FREE</span>
                      <span className="text-[10px] text-gray-400 line-through">₹2499/mo</span>
                   </div>
                </div>
             </div>

             {/* Auth Button */}
             <div className="space-y-3">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-100 transition-all transform active:scale-95 disabled:opacity-70 disabled:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                   {isLoading ? (
                     <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                     <>
                        <svg width="20" height="20" viewBox="0 0 24 24">
                           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                           <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm">Sign Up with Google</span>
                     </>
                   )}
                </button>
                {authError && <p className="text-center text-xs text-red-500 font-bold">{authError}</p>}
                
                <p className="text-center text-[10px] text-gray-500">
                   No credit card required. Cancel anytime. <br/> By continuing, you agree to our Terms.
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};
