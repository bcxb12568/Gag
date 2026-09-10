import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PrankConfig, PrankThemeId, AudioEffectType, TrollMemeType } from '../types';
import { THEME_PRESETS } from './ThemePresets';
import { savePrankConfig, saveAudioToDB, getAudioFromDB } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import { generateStandalonePrankHtml } from '../utils/exportHtml';
import { generateViralPrankVideo, ViralVideoPreset } from '../utils/videoGenerator';
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  SlidersHorizontal,
  Copy,
  Check,
  Play,
  Square,
  Bot,
  Gamepad2,
  Flame,
  Smartphone,
  ShieldAlert,
  ExternalLink,
  QrCode,
  Music,
  Share2,
  Volume2,
  Download,
  Globe,
  Mic,
  MicOff,
  Video,
  Film,
  Trash2,
  Heart,
  Gift,
  Coins,
  Wifi,
  Eye,
  Camera,
  VideoOff,
  Loader2,
} from 'lucide-react';

interface StealthGeneratorProps {
  onGenerate: (config: PrankConfig) => void;
  onPreview: (config: PrankConfig) => void;
}

export const StealthGenerator: React.FC<StealthGeneratorProps> = ({
  onGenerate,
  onPreview,
}) => {
  // 3-step rapid stealth state
  const [selectedTheme, setSelectedTheme] = useState<PrankThemeId>('recharge');
  const [themeCategoryFilter, setThemeCategoryFilter] = useState<'all' | 'girl' | 'gaming' | 'bonus' | 'hot' | 'tech'>('all');
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);
  const [uploadedAudioData, setUploadedAudioData] = useState<string | undefined>(undefined);
  const [selectedAudioEffect, setSelectedAudioEffect] = useState<AudioEffectType>('siren_glitch');

  // Direct Video & Media Mode State
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [uploadedVideoData, setUploadedVideoData] = useState<string | undefined>(undefined);
  const [mediaMode, setMediaMode] = useState<'audio' | 'video' | 'both'>('video');
  const [mediaTab, setMediaTab] = useState<'video' | 'voice'>('video');
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Camera Video Recording State
  const [showCameraRecorder, setShowCameraRecorder] = useState(false);
  const [isCameraRecording, setIsCameraRecording] = useState(false);
  const [cameraRecordingSeconds, setCameraRecordingSeconds] = useState(0);
  const [isGeneratingViralVideo, setIsGeneratingViralVideo] = useState(false);
  const cameraVideoPreviewRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<number | null>(null);

  // Chameleon Dynamic Engine fields
  const [showChameleon, setShowChameleon] = useState(true);
  const [customTitle, setCustomTitle] = useState('পাও ১০০০ টাকা ফ্রি মোবাইল রিচার্জ!');
  const [customSubtitle, setCustomSubtitle] = useState(
    'সকল সিমের জন্য প্রযোজ্য। কোনো টাকা লাগবে না, এখনই আপনার নম্বরে রিচার্জ নিন!'
  );
  const [buttonText, setButtonText] = useState('এখনই ১০০০ টাকা রিচার্জ নিন');
  const [countdownSeconds, setCountdownSeconds] = useState(180);
  const [memeMessage, setMemeMessage] = useState(
    'হাসিমুখে মেনে নিন! এটা আপনার বন্ধুর বানানো একটি মজার প্র্যাঙ্ক ছিল! 😂'
  );
  const [trollMeme, setTrollMeme] = useState<TrollMemeType>('bengali_troll');

  // Link output state
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setUploadedAudioData(dataUrl);
          setUploadedAudioName('রেকর্ডকৃত_ভয়েস.webm');
          setSelectedAudioEffect('custom');
          setMediaMode((prev) => (uploadedVideoData ? 'both' : 'audio'));
          saveAudioToDB('latest_custom_audio', dataUrl);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('মাইক্রোফোন অনুমতি মেলেনি। আপনি অডিও ফাইল আপলোড বাটনে ক্লিক করে যেকোনো ভয়েস বা অডিও ফাইল দিতে পারেন।');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Direct Live Camera Recording
  const startCameraRecording = async () => {
    try {
      setShowCameraRecorder(true);
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      }

      cameraStreamRef.current = stream;
      if (cameraVideoPreviewRef.current) {
        cameraVideoPreviewRef.current.srcObject = stream;
        cameraVideoPreviewRef.current.play().catch(() => {});
      }

      videoChunksRef.current = [];
      let mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = '';
      }
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      videoRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'video/webm';
        const videoBlob = new Blob(videoChunksRef.current, { type: mime });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setUploadedVideoData(dataUrl);
          setUploadedVideoName('ক্যামেরা_ভিডিও.webm');
          setMediaMode((prev) => (uploadedAudioData ? 'both' : 'video'));
          saveAudioToDB('latest_custom_video', dataUrl);
        };
        reader.readAsDataURL(videoBlob);

        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach((t) => t.stop());
          cameraStreamRef.current = null;
        }
        setShowCameraRecorder(false);
        setIsCameraRecording(false);
      };

      recorder.start(500);
      setIsCameraRecording(true);
      setCameraRecordingSeconds(0);
      videoTimerRef.current = window.setInterval(() => {
        setCameraRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Camera recording error:', err);
      alert('ক্যামেরা পারমিশন মেলেনি। অনুগ্রহ করে ক্যামেরা অনুমতি দিন অথবা "ভিডিও ফাইল আপলোড" ব্যবহার করুন।');
      setShowCameraRecorder(false);
      setIsCameraRecording(false);
    }
  };

  const stopCameraRecording = () => {
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop();
    } else if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      setShowCameraRecorder(false);
      setIsCameraRecording(false);
    }
  };

  const cancelCameraRecording = () => {
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.onstop = null;
      videoRecorderRef.current.stop();
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setShowCameraRecorder(false);
    setIsCameraRecording(false);
  };

  // Instant Viral Prank Video Preset Generator
  const handleSelectViralPrankVideo = async (presetType: ViralVideoPreset) => {
    setIsGeneratingViralVideo(true);
    try {
      const dataUrl = await generateViralPrankVideo(presetType);
      if (dataUrl) {
        const names: Record<ViralVideoPreset, string> = {
          screamer: 'ভৌতিক_স্ক্রিমার_প্র্যাঙ্ক.webm',
          glitch: 'সাইবার_সিস্টেম_লক.webm',
          rickroll: 'রিকরোল_ড্যান্স_মেমে.webm',
          troll: 'হাস্যকর_ট্রোল_মেমে.webm',
        };
        setUploadedVideoData(dataUrl);
        setUploadedVideoName(names[presetType]);
        setMediaMode((prev) => (uploadedAudioData ? 'both' : 'video'));
        saveAudioToDB('latest_custom_video', dataUrl);
      }
    } catch (err) {
      console.error('Viral video preset error:', err);
    } finally {
      setIsGeneratingViralVideo(false);
    }
  };

  // Restore latest custom audio & video if previously uploaded
  React.useEffect(() => {
    getAudioFromDB('latest_custom_audio').then((data) => {
      if (data) {
        setUploadedAudioData(data);
        setUploadedAudioName((prev) => prev || 'আপনার আপলোড করা অডিও');
        setSelectedAudioEffect('custom');
      }
    });

    getAudioFromDB('latest_custom_video').then((vData) => {
      if (vData) {
        setUploadedVideoData(vData);
        setUploadedVideoName((prev) => prev || 'আপনার আপলোড করা ভিডিও');
      }
    });
  }, []);

  // Handle theme selection and automatically update chameleon defaults
  const handleThemeChange = (themeId: PrankThemeId) => {
    setSelectedTheme(themeId);
    const preset = THEME_PRESETS[themeId];
    setCustomTitle(preset.defaultTitle);
    setCustomSubtitle(preset.defaultSubtitle);
    setButtonText(preset.defaultButton);
  };

  // Handle custom audio file upload (MP3, WAV, OGG, M4A, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedAudioName(file.name);
    setSelectedAudioEffect('custom');
    setMediaMode((prev) => (uploadedVideoData ? 'both' : 'audio'));

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setUploadedAudioData(dataUrl);
        saveAudioToDB('latest_custom_audio', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle direct video file upload (MP4, WEBM, MOV, etc.)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('ভিডিও সাইজ ৫০ MB এর কম রাখুন যাতে যেকোনো ব্রাউজারে দ্রুত লোড হয়।');
      return;
    }

    setUploadedVideoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setUploadedVideoData(dataUrl);
        saveAudioToDB('latest_custom_video', dataUrl);
        setMediaMode((prev) => (uploadedAudioData ? 'both' : 'video'));
      }
    };
    reader.readAsDataURL(file);
  };

  // Sound test preview - STRICT EXCLUSIVITY (Only plays user sound if custom, zero background synth)
  const handleToggleSoundPreview = () => {
    if (isPlayingAudioPreview) {
      soundEngine.stop();
      setIsPlayingAudioPreview(false);
    } else {
      if (selectedAudioEffect === 'custom') {
        if (uploadedAudioData) {
          soundEngine.playCustomAudio(uploadedAudioData, false);
          setIsPlayingAudioPreview(true);
          setTimeout(() => {
            setIsPlayingAudioPreview(false);
          }, 6000);
        } else {
          alert('অনুগ্রহ করে আগে আপনার অডিও ফাইলটি সিলেক্ট করুন।');
        }
      } else {
        soundEngine.play(selectedAudioEffect, undefined, false);
        setIsPlayingAudioPreview(true);
        setTimeout(() => {
          setIsPlayingAudioPreview(false);
        }, 4000);
      }
    }
  };

  // Generate Stealth Link
  const handleGenerateLink = () => {
    const configId = 'p-' + Date.now().toString(36);
    const effectiveAudioEffect = uploadedAudioData ? 'custom' : selectedAudioEffect;
    const newConfig: PrankConfig = {
      id: configId,
      theme: selectedTheme,
      customTitle,
      customSubtitle,
      buttonText,
      audioEffect: effectiveAudioEffect,
      customAudioName: uploadedAudioName || undefined,
      customAudioDataUrl: uploadedAudioData,
      customVideoName: uploadedVideoName || undefined,
      customVideoDataUrl: uploadedVideoData,
      mediaMode: mediaMode,
      countdownDuration: countdownSeconds,
      trollMeme,
      memeMessage,
      glitchIntensity: 'extreme',
      enableSoundLoop: true,
      createdAt: Date.now(),
    };

    savePrankConfig(newConfig);

    // Construct full shareable URL using encoded state
    const params = new URLSearchParams({
      prank: configId,
      t: selectedTheme,
      title: customTitle,
      btn: buttonText,
      snd: effectiveAudioEffect,
      dur: countdownSeconds.toString(),
      hasAudio: uploadedAudioData ? '1' : '0',
      hasVideo: uploadedVideoData ? '1' : '0',
      mode: mediaMode,
    });

    const fullUrl = `${window.location.origin}${window.location.pathname}#${params.toString()}`;
    setGeneratedLink(fullUrl);
    onGenerate(newConfig);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadStandalone = () => {
    const effectiveAudioEffect = uploadedAudioData ? 'custom' : selectedAudioEffect;
    const currentConf: PrankConfig = {
      id: 'custom-' + Date.now(),
      theme: selectedTheme,
      customTitle: customTitle || currentPreset.defaultTitle,
      customSubtitle: customSubtitle || currentPreset.defaultSubtitle,
      buttonText: buttonText || currentPreset.defaultButton,
      audioEffect: effectiveAudioEffect,
      customAudioName: uploadedAudioName || undefined,
      customAudioDataUrl: uploadedAudioData,
      customVideoName: uploadedVideoName || undefined,
      customVideoDataUrl: uploadedVideoData,
      mediaMode: mediaMode,
      countdownDuration: countdownSeconds,
      trollMeme,
      memeMessage,
      glitchIntensity: 'extreme',
      enableSoundLoop: true,
      createdAt: Date.now(),
    };
    const htmlCode = generateStandalonePrankHtml(currentConf);
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `standalone-prank-${selectedTheme}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentPreset = THEME_PRESETS[selectedTheme];

  return (
    <div className="space-y-6 font-sans">
      {/* Hidden Audio File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      {/* Hidden Video File Input */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* SECTION 1: THE STEALTH GENERATOR (Fast 3-Action Workflow) */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                ১. The Stealth Generator (ফাস্ট লিংক বিল্ডার)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              ডাইরেক্ট ভিডিও, কাস্টম অডিও বা ভয়েস যুক্ত করে মুহূর্তেই ট্র্যাপ লিংক তৈরি করুন
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold self-start sm:self-auto font-mono">
            3-STEP ENGINE
          </span>
        </div>

        {/* 3 Main Action Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Button 1: Direct Video & Voice Media Trap */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                  ধাপ ১: মিডিয়া (ভিডিও ও ভয়েস)
                </span>
                {uploadedVideoData && (
                  <span className="text-[10px] bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Video className="w-2.5 h-2.5" /> ভিডিও যুক্ত আছে
                  </span>
                )}
              </div>

              {/* Large Media Type Switcher */}
              <div className="grid grid-cols-2 p-1 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs font-bold mt-2">
                <button
                  type="button"
                  onClick={() => setMediaTab('video')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mediaTab === 'video'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>🎬 ডাইরেক্ট ভিডিও</span>
                  {uploadedVideoData && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('voice')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mediaTab === 'voice'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>🎤 ভয়েস ও অডিও</span>
                  {uploadedAudioData && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </button>
              </div>

              <h3 className="text-sm font-bold text-white mt-2.5">
                {mediaTab === 'video' ? 'Add Direct Prank Video' : 'Upload or Record Voice'}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {mediaTab === 'video'
                  ? 'গ্যালারি থেকে ভিডিও দিন, ক্যামেরা দিয়ে লাইভ রেকর্ড করুন বা ভাইরাল ক্লিপ বেছে নিন'
                  : 'আপনার নিজস্ব অডিও আপলোড করুন বা সরাসরি ভয়েস রেকর্ড করুন'}
              </p>
            </div>

            <div className="space-y-2.5">
              {/* TAB 1: DIRECT VIDEO CONTROLS */}
              {mediaTab === 'video' && (
                <div className="space-y-2.5 animate-in fade-in">
                  {/* Camera Live Recorder Modal/Container */}
                  {showCameraRecorder ? (
                    <div className="p-3 rounded-2xl bg-neutral-900 border-2 border-rose-500/80 space-y-2.5 shadow-2xl">
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-neutral-700">
                        <video
                          ref={cameraVideoPreviewRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center gap-1.5 animate-pulse shadow">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>রেকর্ডিং হচ্ছে... 00:{cameraRecordingSeconds.toString().padStart(2, '0')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={stopCameraRecording}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>রেকর্ড শেষ ও সেভ</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelCameraRecording}
                          className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <VideoOff className="w-3.5 h-3.5 text-neutral-400" />
                          <span>বাতিল</span>
                        </button>
                      </div>
                    </div>
                  ) : uploadedVideoData ? (
                    /* Existing Video Preview */
                    <div className="p-3 rounded-2xl bg-neutral-900 border border-rose-500/40 space-y-2.5 animate-in fade-in">
                      <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-black">
                        <video
                          src={uploadedVideoData}
                          controls
                          playsInline
                          className="w-full max-h-32 object-contain"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-[9px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ভিডিও প্রস্তুত</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-300 font-mono truncate">
                        <span className="truncate max-w-[160px] text-rose-300 font-bold">
                          🎬 {uploadedVideoName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedVideoData(undefined);
                            setUploadedVideoName(null);
                            setMediaMode('audio');
                          }}
                          className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>রিমুভ</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="py-2 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-rose-400" />
                          <span>পরিবর্তন করুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={startCameraRecording}
                          className="py-2 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-rose-400" />
                          <span>ক্যামেরা রেকর্ড</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Direct Video Selection Options */
                    <div className="space-y-2">
                      {/* Direct Upload Button */}
                      <button
                        id="stealth-upload-video-btn"
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full py-3 px-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer active:scale-98"
                      >
                        <Video className="w-4 h-4" />
                        <span>ভিডিও ফাইল দিন (.mp4 / .webm / .mov)</span>
                      </button>

                      {/* Direct Camera Record Button */}
                      <button
                        type="button"
                        onClick={startCameraRecording}
                        className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-rose-400" />
                        <span>ক্যামেরা দিয়ে লাইভ ভিডিও রেকর্ড</span>
                      </button>

                      {/* 1-Click Viral Prank Videos */}
                      <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          ⚡ অথবা রেডিমেড ভাইরাল প্র্যাঙ্ক ভিডিও (১-ক্লিক):
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            disabled={isGeneratingViralVideo}
                            onClick={() => handleSelectViralPrankVideo('screamer')}
                            className="py-1.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/60 text-[11px] font-bold text-neutral-200 flex items-center gap-1.5 cursor-pointer text-left truncate"
                          >
                            <span>💀</span>
                            <span className="truncate">ভূত স্ক্রিমার</span>
                          </button>
                          <button
                            type="button"
                            disabled={isGeneratingViralVideo}
                            onClick={() => handleSelectViralPrankVideo('glitch')}
                            className="py-1.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/60 text-[11px] font-bold text-neutral-200 flex items-center gap-1.5 cursor-pointer text-left truncate"
                          >
                            <span>🚨</span>
                            <span className="truncate">সাইবার হ্যাক</span>
                          </button>
                          <button
                            type="button"
                            disabled={isGeneratingViralVideo}
                            onClick={() => handleSelectViralPrankVideo('rickroll')}
                            className="py-1.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-indigo-500/60 text-[11px] font-bold text-neutral-200 flex items-center gap-1.5 cursor-pointer text-left truncate"
                          >
                            <span>🕺</span>
                            <span className="truncate">রিকরোল ড্যান্স</span>
                          </button>
                          <button
                            type="button"
                            disabled={isGeneratingViralVideo}
                            onClick={() => handleSelectViralPrankVideo('troll')}
                            className="py-1.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/60 text-[11px] font-bold text-neutral-200 flex items-center gap-1.5 cursor-pointer text-left truncate"
                          >
                            <span>😂</span>
                            <span className="truncate">ফানি ট্রোল</span>
                          </button>
                        </div>
                        {isGeneratingViralVideo && (
                          <div className="flex items-center justify-center gap-2 text-[11px] text-rose-400 py-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>ভিডিও তৈরি হচ্ছে...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VOICE & AUDIO */}
              {mediaTab === 'voice' && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="stealth-upload-audio-btn"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-rose-400" />
                      <span className="truncate">{uploadedAudioName ? 'ফাইল পরিবর্তন' : 'অডিও ফাইল'}</span>
                    </button>

                    {isRecording ? (
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="py-2.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all animate-pulse cursor-pointer shadow-lg shadow-rose-900/50"
                      >
                        <MicOff className="w-3.5 h-3.5" />
                        <span>থামান ({recordingSeconds}s)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="py-2.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5 text-amber-400" />
                        <span>ভয়েস রেকর্ড</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedAudioEffect}
                      onChange={(e) => setSelectedAudioEffect(e.target.value as AudioEffectType)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-rose-500"
                    >
                      <option value="custom">
                        🎤 {uploadedAudioName ? `আপনার ভয়েস: ${uploadedAudioName}` : 'কাস্টম ভয়েস / অডিও'}
                      </option>
                      <option value="siren_glitch">🚨 সাইবার গ্লিচ অ্যালার্ম</option>
                      <option value="rickroll_8bit">🎵 8-Bit Rickroll Synth</option>
                      <option value="funny_screamer">😱 ফানি কার্টুন স্ক্রিমার</option>
                      <option value="airhorn">📢 MLG এয়ারহর্ন ব্লাস্ট</option>
                      <option value="party_horn">🎺 পার্টি হর্ন ফানফেয়ার</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleToggleSoundPreview}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                        isPlayingAudioPreview
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                      title={isPlayingAudioPreview ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড শুনুন'}
                    >
                      {isPlayingAudioPreview ? (
                        <>
                          <Square className="w-3.5 h-3.5 text-white animate-pulse" />
                          <span className="hidden sm:inline">Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">শুনুন</span>
                        </>
                      )}
                    </button>
                  </div>

                  {uploadedAudioData && (
                    <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-xs text-emerald-200 space-y-2 animate-in fade-in shadow-lg">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          🎤 আপনার ভয়েস ট্র্যাপে ১০০% লক ও সক্রিয়!
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedAudioData(undefined);
                            setUploadedAudioName(null);
                            setSelectedAudioEffect('siren_glitch');
                          }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                        >
                          মুছে ফেলুন
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-black/50 px-3 py-2 rounded-xl border border-emerald-500/30">
                        <span className="truncate font-mono text-[11px] text-emerald-300 max-w-[180px]">
                          🎵 {uploadedAudioName || 'রেকর্ডকৃত_ভয়েস.webm'}
                        </span>
                        <button
                          type="button"
                          onClick={handleToggleSoundPreview}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {isPlayingAudioPreview ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>থামান</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>বাজিয়ে শুনুন</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-emerald-300/90 leading-relaxed font-sans">
                        🔒 ১০০% গ্যারান্টি: ট্র্যাপে ভিকটিম ঢুকলে কোনো ফেক সাইরেন বা অন্য সাউন্ড বাজবে না, শুধুমাত্র আপনার এই ভয়েসটিই লাউড স্পিকারে একটানা বাজবে।
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MEDIA PLAYBACK MODE SELECTOR (Audio, Video, or Both) */}
              {(uploadedAudioData || uploadedVideoData) && (
                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    মিডিয়া প্লেব্যাক মোড:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMediaMode('video')}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all truncate cursor-pointer ${
                        mediaMode === 'video'
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                      title="শুধুমাত্র ভিডিও"
                    >
                      🎬 ভিডিও অনলি
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaMode('audio')}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all truncate cursor-pointer ${
                        mediaMode === 'audio'
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                      title="শুধুমাত্র অডিও/ভয়েস"
                    >
                      🎤 অডিও অনলি
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaMode('both')}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all truncate cursor-pointer ${
                        mediaMode === 'both'
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                      title="ভিডিও ও ভয়েস উভয়ই"
                    >
                      🔥 উভয়ই (ভিডিও+ভয়েস)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Button 2: Select Fake Theme */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  ধাপ ২: লোভনীয় থিম বাছাই
                </span>
                <span className="text-[10px] bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold px-1.5 py-0.5 rounded-md">
                  ১২টি ক্যাটাগরি
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">Select Fake Enticing Theme</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                বন্ধু কোন লোভনীয় টপিকে সবচেয়ে দ্রুত ক্লিক করবে?
              </p>
            </div>

            {/* Quick Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              {[
                { id: 'all', label: 'সবগুলো (১২)' },
                { id: 'girl', label: '👧 মেয়ের আইডি' },
                { id: 'gaming', label: '💎 ফ্রি ডায়মন্ড' },
                { id: 'bonus', label: '💰 ক্যাশ ও রিচার্জ' },
                { id: 'hot', label: '🎁 গিফট ও আয়' },
                { id: 'tech', label: '⚡ টেক ও ভাইরাল' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setThemeCategoryFilter(tab.id as any)}
                  className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                    themeCategoryFilter === tab.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
              {(Object.keys(THEME_PRESETS) as PrankThemeId[])
                .filter((themeKey) => {
                  if (themeCategoryFilter === 'all') return true;
                  return THEME_PRESETS[themeKey].category === themeCategoryFilter;
                })
                .map((themeKey) => {
                  const item = THEME_PRESETS[themeKey];
                  const isSelected = selectedTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => handleThemeChange(themeKey)}
                      className={`p-2 rounded-xl border text-left text-[11px] transition-all cursor-pointer flex items-start gap-1.5 ${
                        isSelected
                          ? 'bg-rose-950/90 border-rose-500 text-white shadow-md ring-1 ring-rose-500/50'
                          : 'bg-neutral-900/80 border-neutral-800/90 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <span className="text-base flex-shrink-0 leading-none pt-0.5">
                        {item.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate leading-tight">
                          {item.nameBn}
                        </div>
                        <div className="text-[9px] text-neutral-400 truncate mt-0.5 font-medium">
                          {item.badge}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Button 3: Generate Link & Standalone Download */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-neutral-950 to-neutral-950 border border-rose-500/40 hover:border-rose-500 transition-all flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                ধাপ ৩: ইনস্ট্যান্ট প্র্যাঙ্ক তৈরি
              </span>
              <h3 className="text-sm font-bold text-white mt-1">Generate Link & Download</h3>
              <p className="text-xs text-neutral-400 mt-1">
                এক ক্লিকে অনলাইন লিংক ও স্বতন্ত্র ডাউনলোড ফাইল উভয়ই তৈরি হবে।
              </p>
            </div>

            <button
              id="stealth-generate-link-btn"
              type="button"
              onClick={handleGenerateLink}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 hover:from-rose-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <LinkIcon className="w-4 h-4" />
              <span>লিংক ও ডাউনলোড উভয়ই তৈরি করুন</span>
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Generated Results: Both Link Option and Download Option */}
      <AnimatePresence>
        {generatedLink && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-5 sm:p-6 rounded-3xl bg-neutral-900 border-2 border-emerald-500/60 shadow-2xl space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> প্র্যাঙ্ক লিংক ও ডাউনলোড ফাইল সফলভাবে তৈরি হয়েছে!
                </span>
                <p className="text-xs text-neutral-300 mt-0.5">
                  {uploadedAudioData
                    ? `আপনার কাস্টম ভয়েস ("${uploadedAudioName || 'রেকর্ডকৃত ভয়েস'}") উভয় অপশনেই যুক্ত করা হয়েছে`
                    : 'নির্বাচিত সাউন্ড উভয় অপশনেই কার্যকর আছে'}
                </p>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono self-start sm:self-auto bg-neutral-950 px-2.5 py-1 rounded-full border border-neutral-800">
                থিম: {THEME_PRESETS[selectedTheme].name}
              </span>
            </div>

            {/* DUAL OPTIONS GRID: Link Option & Download Option Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Option 1: Online Shareable Link */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" /> অপশন ১: অনলাইন প্র্যাঙ্ক লিংক
                    </span>
                    <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      ONLINE URL
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    বন্ধুকে সরাসরি এই লিংকটি পাঠান। ওপেন করলে কোনো জেনারেটর কোড থাকবে না; ভিকটিম ব্যাক দিলে বা স্টার্ট চাপলে ফোন ফ্রিজ হয়ে আপনার ভয়েস বাজবে।
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-transparent px-2 text-xs text-neutral-200 font-mono focus:outline-none select-all truncate"
                  />
                  <button
                    id="copy-prank-link-btn"
                    onClick={handleCopy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 ${
                      copied
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'কপি হয়েছে!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const effectiveAudioEffect = uploadedAudioData ? 'custom' : selectedAudioEffect;
                      const currentConf: PrankConfig = {
                        id: 'preview-' + Date.now(),
                        theme: selectedTheme,
                        customTitle,
                        customSubtitle,
                        buttonText,
                        audioEffect: effectiveAudioEffect,
                        customAudioName: uploadedAudioName || undefined,
                        customAudioDataUrl: uploadedAudioData,
                        customVideoName: uploadedVideoName || undefined,
                        customVideoDataUrl: uploadedVideoData,
                        mediaMode: mediaMode,
                        countdownDuration: countdownSeconds,
                        trollMeme,
                        memeMessage,
                        glitchIntensity: 'extreme',
                        enableSoundLoop: true,
                        createdAt: Date.now(),
                      };
                      onPreview(currentConf);
                    }}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>টেস্ট করুন</span>
                  </button>

                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>নতুন ট্যাবে খুলুন</span>
                  </a>
                </div>
              </div>

              {/* Option 2: Standalone Website (.html File Download) */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-cyan-500/30 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> অপশন ২: স্বতন্ত্র ওয়েবসাইট ডাউনলোড (.html)
                    </span>
                    <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                      100% INDEPENDENT
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    সম্পূর্ণ আলাদা ওয়েবসাইট ফাইল। আপনার ভয়েস সরাসরি এর ভেতরে এমবেড করা আছে। এই ওয়েবসাইটের সাথে কোনো সংযোগ ছাড়াই যেকোনো জায়গায় চলবে।
                  </p>
                </div>

                <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800 text-[11px] text-neutral-300 flex items-center justify-between">
                  <span className="font-mono text-neutral-400 truncate">
                    standalone-prank-{selectedTheme}.html
                  </span>
                  <span className="text-emerald-400 font-bold ml-2 flex-shrink-0">
                    অডিও এমবেডেড
                  </span>
                </div>

                <button
                  type="button"
                  id="download-standalone-html-btn"
                  onClick={handleDownloadStandalone}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-transform active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>ডাউনলোড করুন .html ওয়েবসাইট</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2: THE DYNAMIC CHAMELEON ENGINE (Custom Color & Text Changer) */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                ২. The Dynamic Chameleon Engine (কাস্টম কালার ও টেক্সট চেঞ্জার)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              ভুয়া ওয়েবসাইটের হেডলাইন, সাবটাইটেল, বাটন এবং ৩ মিনিট পরের ট্রোল মেমে কাস্টমাইজ করুন
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowChameleon((prev) => !prev)}
            className="text-xs text-neutral-400 hover:text-white underline"
          >
            {showChameleon ? 'সংক্ষিপ্ত করুন' : 'বিস্তারিত খুলুন'}
          </button>
        </div>

        {showChameleon && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Custom Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  কাস্টম টাইটেল / হেডলাইন:
                </label>
                <input
                  id="chameleon-title-input"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="যেমন: পাও ১০০০ টাকা মোবাইল রিচার্জ!"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Custom Button Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  ট্র্যাপ বাটনের লেখা (Get Started Button):
                </label>
                <input
                  id="chameleon-button-input"
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="যেমন: এখনই ১০০০ টাকা রিচার্জ নিন"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Custom Subtitle / Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                কাস্টম সাবটাইটেল / লোভনীয় মেসেজ:
              </label>
              <textarea
                id="chameleon-subtitle-input"
                rows={2}
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                placeholder="যেমন: সকল সিমের জন্য অফার প্রযোজ্য (GP, Robi, Banglalink)..."
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Countdown Duration & Troll Meme Reveal Setting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  ফেক সিস্টেম কাউন্টডাউন ও অডিও লুপ সময়:
                </label>
                <select
                  value={countdownSeconds}
                  onChange={(e) => setCountdownSeconds(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value={180}>৩ মিনিট (১৮০ সেকেন্ড - স্ট্যান্ডার্ড ট্র্যাপ)</option>
                  <option value={120}>২ মিনিট (১২০ সেকেন্ড)</option>
                  <option value={60}>১ মিনিট (৬০ সেকেন্ড - ফাস্ট ট্র্যাপ)</option>
                  <option value={30}>৩০ সেকেন্ড (কুইক টেস্টিং)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  ৩ মিনিট পরের ফানি ট্রোল মেমে মেসেজ:
                </label>
                <input
                  type="text"
                  value={memeMessage}
                  onChange={(e) => setMemeMessage(e.target.value)}
                  placeholder="যেমন: আরে ভাই শান্ত হন! আপনি ট্রোল হয়েছেন! 😂"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
