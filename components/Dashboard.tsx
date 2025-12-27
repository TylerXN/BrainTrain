import React from 'react';
import { Play, Trophy, Flame, Brain, Network, Zap } from 'lucide-react';
import { GameStats } from '../types';

interface DashboardProps {
  stats: GameStats;
  onStart: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, onStart }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6 space-y-12 animate-fade-in relative">
      {/* Background ambient glow */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent-fuchsia/10 rounded-full blur-[100px] -z-10"></div>

      {/* Brand / Logo Section */}
      <div className="text-center space-y-6 flex flex-col items-center">
        <div className="relative group">
            {/* Animated Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan to-accent-fuchsia rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse-fast"></div>
            
            {/* Main Logo Container */}
            <div className="relative w-32 h-32 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl border border-slate-700/50 overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-30" 
                     style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
                </div>
                
                {/* Icon Composition */}
                <div className="relative z-10 text-white">
                    <Brain size={64} strokeWidth={1.5} className="text-slate-100" />
                    <div className="absolute -top-1 -right-1 text-accent-cyan animate-bounce">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-0 right-0 opacity-60 text-accent-fuchsia">
                        <Network size={32} />
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-1">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight drop-shadow-sm">
                NeuroBack
            </h1>
            <div className="flex items-center justify-center gap-3 text-slate-400 font-bold tracking-[0.2em] text-[10px] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
                Dual N-Back Trainer
                <span className="w-1.5 h-1.5 rounded-full bg-accent-fuchsia animate-pulse"></span>
            </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md flex flex-col items-center hover:bg-slate-800/50 transition-colors group">
            <Flame className="text-orange-500 mb-2 drop-shadow-lg group-hover:scale-110 transition-transform" size={28} />
            <span className="text-3xl font-bold text-white">{stats.streak}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Day Streak</span>
        </div>
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md flex flex-col items-center hover:bg-slate-800/50 transition-colors group">
            <Trophy className="text-yellow-400 mb-2 drop-shadow-lg group-hover:scale-110 transition-transform" size={28} />
            <span className="text-3xl font-bold text-white">N-{stats.highScoreN}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Best Level</span>
        </div>
      </div>

      {/* Start Button */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-cyan to-accent-fuchsia rounded-full blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
        <button
            onClick={onStart}
            className="relative flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-full text-xl font-bold shadow-2xl transition-all hover:scale-[1.02] active:scale-95 border border-slate-700/50"
        >
            <Play size={28} className="text-accent-cyan fill-current" />
            <span>Start Training</span>
        </button>
      </div>
      
    </div>
  );
};

export default Dashboard;