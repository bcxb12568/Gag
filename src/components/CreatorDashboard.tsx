import React, { useState, useEffect } from 'react';
import { PrankConfig, TrackerStats } from '../types';
import { StealthGenerator } from './StealthGenerator';
import { VictimTracker } from './VictimTracker';
import { PreviewSimulatorModal } from './PreviewSimulatorModal';
import { getInitialStats } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import {
  Lock,
  Skull,
  Flame,
  VolumeX,
  Target,
  Wand2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface CreatorDashboardProps {
  onLock: () => void;
  onOpenDirectVictim: (config: PrankConfig) => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  onLock,
  onOpenDirectVictim,
}) => {
  const [stats, setStats] = useState<TrackerStats>(getInitialStats);
  const [activeTab, setActiveTab] = useState<'generator' | 'tracker'>('generator');
  const [previewConfig, setPreviewConfig] = useState<PrankConfig | null>(null);

  // Poll stats or update
  const refreshStats = () => {
    setStats(getInitialStats());
  };

  useEffect(() => {
    const interval = setInterval(refreshStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStopAllAudio = () => {
    soundEngine.stop();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-600 selection:text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-lg shadow-rose-600/20">
            <Skull className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                Cyber-Glitch Prank Hub
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-600/30 text-[10px] font-bold font-mono">
                V2.5
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Stealth Generator & Dynamic Chameleon Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick stop audio */}
          <button
            onClick={handleStopAllAudio}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="সকল অডিও নিঃশব্দ করুন"
          >
            <VolumeX className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">Mute Sounds</span>
          </button>

          {/* Lock Dashboard Button */}
          <button
            id="creator-lock-btn"
            onClick={onLock}
            className="py-2 px-3 sm:px-4 rounded-xl bg-neutral-900 hover:bg-red-950 text-neutral-300 hover:text-red-300 border border-neutral-800 hover:border-red-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              id="tab-generator-btn"
              onClick={() => setActiveTab('generator')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>১ & ২. লিংক জেনারেটর ও ক্যামেলিয়ন</span>
            </button>

            <button
              id="tab-tracker-btn"
              onClick={() => setActiveTab('tracker')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
                activeTab === 'tracker'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>৩. Victim Tracker</span>
              {stats.totalTrapped > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-500 text-[10px] font-mono">
                  {stats.totalTrapped}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Radar Active</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'generator' ? (
          <StealthGenerator
            onGenerate={(cfg) => {
              refreshStats();
            }}
            onPreview={(cfg) => {
              setPreviewConfig(cfg);
            }}
          />
        ) : (
          <VictimTracker stats={stats} onRefresh={refreshStats} />
        )}
      </main>

      {/* Simulator Modal */}
      {previewConfig && (
        <PreviewSimulatorModal
          config={previewConfig}
          onClose={() => setPreviewConfig(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/60 py-4 px-4 text-center text-xs text-neutral-500 font-mono space-y-1">
        <p>Cyber-Glitch Prank Hub • Stealth Generator • 100% Client-Side Safe Fun</p>
      </footer>
    </div>
  );
};
