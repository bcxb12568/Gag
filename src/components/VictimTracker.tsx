import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrackerStats, VictimEvent } from '../types';
import { getInitialStats, saveStats } from '../utils/storage';
import {
  Users,
  Target,
  Smile,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Flame,
} from 'lucide-react';

interface VictimTrackerProps {
  stats: TrackerStats;
  onRefresh: () => void;
}

export const VictimTracker: React.FC<VictimTrackerProps> = ({ stats, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'trapped' | 'visit'>('all');

  const conversionRate =
    stats.totalVisits > 0
      ? Math.round((stats.totalTrapped / stats.totalVisits) * 100)
      : 0;

  const filteredVictims = stats.recentVictims.filter((v) => {
    if (filter === 'all') return true;
    return v.action === filter;
  });

  const handleClearHistory = () => {
    if (window.confirm('আপনি কি ভিকটিম ট্র্যাকার হিস্টোরি ক্লিয়ার করতে চান?')) {
      const reset: TrackerStats = {
        totalVisits: 0,
        totalTrapped: 0,
        totalMemeReveals: 0,
        recentVictims: [],
      };
      saveStats(reset);
      onRefresh();
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'এইমাত্র';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} মিনিট আগে`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    return `${Math.floor(diffHours / 24)} দিন আগে`;
  };

  const getDeviceIcon = (device: 'Mobile' | 'Desktop' | 'Tablet') => {
    if (device === 'Mobile') return <Smartphone className="w-4 h-4 text-emerald-400" />;
    if (device === 'Tablet') return <Tablet className="w-4 h-4 text-purple-400" />;
    return <Monitor className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-500 animate-pulse" />
              <span>Victim Tracker (লাইভ অ্যানালিটিক্স)</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-600/40 text-[10px] font-mono text-rose-400 uppercase tracking-wider">
              LIVE RADAR
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            কোন কোন বন্ধু লিংকে ক্লিক করেছে এবং ট্র্যাপে পড়েছে তার রিয়েলটাইম হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 border border-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
            title="হিস্টোরি মুছুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Visits */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>মোট লিংক ভিউ</span>
            <Users className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
            {stats.totalVisits}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            <span>বন্ধু ক্লিক করেছে</span>
          </div>
        </div>

        {/* Trapped Victims */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-400 text-xs font-medium">
            <span>ট্র্যাপে পড়া ভিকটিম</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2 font-mono">
            {stats.totalTrapped}
          </div>
          <div className="text-[11px] text-rose-300/70 mt-1 flex items-center gap-1">
            <span>'Get Started' চেপেছে</span>
          </div>
        </div>

        {/* Success / Conversion Rate */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>ট্র্যাপ সাকসেস রেট</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            <span>ক্লিক থেকে ট্র্যাপ কনভার্সন</span>
          </div>
        </div>

        {/* Total Memes Revealed */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>ট্রোল মেমে রিভিল্ড</span>
            <Smile className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono">
            {stats.totalMemeReveals}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            <span>শেষ পর্যন্ত মজা দেখেছে</span>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            রিসেন্ট ভিকটিম অ্যাক্টিভিটি স্ট্রিম ({filteredVictims.length})
          </span>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded ${filter === 'all' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'}`}
            >
              সকল
            </button>
            <button
              onClick={() => setFilter('trapped')}
              className={`px-2 py-0.5 rounded ${filter === 'trapped' ? 'bg-rose-950 text-rose-300 font-bold' : 'text-neutral-400'}`}
            >
              ট্র্যাপ্ড
            </button>
            <button
              onClick={() => setFilter('visit')}
              className={`px-2 py-0.5 rounded ${filter === 'visit' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'}`}
            >
              ভিজিট
            </button>
          </div>
        </div>

        {filteredVictims.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            এখনও কোনো ভিকটিম ডেটা নেই। উপরে লিংক বানিয়ে বন্ধুদের শেয়ার করুন!
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {filteredVictims.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 flex-shrink-0">
                    {getDeviceIcon(item.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {item.browser}
                      </span>
                      {item.action === 'trapped' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-600/30 text-[10px] font-bold">
                          TRAPPED 💥
                        </span>
                      ) : item.action === 'troll_revealed' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          MEME SEEN 😂
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px]">
                          VIEWED 👀
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                      <span>থিম: <strong className="text-neutral-400 capitalize">{item.theme}</strong></span>
                      <span>•</span>
                      <span>লোকেশন: {item.locationGuess || 'BD'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-neutral-500 flex items-center gap-1 font-mono flex-shrink-0">
                  <Clock className="w-3 h-3 text-neutral-600" />
                  <span>{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
