import { GameSettings } from './types';

export const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

export const DEFAULT_SETTINGS: GameSettings = {
  nLevel: 2,
  durationSeconds: 2.5,
  totalTrials: 20,
  matchChance: 0.3,
  audioProvider: 'TTS', // Default to TTS for Tara
  ttsVoiceURI: null,
};

// Grid is 3x3
export const GRID_SIZE = 9;

export const STORAGE_KEY = 'neuroback_data_v1';
export const SETTINGS_KEY = 'neuroback_settings_v1';