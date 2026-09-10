import { PrankConfig } from '../types';
import { THEME_PRESETS } from '../components/ThemePresets';

/**
 * Generates a 100% standalone, self-contained HTML website file.
 * This standalone website has ZERO connection to the Prank Hub website.
 * It contains:
 * 1. Realistic disguised portal UI (Mobile recharge, Gaming, etc.)
 * 2. Un-backable history loop (60x stack flooding, popstate interception)
 * 3. Aggressive Phone Hang / Freeze Simulator (System UI Not Responding dialog, haptic vibration)
 * 4. Embedded custom audio playback (zero glitch background synth if custom audio is used)
 * 5. Troll meme reveal after countdown
 */
export function generateStandalonePrankHtml(config: PrankConfig): string {
  const preset = THEME_PRESETS[config.theme] || THEME_PRESETS.recharge;
  const pageTitle = config.customTitle || preset.defaultTitle;
  const pageSubtitle = config.customSubtitle || preset.defaultSubtitle;
  const buttonLabel = config.buttonText || preset.defaultButton;
  const memeMsg = config.memeMessage || 'হাসিমুখে মেনে নিন! এটা আপনার বন্ধুর তৈরি নির্দোষ প্র্যাঙ্ক ছিল! 😂';
  const customAudioSrc = config.customAudioDataUrl || '';
  const customVideoSrc = config.customVideoDataUrl || '';
  const countdown = config.countdownDuration || 180;
  const themeEmoji = preset.emoji || '🎁';
  const portalHeader = preset.name || 'বাংলাদেশ ডিজিটাল পোর্টাল';

  const renderLureFormHtml = () => {
    switch (config.theme) {
      case 'girl_fb':
        return `
        <div class="space-y-4">
          <div class="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 border border-pink-500/30">
            <div class="w-13 h-13 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 p-0.5 flex items-center justify-center text-2xl shadow-lg">
              👩‍🦰
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-sm text-white">তানিয়া আক্তার (২১)</span>
                <span class="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded-full font-bold">✓ Verified</span>
              </div>
              <p class="text-xs text-pink-200 mt-0.5">ধানমন্ডি, ঢাকা • 🟢 এখন একটিভ আছেন</p>
              <p class="text-[11px] text-neutral-300 italic mt-1 bg-black/30 px-2 py-1 rounded-lg">
                "হাই! একটু ভালো কথা বলার মতো বন্ধু খুঁজছি... ইনবক্সে নক দাও 💕"
              </p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
              আপনার নাম বা মোবাইল নম্বর দিন:
            </label>
            <input type="text" placeholder="যেমন: Shuvo / 017XXXXXXXX" class="w-full px-4 py-3 bg-black/60 border border-pink-500/30 rounded-xl text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-pink-400">
          </div>

          <div class="flex items-center justify-between text-xs text-pink-300 bg-pink-950/40 p-2.5 rounded-xl border border-pink-500/30">
            <span>🔒 ১০০% প্রাইভেট চ্যাটরুম</span>
            <span class="font-bold text-emerald-400">কল সুবিধা অন</span>
          </div>

          <button id="trapTriggerBtn" type="button" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-base shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform">
            <span>${escapeHtml(buttonLabel)}</span>
            <span>➔</span>
          </button>
        </div>`;

      case 'free_diamond':
        return `
        <div class="space-y-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-cyan-300">
            ডায়মন্ড অফার প্যাক সিলেক্ট করুন:
          </label>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-2.5 rounded-xl border bg-cyan-950/80 border-cyan-400 text-white shadow-sm font-bold text-xs">💎 ৫,৬০০ Diamonds</div>
            <div class="p-2.5 rounded-xl border bg-black/40 border-white/10 text-neutral-300 font-bold text-xs">💎 ১০,৮০০ Diamonds</div>
            <div class="p-2.5 rounded-xl border bg-black/40 border-white/10 text-neutral-300 font-bold text-xs">🔥 Elite Pass Bundle</div>
            <div class="p-2.5 rounded-xl border bg-black/40 border-white/10 text-neutral-300 font-bold text-xs">💎 ২৫,০০০ Diamonds</div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
              আপনার Free Fire / PUBG Player UID লিখুন:
            </label>
            <input type="text" placeholder="যেমন: 294819038" class="w-full px-4 py-3 bg-black/60 border border-cyan-500/30 rounded-xl text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400">
          </div>

          <div class="flex items-center justify-between text-xs text-cyan-300 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30">
            <span>⚡ সার্ভার স্ট্যাটাস: অনলাইন</span>
            <span class="font-bold text-emerald-400">০ টাকা ফি</span>
          </div>

          <button id="trapTriggerBtn" type="button" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-base shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform">
            <span>${escapeHtml(buttonLabel)}</span>
            <span>➔</span>
          </button>
        </div>`;

      case 'cash_bonus':
        return `
        <div class="space-y-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-rose-300">
            টাকা গ্রহণের ওয়ালেট বেছে নিন:
          </label>
          <div class="grid grid-cols-4 gap-2">
            <div class="py-2 px-1 text-xs font-bold rounded-xl border bg-rose-600 text-white border-rose-400 text-center">bKash</div>
            <div class="py-2 px-1 text-xs font-bold rounded-xl border bg-black/40 border-white/10 text-neutral-300 text-center">Nagad</div>
            <div class="py-2 px-1 text-xs font-bold rounded-xl border bg-black/40 border-white/10 text-neutral-300 text-center">Rocket</div>
            <div class="py-2 px-1 text-xs font-bold rounded-xl border bg-black/40 border-white/10 text-neutral-300 text-center">Upay</div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-rose-300 mb-1.5">
              আপনার ১১ ডিজিটের ওয়ালেট নম্বর:
            </label>
            <input type="tel" id="victimPhone" placeholder="01XXXXXXXXX" class="w-full px-4 py-3 bg-black/60 border border-rose-500/30 rounded-xl text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-rose-400">
          </div>

          <div class="flex items-center justify-between text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
            <span>🎁 নিশ্চিত ক্যাশ বোনাস: ৳২,৫০০</span>
            <span class="text-emerald-400 font-semibold">কোনো পিন লাগবে না</span>
          </div>

          <button id="trapTriggerBtn" type="button" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-base shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform">
            <span>${escapeHtml(buttonLabel)}</span>
            <span>➔</span>
          </button>
        </div>`;

      case 'recharge':
      default:
        return `
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              আপনার সিম অপারেটর নির্বাচন করুন:
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" class="sim-btn py-2 px-1 text-xs font-bold rounded-xl border bg-emerald-500 text-black border-emerald-400 text-center">Grameenphone</button>
              <button type="button" class="sim-btn py-2 px-1 text-xs font-bold rounded-xl border bg-white/5 border-white/10 text-white/80 text-center">Banglalink</button>
              <button type="button" class="sim-btn py-2 px-1 text-xs font-bold rounded-xl border bg-white/5 border-white/10 text-white/80 text-center">Robi</button>
              <button type="button" class="sim-btn py-2 px-1 text-xs font-bold rounded-xl border bg-white/5 border-white/10 text-white/80 text-center">Airtel</button>
              <button type="button" class="sim-btn py-2 px-1 text-xs font-bold rounded-xl border bg-white/5 border-white/10 text-white/80 text-center">Teletalk</button>
              <button type="button" class="sim-btn py-2 px-1 text-xs font-bold rounded-xl border bg-white/5 border-white/10 text-white/80 text-center">Skitto</button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              ১১ ডিজিটের মোবাইল নম্বর লিখুন:
            </label>
            <input type="tel" id="victimPhone" placeholder="01XXXXXXXXX" class="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400">
          </div>

          <div class="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
            <span>🎁 অফার ব্যালেন্স: ৳১০০০ রিচার্জ</span>
            <span class="font-bold">মেয়াদ: আজ রাত ১২টা পর্যন্ত</span>
          </div>

          <button id="trapTriggerBtn" type="button" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform">
            <span>${escapeHtml(buttonLabel)}</span>
            <span>➔</span>
          </button>
        </div>`;
    }
  };

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(pageSubtitle)}">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(pageSubtitle)}">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#09090b">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Outfit:wght@400;600;800&family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Hind Siliguri', 'Outfit', sans-serif;
      overscroll-behavior: none;
      -webkit-touch-callout: none;
    }
    .mono {
      font-family: 'Fira Code', monospace;
    }
    @keyframes screenJitter {
      0% { transform: translate(0, 0); }
      20% { transform: translate(-3px, 2px); }
      40% { transform: translate(3px, -2px); }
      60% { transform: translate(-2px, -3px); }
      80% { transform: translate(2px, 3px); }
      100% { transform: translate(0, 0); }
    }
    .jitter-active {
      animation: screenJitter 0.15s infinite;
    }
    .scanlines {
      background: repeating-linear-gradient(0deg, rgba(255, 0, 0, 0.12) 0px, rgba(255, 0, 0, 0.12) 2px, transparent 2px, transparent 4px);
    }
  </style>
</head>
<body class="bg-neutral-950 text-white select-none overflow-x-hidden">

  <!-- ================= LURE PHASE: DISGUISED INDEPENDENT PORTAL ================= -->
  <div id="lurePhase" class="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black flex flex-col justify-between">
    <!-- Official Fake Topbar -->
    <header class="border-b border-white/10 bg-black/50 backdrop-blur-md px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl">
          ${themeEmoji}
        </div>
        <div>
          <span class="font-bold text-sm sm:text-base tracking-tight block">${escapeHtml(portalHeader)}</span>
          <span class="text-[10px] text-emerald-400 block font-mono font-semibold">● SECURE SSL 256-BIT ENCRYPTED</span>
        </div>
      </div>
      <div class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
        Verified Active
      </div>
    </header>

    <!-- Main Lure Hero -->
    <main class="max-w-xl mx-auto w-full px-4 py-8 flex-1 flex flex-col items-center justify-center text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white/90 mb-4 shadow-sm">
        ${escapeHtml(preset.badge || '✨ সীমিত সময়ের বিশেষ মেগা অফার')}
      </div>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
        ${escapeHtml(pageTitle)}
      </h1>

      <p class="mt-3 text-sm sm:text-base text-neutral-300 max-w-md font-normal">
        ${escapeHtml(pageSubtitle)}
      </p>

      <!-- Disguised Input Box -->
      <div class="mt-6 w-full p-6 rounded-3xl bg-neutral-900/90 border border-white/10 text-left shadow-2xl space-y-4">
        ${renderLureFormHtml()}
      </div>

      <div class="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-400">
        <span>⭐ রেটিং: ৪.৯/৫ (Verified)</span>
        <span>•</span>
        <span>👥 ১২,৫০০+ জন সফলভাবে গ্রহণ করেছেন</span>
      </div>
    </main>

    <footer class="border-t border-white/10 bg-black/60 px-4 py-4 text-center text-xs text-neutral-500">
      <p>© 2026 Bangladesh Telecom Services • National Digital Portal</p>
    </footer>
  </div>

  <!-- ================= GLITCH TRAP & PHONE HANG PHASE ================= -->
  <div id="trapPhase" class="fixed inset-0 z-50 bg-black mono select-none hidden flex flex-col justify-between overflow-hidden">
    <div class="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/70 via-black to-black"></div>
    <div class="absolute inset-0 pointer-events-none scanlines opacity-25"></div>

    <!-- Live Top Status Alert -->
    <div class="relative z-20 flex items-center justify-between p-4 bg-black/70 border-b border-red-900/60">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
        <span class="text-red-500 font-bold text-xs uppercase tracking-wider">HARDWARE FAULT: MEMORY DEADLOCK</span>
      </div>
      <div class="text-xs text-red-400 font-bold">
        BATTERY 1% • CPU 100%
      </div>
    </div>

    <!-- Main Glitch Content -->
    <div id="glitchBody" class="relative z-10 flex-1 flex items-center justify-center p-4">
      <div class="max-w-md w-full text-center space-y-5">
        <div id="skullIcon" class="inline-flex p-6 rounded-2xl bg-red-950/50 border-2 border-red-600/80 shadow-[0_0_60px_rgba(239,68,68,0.5)] cursor-pointer">
          <span class="text-6xl animate-pulse">💀</span>
        </div>

        <div class="space-y-1">
          <h2 class="text-2xl sm:text-3xl font-black text-red-500 tracking-tight drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
            ⚠️ SYSTEM DEADLOCK FREEZE
          </h2>
          <p class="text-xs sm:text-sm text-red-300 font-sans">
            ডিভাইস বাফার ওভারফ্লো এবং টাচ ইনপুট নিয়ন্ত্রক হ্যাং হয়েছে!
          </p>
        </div>

        ${
          customVideoSrc
            ? `
        <!-- Embedded Prank Video -->
        <div class="rounded-2xl overflow-hidden border-2 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.5)] bg-black max-w-sm mx-auto my-2 relative">
          <video id="bgVideo" src="${customVideoSrc}" loop playsinline ${customAudioSrc ? 'muted' : ''} class="w-full max-h-56 object-cover"></video>
          <div class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500 text-red-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>PRANK VIDEO</span>
          </div>
        </div>
        `
            : ''
        }

        <!-- Big Countdown -->
        <div class="p-6 rounded-2xl bg-neutral-950/90 border border-red-500/60 shadow-2xl inline-block w-full">
          <div class="text-[11px] uppercase tracking-widest text-red-400 font-bold mb-1">
            CORE RESTORATION COUNTDOWN
          </div>
          <div id="timerDisplay" class="text-5xl font-black tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">
            03:00
          </div>
          <p class="text-[11px] text-neutral-400 mt-2 font-sans">
            কাউন্টডাউন চলাকালীন ব্যাক বাটন বা পাওয়ার বাটন চাপলে ডেটা সুরক্ষিত থাকবে না
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-neutral-950/90 border border-red-900/70 text-left text-xs text-red-400 space-y-1">
          <p id="liveLog" class="font-bold truncate">&gt; KERNEL_HALT: 0x8800FF12 - System UI deadlock</p>
          <p class="text-neutral-500 text-[11px]">&gt; Input queue blocked. Haptic engine pulsing...</p>
        </div>
      </div>
    </div>

    <!-- Troll Meme Phase (Revealed after timer or secret tap) -->
    <div id="memeBody" class="relative z-10 flex-1 items-center justify-center p-4 hidden">
      <div class="max-w-md w-full bg-neutral-900/95 p-6 rounded-3xl border-2 border-emerald-500/60 shadow-[0_0_60px_rgba(16,185,129,0.4)] text-center space-y-5">
        <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-5xl shadow-xl border-4 border-white animate-bounce">
          😂
        </div>
        <div class="space-y-2 font-sans">
          <h2 class="text-3xl font-extrabold text-white">
            আরে ভাই! ট্রোল হয়েছেন! 🤣
          </h2>
          <p class="text-emerald-400 font-bold text-base">
            ${escapeHtml(memeMsg)}
          </p>
          <p class="text-neutral-300 text-xs leading-relaxed">
            আপনার ফোনের কোনো ক্ষতি হয়নি! ফাইল বা মেমোরি ১০০% অক্ষত আছে। এটি শুধুই একটি মজার প্র্যাঙ্ক ছিল!
          </p>
        </div>

        <button id="finalExitBtn" type="button" class="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-base font-sans transition-all active:scale-95 shadow-lg shadow-emerald-500/30">
          হাসিমুখে প্র্যাঙ্ক বন্ধ করুন (Exit Safe)
        </button>
      </div>
    </div>

    <!-- Bottom Status Bar -->
    <div class="relative z-20 p-2.5 text-center text-[10px] text-neutral-600 border-t border-neutral-900 bg-black/90">
      SYSTEM STATUS: WATCHDOG ACTIVE • NO SIGNAL DROP
    </div>
  </div>

  <!-- ================= SIMULATED ANDROID "SYSTEM UI NOT RESPONDING" DIALOG ================= -->
  <div id="anrDialog" class="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm hidden items-center justify-center p-4 font-sans">
    <div class="bg-[#2d3033] border border-neutral-700 text-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
          ⚠️
        </div>
        <div>
          <h3 class="font-bold text-base text-white">System UI isn't responding</h3>
          <p class="text-xs text-neutral-400 font-mono">com.android.systemui</p>
        </div>
      </div>
      <p class="text-xs text-neutral-300 leading-relaxed">
        ডিভাইসটি বর্তমানে হ্যাং অবস্থায় আছে। প্রসেস রেসপন্স করছে না।
      </p>
      <div class="flex gap-2 pt-2">
        <button id="anrWaitBtn" type="button" class="flex-1 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-semibold">
          Wait (অপেক্ষা করুন)
        </button>
        <button id="anrCloseBtn" type="button" class="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold">
          Close App
        </button>
      </div>
    </div>
  </div>

  <!-- Audio Element -->
  ${
    customAudioSrc
      ? `<audio id="bgAudio" loop preload="auto" src="${customAudioSrc}"></audio>`
      : `<audio id="bgAudio"></audio>`
  }

  <!-- ================= SCRIPT: ANTI-BACK & PHONE FREEZE ENGINE ================= -->
  <script>
    (function() {
      let isTrapped = false;
      let secondsLeft = ${countdown};
      let secretTaps = 0;
      let lastTapTime = 0;
      const audioEl = document.getElementById('bgAudio');
      const hasCustomAudio = ${Boolean(customAudioSrc)};

      // 1. FLOOD HISTORY IMMEDIATELY ON LOAD TO PREVENT INITIAL BACK
      function floodHistory() {
        for (let i = 0; i < 50; i++) {
          window.history.pushState({ trap: true, idx: i }, '', window.location.href);
        }
      }
      floodHistory();

      // 2. UN-BACKABLE POPSTATE INTERCEPTOR
      window.addEventListener('popstate', function(e) {
        e.preventDefault();
        // Re-flood history forward immediately
        for (let i = 0; i < 30; i++) {
          window.history.pushState({ trap: true, step: i }, '', window.location.href);
        }
        window.history.forward();

        // Trigger phone vibration
        if (navigator.vibrate) {
          navigator.vibrate([400, 150, 400, 150, 800]);
        }

        // If not trapped yet, back button activates the trap!
        if (!isTrapped) {
          startTrap();
        } else {
          // Show simulated phone hang ANR dialog
          triggerAnr();
        }
      });

      // 3. BEFOREUNLOAD INTERCEPTION
      window.addEventListener('beforeunload', function(e) {
        e.preventDefault();
        e.returnValue = 'System recovery in progress. Stay on page.';
        return e.returnValue;
      });

      // 4. TRIGGER THE TRAP
      function startTrap() {
        if (isTrapped) return;
        isTrapped = true;

        document.getElementById('lurePhase').style.display = 'none';
        const trapEl = document.getElementById('trapPhase');
        trapEl.classList.remove('hidden');
        trapEl.classList.add('flex');

        // Request Fullscreen
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(function() {});
        }

        // Start Audio Playback
        playAudio();

        // Start Video Playback
        const videoEl = document.getElementById('bgVideo');
        if (videoEl) {
          videoEl.currentTime = 0;
          videoEl.play().catch(function() {});
        }

        // Start Countdown Timer
        startCountdown();

        // Screen Jitter lag effect
        document.body.classList.add('jitter-active');
        setTimeout(function() {
          document.body.classList.remove('jitter-active');
        }, 3000);

        // Heavy haptic vibration on phone
        if (navigator.vibrate) {
          navigator.vibrate([500, 200, 500, 200, 1000]);
        }
      }

      // Audio Playback Handler
      function playAudio() {
        if (hasCustomAudio && audioEl && audioEl.src) {
          audioEl.volume = 1.0;
          audioEl.currentTime = 0;
          audioEl.play().catch(function() {
            // Unlock on touch
            const unlock = function() {
              audioEl.play().catch(function() {});
              window.removeEventListener('click', unlock);
              window.removeEventListener('touchstart', unlock);
            };
            window.addEventListener('click', unlock, { once: true });
            window.addEventListener('touchstart', unlock, { once: true });
          });
        } else {
          // Built-in siren synth fallback
          playSynthSiren();
        }
      }

      // Keep custom audio & video playing across interactions
      window.addEventListener('click', function() {
        if (isTrapped && hasCustomAudio && audioEl && audioEl.paused) {
          audioEl.play().catch(function() {});
        }
        const vEl = document.getElementById('bgVideo');
        if (isTrapped && vEl && vEl.paused) {
          vEl.play().catch(function() {});
        }
      });
      window.addEventListener('touchstart', function() {
        if (isTrapped && hasCustomAudio && audioEl && audioEl.paused) {
          audioEl.play().catch(function() {});
        }
        const vEl = document.getElementById('bgVideo');
        if (isTrapped && vEl && vEl.paused) {
          vEl.play().catch(function() {});
        }
      });

      // Web Audio API Synth Siren
      function playSynthSiren() {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(450, ctx.currentTime);
          
          let up = true;
          setInterval(function() {
            const freq = up ? 880 : 350;
            osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.3);
            up = !up;
          }, 350);

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
        } catch(e) {}
      }

      // Countdown Timer
      function startCountdown() {
        const timerDisp = document.getElementById('timerDisplay');
        const interval = setInterval(function() {
          secondsLeft--;
          if (secondsLeft <= 0) {
            clearInterval(interval);
            revealMeme();
            return;
          }
          const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
          const s = (secondsLeft % 60).toString().padStart(2, '0');
          timerDisp.textContent = m + ':' + s;
        }, 1000);
      }

      // ANR (System UI Not Responding) Trigger
      function triggerAnr() {
        const dialog = document.getElementById('anrDialog');
        dialog.classList.remove('hidden');
        dialog.classList.add('flex');
        if (navigator.vibrate) {
          navigator.vibrate([300, 100, 300, 100, 600]);
        }
      }

      function dismissAnr() {
        const dialog = document.getElementById('anrDialog');
        dialog.classList.add('hidden');
        dialog.classList.remove('flex');
        // Jitter screen again
        document.body.classList.add('jitter-active');
        setTimeout(function() {
          document.body.classList.remove('jitter-active');
        }, 1500);
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 400]);
        }
      }

      // Reveal Meme
      function revealMeme() {
        document.getElementById('glitchBody').style.display = 'none';
        const memeEl = document.getElementById('memeBody');
        memeEl.classList.remove('hidden');
        memeEl.classList.add('flex');
        document.body.classList.remove('jitter-active');

        // Stop Audio
        if (audioEl) {
          audioEl.pause();
        }
      }

      // Secret Creator Tap on Skull to Reveal Instantly
      const skullEl = document.getElementById('skullIcon');
      if (skullEl) {
        skullEl.addEventListener('click', function() {
          const now = Date.now();
          if (now - lastTapTime < 600) {
            secretTaps++;
            if (secretTaps >= 5) {
              revealMeme();
            }
          } else {
            secretTaps = 1;
          }
          lastTapTime = now;
        });
      }

      // Event Listeners
      document.getElementById('trapTriggerBtn').addEventListener('click', startTrap);
      document.getElementById('anrWaitBtn').addEventListener('click', dismissAnr);
      document.getElementById('anrCloseBtn').addEventListener('click', dismissAnr);
      document.getElementById('finalExitBtn').addEventListener('click', function() {
        window.location.href = 'https://www.google.com';
      });

      // SIM Buttons toggle
      const simBtns = document.querySelectorAll('.sim-btn');
      simBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          simBtns.forEach(function(b) {
            b.className = 'sim-btn py-2 px-1 text-xs font-bold rounded-xl border bg-white/5 border-white/10 text-white/80 text-center';
          });
          btn.className = 'sim-btn py-2 px-1 text-xs font-bold rounded-xl border bg-emerald-500 text-black border-emerald-400 text-center';
        });
      });

    })();
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
