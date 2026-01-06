
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AIScanner } from './components/AIScanner';
import { FOAnalytics } from './components/FOAnalytics';
import { Portfolio } from './components/Portfolio';
import { Settings } from './components/Settings';
import { Training } from './components/Training';
import { Notifications } from './components/Notifications';
import { AnalysisDetail } from './components/AnalysisDetail';
import { AppRoute, MarketType, UserSettings, NotificationItem } from './types';
import { USER_WEBHOOK_ID, NOTIFICATIONS_MOCK } from './constants';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [market, setMarket] = useState<MarketType>('IN');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS_MOCK);

  // Initialize Settings from LocalStorage
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('market_ai_settings');
    return saved ? JSON.parse(saved) : {
      darkMode: false, 
      streamerMode: false,
      riskProfile: 'AGGRESSIVE',
      webhookUrl: USER_WEBHOOK_ID
    };
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('market_ai_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const addNotification = useCallback((notification: NotificationItem) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50));
  }, []);

  const handleNavigate = (route: AppRoute, params?: any) => {
    if (route === AppRoute.ANALYSIS && params?.symbol) {
       setSelectedSymbol(params.symbol);
    }
    setCurrentRoute(route);
  };

  const renderPersistentScreen = (route: AppRoute, component: React.ReactNode) => (
    <div 
      key={route}
      className={`${currentRoute === route ? 'flex' : 'hidden'} flex-col w-full h-full overflow-y-auto scroll-smooth no-scrollbar`}
    >
      {component}
    </div>
  );

  return (
    <div className={settings.darkMode ? 'bg-black' : 'bg-[#09090b]'}>
      <Layout currentRoute={currentRoute} onNavigate={handleNavigate}>
        {renderPersistentScreen(AppRoute.DASHBOARD, 
          <Dashboard market={market} setMarket={setMarket} onNavigate={handleNavigate} settings={settings} />
        )}
        {renderPersistentScreen(AppRoute.AI_SCANNER, 
          <AIScanner market={market} settings={settings} onSignalDetected={addNotification} />
        )}
        {renderPersistentScreen(AppRoute.FNO, 
          <FOAnalytics market={market} />
        )}
        {renderPersistentScreen(AppRoute.PORTFOLIO, 
          <Portfolio market={market} settings={settings} />
        )}
        {renderPersistentScreen(AppRoute.TRAINING, 
          <Training />
        )}
        {renderPersistentScreen(AppRoute.SETTINGS, 
          <Settings settings={settings} onUpdateSettings={updateSettings} />
        )}
        {renderPersistentScreen(AppRoute.NOTIFICATIONS, 
          <Notifications onNavigate={handleNavigate} notifications={notifications} />
        )}
      </Layout>
      
      {currentRoute === AppRoute.ANALYSIS && selectedSymbol && (
        <AnalysisDetail 
           symbol={selectedSymbol} 
           onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} 
        />
      )}
    </div>
  );
};

export default App;
