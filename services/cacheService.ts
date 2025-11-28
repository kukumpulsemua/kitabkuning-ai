
import { TranslationResult, BookExplanation, AuthorExplanation } from "../types.ts";

const CACHE_PREFIX = 'kk_v3_cache_';
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 Hari
const MAX_CACHE_ITEMS = 100; // Batas jumlah item tersimpan agar storage tidak penuh

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

// Helper: Simple Hash untuk membuat Key unik dari string panjang
const generateHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

// Helper: Generate Key berdasarkan tipe dan parameter
export const generateCacheKey = (type: 'analysis' | 'book' | 'author' | 'topic' | 'library_toc' | 'library_chapter', params: string[]): string => {
  const rawKey = params.join('|||');
  return `${CACHE_PREFIX}${type}_${generateHash(rawKey)}`;
};

// Set Cache
export const setCache = <T>(key: string, data: T): void => {
  try {
    const entry: CacheEntry<T> = {
      timestamp: Date.now(),
      data: data
    };
    
    // Cek Quota: Jika penuh, hapus item terlama
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      // Jika error (biasanya QuotaExceededError), hapus cache lama
      pruneCache();
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (e2) {
        console.warn("Gagal menyimpan cache meski sudah dibersihkan.", e2);
      }
    }
  } catch (error) {
    console.error("Error saving to cache", error);
  }
};

// Get Cache
export const getCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);
    
    // Cek Kadaluarsa
    if (Date.now() - entry.timestamp > MAX_CACHE_AGE) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error("Error reading cache", error);
    return null;
  }
};

// Hapus Cache Lama (LRU - Least Recently Used simple version)
const pruneCache = () => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      keys.push(key);
    }
  }

  // Jika jumlah item melebihi batas, hapus yang paling tua
  if (keys.length > MAX_CACHE_ITEMS) {
    const sortedKeys = keys.map(key => {
      try {
        const item = localStorage.getItem(key);
        const parsed = item ? JSON.parse(item) as CacheEntry<any> : { timestamp: 0 };
        return { key, timestamp: parsed.timestamp };
      } catch {
        return { key, timestamp: 0 };
      }
    }).sort((a, b) => a.timestamp - b.timestamp); // Urutkan dari yang terlama

    // Hapus 20% item terlama
    const deleteCount = Math.ceil(MAX_CACHE_ITEMS * 0.2);
    for (let i = 0; i < deleteCount; i++) {
      localStorage.removeItem(sortedKeys[i].key);
    }
  }
};

export const clearAppCache = () => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(k => localStorage.removeItem(k));
};
