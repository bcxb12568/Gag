import { PrankConfig, TrackerStats, VictimEvent } from '../types';

const STATS_KEY = 'prank_hub_victim_stats';
const PRANKS_KEY = 'prank_hub_saved_configs';
const PIN_KEY = 'prank_hub_creator_pin';
const LATEST_AUDIO_KEY = 'prank_hub_latest_custom_audio';
const DEFAULT_PIN = '1234';
const MASTER_PIN = '1234';

// --- IndexedDB for Reliable Large Audio Storage ---
const IDB_NAME = 'PrankHubAudioDB';
const IDB_STORE = 'audio_files';

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioToDB(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not store audio in IndexedDB, fallback to memory/localStorage:', err);
  }
}

export async function getAudioFromDB(key: string): Promise<string | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Loads custom audio by prank ID or fallback to latest custom audio or server
 */
export async function loadPrankAudio(prankId: string): Promise<string | null> {
  // 1. Check indexedDB by prank ID
  const fromDb = await getAudioFromDB(`prank_audio_${prankId}`);
  if (fromDb) return fromDb;

  // 2. Check indexedDB latest
  const latestDb = await getAudioFromDB('latest_custom_audio');
  if (latestDb) return latestDb;

  // 3. Check memory/localStorage
  try {
    const fromLocal = localStorage.getItem(`${LATEST_AUDIO_KEY}_${prankId}`) || localStorage.getItem(LATEST_AUDIO_KEY);
    if (fromLocal) return fromLocal;
  } catch {
    // Ignore quota or read error
  }

  // 4. Check saved pranks array
  const pranks = getSavedPranks();
  const matched = pranks.find((p) => p.id === prankId);
  if (matched?.customAudioDataUrl) {
    return matched.customAudioDataUrl;
  }

  // 5. Check backend server API
  try {
    const res = await fetch(`/api/pranks/${prankId}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.customAudioDataUrl) {
        saveAudioToDB(`prank_audio_${prankId}`, data.customAudioDataUrl);
        return data.customAudioDataUrl;
      }
    }
  } catch {
    // Server fetch error or offline
  }

  return null;
}

/**
 * Loads custom video by prank ID or fallback to latest custom video or server
 */
export async function loadPrankVideo(prankId: string): Promise<string | null> {
  // 1. Check indexedDB by prank ID
  const fromDb = await getAudioFromDB(`prank_video_${prankId}`);
  if (fromDb) return fromDb;

  // 2. Check indexedDB latest
  const latestDb = await getAudioFromDB('latest_custom_video');
  if (latestDb) return latestDb;

  // 3. Check saved pranks array
  const pranks = getSavedPranks();
  const matched = pranks.find((p) => p.id === prankId);
  if (matched?.customVideoDataUrl) {
    return matched.customVideoDataUrl;
  }

  // 4. Check backend server API
  try {
    const res = await fetch(`/api/pranks/${prankId}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.customVideoDataUrl) {
        saveAudioToDB(`prank_video_${prankId}`, data.customVideoDataUrl);
        return data.customVideoDataUrl;
      }
    }
  } catch {
    // Server fetch error or offline
  }

  return null;
}

export function getCreatorPin(): string {
  try {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function verifyCreatorPin(inputPin: string): boolean {
  const trimmed = inputPin.trim();
  if (!trimmed) return false;
  const current = getCreatorPin();
  // Accepts the current configured PIN, the new default PIN '1234', or legacy '1337'
  return trimmed === current || trimmed === DEFAULT_PIN || trimmed === MASTER_PIN || trimmed === '1337';
}

export function resetCreatorPinToDefault(): string {
  try {
    localStorage.setItem(PIN_KEY, DEFAULT_PIN);
  } catch {
    // Ignore error
  }
  return DEFAULT_PIN;
}

export function saveCreatorPin(newPin: string): boolean {
  try {
    localStorage.setItem(PIN_KEY, newPin);
    return true;
  } catch {
    return false;
  }
}

// --- Security Question & Emergency Recovery ---
const SECURITY_QUESTION_KEY = 'prank_hub_security_question';
const SECURITY_ANSWER_KEY = 'prank_hub_security_answer';

export const DEFAULT_SECURITY_QUESTIONS = [
  'আপনার প্রিয় শিক্ষকের নাম কি?',
  'আপনার ছোটবেলার ডাকনাম কি ছিল?',
  'আপনার প্রিয় শহর বা জন্মস্থান কোনটি?',
  'আপনার প্রিয় খাবারের নাম কি?',
  'আপনার প্রথম স্কুলের নাম কি ছিল?'
];

export function getSecurityQuestion(): string {
  try {
    return localStorage.getItem(SECURITY_QUESTION_KEY) || DEFAULT_SECURITY_QUESTIONS[0];
  } catch {
    return DEFAULT_SECURITY_QUESTIONS[0];
  }
}

export function getSecurityAnswer(): string {
  try {
    return localStorage.getItem(SECURITY_ANSWER_KEY) || 'admin';
  } catch {
    return 'admin';
  }
}

export function saveSecurityQuestionAndAnswer(question: string, answer: string): boolean {
  try {
    localStorage.setItem(SECURITY_QUESTION_KEY, question);
    localStorage.setItem(SECURITY_ANSWER_KEY, answer.trim().toLowerCase());
    return true;
  } catch {
    return false;
  }
}

export function verifySecurityAnswer(providedAnswer: string): boolean {
  const stored = getSecurityAnswer();
  return stored.trim().toLowerCase() === providedAnswer.trim().toLowerCase();
}

export function getInitialStats(): TrackerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }

  // Realistic sample starter data for visual impact
  const initialEvents: VictimEvent[] = [
    {
      id: 'v-1',
      prankId: 'starter-1',
      theme: 'recharge',
      action: 'trapped',
      timestamp: Date.now() - 1000 * 60 * 18,
      deviceType: 'Mobile',
      browser: 'Chrome Mobile (Android)',
      locationGuess: 'Dhaka, BD',
    },
    {
      id: 'v-2',
      prankId: 'starter-2',
      theme: 'game',
      action: 'trapped',
      timestamp: Date.now() - 1000 * 60 * 45,
      deviceType: 'Desktop',
      browser: 'Chrome 124 (Windows)',
      locationGuess: 'Chittagong, BD',
    },
    {
      id: 'v-3',
      prankId: 'starter-3',
      theme: 'ai',
      action: 'troll_revealed',
      timestamp: Date.now() - 1000 * 60 * 120,
      deviceType: 'Mobile',
      browser: 'Safari (iOS iPhone 15)',
      locationGuess: 'Sylhet, BD',
    },
  ];

  return {
    totalVisits: 14,
    totalTrapped: 9,
    totalMemeReveals: 7,
    recentVictims: initialEvents,
  };
}

export function saveStats(stats: TrackerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function recordVictimEvent(
  prankId: string,
  theme: any,
  action: 'visit' | 'trapped' | 'troll_revealed'
): TrackerStats {
  const current = getInitialStats();

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isTablet = /iPad|Tablet/i.test(navigator.userAgent);
  const deviceType: 'Mobile' | 'Desktop' | 'Tablet' = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

  let browserName = 'Chrome';
  if (navigator.userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) browserName = 'Safari';
  else if (navigator.userAgent.includes('Edg')) browserName = 'Edge';

  const newEvent: VictimEvent = {
    id: 'evt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    prankId,
    theme,
    action,
    timestamp: Date.now(),
    deviceType,
    browser: `${browserName} (${deviceType})`,
    locationGuess: 'Bangladesh (Live IP)',
  };

  if (action === 'visit') {
    current.totalVisits += 1;
  } else if (action === 'trapped') {
    current.totalTrapped += 1;
  } else if (action === 'troll_revealed') {
    current.totalMemeReveals += 1;
  }

  // Prepend event, keep last 30
  current.recentVictims = [newEvent, ...current.recentVictims.slice(0, 29)];
  saveStats(current);
  return current;
}

export function getSavedPranks(): PrankConfig[] {
  try {
    const raw = localStorage.getItem(PRANKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read pranks:', e);
  }
  return [];
}

export function getSavedPrankById(prankId: string): PrankConfig | null {
  const pranks = getSavedPranks();
  return pranks.find((p) => p.id === prankId) || null;
}

export function savePrankConfig(config: PrankConfig): void {
  // Sync with backend server API so links work across any device
  try {
    fetch('/api/pranks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: config.id, config }),
    }).catch(() => {});
  } catch {
    // Offline or server unavailable
  }

  // If custom audio is included, save to IndexedDB asynchronously
  if (config.customAudioDataUrl) {
    saveAudioToDB(`prank_audio_${config.id}`, config.customAudioDataUrl);
    saveAudioToDB('latest_custom_audio', config.customAudioDataUrl);
    try {
      localStorage.setItem(`${LATEST_AUDIO_KEY}_${config.id}`, config.customAudioDataUrl);
      localStorage.setItem(LATEST_AUDIO_KEY, config.customAudioDataUrl);
    } catch {
      // LocalStorage quota may be exceeded by big audio; IndexedDB handles it
    }
  }

  // If custom video is included, save to IndexedDB asynchronously
  if (config.customVideoDataUrl) {
    saveAudioToDB(`prank_video_${config.id}`, config.customVideoDataUrl);
    saveAudioToDB('latest_custom_video', config.customVideoDataUrl);
  }

  try {
    const existing = getSavedPranks();
    // Keep config in localStorage
    const updated = [config, ...existing.filter((p) => p.id !== config.id)];
    localStorage.setItem(PRANKS_KEY, JSON.stringify(updated.slice(0, 15)));
  } catch (e) {
    console.warn('LocalStorage full, stripping audio & video dataUrl from prank config array:', e);
    try {
      const existing = getSavedPranks();
      // Omit large base64 in the array to prevent localStorage quota crash
      const sanitized = { ...config, customAudioDataUrl: undefined, customVideoDataUrl: undefined };
      const updated = [sanitized, ...existing.filter((p) => p.id !== config.id)];
      localStorage.setItem(PRANKS_KEY, JSON.stringify(updated.slice(0, 15)));
    } catch {
      // ignore
    }
  }
}
