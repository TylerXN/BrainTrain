import React, { useState, useEffect } from 'react';
import { Volume2, Mic, PlayCircle } from 'lucide-react';
import { GameSettings } from '../types';
import { getAvailableVoices, playLetterSound, preloadGameAudio } from '../services/audioService';

interface SettingsProps {
  settings: GameSettings;
  updateSettings: (s: GameSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  useEffect(() => {
    // Load voices for the dropdown
    preloadGameAudio(settings).then(() => {
        setVoices(getAvailableVoices());
    });
  }, []);

  const handleChange = (key: keyof GameSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    updateSettings(newSettings);
    // If switching to Recorded, make sure they are loaded
    if (key === 'audioProvider' && value === 'RECORDED') {
        preloadGameAudio(newSettings);
    }
  };

  const testAudio = () => {
    // Play a sample letter 'K'
    playLetterSound('K', settings);
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-24">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      {/* Audio Section */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Volume2 className="text-primary-400" size={20} /> Audio
        </h3>

        {/* Provider Toggle */}
        <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-medium text-sm">Audio Source</label>
            <div className="flex gap-2">
                <button 
                    onClick={() => handleChange('audioProvider', 'RECORDED')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                        settings.audioProvider === 'RECORDED' 
                        ? 'bg-primary-600 border-primary-500 text-white shadow-lg' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    Recorded (High Quality)
                </button>
                <button 
                    onClick={() => handleChange('audioProvider', 'TTS')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                        settings.audioProvider === 'TTS' 
                        ? 'bg-primary-600 border-primary-500 text-white shadow-lg' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    Browser TTS
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
                {settings.audioProvider === 'RECORDED' 
                    ? "Uses pre-recorded human voice samples. Best for clarity." 
                    : "Uses your browser's built-in text-to-speech engine."}
            </p>
        </div>

        {/* TTS Voice Selector (Only visible if TTS is active) */}
        {settings.audioProvider === 'TTS' && (
            <div className="space-y-2 animate-fade-in">
                <label className="text-slate-300 font-medium text-sm flex items-center gap-2">
                    <Mic size={14} /> Voice Selection
                </label>
                <select 
                    value={settings.ttsVoiceURI || ''}
                    onChange={(e) => handleChange('ttsVoiceURI', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                    <option value="">Default (Auto-Detect)</option>
                    {voices
                        .filter(v => v.lang.startsWith('en')) // Filter for English mostly
                        .map(v => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                        </option>
                    ))}
                </select>
                <p className="text-xs text-orange-400/80">
                    If the audio sounds like a whisper, try selecting a different voice (e.g., "Google US English" or "Samantha").
                </p>
            </div>
        )}

        {/* Test Button */}
        <button 
            onClick={testAudio}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
            <PlayCircle size={16} /> Test Audio Sound
        </button>
      </div>

      <div className="h-px bg-slate-800 w-full"></div>

      {/* Difficulty Section */}
      <h3 className="text-lg font-semibold text-white">Difficulty</h3>

      {/* N-Level */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-slate-300 font-medium">N-Back Level</label>
            <span className="text-primary-400 font-bold text-xl">{settings.nLevel}</span>
        </div>
        <input 
            type="range" 
            min="1" 
            max="5" 
            step="1"
            value={settings.nLevel}
            onChange={(e) => handleChange('nLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <p className="text-xs text-slate-500">How many steps back to remember. Higher is harder.</p>
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-slate-300 font-medium">Speed</label>
            <span className="text-primary-400 font-bold text-xl">{settings.durationSeconds}s</span>
        </div>
        <input 
            type="range" 
            min="1" 
            max="5" 
            step="0.5"
            value={settings.durationSeconds}
            onChange={(e) => handleChange('durationSeconds', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <p className="text-xs text-slate-500">Time per trial. Lower is faster.</p>
      </div>

       {/* Trials */}
       <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-slate-300 font-medium">Trials per Game</label>
            <span className="text-primary-400 font-bold text-xl">{settings.totalTrials}</span>
        </div>
        <input 
            type="range" 
            min="10" 
            max="50" 
            step="5"
            value={settings.totalTrials}
            onChange={(e) => handleChange('totalTrials', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
      </div>
    </div>
  );
};

export default Settings;