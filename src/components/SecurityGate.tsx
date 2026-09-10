import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Unlock,
  KeyRound,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  ShieldQuestion,
  ArrowLeft,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import {
  getCreatorPin,
  verifyCreatorPin,
  resetCreatorPinToDefault,
  saveCreatorPin,
  getSecurityQuestion,
  getSecurityAnswer,
  saveSecurityQuestionAndAnswer,
  verifySecurityAnswer,
  DEFAULT_SECURITY_QUESTIONS,
} from '../utils/storage';

interface SecurityGateProps {
  onUnlock: () => void;
}

type GateMode = 'unlock' | 'change_pin' | 'forgot_password';

export const SecurityGate: React.FC<SecurityGateProps> = ({ onUnlock }) => {
  const [mode, setMode] = useState<GateMode>('unlock');

  // Unlock state
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Change PIN state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showChangeFields, setShowChangeFields] = useState(false);

  // Security Question Settings state
  const [showSecQuestionConfig, setShowSecQuestionConfig] = useState(false);
  const [customQuestion, setCustomQuestion] = useState(getSecurityQuestion());
  const [customAnswer, setCustomAnswer] = useState('');

  // Forgot Password / Emergency Recovery state
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryNewPin, setRecoveryNewPin] = useState('');
  const [recoveryConfirmPin, setRecoveryConfirmPin] = useState('');

  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Normal login unlock
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCreatorPin(pinInput)) {
      setErrorMsg('');
      onUnlock();
    } else {
      setErrorMsg('ভুল পাসওয়ার্ড! নতুন পাসওয়ার্ড "1234" অথবা পূর্বের পাসওয়ার্ড দিয়ে চেষ্টা করুন।');
      setPinInput('');
    }
  };

  // Change PIN - accepts old PIN or master fallback '1234'
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!verifyCreatorPin(oldPin)) {
      setErrorMsg('পূর্বের পাসওয়ার্ড সঠিক নয়! সঠিক বর্তমান পাসওয়ার্ড অথবা "1234" দিন।');
      return;
    }

    if (newPin.length < 4) {
      setErrorMsg('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('নতুন পাসওয়ার্ড দুইটি মিলছে না!');
      return;
    }

    // If user also updated security question
    if (showSecQuestionConfig && customAnswer.trim()) {
      saveSecurityQuestionAndAnswer(customQuestion, customAnswer.trim());
    }

    saveCreatorPin(newPin);
    setSuccessNotice('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
    setErrorMsg('');
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setCustomAnswer('');
    setShowSecQuestionConfig(false);
    setMode('unlock');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Emergency Recovery using Security Question
  const handleEmergencyRecovery = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoveryAnswer.trim()) {
      setErrorMsg('সিকিউরিটি প্রশ্নের উত্তরটি লিখুন!');
      return;
    }

    const isAnswerCorrect = verifySecurityAnswer(recoveryAnswer);
    if (!isAnswerCorrect) {
      setErrorMsg('সিকিউরিটি প্রশ্নের উত্তর সঠিক নয়! আবার চেষ্টা করুন।');
      return;
    }

    if (recoveryNewPin.length < 4) {
      setErrorMsg('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!');
      return;
    }

    if (recoveryNewPin !== recoveryConfirmPin) {
      setErrorMsg('নতুন পাসওয়ার্ড দুইটি মিলছে না!');
      return;
    }

    saveCreatorPin(recoveryNewPin);
    setSuccessNotice('সিকিউরিটি উত্তরের মাধ্যমে নতুন পাসওয়ার্ড সফলভাবে সেট করা হয়েছে!');
    setErrorMsg('');
    setRecoveryAnswer('');
    setRecoveryNewPin('');
    setRecoveryConfirmPin('');
    setMode('unlock');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const activeQuestion = getSecurityQuestion();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 selection:bg-rose-600 selection:text-white relative overflow-hidden font-sans">
      {/* Subtle ambient background lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-neutral-900/95 border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-2xl bg-rose-950/50 border border-rose-600/40 text-rose-500 shadow-inner">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              The Stealth Generator
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              সুরক্ষিত ক্রিয়েটর প্যানেল • শুধুমাত্র পাসওয়ার্ড দিয়ে প্রবেশ করুন
            </p>
          </div>
        </div>

        {/* Notices */}
        <AnimatePresence>
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successNotice}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODE 1: Standard Protected Unlock */}
        {mode === 'unlock' && (
          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                পাসওয়ার্ড / সিকিউরিটি PIN দিন:
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="security-pin-input"
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-neutral-950 border border-neutral-700/90 rounded-2xl text-white font-mono text-center tracking-widest text-lg placeholder:text-neutral-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  title={showPin ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="security-unlock-btn"
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Unlock className="w-4 h-4" />
              <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
            </button>

            {/* Bottom Actions: Change PIN or Forgot Password */}
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800/80">
              <button
                type="button"
                id="forgot-password-link-btn"
                onClick={() => {
                  setMode('forgot_password');
                  setErrorMsg('');
                  setSuccessNotice('');
                }}
                className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>পাসওয়ার্ড ভুলে গেছেন?</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetCreatorPinToDefault();
                  setPinInput('1234');
                  setSuccessNotice('পাসওয়ার্ড রিসেট করে "1234" করা হয়েছে!');
                  setErrorMsg('');
                  setTimeout(() => setSuccessNotice(''), 4000);
                }}
                className="text-rose-400/90 hover:text-rose-300 transition-colors underline cursor-pointer"
                title="পাসওয়ার্ড 1234 এ রিসেট করুন"
              >
                রিসেট (1234)
              </button>

              <button
                type="button"
                id="change-password-link-btn"
                onClick={() => {
                  setMode('change_pin');
                  setErrorMsg('');
                  setSuccessNotice('');
                }}
                className="text-neutral-400 hover:text-neutral-200 transition-colors underline cursor-pointer"
              >
                পরিবর্তন
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: Change PIN (Strictly requires Old PIN first) */}
        {mode === 'change_pin' && (
          <form onSubmit={handleSaveNewPin} className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <Settings className="w-4 h-4" />
                <span>পাসওয়ার্ড পরিবর্তন</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('unlock');
                  setErrorMsg('');
                }}
                className="text-neutral-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ফিরে যান</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Field 1: Old Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  পূর্বের বর্তমান পাসওয়ার্ড দিন: <span className="text-rose-500">*</span>
                </label>
                <input
                  id="security-old-pin-input"
                  type={showChangeFields ? 'text' : 'password'}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="পূর্বের পাসওয়ার্ড লিখুন"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Field 2: New Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  নতুন পাসওয়ার্ড: <span className="text-rose-500">*</span>
                </label>
                <input
                  id="security-new-pin-input"
                  type={showChangeFields ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড (যেমন: 2026)"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Field 3: Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  নতুন পাসওয়ার্ড আবার লিখুন: <span className="text-rose-500">*</span>
                </label>
                <input
                  id="security-confirm-pin-input"
                  type={showChangeFields ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <button
                  type="button"
                  onClick={() => setShowChangeFields(!showChangeFields)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  {showChangeFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showChangeFields ? 'পাসওয়ার্ড লুকান' : 'টাইপ করা পাসওয়ার্ড দেখুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSecQuestionConfig(!showSecQuestionConfig)}
                  className="text-amber-400/90 hover:text-amber-300 underline cursor-pointer"
                >
                  {showSecQuestionConfig ? 'সিকিউরিটি প্রশ্ন বন্ধ' : 'সিকিউরিটি প্রশ্ন সেট করুন'}
                </button>
              </div>

              {/* Optional: Configure Security Question */}
              {showSecQuestionConfig && (
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 mt-2 animate-in fade-in">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldQuestion className="w-3.5 h-3.5" />
                    জরুরি পাসওয়ার্ড রিকভারি প্রশ্ন
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    ভবিষ্যতে পাসওয়ার্ড ভুলে গেলে এই প্রশ্নের সঠিক উত্তর দিয়ে পাসওয়ার্ড পুনরুদ্ধার করা যাবে।
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      প্রশ্ন নির্বাচন বা লিখুন:
                    </label>
                    <select
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500 mb-2"
                    >
                      {DEFAULT_SECURITY_QUESTIONS.map((q, idx) => (
                        <option key={idx} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      আপনার গোপন উত্তর (Secret Answer):
                    </label>
                    <input
                      type="text"
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      placeholder="যেমন: রাশেদ স্যার / লালমাটিয়া"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('unlock');
                  setErrorMsg('');
                }}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                id="security-save-pin-btn"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                পাসওয়ার্ড সেভ করুন
              </button>
            </div>
          </form>
        )}

        {/* MODE 3: Emergency Security Question Recovery */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleEmergencyRecovery} className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldQuestion className="w-4 h-4" />
                <span>জরুরি পাসওয়ার্ড রিকভারি</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('unlock');
                  setErrorMsg('');
                }}
                className="text-neutral-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>লগইনে ফিরুন</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1 text-xs">
              <span className="font-bold text-amber-300 block">
                আপনার নির্ধারিত সিকিউরিটি প্রশ্ন:
              </span>
              <p className="text-white text-sm font-semibold">
                "{activeQuestion}"
              </p>
              <p className="text-[11px] text-amber-200/70 pt-1">
                এই প্রশ্নের সঠিক উত্তরটি নিচে লিখুন এবং সরাসরি নতুন পাসওয়ার্ড সেট করে নিন।
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  সিকিউরিটি প্রশ্নের উত্তর: <span className="text-amber-400">*</span>
                </label>
                <input
                  id="recovery-security-answer-input"
                  type="text"
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                  placeholder="আপনার গোপন উত্তরটি লিখুন"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  নতুন পাসওয়ার্ড দিন: <span className="text-rose-400">*</span>
                </label>
                <input
                  id="recovery-new-pin-input"
                  type="password"
                  value={recoveryNewPin}
                  onChange={(e) => setRecoveryNewPin(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  নতুন পাসওয়ার্ড নিশ্চিত করুন: <span className="text-rose-400">*</span>
                </label>
                <input
                  id="recovery-confirm-pin-input"
                  type="password"
                  value={recoveryConfirmPin}
                  onChange={(e) => setRecoveryConfirmPin(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('unlock');
                  setErrorMsg('');
                }}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                id="recovery-submit-btn"
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30 cursor-pointer"
              >
                পাসওয়ার্ড রিসেট করুন
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
