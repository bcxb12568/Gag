import React, { useState, useEffect } from 'react';
import { PrankConfig, PrankThemeId, AudioEffectType, TrollMemeType } from './types';
import { SecurityGate } from './components/SecurityGate';
import { CreatorDashboard } from './components/CreatorDashboard';
import { VictimPageView } from './components/VictimPageView';
import { THEME_PRESETS } from './components/ThemePresets';
import { getSavedPrankById, loadPrankAudio } from './utils/storage';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [victimConfig, setVictimConfig] = useState<PrankConfig | null>(null);

  // Check URL hash or search params on mount and on hashchange
  useEffect(() => {
    const parseUrl = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const search = window.location.search.replace(/^\?/, '');
      const rawParams = hash || search;

      if (rawParams && rawParams.includes('prank')) {
        const params = new URLSearchParams(rawParams);
        const prankId = params.get('prank') || 'direct';
        const theme = (params.get('t') as PrankThemeId) || 'recharge';
        const preset = THEME_PRESETS[theme] || THEME_PRESETS.recharge;
        const saved = getSavedPrankById(prankId);

        const hasAudioParam = params.get('hasAudio') === '1' || params.get('snd') === 'custom' || Boolean(saved?.customAudioDataUrl);
        const config: PrankConfig = {
          id: prankId,
          theme,
          customTitle: params.get('title') || saved?.customTitle || preset.defaultTitle,
          customSubtitle: params.get('sub') || saved?.customSubtitle || preset.defaultSubtitle,
          buttonText: params.get('btn') || saved?.buttonText || preset.defaultButton,
          audioEffect: hasAudioParam ? 'custom' : ((params.get('snd') as AudioEffectType) || saved?.audioEffect || 'siren_glitch'),
          customAudioName: saved?.customAudioName,
          customAudioDataUrl: saved?.customAudioDataUrl,
          customVideoName: saved?.customVideoName,
          customVideoDataUrl: saved?.customVideoDataUrl,
          mediaMode: (params.get('mode') as any) || saved?.mediaMode || 'audio',
          countdownDuration: Number(params.get('dur')) || saved?.countdownDuration || 180,
          trollMeme: (params.get('meme') as TrollMemeType) || saved?.trollMeme || 'bengali_troll',
          memeMessage: params.get('msg') || saved?.memeMessage || 'আরে ভাই শান্ত হন! এটা স্রেফ একটা নির্দোষ প্র্যাঙ্ক ছিল! 😂',
          glitchIntensity: 'extreme',
          enableSoundLoop: true,
          createdAt: saved?.createdAt || Date.now(),
        };

        setVictimConfig(config);

        // Load custom audio from IndexedDB/storage/API server
        loadPrankAudio(prankId).then((audioData) => {
          if (audioData) {
            setVictimConfig((prev) => (prev ? { ...prev, customAudioDataUrl: audioData, audioEffect: 'custom' } : null));
          }
        });

        // Also fetch from API server if created on another device
        fetch(`/api/pranks/${prankId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((serverData) => {
            if (serverData) {
              setVictimConfig((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  customAudioDataUrl: serverData.customAudioDataUrl || prev.customAudioDataUrl,
                  customAudioName: serverData.customAudioName || prev.customAudioName,
                  customVideoDataUrl: serverData.customVideoDataUrl || prev.customVideoDataUrl,
                  customVideoName: serverData.customVideoName || prev.customVideoName,
                  audioEffect: serverData.customAudioDataUrl ? 'custom' : (serverData.audioEffect || prev.audioEffect),
                  mediaMode: serverData.mediaMode || prev.mediaMode,
                };
              });
            }
          })
          .catch(() => {});
      } else {
        setVictimConfig(null);
      }
    };

    parseUrl();
    window.addEventListener('hashchange', parseUrl);
    return () => window.removeEventListener('hashchange', parseUrl);
  }, []);

  // If URL contains a prank link, render the victim view directly
  if (victimConfig) {
    return (
      <VictimPageView
        config={victimConfig}
        onExitToCreator={() => {
          window.location.hash = '';
          setVictimConfig(null);
        }}
      />
    );
  }

  // Otherwise, creator interface locked behind password gate
  if (!isUnlocked) {
    return <SecurityGate onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <CreatorDashboard
      onLock={() => setIsUnlocked(false)}
      onOpenDirectVictim={(config) => setVictimConfig(config)}
    />
  );
}
