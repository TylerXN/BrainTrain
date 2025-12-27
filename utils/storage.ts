import { GameStats, GameSettings, GameSession } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEY, SETTINGS_KEY } from '../constants';

const INITIAL_STATS: GameStats = {
  sessions: [],
  highScoreN: 1,
  streak: 0,
  lastPlayedDate: null
};

export const loadStats = (): GameStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_STATS;
  } catch (e) {
    console.error("Failed to load stats", e);
    return INITIAL_STATS;
  }
};

export const saveStats = (stats: GameStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save stats", e);
  }
};

export const loadSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: GameSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const updateStatsAfterGame = (session: GameSession): GameStats => {
  const currentStats = loadStats();
  const today = new Date().toISOString().split('T')[0];
  
  let newStreak = currentStats.streak;
  if (currentStats.lastPlayedDate !== today) {
    // Check if yesterday was played
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (currentStats.lastPlayedDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  // Update high score (N-level reached with decent accuracy)
  // Strict criteria: > 80% combined accuracy or > 70% in both modalities
  const accPos = session.accuracyPosition;
  const accAud = session.accuracyAudio;
  const passed = accPos >= 80 && accAud >= 80;

  const newHighScore = (passed && session.nLevel > currentStats.highScoreN) 
    ? session.nLevel 
    : currentStats.highScoreN;

  const newStats: GameStats = {
    sessions: [...currentStats.sessions, session],
    highScoreN: newHighScore,
    streak: newStreak,
    lastPlayedDate: today
  };

  saveStats(newStats);
  return newStats;
};
