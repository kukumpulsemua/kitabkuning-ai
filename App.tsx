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
import AuthView from './components/AuthView.tsx';
import LoadingIndicator from './components/LoadingIndicator.tsx';
import { analyzeKitabText } from './services/geminiService.ts';
import * as supabaseService from './services/supabaseService.ts';
import { TranslationResult, AppSettings, HistoryItem } from './types.ts';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { Session } from '@supabase/supabase-js';

type ViewState = 'HOME' | 'RESULT' | 'BOOK_DETAIL' | 'AUTHOR_DETAIL' | 'LIBRARY_VIEW' | 'QURAN' | 'HADITH' | 'SETTINGS' | 'INHERITANCE' | 'ZAKAT' | 'TASBIH' | 'CALENDAR' | 'DOA' | 'SHOLAWAT' | 'QIBLA' | 'READING_PRACTICE' | 'QUIZ' | 'AUTH';

export const AppContext = createContext<any>(null);

const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      return saved ? JSON.parse(saved) : { arabicFont: 'scheherazade', latinFont: 'sans', textSize: 'medium', darkMode: false };
    } catch { return { arabicFont: 'scheherazade', latinFont: 'sans', textSize: 'medium', darkMode: false }; }
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load initial session and subscribe to auth changes
  useEffect(() => {
    setAuthLoading(true);
    supabaseService.getSession().then(s => {
      setSession(s);
      setAuthLoading(false);
    });
    const authSubscription = supabaseService.onAuthStateChange(setSession);
    return () => authSubscription.unsubscribe();
  }, []);

  // Fetch data based on session
  useEffect(() => {
    const loadData = async () => {
      if (session) {
        // User is logged in, fetch from Supabase
        const cloudHistory = await supabaseService.getHistory();
        setHistory(cloudHistory);
      } else if (!authLoading) {
        // User is logged out, load from local storage
        try {
          const localHistory = JSON.parse(localStorage.getItem('kitabHistory') || '[]');
          setHistory(localHistory);
        } catch { setHistory([]); }
      }
    };
    loadData();
  }, [session, authLoading]);
  
  // Migrate local data to cloud on first login
  useEffect(() => {
    if (session) {
      const hasMigrated = localStorage.getItem('hasMigratedToCloud');
      if (!hasMigrated) {
        try {
          const localHistory = JSON.parse(localStorage.getItem('kitabHistory') || '[]');
          if (localHistory.length > 0) {
            console.log("Migrating local history to cloud...");
            Promise.all(localHistory.map((item: any) => supabaseService.addHistoryItem({
              arabicPreview: item.arabicPreview,
              translationPreview: item.translationPreview,
              fullResult: item.fullResult,
            }))).then(() => {
              console.log("Migration complete.");
              localStorage.setItem('hasMigratedToCloud', 'true');
            });
          } else {
             localStorage.setItem('hasMigratedToCloud', 'true');
          }
        } catch {}
      }
    }
  }, [session]);


  // Save settings to local storage
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings]);

  // --- Data Management Functions ---
  const addToHistory = async (data: TranslationResult) => {
    const newItem: Omit<HistoryItem, 'id' | 'timestamp'> = {
      arabicPreview: data.arabicText.substring(0, 50) + (data.arabicText.length > 50 ? '...' : ''),
      translationPreview: data.translationIndonesia.substring(0, 80) + (data.translationIndonesia.length > 80 ? '...' : ''),
      fullResult: data
    };
    if (session) {
      await supabaseService.addHistoryItem(newItem);
      const updatedHistory = await supabaseService.getHistory();
      setHistory(updatedHistory);
    } else {
      setHistory(prev => {
        const newHistory = [{ ...newItem, id: Date.now().toString(), timestamp: Date.now() }, ...prev].slice(0, 20);
        localStorage.setItem('kitabHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (session) {
      await supabaseService.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } else {
      setHistory(prev => {
        const newHistory = prev.filter(item => item.id !== id);
        localStorage.setItem('kitabHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  };

  const clearAllHistory = async () => {
    if (confirm('Hapus semua riwayat?')) {
      if (session) {
        await supabaseService.clearHistory();
      } else {
        localStorage.setItem('kitabHistory', '[]');
      }
      setHistory([]);
    }
  };
  
  const value = {
    settings,
    setSettings,
    history,
    addToHistory,
    deleteHistoryItem,
    clearAllHistory,
    session,
    authLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const getViewFromHash = (): { view: ViewState, params: Record<string, string> } => {
  const hash = window.location.hash.slice(1);
  if (!hash) return { view: 'HOME', params: {} };
  
  const [path, query] = hash.split('?');
  const params: Record<string, string> = {};
  if (query) new URLSearchParams(query).forEach((v,k) => { params[k] = decodeURIComponent(v); });
  
  const view = path.toUpperCase() as ViewState;
  const validViews: ViewState[] = ['HOME','RESULT','BOOK_DETAIL','AUTHOR_DETAIL','LIBRARY_VIEW','QURAN','HADITH','SETTINGS','INHERITANCE','ZAKAT','TASBIH','CALENDAR','DOA','SHOLAWAT','QIBLA','READING_PRACTICE','QUIZ', 'AUTH'];
  
  return validViews.includes(view) ? { view, params } : { view: 'HOME', params: {} };
};

export const navigate = (view: ViewState, params?: Record<string, string>) => {
  let hash = `#${view.toLowerCase()}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => searchParams.append(key, params[key]));
    hash += `?${searchParams.toString()}`;
  }
  window.location.hash = hash;
};

const AppCore: React.FC = () => {
  const { settings, history, addToHistory, deleteHistoryItem, clearAllHistory, session } = useContext(AppContext);
  
  const [route, setRoute] = useState(getViewFromHash());
  const currentView = route.view;

  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>('');

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [isHadithBookmarkOpen, setIsHadithBookmarkOpen] = useState(false);

  const [bookmarkTarget, setBookmarkTarget] = useState<{surah: number, ayah: number} | null>(null);
  const [hadithBookmarkTarget, setHadithBookmarkTarget] = useState<{bookId: string, hadithNumber: number} | null>(null);
  
  // Public Cache State
  const [publicAnalyses, setPublicAnalyses] = useState<any[]>([]);

  useEffect(() => {
    const handleHashChange = () => setRoute(getViewFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isPluginAvailable('StatusBar')) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(console.error);
    }
  }, []);

  useEffect(() => {
     if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isPluginAvailable('StatusBar')) {
        StatusBar.setStyle({ style: settings.darkMode ? Style.Dark : Style.Light }).catch(console.error);
     }
  }, [settings.darkMode]);

  useEffect(() => {
    if (typeof (window as any).Capacitor?.isPluginAvailable('App')) {
      const listenerPromise = CapacitorApp.addListener('backButton', () => {
        if (isHistoryOpen || isBookmarkOpen || isHadithBookmarkOpen) {
          setIsHistoryOpen(false); setIsBookmarkOpen(false); setIsHadithBookmarkOpen(false); return;
        }
        if (window.location.hash !== '' && window.location.hash !== '#home') {
          window.history.back();
        } else {
          CapacitorApp.exitApp();
        }
      });
      return () => { listenerPromise.then(l => l.remove()); };
    }
  }, [isHistoryOpen, isBookmarkOpen, isHadithBookmarkOpen]);

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item.fullResult);
    setIsHistoryOpen(false);
    setError(null);
    navigate('RESULT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublicAnalysisSelect = (analysis: any) => {
    setResult(analysis.full_result);
    setError(null);
    navigate('RESULT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBookmarkSelect = (surah: number, ayah: number) => { setBookmarkTarget({ surah, ayah }); setIsBookmarkOpen(false); navigate('QURAN'); };
  const handleHadithBookmarkSelect = (bookId: string, hadithNumber: number) => { setHadithBookmarkTarget({ bookId, hadithNumber }); setIsHadithBookmarkOpen(false); navigate('HADITH'); };
  
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
  };
  
  const handleClearAllHistory = () => clearAllHistory();

  const handleAnalyze = async (text: string, image: string | undefined) => {
    setIsLoading(true); setError(null); setResult(null); setInitialInputText(text);
    try {
      const data = await analyzeKitabText(text, image);
      setResult(data);
      await addToHistory(data);
      navigate('RESULT');
    } catch (err: any) {
      const msg = err.message || 'Gagal memproses';
      if (msg.toLowerCase().includes('quota') || msg.includes('429')) setError("QUOTA_EXCEEDED");
      else setError(`Terjadi kesalahan: ${msg}`);
      navigate('HOME'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFromLibrary = async (text: string) => { setInitialInputText(text); await handleAnalyze(text, undefined); };
  const handleBackToHome = () => { setResult(null); setInitialInputText(''); navigate('HOME'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const renderContent = () => {
    if (isLoading) return <LoadingIndicator />;
    switch(currentView) {
      case 'SETTINGS': return <SettingsView onHistoryClick={() => setIsHistoryOpen(true)} onBookmarksClick={() => setIsBookmarkOpen(true)} onHadithBookmarksClick={() => setIsHadithBookmarkOpen(true)} />;
      case 'AUTH': return <AuthView onBack={() => navigate('SETTINGS')} />;
      case 'QURAN': return <ScriptureView type="QURAN" onSelect={(t) => handleAnalyze(t, undefined)} initialJump={bookmarkTarget} onOpenBookmarks={() => setIsBookmarkOpen(true)} />;
      case 'HADITH': return <ScriptureView type="HADITH" onSelect={(t) => handleAnalyze(t, undefined)} initialHadithJump={hadithBookmarkTarget} />;
      case 'LIBRARY_VIEW': return <LibraryView onAnalyzeText={handleAnalyzeFromLibrary} initialQuery={route.params.book} onBack={handleBackToHome} onOpenAuthor={(name) => navigate('AUTHOR_DETAIL', {name})} />;
      case 'BOOK_DETAIL': return <BookDetailPage title={route.params.title} author={route.params.author} onBack={() => window.history.back()} onOpenAuthor={(name) => navigate('AUTHOR_DETAIL', {name})} />;
      case 'AUTHOR_DETAIL': return <AuthorDetailPage authorName={route.params.name} onBack={() => window.history.back()} onOpenAuthor={(name) => navigate('AUTHOR_DETAIL', {name})} onOpenBook={(title) => navigate('LIBRARY_VIEW', {book: title})} />;
      case 'RESULT': return result ? <main className="max-w-5xl mx-auto px-4 pt-8 mb-20 animate-fade-in"><ResultDisplay result={result} onOpenBookTOC={(title) => navigate('LIBRARY_VIEW', {book: title})} onBack={handleBackToHome} /></main> : null;
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
              <InputSection onAnalyze={handleAnalyze} onBookSelect={(title) => navigate('LIBRARY_VIEW', {book: title})} isAnalyzing={isLoading} initialValue={initialInputText} onHistoryClick={() => setIsHistoryOpen(true)} onOpenTool={(id) => navigate(id as ViewState)} onSelectPublicAnalysis={handlePublicAnalysisSelect} />
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
