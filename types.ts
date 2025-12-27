export interface GameSettings {
  nLevel: number;
  durationSeconds: number; // Duration of each stimulus
  totalTrials: number;
  matchChance: number; // Probability of a match (0-1)
  
  // Audio Settings
  audioProvider: 'RECORDED' | 'TTS';
  ttsVoiceURI: string | null;
}

export interface GameStep {
  position: number; // 0-8
  audioLetter: string;
  isPositionMatch: boolean;
  isAudioMatch: boolean;
}

export interface UserInput {
  position: boolean;
  audio: boolean;
  positionTimestamp?: number;
  audioTimestamp?: number;
}

export interface ModalStats {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  avgResponseTimeMs: number;
}

export interface GameSession {
  id: string;
  timestamp: number;
  nLevel: number;
  score: number;
  // Legacy accuracy fields (kept for backward compatibility if needed, but we use detailed stats now)
  accuracyPosition: number; 
  accuracyAudio: number;
  totalMistakes?: number; // Optional as it might not be in old data, but new games will populate it
  
  // New detailed stats
  visualStats: ModalStats;
  audioStats: ModalStats;
}

export interface GameStats {
  sessions: GameSession[];
  highScoreN: number;
  streak: number;
  lastPlayedDate: string | null;
}

export enum GameState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export enum Screen {
  DASHBOARD = 'DASHBOARD',
  GAME = 'GAME',
  STATS = 'STATS',
  SETTINGS = 'SETTINGS'
}