import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Brain, TrendingUp, Calendar, Lightbulb, Clock, CheckCircle2 } from 'lucide-react';
import { loadStats } from '../utils/storage';
import { getAiCoaching } from '../services/geminiService';
import { GameStats } from '../types';

const Stats: React.FC = () => {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const handleGetCoaching = async () => {
    if (!stats) return;
    setLoadingAnalysis(true);
    const result = await getAiCoaching(stats.sessions);
    setAdvice(result);
    setLoadingAnalysis(false);
  };

  if (!stats) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

  const recentSessions = stats.sessions.slice(-10);
  const lastSession = stats.sessions[stats.sessions.length - 1];

  // Prepare data for Reaction Time Chart (Visual vs Audio)
  const rtData = recentSessions.map((s, i) => ({
    name: i + 1,
    Visual: s.visualStats?.avgResponseTimeMs || 0,
    Audio: s.audioStats?.avgResponseTimeMs || 0
  }));

  const averageScore = stats.sessions.length > 0 
    ? Math.round(stats.sessions.reduce((acc, s) => acc + s.score, 0) / stats.sessions.length) 
    : 0;

  return (
    <div className="h-full overflow-y-auto pb-24 px-4 pt-6 space-y-6 animate-fade-in custom-scrollbar">
      <h2 className="text-3xl font-bold text-white mb-2">Analytics</h2>

      {/* Last Game Analysis Card */}
      {lastSession && (
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan to-accent-fuchsia"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <CheckCircle2 className="text-accent-cyan" size={18} /> Last Game Breakdown
            </h3>
            <span className="text-xs text-white bg-slate-700/50 border border-slate-600 px-2 py-1 rounded">N-{lastSession.nLevel}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             {/* Visual Stats */}
             <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <div className="text-xs text-accent-cyan mb-2 uppercase tracking-wide font-bold">Visual (Position)</div>
                <div className="space-y-1">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Hits</span>
                      <span className="text-green-400 font-mono">{lastSession.visualStats?.hits ?? '-'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-300">False Alarm</span>
                      <span className="text-red-400 font-mono">{lastSession.visualStats?.falseAlarms ?? '-'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Avg RT</span>
                      <span className="text-blue-400 font-mono">{lastSession.visualStats?.avgResponseTimeMs ?? '-'}ms</span>
                   </div>
                </div>
             </div>

             {/* Audio Stats */}
             <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <div className="text-xs text-accent-fuchsia mb-2 uppercase tracking-wide font-bold">Audio (Letter)</div>
                <div className="space-y-1">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Hits</span>
                      <span className="text-green-400 font-mono">{lastSession.audioStats?.hits ?? '-'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-300">False Alarm</span>
                      <span className="text-red-400 font-mono">{lastSession.audioStats?.falseAlarms ?? '-'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Avg RT</span>
                      <span className="text-blue-400 font-mono">{lastSession.audioStats?.avgResponseTimeMs ?? '-'}ms</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 shadow-md">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <TrendingUp size={16} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Avg Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{averageScore}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 shadow-md">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Calendar size={16} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Games</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.sessions.length}</div>
        </div>
      </div>

      {/* Reaction Time Chart */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 shadow-lg h-72">
        <h3 className="text-sm text-slate-300 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" /> Reaction Time (ms)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rtData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
                cursor={{fill: '#1e293b'}}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="Visual" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Visual" />
            <Bar dataKey="Audio" fill="#d946ef" radius={[4, 4, 0, 0]} name="Audio" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Coach */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden shadow-xl">
        <div className="absolute -top-6 -right-6 p-4 opacity-10 rotate-12">
            <Brain size={120} />
        </div>
        <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Brain className="text-indigo-400" /> Neuro Coach
            </h3>
            
            {!advice ? (
                <div className="space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Analyze your cognitive patterns. I'll look at your reaction times, error rates, and modality bias to provide training tips.
                    </p>
                    <button 
                        onClick={handleGetCoaching}
                        disabled={loadingAnalysis}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-900/50"
                    >
                        {loadingAnalysis ? <span className="animate-pulse">Analyzing...</span> : <><Lightbulb size={16} /> Get Tips</>}
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <p className="text-indigo-100 text-sm mb-4 leading-relaxed font-medium bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20">
                        {advice}
                    </p>
                    <button 
                        onClick={() => setAdvice(null)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Stats;