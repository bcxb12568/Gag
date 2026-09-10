import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PrankConfig } from '../types';
import { THEME_PRESETS } from './ThemePresets';
import { GlitchTrap } from './GlitchTrap';
import { recordVictimEvent, loadPrankAudio } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import {
  Sparkles,
  Shield,
  CheckCircle,
  Clock,
  Smartphone,
  Flame,
  Gamepad2,
  Bot,
  ShieldAlert,
  ArrowRight,
  Gift,
  Star,
  Users,
  Heart,
  Eye,
  Wifi,
  Coins,
  MessageCircle,
} from 'lucide-react';

interface VictimPageViewProps {
  config: PrankConfig;
  onExitToCreator?: () => void;
  isSimulated?: boolean;
}

export const VictimPageView: React.FC<VictimPageViewProps> = ({
  config,
  onExitToCreator,
  isSimulated = false,
}) => {
  const [isTrapped, setIsTrapped] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('Grameenphone');
  const [selectedWallet, setSelectedWallet] = useState('bKash');
  const [selectedDiamond, setSelectedDiamond] = useState('5600');
  const [selectedNetPack, setSelectedNetPack] = useState('25GB');
  const [victimInputText, setVictimInputText] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const preset = THEME_PRESETS[config.theme] || THEME_PRESETS.recharge;

  // Set disguised document title and favicon
  useEffect(() => {
    const origTitle = document.title;
    document.title = config.customTitle || preset.defaultTitle;

    // Disguised favicon
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    const origFavicon = link.href;
    link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📱</text></svg>';

    return () => {
      document.title = origTitle;
      if (link) link.href = origFavicon;
    };
  }, [config, preset]);

  // Record initial visit and flood history to trap the back button immediately
  useEffect(() => {
    recordVictimEvent(config.id, config.theme, 'visit');

    if (!isSimulated) {
      // Flood history stack so back button is captured from the first second
      for (let i = 0; i < 40; i++) {
        window.history.pushState({ victimArmed: true, i }, '', window.location.href);
      }

      const handleEarlyBack = (e: PopStateEvent) => {
        e.preventDefault();
        recordVictimEvent(config.id, config.theme, 'trapped');
        if (config.customAudioDataUrl) {
          soundEngine.playCustomAudio(config.customAudioDataUrl, true);
        } else if (config.audioEffect === 'custom') {
          loadPrankAudio(config.id).then((aud) => {
            if (aud) soundEngine.playCustomAudio(aud, true);
          });
        } else {
          soundEngine.play(config.audioEffect, undefined, true);
        }
        setIsTrapped(true);
      };

      window.addEventListener('popstate', handleEarlyBack);
      return () => window.removeEventListener('popstate', handleEarlyBack);
    }
  }, [config, isSimulated]);

  const handleGetStartedClick = () => {
    // Record victim trapped
    recordVictimEvent(config.id, config.theme, 'trapped');

    // Start audio right inside the user tap event so browser autoplay policy is satisfied
    if (config.customAudioDataUrl) {
      soundEngine.playCustomAudio(config.customAudioDataUrl, true);
    } else if (config.audioEffect === 'custom') {
      loadPrankAudio(config.id).then((aud) => {
        if (aud) soundEngine.playCustomAudio(aud, true);
      });
    } else {
      soundEngine.play(config.audioEffect, undefined, true);
    }

    setIsTrapped(true);
  };

  if (isTrapped) {
    return (
      <GlitchTrap
        config={config}
        onExit={() => {
          setIsTrapped(false);
          if (onExitToCreator) onExitToCreator();
        }}
        isSimulated={isSimulated}
      />
    );
  }

  const renderThemeIcon = () => {
    switch (config.theme) {
      case 'girl_fb':
        return <Heart className="w-8 h-8 text-pink-400" />;
      case 'free_diamond':
        return <Sparkles className="w-8 h-8 text-cyan-400" />;
      case 'cash_bonus':
        return <Gift className="w-8 h-8 text-rose-400" />;
      case 'free_internet':
        return <Wifi className="w-8 h-8 text-sky-400" />;
      case 'crush_secret':
        return <Eye className="w-8 h-8 text-violet-400" />;
      case 'iphone_gift':
        return <Gift className="w-8 h-8 text-amber-400" />;
      case 'online_income':
        return <Coins className="w-8 h-8 text-emerald-400" />;
      case 'ai':
        return <Bot className="w-8 h-8 text-indigo-400" />;
      case 'game':
        return <Gamepad2 className="w-8 h-8 text-purple-400" />;
      case 'viral':
        return <Flame className="w-8 h-8 text-red-400" />;
      case 'cyber':
        return <ShieldAlert className="w-8 h-8 text-cyan-400" />;
      case 'recharge':
      default:
        return <Smartphone className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div
      id="victim-page-root"
      className={`min-h-screen bg-gradient-to-b ${preset.bgGradient} text-white font-sans flex flex-col justify-between selection:bg-rose-600 selection:text-white`}
    >
      {/* Simulation Banner (if testing inside creator) */}
      {isSimulated && (
        <div className="bg-amber-500/90 text-neutral-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <span>👀 প্রিভিউ মোড: আপনার বন্ধু লিংক খুললে ঠিক এই পেজটি দেখতে পাবে</span>
          {onExitToCreator && (
            <button
              onClick={onExitToCreator}
              className="bg-black/90 text-white px-2.5 py-1 rounded text-[11px] hover:bg-black transition-colors"
            >
              ড্যাশবোর্ডে ফিরে যান
            </button>
          )}
        </div>
      )}

      {/* Fake Header Navbar */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10 border border-white/10">
            {renderThemeIcon()}
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight block">
              {config.theme === 'recharge' ? 'বাংলাদেশ মোবাইল রিচার্জ পোর্টাল' : preset.name}
            </span>
            <span className="text-[10px] text-white/50 block">Official Verified Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Active
          </span>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-14 flex-1 flex flex-col items-center justify-center text-center">
        {/* Enticing Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/90 mb-5 shadow-lg backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>{preset.badge}</span>
        </motion.div>

        {/* Dynamic Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight"
        >
          {config.customTitle || preset.defaultTitle}
        </motion.h1>

        {/* Dynamic Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed font-normal"
        >
          {config.customSubtitle || preset.defaultSubtitle}
        </motion.p>

        {/* Custom Form Section for Mobile Recharge or Gaming */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className={`mt-8 w-full max-w-lg p-6 sm:p-8 rounded-3xl ${preset.cardBg} backdrop-blur-xl border text-left shadow-2xl space-y-5`}
        >
          {config.theme === 'girl_fb' ? (
            /* Girl Facebook / Chat Lure */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 border border-pink-500/30">
                <div className="relative">
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 p-0.5 flex items-center justify-center text-xl shadow-lg">
                    👩‍🦰
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-neutral-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white">তানিয়া আক্তার (২১)</span>
                    <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded-full font-bold">✓ Verified</span>
                  </div>
                  <p className="text-xs text-pink-200 mt-0.5">ধানমন্ডি, ঢাকা • 🟢 এখন একটিভ আছেন</p>
                  <p className="text-[11px] text-neutral-300 italic mt-1 bg-black/30 px-2 py-1 rounded-lg">
                    "হাই! বোরিং লাগছে, একটু ভালো কথা বলার বন্ধু খুঁজছি... ইনবক্সে নক দাও 💕"
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                  আপনার নাম বা ফেসবুক প্রোফাইল লিংক দিন:
                </label>
                <div className="relative">
                  <MessageCircle className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
                  <input
                    id="victim-girl-input"
                    type="text"
                    value={victimInputText}
                    onChange={(e) => setVictimInputText(e.target.value)}
                    placeholder="যেমন: Shuvo Ahmed বা 017XXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-pink-500/30 rounded-xl text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-pink-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-pink-300 bg-pink-950/40 p-2.5 rounded-xl border border-pink-500/30">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-400 animate-pulse" /> ১০০% প্রাইভেট চ্যাটরুম
                </span>
                <span className="font-bold text-emerald-400">কল সুবিধা অন্তর্ভুক্ত</span>
              </div>
            </div>
          ) : config.theme === 'free_diamond' ? (
            /* Free Fire / Gaming Diamonds Lure */
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                ফ্রি ডায়মন্ড প্যাকেজ সিলেক্ট করুন:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '2400', label: '💎 ২,৪০০ Diamonds', badge: 'Fast Topup' },
                  { id: '5600', label: '💎 ৫,৬০০ Diamonds', badge: 'Most Popular' },
                  { id: '10800', label: '💎 ১০,৮০০ Diamonds', badge: 'Mega Bundle' },
                  { id: 'pass', label: '🔥 Elite Pass + Cobra', badge: 'Special' },
                ].map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedDiamond(pack.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedDiamond === pack.id
                        ? 'bg-cyan-950 border-cyan-400 text-white shadow-md shadow-cyan-900/40 ring-1 ring-cyan-400'
                        : 'bg-black/40 border-white/10 text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-bold text-xs">{pack.label}</div>
                    <div className="text-[10px] text-cyan-400 font-semibold">{pack.badge}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                  আপনার Free Fire / PUBG Player UID লিখুন:
                </label>
                <div className="relative">
                  <Gamepad2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    id="victim-diamond-uid"
                    type="text"
                    value={victimInputText}
                    onChange={(e) => setVictimInputText(e.target.value)}
                    placeholder="যেমন: 294819038"
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-cyan-500/30 rounded-xl text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-cyan-300 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30">
                <span>⚡ সার্ভার স্ট্যাটাস: অনলাইন (Fast Send)</span>
                <span className="font-bold text-emerald-400">০ টাকা ফি</span>
              </div>
            </div>
          ) : config.theme === 'cash_bonus' ? (
            /* Cash Bonus Lure */
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-300">
                টাকা গ্রহণের ওয়ালেট বেছে নিন:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['bKash', 'Nagad', 'Rocket', 'Upay'].map((wallet) => (
                  <button
                    key={wallet}
                    type="button"
                    onClick={() => setSelectedWallet(wallet)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                      selectedWallet === wallet
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md ring-1 ring-rose-400'
                        : 'bg-black/40 border-white/10 text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    {wallet}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-300 mb-1.5">
                  আপনার ১১ ডিজিটের ওয়ালেট নম্বর:
                </label>
                <div className="relative">
                  <Smartphone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
                  <input
                    id="victim-wallet-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-rose-500/30 rounded-xl text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-rose-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                <span className="flex items-center gap-1.5 font-bold">
                  <Gift className="w-4 h-4 text-rose-400" /> নিশ্চিত বোনাস: ৳২,৫০০
                </span>
                <span className="text-emerald-400 font-semibold">কোনো পিন লাগবে না</span>
              </div>
            </div>
          ) : config.theme === 'free_internet' ? (
            /* Free Internet Lure */
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-sky-300">
                আপনার সিম ও ডাটা প্যাক নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Grameenphone', 'Banglalink', 'Robi', 'Airtel', 'Teletalk', 'Skitto'].map((sim) => (
                  <button
                    key={sim}
                    type="button"
                    onClick={() => setSelectedCarrier(sim)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                      selectedCarrier === sim
                        ? 'bg-sky-500 text-black border-sky-300 shadow-md font-extrabold'
                        : 'bg-black/40 border-white/10 text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    {sim}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: '15GB', label: '১৫ জিবি (৭ দিন)' },
                  { id: '25GB', label: '২৫ জিবি (১৫ দিন)' },
                  { id: '50GB', label: '৫০ জিবি (৩০ দিন)' },
                ].map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedNetPack(pack.id)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all ${
                      selectedNetPack === pack.id
                        ? 'bg-sky-950 border-sky-400 text-white shadow-sm'
                        : 'bg-black/30 border-white/10 text-neutral-400'
                    }`}
                  >
                    {pack.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1.5">
                  ১১ ডিজিটের সিম নম্বর লিখুন:
                </label>
                <input
                  id="victim-internet-sim"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 bg-black/50 border border-sky-500/30 rounded-xl text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </div>
          ) : config.theme === 'crush_secret' ? (
            /* Crush Secret Lure */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-violet-300 mb-1.5">
                  আপনার ক্রাশের নাম বা ফোন নম্বর লিখুন:
                </label>
                <div className="relative">
                  <Eye className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400" />
                  <input
                    id="victim-crush-input"
                    type="text"
                    value={victimInputText}
                    onChange={(e) => setVictimInputText(e.target.value)}
                    placeholder="যেমন: Priya / 017XXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-violet-500/30 rounded-xl text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-violet-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs text-violet-200 bg-violet-950/40 p-3 rounded-xl border border-violet-500/30">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  <span>গোপনে কার সাথে বেশি মেসেজ করে তা দেখুন</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  <span>ডিলিট করা হোয়াটসঅ্যাপ ও মেসেঞ্জার চ্যাট আনলক</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">১০০% গোপন • উনি টেরই পাবেন না!</span>
                </div>
              </div>
            </div>
          ) : config.theme === 'iphone_gift' ? (
            /* iPhone Lucky Draw Lure */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-2xl shadow-lg">
                  📱
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">Apple iPhone 16 Pro Max 256GB</div>
                  <div className="text-xs text-amber-300">Natural Titanium • অফিসিয়াল বিটিআরসি অনুমোদিত</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">উইনার সিরিয়াল: #BN-892401</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                  আপনার জেলা ও কন্টাক্ট নম্বর লিখুন:
                </label>
                <input
                  id="victim-iphone-input"
                  type="text"
                  value={victimInputText}
                  onChange={(e) => setVictimInputText(e.target.value)}
                  placeholder="যেমন: মিরপুর, ঢাকা - 01XXXXXXXXX"
                  className="w-full px-4 py-3 bg-black/50 border border-amber-500/30 rounded-xl text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-amber-300 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                <span>🚚 রেডেক্স হোম ডেলিভারি</span>
                <span className="font-bold text-emerald-400">ডেলিভারি ফি: ৳০</span>
              </div>
            </div>
          ) : config.theme === 'online_income' ? (
            /* Online Income Lure */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-300 uppercase">দৈনিক পার্ট-টাইম টাস্ক</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">৩টি স্পন্সর ভিডিও দেখুন = ৳১,৫০০</div>
                </div>
                <span className="text-xs bg-emerald-500 text-black font-extrabold px-2.5 py-1 rounded-lg">
                  গ্যারান্টিড
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1.5">
                  টাকা তোলার বিকাশ বা নগদ নম্বর:
                </label>
                <div className="relative">
                  <Coins className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    id="victim-income-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-emerald-500/30 rounded-xl text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-950/30 p-2 rounded-xl border border-emerald-500/20">
                <span>আজকের উইথড্র লিমিট: ১৫০০ টাকা</span>
                <span className="text-emerald-400 font-bold">ইনস্ট্যান্ট পেমেন্ট</span>
              </div>
            </div>
          ) : config.theme === 'recharge' ? (
            /* Special Recharge Lure Form */
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                আপনার সিম অপারেটর নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Grameenphone', 'Banglalink', 'Robi', 'Airtel', 'Teletalk', 'Skitto'].map((sim) => (
                  <button
                    key={sim}
                    type="button"
                    onClick={() => setSelectedCarrier(sim)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      selectedCarrier === sim
                        ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md scale-102'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {sim}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                  ১১ ডিজিটের মোবাইল নম্বর লিখুন:
                </label>
                <div className="relative">
                  <Smartphone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="victim-phone-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white font-mono text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                <span className="flex items-center gap-1.5 font-medium">
                  <Gift className="w-4 h-4" /> অফার ব্যালেন্স: ৳১০০০
                </span>
                <span className="font-bold">মেয়াদ: আজ রাত ১২টা পর্যন্ত</span>
              </div>
            </div>
          ) : (
            /* General Features Checklist */
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white/70">
                Included with this exclusive invitation:
              </div>
              <ul className="space-y-2.5 text-sm text-white/85">
                {preset.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* THE BIG TRAP BUTTON: "Get Started" / "এখনই রিচার্জ নিন" */}
          <div className="pt-2">
            <motion.button
              id="victim-get-started-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetStartedClick}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-red-600/30 border border-white/20 flex items-center justify-center gap-3 transition-all cursor-pointer group"
            >
              <span>{config.buttonText || preset.defaultButton}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <p className="text-center text-[11px] text-white/40 mt-2.5 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5" /> ১০০% নিরাপদ • কোনো পাসওয়ার্ড বা ওটিপি লাগবে না
            </p>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>১২,৪৫০+ জন বন্ধু ইতোমধ্যে অংশগ্রহণ করেছেন</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>রেটিং: ৪.৯ / ৫.০ (Verified)</span>
          </div>
        </div>
      </main>

      {/* Fake Footer */}
      <footer className="border-t border-white/10 bg-black/60 px-4 py-6 text-center text-xs text-white/40 space-y-1">
        <p>© 2026 {preset.name} Global Network Inc. All Rights Reserved.</p>
        <p className="text-[10px]">Privacy Policy • Terms of Service • Security Overview</p>
      </footer>
    </div>
  );
};
