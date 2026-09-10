import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PrankConfig } from '../types';
import { VictimPageView } from './VictimPageView';
import { X, Smartphone, Monitor, RotateCcw } from 'lucide-react';

interface PreviewSimulatorModalProps {
  config: PrankConfig;
  onClose: () => void;
}

export const PreviewSimulatorModal: React.FC<PreviewSimulatorModalProps> = ({
  config,
  onClose,
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [simulatorKey, setSimulatorKey] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-[92vh] bg-neutral-900 border border-neutral-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Simulator Bar */}
        <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Victim Trap Simulator
            </span>
            <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
              Theme: {config.theme}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Mode Toggle */}
            <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                  deviceMode === 'mobile'
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="মোবাইল ভিউ"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                  deviceMode === 'desktop'
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="ডেস্কটপ ভিউ"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
            </div>

            {/* Reset View */}
            <button
              onClick={() => setSimulatorKey((prev) => prev + 1)}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              title="রিস্টার্ট সিমুলেশন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-300 border border-neutral-800 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="flex-1 bg-neutral-950/80 overflow-auto flex items-center justify-center p-2 sm:p-4">
          <div
            className={`transition-all duration-300 overflow-hidden shadow-2xl rounded-2xl border border-neutral-800 bg-black ${
              deviceMode === 'mobile'
                ? 'w-full max-w-sm h-[78vh] ring-8 ring-neutral-900'
                : 'w-full h-full max-h-[82vh]'
            }`}
          >
            <div key={simulatorKey} className="w-full h-full overflow-y-auto">
              <VictimPageView
                config={config}
                onExitToCreator={onClose}
                isSimulated={true}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
