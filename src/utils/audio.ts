/**
 * Sound synthesis and audio loop manager
 * Provides reliable, guaranteed sound using Web Audio API + custom audio playback
 */

import { AudioEffectType } from '../types';

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isPlayingSynth = false;
  private synthStopCallbacks: (() => void)[] = [];

  private getContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private currentAudioDataUrl: string | null = null;

  /**
   * Plays the selected audio effect or custom uploaded audio
   */
  public play(
    effectType: AudioEffectType,
    customAudioDataUrl?: string,
    loop = true
  ): void {
    // If custom audio data is present, ALWAYS prioritize and play the custom audio!
    if (customAudioDataUrl && customAudioDataUrl.trim() !== '') {
      this.playCustomAudio(customAudioDataUrl, loop);
      return;
    }

    if (effectType === 'custom') {
      if (customAudioDataUrl && customAudioDataUrl.trim() !== '') {
        this.playCustomAudio(customAudioDataUrl, loop);
      } else {
        console.warn('Custom audio selected but audio data is not yet available.');
      }
      return;
    }

    this.stop();

    // Play built-in sound effect (only if NOT custom)
    switch (effectType) {
      case 'rickroll_8bit':
        this.playRickrollSynth(loop);
        break;
      case 'funny_screamer':
        this.playFunnyScreamer(loop);
        break;
      case 'airhorn':
        this.playAirhornFanfare(loop);
        break;
      case 'party_horn':
        this.playPartyHorn(loop);
        break;
      case 'siren_glitch':
      default:
        this.playGlitchSiren(loop);
        break;
    }
  }

  /**
   * Plays custom uploaded audio file exclusively (zero background synth)
   */
  public playCustomAudio(dataUrl: string, loop = true): void {
    if (!dataUrl || dataUrl.trim() === '') return;

    // Stop any Web Audio API synthesis alarms immediately
    this.stopSynth();

    // If already playing this exact audio, keep it playing smoothly (do not destroy it)
    if (
      this.currentAudioElement &&
      this.currentAudioDataUrl === dataUrl &&
      !this.currentAudioElement.paused
    ) {
      this.currentAudioElement.loop = loop;
      return;
    }

    // Stop previous audio element if changing
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = '';
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    try {
      const audio = new Audio();
      audio.src = dataUrl;
      audio.loop = loop;
      audio.volume = 1.0;
      audio.preload = 'auto';

      this.currentAudioElement = audio;
      this.currentAudioDataUrl = dataUrl;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio autoplay blocked by browser policy. Will auto-play on first user touch:', err);
          const resumeAudio = () => {
            if (this.currentAudioElement) {
              this.currentAudioElement.play().catch((e) => console.error('Audio play error:', e));
            }
            window.removeEventListener('click', resumeAudio);
            window.removeEventListener('touchstart', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
          };
          window.addEventListener('click', resumeAudio, { once: true });
          window.addEventListener('touchstart', resumeAudio, { once: true });
          window.addEventListener('keydown', resumeAudio, { once: true });
        });
      }
    } catch (e) {
      console.error('Failed to play custom audio:', e);
    }
  }

  /**
   * Resume audio on user interaction if blocked
   */
  public resumeIfNeeded(): void {
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play().catch(() => {});
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  /**
   * Cyber Glitch Siren - Alternating harsh alarm with digital glitch beeps
   */
  private playGlitchSiren(loop = true) {
    const ctx = this.getContext();
    this.isPlayingSynth = true;

    let active = true;
    this.synthStopCallbacks.push(() => {
      active = false;
    });

    const runLoop = () => {
      if (!active) return;
      const now = ctx.currentTime;

      // Dual oscillator alarm
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // Pitch sweep up and down
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.7);

      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.linearRampToValueAtTime(660, now + 0.35);
      osc2.frequency.linearRampToValueAtTime(220, now + 0.7);

      // Gain envelope
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.setValueAtTime(0.28, now + 0.65);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.75);
      osc2.stop(now + 0.75);

      // Also trigger digital glitch blip
      setTimeout(() => {
        if (!active) return;
        this.triggerGlitchBlip(ctx);
      }, 350);

      if (loop && active) {
        setTimeout(() => {
          if (active) runLoop();
        }, 850);
      }
    };

    runLoop();
  }

  private triggerGlitchBlip(ctx: AudioContext) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200 + Math.random() * 800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * 8-Bit Rickroll Synthesizer ("Never Gonna Give You Up" chorus)
   */
  private playRickrollSynth(loop = true) {
    const ctx = this.getContext();
    this.isPlayingSynth = true;

    let active = true;
    this.synthStopCallbacks.push(() => {
      active = false;
    });

    // Rickroll melody notes (frequencies in Hz and durations in seconds)
    // "Never gonna give you up, never gonna let you down..."
    const melody: [number, number][] = [
      [392.00, 0.2], // G4
      [440.00, 0.2], // A4
      [523.25, 0.2], // C5
      [440.00, 0.2], // A4
      [659.25, 0.4], // E5
      [659.25, 0.35], // E5
      [587.33, 0.5], // D5
      [0, 0.15],     // rest
      [392.00, 0.2], // G4
      [440.00, 0.2], // A4
      [523.25, 0.2], // C5
      [440.00, 0.2], // A4
      [587.33, 0.4], // D5
      [587.33, 0.35], // D5
      [523.25, 0.5], // C5
      [0, 0.2],      // rest
      [392.00, 0.2], // G4
      [440.00, 0.2], // A4
      [523.25, 0.2], // C5
      [440.00, 0.2], // A4
      [523.25, 0.3], // C5
      [587.33, 0.25], // D5
      [493.88, 0.35], // B4
      [440.00, 0.35], // A4
      [392.00, 0.4], // G4
      [0, 0.4],
    ];

    const playSequence = () => {
      if (!active) return;
      let timeOffset = 0;

      melody.forEach(([freq, dur]) => {
        setTimeout(() => {
          if (!active) return;
          if (freq > 0) {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square'; // chiptune / 8-bit sound
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + dur * 0.9);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + dur);
          }
        }, timeOffset * 1000);
        timeOffset += dur;
      });

      if (loop && active) {
        setTimeout(() => {
          if (active) playSequence();
        }, (timeOffset + 0.3) * 1000);
      }
    };

    playSequence();
  }

  /**
   * Funny Screamer - goofy cartoon pitch wobble and scream
   */
  private playFunnyScreamer(loop = true) {
    const ctx = this.getContext();
    this.isPlayingSynth = true;

    let active = true;
    this.synthStopCallbacks.push(() => {
      active = false;
    });

    const run = () => {
      if (!active) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
      osc.frequency.linearRampToValueAtTime(600, now + 0.9);

      // Wobble
      lfo.frequency.setValueAtTime(18, now);
      lfoGain.gain.setValueAtTime(120, now);
      lfo.connect(osc.frequency);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);
      osc.stop(now + 1.2);
      lfo.stop(now + 1.2);

      if (loop && active) {
        setTimeout(() => {
          if (active) run();
        }, 1500);
      }
    };

    run();
  }

  /**
   * Airhorn Fanfare - Classic MLG / meme airhorn triple blast
   */
  private playAirhornFanfare(loop = true) {
    const ctx = this.getContext();
    let active = true;
    this.synthStopCallbacks.push(() => {
      active = false;
    });

    const playBlast = (time: number, dur = 0.18) => {
      if (!active) return;
      const baseFreqs = [466.16, 554.37, 622.25, 932.33]; // Bb chord
      baseFreqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.linearRampToValueAtTime(freq * 0.98, time + dur);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      });
    };

    const run = () => {
      if (!active) return;
      const now = ctx.currentTime;
      // 3 short blasts + 1 longer blast
      playBlast(now, 0.14);
      playBlast(now + 0.18, 0.14);
      playBlast(now + 0.36, 0.14);
      playBlast(now + 0.54, 0.45);

      if (loop && active) {
        setTimeout(() => {
          if (active) run();
        }, 1600);
      }
    };

    run();
  }

  /**
   * Party Horn / Kazoo Sound
   */
  private playPartyHorn(loop = true) {
    const ctx = this.getContext();
    let active = true;
    this.synthStopCallbacks.push(() => {
      active = false;
    });

    const run = () => {
      if (!active) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.3);
      osc.frequency.linearRampToValueAtTime(260, now + 0.7);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);

      if (loop && active) {
        setTimeout(() => {
          if (active) run();
        }, 1200);
      }
    };

    run();
  }

  /**
   * Stops Web Audio API synthesized sounds
   */
  public stopSynth(): void {
    this.isPlayingSynth = false;
    this.synthStopCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.warn('Error in synth stop callback:', e);
      }
    });
    this.synthStopCallbacks = [];

    // Also suspend AudioContext if running
    if (this.audioCtx && this.audioCtx.state === 'running') {
      try {
        this.audioCtx.suspend();
      } catch (e) {
        console.warn('Error suspending AudioContext:', e);
      }
    }
  }

  /**
   * Stops all playing sounds immediately
   */
  public stop(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
      this.currentAudioDataUrl = null;
    }

    this.stopSynth();
  }
}

export const soundEngine = new SoundEngine();
