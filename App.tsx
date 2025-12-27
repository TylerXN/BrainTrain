import React, { useState, useEffect } from 'react';
import { Home, BarChart2, Settings as SettingsIcon, Gamepad2 } from 'lucide-react';
import { Screen, GameSettings, GameStats } from './types';
import { loadSettings, saveSettings, loadStats } from './utils/storage';
import Dashboard from './components/Dashboard';
import Game from './components/Game';
import Stats from './components/Stats';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
  const [settings, setSettings] = useState<GameSettings>(loadSettings());
  const [stats, setStats] = useState<GameStats>(loadStats());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Refresh stats when entering dashboard or stats screen
  useEffect(() => {
    if (currentScreen === Screen.DASHBOARD || currentScreen === Screen.STATS) {
      setStats(loadStats());
    }
  }, [currentScreen]);

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  const renderContent = () => {
    switch (currentScreen) {
      case Screen.GAME:
        return <Game settings={settings} onFinish={() => setCurrentScreen(Screen.STATS)} />;
      case Screen.STATS:
        return <Stats />;
      case Screen.SETTINGS:
        return <Settings settings={settings} updateSettings={handleUpdateSettings} />;
      case Screen.DASHBOARD:
      default:
        return <Dashboard stats={stats} onStart={() => setCurrentScreen(Screen.GAME)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      {currentScreen !== Screen.GAME && (
        <nav className="h-20 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex justify-around items-center px-6 pb-2 z-50">
          <button 
            onClick={() => setCurrentScreen(Screen.DASHBOARD)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentScreen === Screen.DASHBOARD ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Home size={24} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setCurrentScreen(Screen.STATS)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentScreen === Screen.STATS ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <BarChart2 size={24} />
            <span className="text-[10px] font-medium">Stats</span>
          </button>

          <button 
            onClick={() => setCurrentScreen(Screen.SETTINGS)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentScreen === Screen.SETTINGS ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <SettingsIcon size={24} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
