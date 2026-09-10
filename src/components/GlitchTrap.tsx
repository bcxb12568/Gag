import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { PrankConfig } from '../types';
import { soundEngine } from '../utils/audio';
import { recordVictimEvent, loadPrankAudio, loadPrankVideo } from '../utils/storage';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  X,
  Skull,
  Terminal,
  Clock,
  Sparkles,
  Maximize,
  Smile,
  ShieldCheck,
  Music,
  Video,
} from 'lucide-react';

interface GlitchTrapProps {
  config: PrankConfig;
  onExit?: () => void;
  isSimulated?: boolean;
}

const FAKE_SYSTEM_LOGS = [
  'KERNEL PANIC: Unhandled MEME_EXCEPTION at 0x7FFF0042',
  'OVERCLOCKING CPU TO 9.8 GHz... COOLING FANS FAILING!',
  'SCANNING BROWSER HISTORY... 420 FUNNY CAT VIDEOS FOUND',
  'DOWNLOADING ULTRA_TROLL_VIRUS_V9.EXE [██████████] 100%',
  'DISPATCHING PRANK ALERT TO NASA & LOCAL PIZZA SHOP...',
  'WARNING: SYSTEM TEMPERATURE REACHED 102°C 🔥',
  'ENCRYPTING SCREEN WITH NEON MATRIX PARTICLES...',
  'ATTEMPTING BACK-BUTTON OVERRIDE... INTERCEPTED!',
  'BRIGHTNESS FORCED TO 100% FOR MAXIMUM MEME CONTRAST',
  'SYNCING WITH SATELLITE... READY FOR FINAL REVEAL...',
];

export const GlitchTrap: React.FC<GlitchTrapProps> = ({ config, onExit, isSimulated = false }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(config.countdownDuration || 180);
  const [isMuted, setIsMuted] = useState(false);
  const [isTrollRevealed, setIsTrollRevealed] = useState(false);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [glitchShake, setGlitchShake] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [backAttemptAlert, setBackAttemptAlert] = useState(false);
  const [showAnrDialog, setShowAnrDialog] = useState(false);
  const [secretTaps, setSecretTaps] = useState(0);
  const [isScreenFrozenLag, setIsScreenFrozenLag] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(config.customVideoDataUrl || null);
  const hasTriggeredMemeRef = useRef(false);
  const lastTapRef = useRef<number>(0);

  // Request fullscreen if permissible and not in preview simulator
  useEffect(() => {
    if (!isSimulated && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // User/browser may block auto-fullscreen without gesture
      });
    }

    // Load custom video if not already populated
    if (!videoSrc) {
      loadPrankVideo(config.id).then((v) => {
        if (v) setVideoSrc(v);
      });
    }

    // Start playing audio loop:
    if (config.customAudioDataUrl) {
      soundEngine.playCustomAudio(config.customAudioDataUrl, true);
    } else if (config.audioEffect === 'custom') {
      loadPrankAudio(config.id).then((audioData) => {
        if (audioData) {
          soundEngine.playCustomAudio(audioData, true);
        }
      });
    } else {
      soundEngine.play(config.audioEffect, undefined, true);
    }

    // Audio gesture unlock for strict browser autoplay
    const unlockAudio = () => {
      soundEngine.resumeIfNeeded();
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // ================= AGGRESSIVE ANTI-BACK & PHONE HANG TRAP =================
    // 1. Flood history with 50 states to trap back gestures
    for (let i = 0; i < 50; i++) {
      window.history.pushState({ lockedTrap: true, step: i }, '', window.location.href);
    }

    // 2. Intercept popstate (Back button / swipe back gesture)
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Re-flood history forward immediately so back doesn't escape
      for (let i = 0; i < 30; i++) {
        window.history.pushState({ lockedTrap: true, step: i }, '', window.location.href);
      }
      window.history.forward();

      // Trigger heavy haptic phone vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([400, 150, 400, 150, 800, 200, 1000]);
      }

      // Show simulated system deadlock / freeze ANR dialog
      setShowAnrDialog(true);
      setBackAttemptAlert(true);
      setIsScreenFrozenLag(true);
      setTimeout(() => setBackAttemptAlert(false), 3500);
      setTimeout(() => setIsScreenFrozenLag(false), 2000);
    };

    window.addEventListener('popstate', handlePopState);

    // 3. BeforeUnload lock
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'সিস্টেম প্রসেস লক অবস্থায় আছে!';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      soundEngine.stop();
    };
  }, [config, isSimulated]);

  // Handle countdown timer
  useEffect(() => {
    if (isTrollRevealed) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerMemeReveal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTrollRevealed]);

  // Rotate fake logs
  useEffect(() => {
    const logTimer = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % FAKE_SYSTEM_LOGS.length);
    }, 1400);

    // Random glitch flickers
    const shakeTimer = setInterval(() => {
      setGlitchShake((prev) => !prev);
    }, 280);

    return () => {
      clearInterval(logTimer);
      clearInterval(shakeTimer);
    };
  }, []);

  const triggerMemeReveal = () => {
    if (hasTriggeredMemeRef.current) return;
    hasTriggeredMemeRef.current = true;
    setIsTrollRevealed(true);

    // Record reveal in tracker
    recordVictimEvent(config.id, config.theme, 'troll_revealed');

    // Confetti celebration!
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'],
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      if (config.customAudioDataUrl) {
        soundEngine.playCustomAudio(config.customAudioDataUrl, true);
      } else if (config.audioEffect === 'custom') {
        loadPrankAudio(config.id).then((aud) => {
          if (aud) soundEngine.playCustomAudio(aud, true);
        });
      } else {
        soundEngine.play(config.audioEffect, undefined, true);
      }
      setIsMuted(false);
    } else {
      soundEngine.stop();
      setIsMuted(true);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExit = () => {
    soundEngine.stop();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    if (isSimulated) {
      if (onExit) onExit();
    } else {
      // In real victim mode, redirect cleanly away so victim never sees creator gate
      window.location.href = 'https://www.google.com';
    }
  };

  return (
    <div
      id="glitch-trap-container"
      className={`fixed inset-0 z-50 overflow-hidden bg-black font-mono select-none flex flex-col justify-between overscroll-none touch-none ${
        isScreenFrozenLag ? 'animate-pulse' : ''
      }`}
    >
      {/* Red-black digital glitch background scanlines and noise */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/60 via-black to-black" />
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255, 0, 0, 0.15) 0px, rgba(255, 0, 0, 0.15) 2px, transparent 2px, transparent 4px)',
        }}
      />

      {/* Floating Back Button Trap Warning Banner */}
      <AnimatePresence>
        {backAttemptAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black px-5 py-3 rounded-xl font-bold flex items-center gap-3 shadow-2xl border-2 border-white"
          >
            <AlertTriangle className="w-6 h-6 animate-bounce text-red-950" />
            <span>⚠️ পালানোর চেষ্টা ব্যর্থ! ব্যাক বাটন লক আছে! অপেক্ষা করুন... 😈</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Controls Bar */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-6 bg-black/60 backdrop-blur-md border-b border-red-900/50">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-red-500 font-bold text-xs sm:text-sm tracking-wider uppercase">
            LIVE CRITICAL EXCEPTION
          </span>
        </div>

        <div className="flex items-center gap-2">
          {videoSrc && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-mono font-semibold">
              <Video className="w-3 h-3 text-rose-400" />
              ডাইরেক্ট ভিডিও
            </span>
          )}

          {config.audioEffect === 'custom' && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-mono font-semibold">
              <Music className="w-3 h-3 text-emerald-400" />
              কাস্টম অডিও
            </span>
          )}

          {/* Audio toggle button */}
          <button
            id="trap-audio-toggle-btn"
            onClick={toggleMute}
            className="p-2.5 rounded-lg bg-neutral-900/90 text-neutral-200 hover:text-white border border-neutral-700/80 hover:border-red-500 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title={isMuted ? 'সাউন্ড আনমিউট করুন' : 'সাউন্ড মিউট করুন'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
            <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Audio On'}</span>
          </button>

          {/* Quick reveal and Exit button ONLY in Simulated Preview Mode */}
          {isSimulated && (
            <>
              {!isTrollRevealed && (
                <button
                  id="trap-instant-reveal-btn"
                  onClick={triggerMemeReveal}
                  className="px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Reveal Meme</span>
                </button>
              )}
              <button
                id="trap-exit-btn"
                onClick={() => setShowExitConfirm(true)}
                className="p-2.5 rounded-lg bg-neutral-900/90 hover:bg-red-950 text-neutral-400 hover:text-red-300 border border-neutral-800 transition-colors cursor-pointer"
                title="Exit Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Glitch Body OR Troll Meme Body */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        {!isTrollRevealed ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: glitchShake ? [-2, 3, -1, 2, 0] : [1, -2, 2, -1, 0],
            }}
            transition={{ duration: 0.2 }}
            className="max-w-xl w-full text-center space-y-6"
          >
            {/* Pulsing Glitch Skull Icon (Secret 5-tap for creator instant unlock) */}
            <div
              onClick={() => {
                const now = Date.now();
                if (now - lastTapRef.current < 600) {
                  const next = secretTaps + 1;
                  setSecretTaps(next);
                  if (next >= 5) {
                    triggerMemeReveal();
                  }
                } else {
                  setSecretTaps(1);
                }
                lastTapRef.current = now;
              }}
              className="inline-flex items-center justify-center p-6 rounded-2xl bg-red-950/40 border-2 border-red-600/80 shadow-[0_0_50px_rgba(239,68,68,0.4)] cursor-pointer active:scale-95 transition-transform"
              title="Touch screen"
            >
              <Skull className="w-20 h-20 sm:w-24 sm:h-24 text-red-500 animate-pulse" />
            </div>

            {/* Warning Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-red-500 tracking-tight drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                ⚠️ CRITICAL SYSTEM GLITCH
              </h1>
              <p className="text-red-300/80 text-sm sm:text-base font-sans">
                {config.customTitle
                  ? `"${config.customTitle}" লিংকে অপ্রত্যাশিত এরর সৃষ্টি হয়েছে!`
                  : 'ডিভাইস বাফার ওভারফ্লো এবং স্ক্রিন ফ্রিজ শুরু হয়েছে!'}
              </p>
            </div>

            {/* Direct Prank Video Player (if provided) */}
            {videoSrc && (
              <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.4)] bg-black relative my-2">
                <video
                  src={videoSrc}
                  autoPlay
                  loop
                  playsInline
                  muted={Boolean(config.customAudioDataUrl) || config.audioEffect !== 'custom'}
                  className="w-full max-h-64 sm:max-h-80 object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>DIRECT PRANK VIDEO</span>
                </div>
              </div>
            )}

            {/* Big Countdown Clock */}
            <div className="p-6 rounded-2xl bg-neutral-950/90 border border-red-500/50 shadow-2xl inline-block w-full max-w-sm">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-red-400 font-bold mb-2">
                <Clock className="w-4 h-4 animate-spin text-red-400" />
                <span>SYSTEM PURGE COUNTDOWN</span>
              </div>
              <div className="text-5xl sm:text-6xl font-black tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">
                {formatTimer(secondsRemaining)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-sans">
                কাউন্টডাউন শেষ না হওয়া পর্যন্ত ব্যাক করবেন না
              </p>
            </div>

            {/* Rolling Terminal Output */}
            <div className="p-4 rounded-xl bg-neutral-950/95 border border-red-900/60 text-left text-xs text-red-400 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2 text-neutral-500 border-b border-neutral-800 pb-2 mb-2">
                <Terminal className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold uppercase tracking-wider text-[10px]">Active Terminal Stream</span>
              </div>
              <p className="text-neutral-300 font-bold">&gt; {FAKE_SYSTEM_LOGS[activeLogIndex]}</p>
              <p className="text-neutral-500 truncate">&gt; {FAKE_SYSTEM_LOGS[(activeLogIndex + 1) % FAKE_SYSTEM_LOGS.length]}</p>
            </div>

            <p className="text-xs text-neutral-500 font-sans">
              কাউন্টডাউন শেষ হলে স্বয়ংক্রিয়ভাবে আসল মেসেজ প্রকাশ পাবে।
            </p>
          </motion.div>
        ) : (
          /* Troll Meme Screen */
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="max-w-xl w-full bg-neutral-900/90 p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.3)] text-center space-y-6"
          >
            {/* Laughing Troll Face Visual */}
            <div className="relative inline-block">
              <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-6xl sm:text-7xl shadow-xl shadow-yellow-500/30 border-4 border-white animate-bounce">
                😂
              </div>
              <div className="absolute -top-2 -right-2 px-3 py-1 bg-red-600 text-white font-black text-xs rounded-full uppercase tracking-wider animate-pulse shadow-lg">
                RICKROLLED!
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
                আরে ভাই! আপনি ট্রোল হয়েছেন! 🤣
              </h2>
              <p className="text-emerald-400 font-semibold text-lg font-sans">
                {config.memeMessage || 'হাসিমুখে মেনে নিন! এটা আপনার বন্ধুর বানানো একটি মজার প্র্যাঙ্ক ছিল!'}
              </p>
              <p className="text-neutral-300 text-sm font-sans max-w-md mx-auto">
                আপনার ডিভাইসের কোনো ক্ষতি হয়নি। কোনো ফাইল নষ্ট বা চুরি হয়নি। বন্ধুকে ফোন দিয়ে একটা জোর হাসির ইমোজি পাঠান!
              </p>
            </div>

            {/* Troll Meme Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-left">
                <span className="text-[11px] text-neutral-400 block font-sans">ফেক থিম ব্যবহৃত:</span>
                <span className="text-sm font-bold text-white capitalize">{config.theme} Prank</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-left">
                <span className="text-[11px] text-neutral-400 block font-sans">ট্র্যাপে পড়ার সময়:</span>
                <span className="text-sm font-bold text-emerald-400">{config.countdownDuration} সেকেন্ডস</span>
              </div>
            </div>

            {/* Exit Prank Button */}
            <div className="pt-2">
              <button
                id="prank-close-final-btn"
                onClick={handleExit}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-base font-sans transition-transform active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-neutral-950" />
                <span>হাসিমুখে প্র্যাঙ্ক বন্ধ করুন (Exit Safe)</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-20 p-3 text-center text-[11px] text-neutral-500 border-t border-neutral-900 bg-black/80 font-mono">
        <span>{isTrollRevealed ? 'Harmless Prank Joke • No Data Collected' : 'SYSTEM HARDWARE WATCHDOG: CORE DEADLOCK PROTECTION ACTIVE'}</span>
      </div>

      {/* Simulated Android System UI ANR Dialog */}
      <AnimatePresence>
        {showAnrDialog && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#2a2d32] border border-neutral-700 text-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">System UI isn't responding</h3>
                  <p className="text-xs text-neutral-400 font-mono">com.android.systemui</p>
                </div>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                ডিভাইসটি বর্তমানে হ্যাং অবস্থায় আছে। টাচ এবং ব্যাক বাটন রেসপন্স করছে না।
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnrDialog(false);
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate([300, 100, 500]);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Wait (অপেক্ষা করুন)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnrDialog(false);
                    setBackAttemptAlert(true);
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate([500, 150, 700]);
                    }
                    setTimeout(() => setBackAttemptAlert(false), 3000);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  Close App
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-700 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <Smile className="w-12 h-12 text-yellow-400 mx-auto" />
              <h3 className="text-lg font-bold text-white font-sans">প্র্যাঙ্ক বন্ধ করতে চান?</h3>
              <p className="text-xs text-neutral-400 font-sans">
                অডিও এবং স্ক্রিন ফ্রিজ এখনই থেমে যাবে।
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                >
                  চালিয়ে রাখুন
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500"
                >
                  হ্যাঁ, বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
