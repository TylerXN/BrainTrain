import { GameSession } from '../types';

/**
 * Local Analysis Service
 * Replaces the previous Cloud AI service with a deterministic rule-based coach.
 * This runs entirely in the browser with no API calls.
 */

export const getAiCoaching = async (history: GameSession[]): Promise<string> => {
  // Simulate a short delay to feel like "analysis"
  await new Promise(resolve => setTimeout(resolve, 600));

  if (history.length === 0) {
    return "Play a few games to unlock performance insights!";
  }

  const recent = history.slice(-5);
  const latest = recent[recent.length - 1];

  // Calculate averages
  const avgPosAcc = recent.reduce((sum, s) => sum + s.accuracyPosition, 0) / recent.length;
  const avgAudAcc = recent.reduce((sum, s) => sum + s.accuracyAudio, 0) / recent.length;
  
  // Calculate specific error types for the latest session
  const visual = latest.visualStats;
  const audio = latest.audioStats;

  // 1. Modality Imbalance
  if (Math.abs(avgPosAcc - avgAudAcc) > 15) {
    if (avgPosAcc > avgAudAcc) {
      return "Your visual memory is strong, but auditory processing is lagging. Try closing your eyes for a moment during audio-only sequences to focus.";
    } else {
      return "Great ear! You're catching the sounds well. Focus more on the grid patterns; try to visualize the shape the movement makes.";
    }
  }

  // 2. High False Alarms (Impulsivity)
  const totalFalseAlarms = visual.falseAlarms + audio.falseAlarms;
  const totalHits = visual.hits + audio.hits;
  
  if (totalFalseAlarms > 4) {
    return "You're reacting a bit impulsively (high false alarms). It's better to miss a match than to guess. Wait until you are certain.";
  }

  // 3. Low Hits (Inattention or Overwhelmed)
  if (totalHits < 3 && (visual.misses + audio.misses > 5)) {
    return "You seem to be missing a lot of matches. If you feel overwhelmed, try dropping down one N-level to build confidence before moving back up.";
  }

  // 4. Reaction Time Insights
  const avgRt = (visual.avgResponseTimeMs + audio.avgResponseTimeMs) / 2;
  if (avgRt > 1500) {
    return "Your accuracy is good, but your reaction time is a bit slow. Trust your gut instinct—the first impression is often correct in N-Back.";
  }

  // 5. N-Level Progress
  if (latest.nLevel >= 3 && avgPosAcc > 80 && avgAudAcc > 80) {
    return "Outstanding performance! You are mastering this N-level. Consistency is key now. Have you tried increasing the speed in settings?";
  }

  // Generic Encouragement
  const tips = [
    "Consistency is better than intensity. 10 minutes a day is ideal.",
    "Try to 'chunk' the information. Remember pairs of position and sound.",
    "If you get frustrated, take a break. Neuroplasticity happens during rest.",
    "Breathe rhythmically. Oxygen helps brain performance."
  ];

  return tips[Math.floor(Math.random() * tips.length)];
};