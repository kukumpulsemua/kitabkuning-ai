import React, { useState, useEffect, useRef, useContext } from 'react';
import { BookOpen, ScrollText, ChevronRight, Search, Play, Pause, ChevronLeft, Sparkles, Book, ArrowRight, Loader2, AlertCircle, ArrowLeft, Bookmark, BookmarkCheck, Copy, Check, Layers, Grid, List, Info, ToggleLeft, ToggleRight, Palette, BookOpenCheck, X, Link, History, Star } from 'lucide-react';
import { AppSettings } from '../types.ts';
import { AppContext } from '../App.tsx';

interface ScriptureViewProps {
  type: 'QURAN' | 'HADITH';
  onSelect: (text: string) => void;
  initialJump?: { surah: number, ayah: number } | null; 
  initialHadithJump?: { bookId: string, hadithNumber: number } | null;
  onOpenBookmarks?: () => void;
}

interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: { [key: string]: string };
}

interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: { [key: string]: string };
}

interface HadithBook {
  id: string;
  name: string;
  available: number;
}

interface HadithData {
  number: number;
  arab: string;
  id: string;
}

const HADITH_METADATA: Record<string, { arabic: string, color: string }> = {
  'bukhari': { arabic: 'صحيح البخاري', color: 'emerald' },
  'muslim': { arabic: 'صحيح مسلم', color: 'emerald' },
  'abu-daud': { arabic: 'سنن أبي داود', color: 'blue' },
  'tirmidzi': { arabic: 'جامع الترمذي', color: 'purple' },
  'nasai': { arabic: 'سنن النسائي', color: 'rose' },
  'ibnu-majah': { arabic: 'سنن ابن ماجه', color: 'orange' },
  'ahmad': { arabic: 'مسند أحمد', color: 'amber' },
  'malik': { arabic: 'موطأ مالك', color: 'teal' },
  'darimi': { arabic: 'سنن الدارمي', color: 'indigo' }
};

const MASYHUR_BOOKS = [
  { title: "Hadits Arba'in Nawawi", author: "Imam An-Nawawi", arabic: "الأربعون النووية", color: "bg-amber-100 text-amber-700" },
  { title: "Kitab Riyadhus Shalihin", author: "Imam An-Nawawi", arabic: "رياض الصالحين", color: "bg-emerald-100 text-emerald-700" },
  { title: "Kitab Bulughul Maram", author: "Ibnu Hajar Al-Asqalani", arabic: "بلوغ المرام", color: "bg-blue-100 text-blue-700" },
];

const JUZ_STARTS = [
  { s: 1, a: 1 }, { s: 2, a: 142 }, { s: 2, a: 253 }, { s: 3, a: 93 }, { s: 4, a: 24 }, { s: 4, a: 148 }, { s: 5, a: 82 }, { s: 6, a: 111 }, { s: 7, a: 88 }, { s: 8, a: 41 }, { s: 9, a: 93 }, { s: 11, a: 6 }, { s: 12, a: 53 }, { s: 15, a: 1 }, { s: 17, a: 1 }, { s: 18, a: 75 }, { s: 21, a: 1 }, { s: 23, a: 1 }, { s: 25, a: 21 }, { s: 27, a: 56 }, { s: 29, a: 46 }, { s: 33, a: 31 }, { s: 36, a: 28 }, { s: 39, a: 32 }, { s: 41, a: 47 }, { s: 46, a: 1 }, { s: 51, a: 31 }, { s: 58, a: 1 }, { s: 67, a: 1 }, { s: 78, a: 1 }
];

const getJuzNumber = (surah: number, ayat: number): number => {
  for (let i = JUZ_STARTS.length - 1; i >= 0; i--) {
    const start = JUZ_STARTS[i];
    if (surah > start.s || (surah === start.s && ayat >= start.a)) {
      return i + 1;
    }
  }
  return 1;
};

const highlightTajweed = (text: string): string => {
  let processed = text;
  const nunTanwin = '([\\u0646\\u064B\\u064C\\u064D]|[\\u0646]\\u0652)'; 
  const wSpace = '[\\s]*';
  processed = processed.replace(/(اللَّهِ|اللَّه|الله)/g, '<span class="text-amber-500 dark:text-amber-400 font-bold" title="Lafzul Jalalah">$1</span>');
  processed = processed.replace(/([\u0646\u0645]\u0651)/g, '<span class="text-red-600 dark:text-red-500 font-bold" title="Ghunnah">$1</span>');
  processed = processed.replace(new RegExp(`${nunTanwin}(?=${wSpace}[\u0628])`, 'g'), '<span class="text-cyan-600 dark:text-cyan-400 font-bold" title="Iqlab">$1</span>');
  processed = processed.replace(new RegExp(`${nunTanwin}(?=${wSpace}[\u064a\u0646\u0645\u0648])`, 'g'), '<span class="text-fuchsia-600 dark:text-fuchsia-400 font-bold" title="Idgham Bighunnah">$1</span>');
  processed = processed.replace(new RegExp(`${nunTanwin}(?=${wSpace}[\u0644\u0631])`, 'g'), '<span class="text-yellow-500 dark:text-yellow-400 font-bold" title="Idgham Bilaghunnah">$1</span>');
  processed = processed.replace(new RegExp(`${nunTanwin}(?=${wSpace}[\u0623\u0625\u0621\u0647\u062d\u062e\u0639\u063a])`, 'g'), '<span class="text-orange-600 dark:text-orange-400 font-bold" title="Izhar Halqi">$1</span>');
  const ikhfaLetters = '[\u062a\u062b\u062c\u062f\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0641\u0642\u0643]';
  processed = processed.replace(new RegExp(`${nunTanwin}(?=${wSpace}${ikhfaLetters})`, 'g'), '<span class="text-green-500 dark:text-green-400 font-bold" title="Ikhfa Haqiqi">$1</span>');
  processed = processed.replace(/([\u0642\u0637\u0628\u062c\u062f]\u0652)/g, '<span class="text-blue-700 dark:text-blue-400 font-bold" title="Qalqalah">$1</span>');
  processed = processed.replace(/([\u0653])/g, '<span class="text-purple-600 dark:text-purple-400 font-bold text-xl" title="Mad Wajib/Jaiz">$1</span>');
  return processed;
};

interface AyahItemProps {
  ayat: Ayat;
  idx: number;
  isActive: boolean;
  isPlaying: boolean;
  isBookmarked: boolean;
  isTajwidMode: boolean;
  onPlay: () => void;
  onSelect: (text: string) => void;
  onToggleBookmark: () => void;
  onOpenTafsir: () => void;
  activeSurah: Surah | null;
  fontClass: string;
}

const AyahItem: React.FC<AyahItemProps> = ({ ayat, idx, isActive, isPlaying, isBookmarked, isTajwidMode, onPlay, onSelect, onToggleBookmark, onOpenTafsir, activeSurah, fontClass }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const juzNumber = activeSurah ? getJuzNumber(activeSurah.nomor, ayat.nomorAyat) : null;

  useEffect(() => { if (isActive) itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [isActive]);

  const handleCopy = () => {
    const textToCopy = `[Q.S ${activeSurah?.namaLatin}: ${ayat.nomorAyat}]\n${ayat.teksArab}\n\n(${ayat.teksLatin})\n\n"${ayat.teksIndonesia}"`;
    navigator.clipboard.writeText(textToCopy); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div ref={itemRef} id={`ayat-${idx}`} className={`p-4 sm:p-6 rounded-2xl border-b-2 transition-all duration-300 relative ${isActive ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
      {juzNumber && <div className="absolute top-0 left-0 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-br-xl text-[10px] font-black uppercase tracking-widest shadow-sm z-10 flex items-center gap-1"><Layers className="w-3 h-3" />Juz {juzNumber}</div>}
      <div className="flex justify-between items-start mb-4 mt-4 sm:mt-0"><div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shadow-sm border border-emerald-200 dark:border-emerald-800 shrink-0">{ayat.nomorAyat}</div></div>
      <div className="text-right mb-6 pl-2">{isTajwidMode ? <p className={`${fontClass} leading-[2.4] text-gray-800 dark:text-gray-100`} dir="rtl" dangerouslySetInnerHTML={{ __html: highlightTajweed(ayat.teksArab) }} /> : <p className={`${fontClass} leading-[2.2] text-gray-800 dark:text-gray-100`} dir="rtl">{ayat.teksArab}</p>}</div>
      <div className="space-y-2 mb-6">{ayat.teksLatin && <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">{ayat.teksLatin}</p>}<p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-l-2 border-gray-200 dark:border-gray-700 pl-3">{ayat.teksIndonesia}</p></div>
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2 justify-end sm:justify-start">
          <button onClick={onPlay} className={`p-2 rounded-full transition-colors border ${isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>{isActive && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
          <button onClick={onToggleBookmark} className={`p-2 rounded-full transition-colors border ${isBookmarked ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-amber-50 hover:text-amber-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>{isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}</button>
          <button onClick={handleCopy} className={`p-2 rounded-full transition-colors border ${isCopied ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>{isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
          <button onClick={() => {const context = `(Q.S ${activeSurah?.namaLatin}: ${ayat.nomorAyat})`; onSelect(`Analisis Hukum Tajwid: ${ayat.teksArab}\n${context}`);}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] sm:text-xs font-bold transition-colors dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/50"><Info className="w-3 h-3" /><span>Tajwid</span></button>
          <button onClick={onOpenTafsir} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold transition-colors dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50"><BookOpenCheck className="w-3 h-3" /><span>Tafsir</span></button>
          <button onClick={() => {const context = `(Q.S ${activeSurah?.namaLatin}: ${ayat.nomorAyat})`; onSelect(`Asbabun Nuzul: ${context}`);}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] sm:text-xs font-bold transition-colors dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/50"><History className="w-3 h-3" /><span>Asbabun Nuzul</span></button>
          <button onClick={() => {const context = `(Q.S ${activeSurah?.namaLatin})`; onSelect(`Munasabah: ${context}`);}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[10px] sm:text-xs font-bold transition-colors dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800/50"><Link className="w-3 h-3" /><span>Munasabah</span></button>
          <button onClick={() => {const context = `(Q.S ${activeSurah?.namaLatin})`; onSelect(`Tafsir Tahlili ${context} ayat ${ayat.nomorAyat}: ${ayat.teksArab}`);}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] sm:text-xs font-bold transition-colors dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/50"><Sparkles className="w-3 h-3" /><span>Bedah AI</span></button>
      </div>
    </div>
  );
};

const BISMILLAH_AUDIO = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3";

const ScriptureView: React.FC<ScriptureViewProps> = ({ type, onSelect, initialJump, initialHadithJump, onOpenBookmarks }) => {
  const { settings } = useContext(AppContext);
  const isQuran = type === 'QURAN';
  const title = isQuran ? "Al-Qur'anul Karim" : "Kutubul Hadits";
  const desc = isQuran ? "Baca per Surah, dengarkan Murrotal, dan tadabbur ayat." : "Pilih Kitab Hadits untuk syarah & penjelasan.";
  const Icon = isQuran ? BookOpen : ScrollText;
  
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [activeSurah, setActiveSurah] = useState<Surah | null>(null);
  const [ayatList, setAyatList] = useState<Ayat[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('quranBookmarks') || '[]'); } catch { return []; }
  });
  const [hadithBookmarks, setHadithBookmarks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hadithBookmarks') || '[]'); } catch { return []; }
  });

  const [tafsirModalOpen, setTafsirModalOpen] = useState(false);
  const [tafsirContent, setTafsirContent] = useState<string | null>(null);
  const [tafsirAyatNum, setTafsirAyatNum] = useState<number>(0);
  const [isTafsirLoading, setIsTafsirLoading] = useState(false);
  const surahTafsirCache = useRef<any[] | null>(null);
  const currentSurahTafsirId = useRef<number | null>(null);

  const [quranTab, setQuranTab] = useState<'SURAH' | 'JUZ'>('SURAH');
  const [pendingScrollToAyat, setPendingScrollToAyat] = useState<number | null>(null);
  const [pendingScrollToHadith, setPendingScrollToHadith] = useState<number | null>(null);
  const [isTajwidMode, setIsTajwidMode] = useState(false);
  
  const [hadithBooksList, setHadithBooksList] = useState<HadithBook[]>([]);
  const [activeHadithBook, setActiveHadithBook] = useState<HadithBook | null>(null);
  const [hadithList, setHadithList] = useState<HadithData[]>([]);
  const [hadithPage, setHadithPage] = useState(1);
  const HADITH_PER_PAGE = 20;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<'LIST' | 'DETAIL'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAyatIndex, setPlayingAyatIndex] = useState<number | null>(null);
  
  const [isPlayingBismillah, setIsPlayingBismillah] = useState(false);
  const shouldAutoPlayNextRef = useRef(false);

  useEffect(() => { if (initialJump && isQuran) { if (activeSurah?.nomor === initialJump.surah) { setPendingScrollToAyat(initialJump.ayah); } else { fetchSurahDetail(initialJump.surah); setPendingScrollToAyat(initialJump.ayah); } } }, [initialJump]);
  useEffect(() => { if (initialHadithJump && !isQuran) { const { bookId, hadithNumber } = initialHadithJump; const targetPage = Math.ceil(hadithNumber / HADITH_PER_PAGE); if (activeHadithBook?.id === bookId) { if (hadithPage !== targetPage) handleHadithPageChange(targetPage); setPendingScrollToHadith(hadithNumber); } else { const doJump = async () => { setIsLoading(true); let books = hadithBooksList; if (books.length === 0) { try { const res = await fetch('https://api.hadith.gading.dev/books'); const data = await res.json(); if (data.code === 200) { setHadithBooksList(data.data); books = data.data; } } catch (e) { console.error(e); } } const book = books.find(b => b.id === bookId); if (book) { setActiveHadithBook(book); setViewState('DETAIL'); setHadithPage(targetPage); await fetchHadithDetail(bookId, targetPage); setPendingScrollToHadith(hadithNumber); } setIsLoading(false); }; doJump(); } } }, [initialHadithJump]);
  useEffect(() => { if (isQuran) fetchSurahList(); else fetchHadithBooks(); setViewState('LIST'); setActiveSurah(null); setActiveHadithBook(null); setSearchQuery(''); setError(null); resetAudioPlayer(); setQuranTab('SURAH'); setTafsirModalOpen(false); }, [type]);
  useEffect(() => { localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('hadithBookmarks', JSON.stringify(hadithBookmarks)); }, [hadithBookmarks]);
  useEffect(() => { if (activeSurah && ayatList.length > 0 && shouldAutoPlayNextRef.current) { shouldAutoPlayNextRef.current = false; handlePlayAudio(ayatList[0].audio['05'], 0); } }, [activeSurah, ayatList]);
  useEffect(() => { if (viewState === 'DETAIL' && ayatList.length > 0 && pendingScrollToAyat !== null) { const timer = setTimeout(() => { const el = document.getElementById(`ayat-${pendingScrollToAyat - 1}`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('ring-2', 'ring-teal-400'); setTimeout(() => el.classList.remove('ring-2', 'ring-teal-400'), 2000); } setPendingScrollToAyat(null); }, 600); return () => clearTimeout(timer); } }, [viewState, ayatList, pendingScrollToAyat]);
  useEffect(() => { if (viewState === 'DETAIL' && hadithList.length > 0 && pendingScrollToHadith !== null) { const timer = setTimeout(() => { const idx = hadithList.findIndex(h => h.number === pendingScrollToHadith); if (idx >= 0) { const el = document.getElementById(`hadith-${idx}`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('ring-2', 'ring-amber-400'); setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 2000); } } setPendingScrollToHadith(null); }, 800); return () => clearTimeout(timer); } }, [viewState, hadithList, pendingScrollToHadith]);

  const toggleBookmark = (s: number, a: number) => { const k = `${s}:${a}`; setBookmarks(p => p.includes(k) ? p.filter(b => b !== k) : [...p, k]); };
  const isBookmarked = (s: number, a: number) => bookmarks.includes(`${s}:${a}`);
  const toggleHadithBookmark = (b: string, n: number) => { const k = `${b}:${n}`; setHadithBookmarks(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]); };
  const isHadithBookmarked = (b: string, n: number) => hadithBookmarks.includes(`${b}:${n}`);
  const fetchSurahList = async () => { setIsLoading(true); try { const res = await fetch('https://equran.id/api/v2/surat'); const d = await res.json(); if(d.code===200) setSurahList(d.data); } catch { setError("Gagal memuat surat."); } finally { setIsLoading(false); }};
  const fetchSurahDetail = async (nomor: number) => { setIsLoading(true); setError(null); try { const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`); const d = await res.json(); if(d.code===200){ setActiveSurah(d.data); setAyatList(d.data.ayat); setViewState('DETAIL'); if(currentSurahTafsirId.current!==nomor){ surahTafsirCache.current=null; currentSurahTafsirId.current=nomor; } if(!shouldAutoPlayNextRef.current) resetAudioPlayer(); } } catch { setError("Gagal detail surat."); } finally { setIsLoading(false); }};
  const handleJuzClick = (idx: number) => { const s = JUZ_STARTS[idx]; fetchSurahDetail(s.s); setPendingScrollToAyat(s.a); };
  const fetchHadithBooks = async () => { setIsLoading(true); try { const res = await fetch('https://api.hadith.gading.dev/books'); const d = await res.json(); if(d.code===200) setHadithBooksList(d.data); } catch { setError("Gagal memuat kitab hadits."); } finally { setIsLoading(false); }};
  const fetchHadithDetail = async (id: string, page: number) => { setIsLoading(true); setError(null); try { const s=(page-1)*HADITH_PER_PAGE+1; const e=page*HADITH_PER_PAGE; const res = await fetch(`https://api.hadith.gading.dev/books/${id}?range=${s}-${e}`); const d = await res.json(); if(d.code===200){ setHadithList(d.data.hadiths); setHadithPage(page); } else setError("Gagal memuat data."); } catch { setError("API Error."); } finally { setIsLoading(false); }};
  const handleHadithBookClick = (b: HadithBook) => { setActiveHadithBook(b); setViewState('DETAIL'); setHadithPage(1); fetchHadithDetail(b.id, 1); };
  const handleHadithPageChange = (p: number) => { if(activeHadithBook && p>=1){ fetchHadithDetail(activeHadithBook.id, p); window.scrollTo({top:0, behavior:'smooth'}); }};
  const handleMasyhurClick = (t: string) => { onSelect(`Saya ingin mempelajari kitab "${t}". Jelaskan ringkasan dan poin pentingnya.`); };
  const handleOpenTafsir = async (ayatNum: number) => { setTafsirAyatNum(ayatNum); setTafsirModalOpen(true); setTafsirContent(null); setIsTafsirLoading(true); if (activeSurah) { if (currentSurahTafsirId.current === activeSurah.nomor && surahTafsirCache.current) { const item = surahTafsirCache.current.find((t: any) => t.ayat === ayatNum); setTafsirContent(item ? item.teks : "Tafsir belum tersedia."); setIsTafsirLoading(false); return; } try { const res = await fetch(`https://equran.id/api/v2/tafsir/${activeSurah.nomor}`); const data = await res.json(); if (data.code === 200) { surahTafsirCache.current = data.data.tafsir; currentSurahTafsirId.current = activeSurah.nomor; const item = data.data.tafsir.find((t: any) => t.ayat === ayatNum); setTafsirContent(item ? item.teks : "Tafsir belum tersedia."); } else setTafsirContent("Gagal memuat tafsir."); } catch { setTafsirContent("Terjadi kesalahan koneksi."); } finally { setIsTafsirLoading(false); } } };
  const resetAudioPlayer = () => { if (audioRef.current && !audioRef.current.paused) audioRef.current.pause(); setPlayingAyatIndex(null); setIsPlaying(false); setIsPlayingBismillah(false); };
  
  const playUrl = async (url: string) => {
    const audioEl = audioRef.current;
    if (!audioEl) { console.error("Audio element ref is not available."); return; }
    if (!audioEl.paused) audioEl.pause();
    if (audioEl.src !== url) audioEl.src = url;
    audioEl.currentTime = 0;
    try { await audioEl.play(); setIsPlaying(true); } 
    catch (error: any) { console.error("Audio play failed:", error.name, error.message); if (error.name === 'NotSupportedError') console.error(`Source URL might be invalid or unsupported: ${url}`); resetAudioPlayer(); }
  };

  const handlePlayAudio = (url: string, index: number, force: boolean = false) => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (playingAyatIndex === index && isPlaying) { audioEl.pause(); setIsPlaying(false); setPlayingAyatIndex(null); setIsPlayingBismillah(false); return; }
    if (index === 0 && !force && activeSurah && activeSurah.nomor !== 1 && activeSurah.nomor !== 9) { setPlayingAyatIndex(0); setIsPlayingBismillah(true); playUrl(BISMILLAH_AUDIO); } 
    else { setPlayingAyatIndex(index); setIsPlayingBismillah(false); playUrl(url); }
  };

  const handleAudioEnded = () => {
    if (isPlayingBismillah) { setIsPlayingBismillah(false); if (ayatList.length > 0) { setPlayingAyatIndex(0); playUrl(ayatList[0].audio['05']); } return; }
    if (playingAyatIndex !== null && playingAyatIndex < ayatList.length - 1) { const nextIndex = playingAyatIndex + 1; setPlayingAyatIndex(nextIndex); playUrl(ayatList[nextIndex].audio['05']); } 
    else { if (activeSurah && activeSurah.nomor < 114) { shouldAutoPlayNextRef.current = true; fetchSurahDetail(activeSurah.nomor + 1); } else resetAudioPlayer(); }
  };
  
  const getFontClass = () => { const f = settings?.arabicFont==='amiri'?'font-amiri':'font-arabic'; const s=settings?.textSize==='small'?'text-2xl':settings?.textSize==='large'?'text-4xl':'text-3xl'; return `${f} ${s}`; };

  const TAJWID_LEGEND = [ { rule: 'Ghunnah', bg: 'bg-red-600' }, { rule: 'Qalqalah', bg: 'bg-blue-700' }, { rule: 'Ikhfa\' Haqiqi', bg: 'bg-green-500' }, { rule: 'Iqlab', bg: 'bg-cyan-600' }, { rule: 'Idgham Bighunnah', bg: 'bg-fuchsia-600' }, { rule: 'Idgham Bilaghunnah', bg: 'bg-yellow-500' }, { rule: 'Izhar Halqi', bg: 'bg-orange-600' }, { rule: 'Mad', bg: 'bg-purple-600' }, { rule: 'Lafzul Jalalah', bg: 'bg-amber-500' }, ];

  if (isQuran && viewState === 'DETAIL' && activeSurah) { return ( <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up pb-32"> <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><button onClick={() => setViewState('LIST')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 font-bold text-sm"><ChevronLeft className="w-4 h-4" /> Kembali</button></div> <div className="bg-emerald-600 rounded-3xl p-6 text-center text-white mb-6 shadow-lg relative overflow-hidden"> <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div> <div className="font-amiri text-4xl mb-2 relative z-10">{activeSurah.nama}</div> <h2 className="text-2xl font-bold relative z-10">{activeSurah.namaLatin}</h2> <p className="text-emerald-100 text-sm mt-1 relative z-10">{activeSurah.arti} • {activeSurah.jumlahAyat} Ayat</p> <div className="mt-6 flex justify-center relative z-10"><audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" onError={(e) => { console.error('Audio element error:', e.currentTarget.error); resetAudioPlayer(); }}/></div> </div> <div className="flex justify-center mb-6"><button onClick={() => setIsTajwidMode(!isTajwidMode)} className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-sm font-bold transition-all shadow-sm ${isTajwidMode ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-white text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}><Palette className="w-4 h-4" /><span>Mode Tajwid: {isTajwidMode?'ON':'OFF'}</span>{isTajwidMode?<ToggleRight className="w-5 h-5 text-emerald-600"/>:<ToggleLeft className="w-5 h-5 text-gray-400"/>}</button></div> {isTajwidMode && ( <div className="mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 animate-slide-down shadow-sm"> <h4 className="text-xs font-bold text-center text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Keterangan Warna Tajwid</h4> <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2"> {TAJWID_LEGEND.map(item => ( <div key={item.rule} className="flex items-center gap-2"> <div className={`w-3 h-3 rounded-full ${item.bg}`}></div> <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.rule}</span> </div> ))} </div> </div> )} {activeSurah.nomor!==1 && activeSurah.nomor!==9 && <div className="text-center mb-8 font-amiri text-3xl text-gray-800 dark:text-gray-200">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</div>} <div className="space-y-4"> {ayatList.map((ayat, idx) => ( <AyahItem key={idx} ayat={ayat} idx={idx} isActive={playingAyatIndex===idx} isPlaying={isPlaying} isBookmarked={isBookmarked(activeSurah.nomor, ayat.nomorAyat)} isTajwidMode={isTajwidMode} onPlay={() => handlePlayAudio(ayat.audio['05'], idx)} onSelect={onSelect} onToggleBookmark={() => toggleBookmark(activeSurah.nomor, ayat.nomorAyat)} onOpenTafsir={() => handleOpenTafsir(ayat.nomorAyat)} activeSurah={activeSurah} fontClass={getFontClass()} /> ))} </div> <div className="flex justify-between mt-10"> {activeSurah.nomor > 1 && <button onClick={() => fetchSurahDetail(activeSurah.nomor - 1)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border hover:bg-emerald-50 flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Surah Sebelumnya</button>} {activeSurah.nomor < 114 && <button onClick={() => fetchSurahDetail(activeSurah.nomor + 1)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border hover:bg-emerald-50 flex items-center gap-2 ml-auto">Surah Berikutnya <ChevronRight className="w-4 h-4" /></button>} </div> {tafsirModalOpen && ( <div className="fixed inset-0 z-[60] flex items-end justify-center"> <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setTafsirModalOpen(false)}></div> <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[85vh] animate-slide-up-modal relative"> <div className="w-full flex justify-center pt-3 pb-1 shrink-0"><div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div></div> <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0"> <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center"><BookOpenCheck className="w-5 h-5" /></div><div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Tafsir Kemenag</h3><p className="text-xs text-gray-500 dark:text-gray-400">QS. {activeSurah.namaLatin} Ayat {tafsirAyatNum}</p></div></div> <button onClick={() => setTafsirModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"><X className="w-5 h-5" /></button> </div> <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 custom-scrollbar min-h-0"> {isTafsirLoading ? <div className="flex flex-col items-center justify-center py-10 text-gray-400"><Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" /><p className="text-sm font-medium">Mengambil tafsir...</p></div> : <div className="prose prose-blue dark:prose-invert max-w-none"><p className="text-gray-700 dark:text-gray-300 leading-loose text-justify text-base">{tafsirContent}</p></div>} </div> </div> </div> )} </div> ); }

  if (!isQuran && viewState === 'DETAIL' && activeHadithBook) { return ( <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up pb-32"> <button onClick={() => setViewState('LIST')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 mb-6 font-bold text-sm"><ChevronLeft className="w-4 h-4" /> Kembali</button> <div className="bg-amber-600 rounded-3xl p-6 text-center text-white mb-8 shadow-lg relative overflow-hidden"> <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div> <Book className="w-10 h-10 mx-auto mb-2 text-amber-200" /> <h2 className="font-serif text-3xl font-bold relative z-10">{activeHadithBook.name}</h2> <p className="text-amber-100 text-sm mt-1 relative z-10">Total: {activeHadithBook.available} Hadits</p> <div className="flex items-center justify-center gap-4 mt-6 relative z-10"> <button disabled={hadithPage<=1||isLoading} onClick={()=>handleHadithPageChange(hadithPage-1)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button> <span className="font-mono bg-black/20 px-3 py-1 rounded-lg text-sm">Hal. {hadithPage}</span> <button disabled={(hadithPage*HADITH_PER_PAGE)>=activeHadithBook.available||isLoading} onClick={()=>handleHadithPageChange(hadithPage+1)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full disabled:opacity-30"><ChevronRight className="w-5 h-5"/></button> </div> </div> {isLoading ? <div className="py-20 flex flex-col items-center justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin mb-2 text-amber-500" /><p>Memuat hadits...</p></div> : error ? <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl border border-red-200"><AlertCircle className="w-8 h-8 mx-auto mb-2" /><p>{error}</p><button onClick={()=>fetchHadithDetail(activeHadithBook.id, hadithPage)} className="mt-4 font-bold underline">Coba Lagi</button></div> : ( <div className="space-y-6"> {hadithList.map((hadith, idx) => { const isBookmarked = isHadithBookmarked(activeHadithBook.id, hadith.number); return ( <div key={idx} id={`hadith-${idx}`} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-amber-300 dark:hover:border-amber-700 transition-colors"> <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-3"> <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-lg text-xs font-bold">Hadits No. {hadith.number}</span> <div className="flex gap-2"> <button onClick={() => toggleHadithBookmark(activeHadithBook.id, hadith.number)} className={`p-1.5 rounded-full transition-colors ${isBookmarked ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500 dark:bg-gray-700 dark:text-gray-400'}`}>{isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}</button> <button onClick={() => { navigator.clipboard.writeText(`[Hadits ${activeHadithBook.name} No. ${hadith.number}]\n\n${hadith.arab}\n\n"${hadith.id}"`); alert("Disalin!"); }} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"><Copy className="w-3.5 h-3.5" /></button> <button onClick={() => onSelect(`Bedah Hadits ${activeHadithBook.name} Nomor ${hadith.number}:\n\n${hadith.arab}\n\n${hadith.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors dark:bg-emerald-900/20 dark:text-emerald-300"><Sparkles className="w-3 h-3" /> Bedah</button> </div> </div> <p className={`${getFontClass()} text-right text-gray-800 dark:text-gray-100 leading-loose mb-4`} dir="rtl">{hadith.arab}</p> <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-justify">{hadith.id}</p> </div> ); })} </div> )} {!isLoading && !error && hadithList.length > 0 && ( <div className="flex justify-center gap-4 mt-8"> <button disabled={hadithPage <= 1} onClick={() => handleHadithPageChange(hadithPage - 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Sebelumnya</button> <button disabled={(hadithPage * HADITH_PER_PAGE) >= activeHadithBook.available} onClick={() => handleHadithPageChange(hadithPage + 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">Selanjutnya <ChevronRight className="w-4 h-4" /></button> </div> )} </div> ); }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in pb-24">
      <div className="text-center mb-8">
         <div className={`w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400`}><Icon className="w-8 h-8" /></div>
         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-serif">{title}</h2>
         <p className="text-gray-600 dark:text-gray-400">{desc}</p>
      </div>
      {isQuran && (<div className="flex justify-center mb-8"><div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex items-center"> <button onClick={() => setQuranTab('SURAH')} className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${quranTab==='SURAH'?'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm':'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Surah</button> <button onClick={() => setQuranTab('JUZ')} className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${quranTab==='JUZ'?'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm':'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Juz</button> {onOpenBookmarks && <button onClick={onOpenBookmarks} className="px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all text-gray-500 hover:text-teal-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700 flex items-center gap-2"><Bookmark className="w-4 h-4" /><span>Bookmark</span></button>} </div></div> )}
      {isQuran ? ( quranTab === 'SURAH' ? ( <> <div className="mb-8 relative max-w-xl mx-auto"><input type="text" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Cari surat..." className="w-full p-4 pl-12 rounded-xl border-2 bg-white dark:bg-gray-800" /><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /></div> {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i=><div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>)}</div> : ( <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> {surahList.filter(s=>s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase())).map(surah=>( <button key={surah.nomor} onClick={()=>fetchSurahDetail(surah.nomor)} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border hover:border-emerald-400 transition-all group text-left"> <div className="flex items-center gap-4"><div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold text-sm border">{surah.nomor}</div><div><h4 className="font-bold text-gray-800 dark:text-gray-200">{surah.namaLatin}</h4><p className="text-xs text-gray-500 dark:text-gray-400">{surah.arti}</p></div></div> <div className="font-amiri text-xl text-emerald-800 dark:text-emerald-200">{surah.nama.replace('سورة','').trim()}</div> </button> ))} </div> )} </> ) : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-slide-up">{JUZ_STARTS.map((s,i)=><button key={i+1} onClick={()=>handleJuzClick(i)} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl border hover:border-emerald-500 hover:shadow-md relative overflow-hidden"><div className="absolute top-0 right-0 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-xl text-[10px] font-bold text-emerald-600">Juz {i+1}</div><Layers className="w-8 h-8 text-emerald-200 mb-2"/><h4 className="font-bold text-gray-800 dark:text-white">Juz {i+1}</h4></button>)}</div> ) : ( <div className="max-w-xl mx-auto"> <div className="mb-8 relative"><input type="text" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Cari topik..." className="w-full p-4 pl-12 rounded-xl border bg-white dark:bg-gray-800" /><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /></div> <div className="mb-8"><h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4"/> Kitab Masyhur</h4><div className="space-y-3">{MASYHUR_BOOKS.map((b,i)=><button key={i} onClick={()=>handleMasyhurClick(b.title)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border hover:border-amber-300 transition-all text-left"><div><h5 className="font-bold text-gray-800 dark:text-gray-200">{b.title}</h5><p className="text-xs text-gray-500">{b.author}</p></div><ArrowRight className="w-4 h-4 text-gray-300"/></button>)}</div></div> <div><h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Book className="w-4 h-4"/> Koleksi 9 Imam</h4> {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>)}</div> : <div className="space-y-3">{hadithBooksList.filter(b=>b.name.toLowerCase().includes(searchQuery.toLowerCase())).map(b=><button key={b.id} onClick={()=>handleHadithBookClick(b)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border hover:border-emerald-400 transition-all"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><Book className="w-6 h-6"/></div><div className="text-left"><h4 className="font-bold text-gray-900 dark:text-white">HR. {b.name}</h4><span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">{b.available} Hadits</span></div></div></button>)}</div>} </div> </div> )}
    </div>
  );
};

export default ScriptureView;
