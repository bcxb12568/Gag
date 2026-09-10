export type PrankThemeId =
  | 'girl_fb'
  | 'free_diamond'
  | 'cash_bonus'
  | 'recharge'
  | 'free_internet'
  | 'crush_secret'
  | 'iphone_gift'
  | 'online_income'
  | 'viral'
  | 'game'
  | 'ai'
  | 'cyber';

export type AudioEffectType = 'custom' | 'siren_glitch' | 'rickroll_8bit' | 'funny_screamer' | 'airhorn' | 'party_horn';

export type TrollMemeType = 'bengali_troll' | 'rickroll' | 'cat_laugh' | 'chad_smile';

export interface PrankConfig {
  id: string;
  theme: PrankThemeId;
  customTitle: string;
  customSubtitle: string;
  buttonText: string;
  audioEffect: AudioEffectType;
  customAudioName?: string;
  customAudioDataUrl?: string; // base64 data URL
  customVideoName?: string;
  customVideoDataUrl?: string; // base64 data URL for direct video prank
  mediaMode?: 'audio' | 'video' | 'both';
  countdownDuration: number; // in seconds, default 180 (3 mins)
  trollMeme: TrollMemeType;
  memeMessage: string;
  glitchIntensity: 'low' | 'medium' | 'extreme';
  enableSoundLoop: boolean;
  createdAt: number;
}

export interface VictimEvent {
  id: string;
  prankId: string;
  theme: PrankThemeId;
  action: 'visit' | 'trapped' | 'troll_revealed';
  timestamp: number;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  locationGuess?: string;
}

export interface TrackerStats {
  totalVisits: number;
  totalTrapped: number;
  totalMemeReveals: number;
  recentVictims: VictimEvent[];
}
