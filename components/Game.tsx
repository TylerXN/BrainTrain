import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Volume2, Grid as GridIcon, Loader2 } from 'lucide-react';
import { GameSettings, GameState, GameStep, UserInput, GameSession, ModalStats } from '../types';
import { LETTERS, GRID_SIZE } from '../constants';
import Grid from './Grid';
import { updateStatsAfterGame } from '../utils/storage';
import { playLetterSound, preloadGameAudio } from '../services/audioService';

interface GameProps {
  settings: GameSettings;
  onFinish: () => void;
}

const Game: React.FC<GameProps> = ({ settings, onFinish }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<GameStep[]>([]);
  const [userInput, setUserInput] = useState<UserInput>({ position: false, audio: false });
  
  // Refs for logic that doesn't need re-renders
  const stepStartTimeRef = useRef<number>(0);
  const userInputRef = useRef<UserInput>({ position: false, audio: false });
  const sequenceRef = useRef<GameStep[]>([]);
  
  // Stats accumulation
  const gameStatsRef = useRef({
    visual: { hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0, totalRt: 0, hitCountForRt: 0 },
    audio: { hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0, totalRt: 0, hitCountForRt: 0 }
  });

  const generateLevel = useCallback(async () => {
    setGameState(GameState.LOADING);
    
    // Preload audio (async)
    await preloadGameAudio(settings);

    const newSequence: GameStep[] = [];
    for (let i = 0; i < settings.totalTrials; i++) {
      let position = Math.floor(Math.random() * GRID_SIZE);
      let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      
      const isTargetIndex = i >= settings.nLevel;
      let isPositionMatch = false;
      let isAudioMatch = false;

      if (isTargetIndex) {
        if (Math.random() < settings.matchChance) {
          position = newSequence[i - settings.nLevel].position;
          isPositionMatch = true;
        }
        if (Math.random() < settings.matchChance) {
          letter = newSequence[i - settings.nLevel].audioLetter;
          isAudioMatch = true;
        }
      }

      // Check for accidental matches
      if (isTargetIndex) {
        if (!isPositionMatch && position === newSequence[i - settings.nLevel].position) isPositionMatch = true;
        if (!isAudioMatch && letter === newSequence[i - settings.nLevel].audioLetter) isAudioMatch = true;
      }

      newSequence.push({ position, audioLetter: letter, isPositionMatch, isAudioMatch });
    }
    
    sequenceRef.current = newSequence;
    setSequence(newSequence);
    
    // Reset Stats
    gameStatsRef.current = {
      visual: { hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0, totalRt: 0, hitCountForRt: 0 },
      audio: { hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0, totalRt: 0, hitCountForRt: 0 }
    };
    
    setScore(0);
    setCurrentStepIndex(-1);
    setGameState(GameState.PLAYING);
  }, [settings]);

  const handleInput = (type: 'position' | 'audio') => {
    if (gameState !== GameState.PLAYING) return;
    
    // Prevent double input for the same step
    if (userInputRef.current[type]) return;

    const now = Date.now();
    const rt = now - stepStartTimeRef.current;
    
    userInputRef.current = { 
        ...userInputRef.current, 
        [type]: true,
        [`${type}Timestamp` as keyof UserInput]: rt 
    };
    setUserInput({ ...userInputRef.current });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA') handleInput('position');
      if (e.code === 'KeyL') handleInput('audio');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Main Loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const processPreviousStep = (idx: number) => {
      if (idx < 0) return;
      
      const step = sequenceRef.current[idx];
      const input = userInputRef.current;
      
      // --- Visual Stats ---
      if (step.isPositionMatch) {
        if (input.position) {
          gameStatsRef.current.visual.hits++;
          gameStatsRef.current.visual.totalRt += (input.positionTimestamp || 0);
          gameStatsRef.current.visual.hitCountForRt++;
          setScore(s => s + 100); // HIT
        } else {
          gameStatsRef.current.visual.misses++;
        }
      } else {
        if (input.position) {
          gameStatsRef.current.visual.falseAlarms++;
          setScore(s => Math.max(0, s - 50)); // FALSE ALARM PENALTY
        } else {
          gameStatsRef.current.visual.correctRejections++;
        }
      }

      // --- Audio Stats ---
      if (step.isAudioMatch) {
        if (input.audio) {
          gameStatsRef.current.audio.hits++;
          gameStatsRef.current.audio.totalRt += (input.audioTimestamp || 0);
          gameStatsRef.current.audio.hitCountForRt++;
          setScore(s => s + 100); // HIT
        } else {
          gameStatsRef.current.audio.misses++;
        }
      } else {
        if (input.audio) {
          gameStatsRef.current.audio.falseAlarms++;
          setScore(s => Math.max(0, s - 50)); // FALSE ALARM PENALTY
        } else {
          gameStatsRef.current.audio.correctRejections++;
        }
      }
    };

    const tick = () => {
      setCurrentStepIndex(prev => {
        const idx = prev;

        // Process results of the step that just ended
        processPreviousStep(idx);

        // Check completion
        if (idx >= settings.totalTrials - 1) {
          finishGame();
          return idx;
        }

        const nextIdx = idx + 1;
        
        // Reset for next step
        userInputRef.current = { position: false, audio: false };
        setUserInput({ position: false, audio: false });
        stepStartTimeRef.current = Date.now();
        
        // Stimuli
        const nextStep = sequenceRef.current[nextIdx];
        playLetterSound(nextStep.audioLetter, settings);
        
        timeoutId = setTimeout(tick, settings.durationSeconds * 1000);
        return nextIdx;
      });
    };

    // Initial kickoff
    if (currentStepIndex === -1) {
       timeoutId = setTimeout(tick, 500); 
    }

    return () => clearTimeout(timeoutId);
  }, [gameState]); 

  const finishGame = () => {
    setGameState(GameState.FINISHED);
  };

  const handleFinishAndSave = () => {
    const s = gameStatsRef.current;
    
    const calculateModalStats = (raw: typeof s.visual): ModalStats => ({
      hits: raw.hits,
      misses: raw.misses,
      falseAlarms: raw.falseAlarms,
      correctRejections: raw.correctRejections,
      avgResponseTimeMs: raw.hitCountForRt > 0 ? Math.round(raw.totalRt / raw.hitCountForRt) : 0
    });

    const visualStats = calculateModalStats(s.visual);
    const audioStats = calculateModalStats(s.audio);

    // Calculate generic accuracy for legacy support / quick view
    const total = settings.totalTrials;
    const accPos = Math.round(((visualStats.hits + visualStats.correctRejections) / total) * 100);
    const accAud = Math.round(((audioStats.hits + audioStats.correctRejections) / total) * 100);

    const session: GameSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      nLevel: settings.nLevel,
      score: score,
      accuracyPosition: accPos,
      accuracyAudio: accAud,
      totalMistakes: visualStats.misses + visualStats.falseAlarms + audioStats.misses + audioStats.falseAlarms,
      visualStats,
      audioStats
    };
    
    updateStatsAfterGame(session);
    onFinish();
  };

  if (gameState === GameState.IDLE) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in px-6">
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-fuchsia animate-pulse-fast">Ready?</h2>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <div className="text-sm text-slate-400 mb-1 uppercase tracking-wider font-bold">Current Level</div>
                <div className="text-5xl font-bold text-white mb-4">N-{settings.nLevel}</div>
                <div className="h-px bg-slate-700 w-full mb-4"></div>
                <div className="flex justify-center gap-6 text-sm font-medium">
                    <span className="flex items-center gap-1 text-accent-cyan">
                        <GridIcon size={16} /> Position Match
                    </span>
                    <span className="flex items-center gap-1 text-accent-fuchsia">
                        <Volume2 size={16} /> Audio Match
                    </span>
                </div>
            </div>
        </div>
        <button 
          onClick={generateLevel}
          className="group relative flex items-center justify-center gap-3 w-full max-w-xs py-4 bg-white text-slate-900 rounded-full text-xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan to-accent-fuchsia opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <Play size={24} className="fill-current" /> 
          Start Game
        </button>
      </div>
    );
  }

  if (gameState === GameState.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fade-in">
        <Loader2 className="w-12 h-12 text-accent-cyan animate-spin" />
        <p className="text-slate-300 font-medium">Preparing Neural Link...</p>
      </div>
    );
  }

  if (gameState === GameState.FINISHED) {
      return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
             <div className="text-center relative">
                <div className="absolute -inset-10 bg-gradient-to-tr from-accent-cyan/20 to-accent-fuchsia/20 blur-3xl rounded-full"></div>
                <h2 className="relative text-4xl font-bold text-white mb-2">Complete!</h2>
                <div className="relative text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-fuchsia mb-4 tracking-tighter drop-shadow-lg">{score}</div>
                <p className="relative text-slate-400 font-medium">Final Score</p>
             </div>
             <button 
                onClick={handleFinishAndSave}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-white rounded-xl font-semibold transition-all shadow-lg"
             >
                See Results
             </button>
          </div>
      )
  }

  const activeStep = sequence[currentStepIndex];

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto p-4 pb-8">
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="text-slate-400 text-xs font-mono uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">
            Level {settings.nLevel}
        </div>
        <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Score</span>
            <span className="text-2xl font-bold text-white font-mono tracking-tight">{score}</span>
        </div>
        <div className="text-slate-400 text-xs font-mono bg-slate-800/50 px-3 py-1 rounded-full">
            {currentStepIndex + 1} / {settings.totalTrials}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center mb-8 relative">
        <Grid activePosition={activeStep ? activeStep.position : null} />
        
        {/* Visual Feedback Overlays */}
        {userInput.position && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-cyan animate-pulse-fast drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                <GridIcon size={36} />
            </div>
        )}
        {userInput.audio && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-fuchsia animate-pulse-fast drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]">
                <Volume2 size={36} />
            </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Position Button (Cyan) */}
        <button
          className={`
            h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all active:scale-95 shadow-lg
            ${userInput.position 
                ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:border-accent-cyan/50 hover:bg-slate-800 hover:text-white backdrop-blur-sm'
            }
          `}
          onTouchStart={(e) => { e.preventDefault(); handleInput('position'); }}
          onMouseDown={(e) => { e.preventDefault(); handleInput('position'); }}
        >
            <GridIcon size={28} className="mb-1" />
            <span className="font-bold tracking-widest text-sm">POSITION</span>
            <span className="text-[10px] opacity-40 hidden sm:block font-mono bg-black/20 px-2 py-0.5 rounded">KEY: A</span>
        </button>

        {/* Audio Button (Fuchsia) */}
        <button
          className={`
            h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all active:scale-95 shadow-lg
            ${userInput.audio 
                ? 'bg-accent-fuchsia/20 border-accent-fuchsia text-accent-fuchsia shadow-[0_0_20px_rgba(217,70,239,0.3)]' 
                : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:border-accent-fuchsia/50 hover:bg-slate-800 hover:text-white backdrop-blur-sm'
            }
          `}
          onTouchStart={(e) => { e.preventDefault(); handleInput('audio'); }}
          onMouseDown={(e) => { e.preventDefault(); handleInput('audio'); }}
        >
            <Volume2 size={28} className="mb-1" />
            <span className="font-bold tracking-widest text-sm">AUDIO</span>
            <span className="text-[10px] opacity-40 hidden sm:block font-mono bg-black/20 px-2 py-0.5 rounded">KEY: L</span>
        </button>
      </div>

      <button 
        onClick={() => setGameState(GameState.IDLE)}
        className="mx-auto text-slate-500 hover:text-white text-xs font-medium py-3 px-6 transition-colors tracking-wide uppercase"
      >
        Quit Game
      </button>
    </div>
  );
};

export default Game;