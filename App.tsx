import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import InputSection from './components/InputSection.tsx';
import ResultDisplay from './components/ResultDisplay.tsx';
import HistorySidebar from './components/HistorySidebar.tsx';
import BookmarkSidebar from './components/BookmarkSidebar.tsx';
import HadithBookmarkSidebar from './components/HadithBookmarkSidebar.tsx';
import BookDetailPage from './components/BookDetailPage.tsx';
import AuthorDetailPage from './components/AuthorDetailPage.tsx';
import PrayerCountdown from './components/PrayerCountdown.tsx';
import LibraryView from './components/LibraryView.tsx'; 
import BottomNav from './components/BottomNav.tsx';
import SettingsView from './components/SettingsView.tsx';
import ScriptureView from './components/ScriptureView.tsx';
import InheritanceView from './components/InheritanceView.tsx';
import ZakatView from './components/ZakatView.tsx';
import TasbihView from './components/TasbihView.tsx';
import CalendarView from './components/CalendarView.tsx';
import DoaView from './components/DoaView.tsx';
import SholawatView from './components/SholawatView.tsx';
import QiblaView from './components/QiblaView.tsx';
import ReadingPracticeView from './components/ReadingPracticeView.tsx';
import QuizView from './components/QuizView.tsx';
import LoadingIndicator from './components/LoadingIndicator.tsx';
import { analyzeKitabText } from './services/geminiService.ts';
import { TranslationResult, AppSettings, HistoryItem } from './types.ts';
import { AlertTriangle, AlertOctagon, Settings } from 'lucide-react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';

type ViewState = 'HOME' | 'RESULT' | 'BOOK_DETAIL' | 'AUTHOR_DETAIL' | 'LIBRARY_VIEW' | 'QURAN' | 'HADITH' | 'SETTINGS' | 'INHERITANCE' | 'ZAKAT' | 'TASBIH' | 'CALENDAR' | 'DOA' | 'SHOLAWAT' | 'QIBLA' | 'READING_PRACTICE' | 'QUIZ';

// 1. Create & Export App Context for global state
export const AppContext = createContext<any>(null);

const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      return savedSettings ? JSON.parse(savedSettings) : { arabicFont: 'scheherazade', latinFont: 'sans', textSize: 'medium', darkMode: false };
    } catch (e) { return { arabicFont: 'scheherazade', latinFont: 'sans', textSize: 'medium', darkMode: false }; }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('kitabHistory') || '[]'); } 
    catch (e) { return []; }
  });

  const isMounted = useRef(false);

  useEffect(() => {
    try { localStorage.setItem('appSettings', JSON.stringify(settings)); } catch (e) { console.warn("Gagal menyimpan settings"); }
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings]);

  useEffect(() => {
    if (isMounted.current) {
      try { localStorage.setItem('kitabHistory', JSON.stringify(history)); } catch (e) { console.warn("Gagal menyimpan history"); }
    } else { isMounted.current = true; }
  }, [history]);

  const addToHistory = (data: TranslationResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      arabicPreview: data.arabicText.substring(0, 50) + (data.arabicText.length > 50 ? '...' : ''),
      translationPreview: data.translationIndonesia.substring(0, 80) + (data.translationIndonesia.length > 80 ? '...' : ''),
      fullResult: data
    };
    setHistory((prev: HistoryItem[]) => [newItem, ...prev].slice(0, 20));
  };
  
  const value = {
    settings,
    setSettings,
    history,
    setHistory,
    addToHistory
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- HASH ROUTING LOGIC ---
const getViewFromHash = (): { view: ViewState, params: Record<string, string> } => {
  const hash = window.location.hash.slice(1);
  if (!hash) return { view: 'HOME', params: {} };
  
  const [path, query] = hash.split('?');
  const params: Record<string, string> = {};
  if (query) {
    new URLSearchParams(query).forEach((value, key) => {
      params[key] = decodeURIComponent(value);
    });
  }
  
  const view = path.toUpperCase() as ViewState;
  
  const validViews: ViewState[] = ['HOME', 'RESULT', 'BOOK_DETAIL', 'AUTHOR_DETAIL', 'LIBRARY_VIEW', 'QURAN', 'HADITH', 'SETTINGS', 'INHERITANCE', 'ZAKAT', 'TASBIH', 'CALENDAR', 'DOA', 'SHOLAWAT', 'QIBLA', 'READING_PRACTICE', 'QUIZ'];
  
  if (validViews.includes(view)) {
    return { view, params };
  }
  
  return { view: 'HOME', params: {} };
};

const navigate = (view: ViewState, params?: Record<string, string>) => {
  let hash = `#${view.toLowerCase()}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => searchParams.append(key, params[key]));
    hash += `?${searchParams.toString()}`;
  }
  window.location.hash = hash;
};

// --- MAIN APP COMPONENT ---
const AppCore: React.FC = () => {
  const { settings, history, setHistory, addToHistory } = useContext(AppContext);
  
  const [route, setRoute] = useState(getViewFromHash());
  const currentView = route.view;

  // Analysis State
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>('');

  // Sidebar States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [isHadithBookmarkOpen, setIsHadithBookmarkOpen] = useState(false);

  // Scripture Jump States
  const [bookmarkTarget, setBookmarkTarget] = useState<{surah: number, ayah: number} | null>(null);
  const [hadithBookmarkTarget, setHadithBookmarkTarget] = useState<{bookId: string, hadithNumber: number} | null>(null);

  useEffect(() => {
    const handleHashChange = () => setRoute(getViewFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const configureStatusBar = async () => {
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isPluginAvailable('StatusBar')) {
        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ style: settings.darkMode ? Style.Dark : Style.Light });
          await StatusBar.setBackgroundColor({ color: '#00000000' });
        } catch (e) { console.error("Status bar config failed", e); }
      }
    };
    configureStatusBar();
  }, [settings.darkMode]);

  useEffect(() => {
    if (typeof (window as any).Capacitor === 'undefined' || !(window as any).Capacitor.isPluginAvailable('App')) return;
    
    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      if (isHistoryOpen) { setIsHistoryOpen(false); return; }
      if (isBookmarkOpen) { setIsBookmarkOpen(false); return; }
      if (isHadithBookmarkOpen) { setIsHadithBookmarkOpen(false); return; }
      
      if (window.location.hash !== '' && window.location.hash !== '#home') {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });
    
    return () => { listenerPromise.then(l => l.remove()); };
  }, [isHistoryOpen, isBookmarkOpen, isHadithBookmarkOpen]);

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item.fullResult);
    setIsHistoryOpen(false);
    setError(null);
    navigate('RESULT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBookmarkSelect = (surah: number, ayah: number) => {
    setBookmarkTarget({ surah, ayah });
    setIsBookmarkOpen(false);
    navigate('QURAN');
  };

  const handleHadithBookmarkSelect = (bookId: string, hadithNumber: number) => {
    setHadithBookmarkTarget({ bookId, hadithNumber });
    setIsHadithBookmarkOpen(false);
    navigate('HADITH');
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev: HistoryItem[]) => prev.filter(item => item.id !== id));
  };

  const handleClearAllHistory = () => {
    if (confirm('Hapus semua riwayat?')) setHistory([]);
  };

  const handleAnalyze = async (text: string, image: string | undefined) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setInitialInputText(text);
    
    try {
      const data = await analyzeKitabText(text, image);
      setResult(data);
      addToHistory(data);
      navigate('RESULT');
    } catch (err: any) {
      console.error("Analysis Error:", err);
      const errorMessage = err.message || 'Gagal memproses';
      // Check for common API key / quota issues from the backend's forwarded error message
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.includes('429') || errorMessage.toLowerCase().includes('api key not valid')) {
        setError("QUOTA_EXCEEDED");
      } else {
        setError(`Terjadi kesalahan: ${errorMessage}`);
      }
      navigate('HOME'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFromLibrary = async (text: string) => {
    setInitialInputText(text);
    await handleAnalyze(text, undefined);
  };
  
  const handleBackToHome = () => {
    setResult(null);
    setInitialInputText('');
    navigate('HOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (isLoading) return <LoadingIndicator />;

    switch(currentView) {
      case 'SETTINGS': return <SettingsView onHistoryClick={() => setIsHistoryOpen(true)} onBookmarksClick={() => setIsBookmarkOpen(true)} onHadithBookmarksClick={() => setIsHadithBookmarkOpen(true)} />;
      case 'QURAN': return <ScriptureView type="QURAN" onSelect={(t) => handleAnalyze(t, undefined)} initialJump={bookmarkTarget} onOpenBookmarks={() => setIsBookmarkOpen(true)} />;
      case 'HADITH': return <ScriptureView type="HADITH" onSelect={(t) => handleAnalyze(t, undefined)} initialHadithJump={hadithBookmarkTarget} />;
      case 'LIBRARY_VIEW': return <LibraryView onAnalyzeText={handleAnalyzeFromLibrary} initialQuery={route.params.book} onBack={handleBackToHome} onOpenAuthor={(name) => navigate('AUTHOR_DETAIL', {name})} />;
      case 'BOOK_DETAIL': return <BookDetailPage title={route.params.title} author={route.params.author} onBack={() => window.history.back()} onOpenAuthor={(name) => navigate('AUTHOR_DETAIL', {name})} />;
      case 'AUTHOR_DETAIL': return <AuthorDetailPage authorName={route.params.name} onBack={() => window.history.back()} onOpenAuthor={(name) => navigate('AUTHOR_DETAIL', {name})} onOpenBook={(title) => navigate('LIBRARY_VIEW', {book: title})} />;
      case 'RESULT': return result ? <main className="max-w-5xl mx-auto px-4 pt-8 mb-20 animate-fade-in"><ResultDisplay result={result} onOpenBookTOC={(title, author) => navigate('LIBRARY_VIEW', {book: title})} onBack={handleBackToHome} /></main> : null;
      case 'INHERITANCE': return <InheritanceView onBack={handleBackToHome} onAnalyze={(t) => handleAnalyze(t, undefined)} isLoading={isLoading} />;
      case 'ZAKAT': return <ZakatView onBack={handleBackToHome} />;
      case 'TASBIH': return <TasbihView onBack={handleBackToHome} />;
      case 'CALENDAR': return <CalendarView onBack={handleBackToHome} />;
      case 'DOA': return <DoaView onBack={handleBackToHome} onAnalyze={(t) => handleAnalyze(t, undefined)} />;
      case 'SHOLAWAT': return <SholawatView onBack={handleBackToHome} onAnalyze={(t) => handleAnalyze(t, undefined)} />;
      case 'QIBLA': return <QiblaView onBack={handleBackToHome} />;
      case 'READING_PRACTICE': return <ReadingPracticeView onBack={handleBackToHome} />;
      case 'QUIZ': return <QuizView onBack={handleBackToHome} />;
      
      case 'HOME':
      default:
        return (
          <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col items-center pb-24">
            <div className="w-full relative z-10">
              <InputSection onAnalyze={handleAnalyze} onBookSelect={(title) => navigate('LIBRARY_VIEW', {book: title})} isAnalyzing={isLoading} initialValue={initialInputText} onHistoryClick={() => setIsHistoryOpen(true)} onOpenTool={(id) => navigate(id as ViewState)} />
              {error && (
                <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 text-red-700 dark:text-red-300 animate-pulse shadow-sm mx-auto max-w-2xl">
                  {error === "QUOTA_EXCEEDED" ? <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                  <div className="flex-1"><h4 className="font-semibold">{error === "QUOTA_EXCEEDED" ? "Server Sibuk" : "Gagal Memproses"}</h4><p className="text-sm opacity-90">{error === "QUOTA_EXCEEDED" ? "Server sedang sibuk karena banyaknya pengguna. Silakan coba lagi beberapa saat." : error}</p></div>
                </div>
              )}
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col" style={{ colorScheme: settings.darkMode ? 'dark' : 'light' }}>
      <div className="flex flex-col relative z-50"><PrayerCountdown /></div>
      <div className="flex-grow relative z-10">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-50/80 to-transparent dark:from-emerald-900/10 -z-10 pointer-events-none"></div>
        {renderContent()}
      </div>
      <BottomNav currentView={currentView} />
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onSelect={handleHistorySelect} onDelete={handleDeleteHistory} onClearAll={handleClearAllHistory} />
      <BookmarkSidebar isOpen={isBookmarkOpen} onClose={() => setIsBookmarkOpen(false)} onSelect={handleBookmarkSelect} />
      <HadithBookmarkSidebar isOpen={isHadithBookmarkOpen} onClose={() => setIsHadithBookmarkOpen(false)} onSelect={handleHadithBookmarkSelect} />
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppCore />
  </AppProvider>
);

export default App;
