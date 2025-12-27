import { LETTERS } from '../constants';
import { GameSettings } from '../types';

const AUDIO_BASE_URL = 'https://raw.githubusercontent.com/mhthebest/Dual-N-Back/master/sounds/';

// Cache for Audio objects
const audioCache: Record<string, HTMLAudioElement> = {};
let voicesLoaded = false;

// Preload recorded audio files
const preloadRecordedAudio = async (): Promise<void> => {
  const promises = LETTERS.map(letter => {
    return new Promise<void>((resolve) => {
      if (audioCache[letter]) {
        resolve();
        return;
      }
      const audio = new Audio(`${AUDIO_BASE_URL}${letter.toLowerCase()}.mp3`);
      audio.preload = 'auto';
      audio.oncanplaythrough = () => {
        audioCache[letter] = audio;
        resolve();
      };
      audio.onerror = () => {
        console.warn(`Failed to load audio for ${letter}, falling back to TTS.`);
        resolve(); // Resolve anyway to not block game start
      };
      // Fallback for slow connections
      setTimeout(resolve, 3000);
    });
  });
  await Promise.all(promises);
};

// Preload TTS voices
const preloadTTS = async (): Promise<void> => {
  return new Promise((resolve) => {
    if (voicesLoaded || window.speechSynthesis.getVoices().length > 0) {
      voicesLoaded = true;
      resolve();
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      resolve();
    };
    setTimeout(() => resolve(), 1000);
  });
};

export const preloadGameAudio = async (settings: GameSettings): Promise<void> => {
  if (settings.audioProvider === 'RECORDED') {
    await preloadRecordedAudio();
  } else {
    await preloadTTS();
  }
};

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  return window.speechSynthesis.getVoices();
};

export const playLetterSound = (letter: string, settings: GameSettings) => {
  // Mode 1: Recorded Audio
  if (settings.audioProvider === 'RECORDED') {
    const audio = audioCache[letter];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Audio play failed", e));
      return;
    }
    // If recorded file missing, fall through to TTS
  }

  // Mode 2: TTS
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(letter);
  utterance.rate = 1.0; 
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  let selectedVoice: SpeechSynthesisVoice | undefined;

  // 1. User Preference
  if (settings.ttsVoiceURI) {
    selectedVoice = voices.find(v => v.voiceURI === settings.ttsVoiceURI);
  } 
  
  // 2. "Tara" (User requested specifically)
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.name.includes('Tara') || v.name.includes('English (India)'));
  }

  // 3. Any English India
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang === 'en-IN');
  }

  // 4. High Quality US/UK Fallbacks
  if (!selectedVoice) {
    selectedVoice = 
      voices.find(v => v.name.includes('Google US English')) ||
      voices.find(v => v.name.includes('Samantha')) ||
      voices.find(v => v.lang === 'en-US' && !v.name.includes('Network')) ||
      voices.find(v => v.lang.startsWith('en'));
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
};