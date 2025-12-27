import React from 'react';
import { GRID_SIZE } from '../constants';

interface GridProps {
  activePosition: number | null; // 0-8 or null
  flashColor?: 'green' | 'red' | null; // For feedback (optional extension)
}

const Grid: React.FC<GridProps> = ({ activePosition }) => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] aspect-square mx-auto p-4 bg-slate-900/80 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm relative">
      {/* Decorative glow behind the grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-accent-fuchsia/10 rounded-2xl blur-xl -z-10"></div>
      
      {Array.from({ length: GRID_SIZE }).map((_, i) => {
        const isActive = activePosition === i;
        return (
          <div
            key={i}
            className={`
              rounded-xl transition-all duration-150 border relative overflow-hidden
              ${isActive 
                ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-105 z-10' 
                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
              }
            `}
          >
            {isActive && (
                <div className="absolute inset-0 bg-white/20 animate-pulse-fast"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Grid;