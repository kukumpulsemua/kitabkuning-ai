import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw,
  Vibrate, CheckCircle, BookOpen, ChevronDown, Clock, Trash2, X, Target, Plus, Edit3
} from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Props Interface
interface TasbihViewProps {
  onBack: () => void;
}

// Data Structures
interface HistoryLog {
  id: number;
  date: string;
  label: string;
  count: number;
}

interface Dhikr {
  arabic: string;
  latin: string;
  meaning: string;
  target: number;
}

interface DhikrSet {
  id: string;
  name: string;
  sequence: Dhikr[];
}

// Predefined Dhikr Sets
const DHIKR_SETS: DhikrSet[] = [
  {
    id: 'tasbih',
    name: 'Wirid Tasbih (setelah sholat)',
    sequence: [
      { arabic: 'سُبْحَانَ اللَّهِ', latin: 'Subhanallah', meaning: 'Maha Suci Allah', target: 33 },
      { arabic: 'الْحَمْدُ لِلَّهِ', latin: 'Alhamdulillah', meaning: 'Segala Puji Bagi Allah', target: 33 },
      { arabic: 'اللَّهُ أَكْبَرُ', latin: 'Allahu Akbar', meaning: 'Allah Maha Besar', target: 33 },
      { arabic: 'لَا إِلَهَ إِلَّا اللهُ', latin: 'La ilaha illallah', meaning: 'Tiada Tuhan Selain Allah', target: 1 },
    ],
  },
  {
    id: 'istighfar',
    name: 'Istighfar 100x',
    sequence: [
      { arabic: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ', latin: 'Astaghfirullahal \'adzim', meaning: 'Aku memohon ampun kepada Allah', target: 100 },
    ],
  },
  {
    id: 'sholawat_jibril',
    name: 'Sholawat Jibril 100x',
    sequence: [
      { arabic: 'صَلَّى اللهُ عَلَى مُحَمَّد', latin: 'Shollallahu \'ala Muhammad', meaning: 'Semoga rahmat tercurah pada Nabi Muhammad', target: 100 },
    ],
  },
  {
    id: 'tahlil',
    name: 'Tahlil 100x',
    sequence: [
      { arabic: 'لَا إِلَهَ إِلَّا اللهُ', latin: 'La ilaha illallah', meaning: 'Tiada Tuhan Selain Allah', target: 100 },
    ],
  },
  {
    id: 'hauqalah',
    name: 'Hauqalah 100x',
    sequence: [
      { arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', latin: 'La hawla wa la quwwata illa billah', meaning: 'Tiada daya dan kekuatan kecuali dengan Allah', target: 100 },
    ],
  },
];

const CUSTOM_SET_ID = 'custom';

const TasbihView: React.FC<TasbihViewProps> = ({ onBack }) => {
  const [activeDhikrSet, setActiveDhikrSet] = useState<DhikrSet>(DHIKR_SETS[0]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(0);
  const [isVibrate, setIsVibrate] = useState(true);
  const [showFinalCompletion, setShowFinalCompletion] = useState(false);
  
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [customArabic, setCustomArabic] = useState('سُبْحَانَ اللَّهِ');
  const [customLatin, setCustomLatin] = useState('Subhanallah');
  const [customTarget, setCustomTarget] = useState('100');
  
  const clickFeedbackRef = useRef<HTMLDivElement>(null);

  const currentDhikr = activeDhikrSet.sequence[phase];
  const target = currentDhikr.target || 1;
  const progress = (count / target) * 100;

  useEffect(() => {
    try {
      const savedVibrate = localStorage.getItem('tasbih_vibrate');
      if (savedVibrate !== null) setIsVibrate(savedVibrate === 'true');
      
      const savedHistory = localStorage.getItem('tasbih_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) { console.error("Failed to load settings", e); }
    
  }, []);

  useEffect(() => { localStorage.setItem('tasbih_vibrate', String(isVibrate)); }, [isVibrate]);
  useEffect(() => { localStorage.setItem('tasbih_history', JSON.stringify(history)); }, [history]);

  const addHistoryLog = () => {
    const newLog: HistoryLog = {
      id: Date.now(),
      date: new Date().toISOString(),
      label: `${activeDhikrSet.name} - ${currentDhikr.latin}`,
      count: target
    };
    setHistory(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleClearHistory = () => {
    if (confirm('Hapus semua riwayat dzikir?')) {
        setHistory([]);
    }
  };

  const handleCount = () => {
    if (showFinalCompletion) return;

    if (isVibrate) { try { Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { /* ignore */ } }
    
    if (clickFeedbackRef.current) {
      const ripple = document.createElement('div');
      ripple.className = 'absolute inset-0 rounded-full bg-emerald-400/50 animate-ripple';
      clickFeedbackRef.current.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    }
    
    const newCount = count + 1;
    if (newCount >= target) {
      if (isVibrate) { try { Haptics.impact({ style: ImpactStyle.Heavy }); } catch(e) {} }
      addHistoryLog();
      setCount(0);
      if (phase < activeDhikrSet.sequence.length - 1) {
        setPhase(phase + 1);
      } else {
        setShowFinalCompletion(true);
      }
    } else {
      setCount(newCount);
    }
  };

  const handleResetAll = () => {
    setCount(0);
    setPhase(0);
    setShowFinalCompletion(false);
  };
  
  const handleSelectDhikrSet = (set: DhikrSet) => {
    if (set.id === CUSTOM_SET_ID) {
      setIsCustomizing(true);
    } else {
      setActiveDhikrSet(set);
      setIsSelectorOpen(false);
      handleResetAll();
    }
  };

  const handleSaveCustomDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    const newSet: DhikrSet = {
      id: `custom-${Date.now()}`,
      name: `Dzikir Custom`,
      sequence: [{ arabic: customArabic, latin: customLatin || 'Custom', meaning: 'Bacaan pribadi', target: parseInt(customTarget) || 100 }]
    };
    setActiveDhikrSet(newSet);
    setIsSelectorOpen(false);
    setIsCustomizing(false);
    handleResetAll();
  };

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 select-none p-safe flex flex-col font-sans overflow-hidden">
      <style>{`
        @keyframes ripple { to { transform: scale(1.5); opacity: 0; } }
        .animate-ripple { animation: ripple 0.5s ease-out forwards; }
        @keyframes pulse-once { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .animate-pulse-once { animation: pulse-once 0.3s ease-in-out; }
      `}</style>
      <header className="flex items-center justify-between p-4 z-10 w-full max-w-md mx-auto">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><ArrowLeft size={20}/></button>
        <h1 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">Tasbih Digital</h1>
        <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><Clock size={20}/></button>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 -mt-10">
        <div className="w-full max-w-md space-y-6 text-center">
            
            <div className="min-h-[140px] flex flex-col justify-center items-center px-4">
              <button onClick={() => setIsSelectorOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4">
                <BookOpen size={14}/>
                <span>{activeDhikrSet.name} ({phase + 1}/{activeDhikrSet.sequence.length})</span>
                <ChevronDown size={14}/>
              </button>
              <h2 className="font-arabic text-4xl text-gray-900 dark:text-white mb-2 transition-opacity duration-300" key={`ar-${phase}`}>{currentDhikr.arabic}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-opacity duration-300" key={`en-${phase}`}>{currentDhikr.latin}</p>
            </div>

            <div ref={clickFeedbackRef} onClick={handleCount} className="w-64 h-64 mx-auto rounded-full bg-gray-50 dark:bg-gray-800 flex flex-col justify-center items-center shadow-2xl transition-transform active:scale-95 relative cursor-pointer border-4 border-gray-100 dark:border-gray-700 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 240">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a3e635" />
                      <stop offset="100%" stopColor="#facc15" />
                    </linearGradient>
                  </defs>
                  <circle className="text-gray-200 dark:text-gray-700" stroke="currentColor" strokeWidth="12" fill="transparent" r={radius} cx="120" cy="120"/>
                  <circle stroke="url(#progressGradient)" strokeWidth="12" strokeLinecap="round" fill="transparent" r={radius} cx="120" cy="120" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.3s' }}/>
                </svg>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <span className="text-7xl font-bold font-mono tracking-tighter text-gray-900 dark:text-white drop-shadow-lg">{count}</span>
                  <div className="h-px w-16 bg-gray-300 dark:bg-gray-600 my-1"></div>
                  <span className="text-lg font-medium text-gray-400 dark:text-gray-500">/ {target}</span>
                </div>
            </div>

            <div className="flex justify-between items-center w-full max-w-xs mx-auto">
              <button onClick={handleResetAll} className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm font-bold transition-colors hover:bg-red-200 dark:hover:bg-red-900/60"><RotateCcw size={14}/>Reset</button>
              <button onClick={() => setIsVibrate(!isVibrate)} className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isVibrate ? 'text-emerald-500' : 'text-gray-400'}`}><Vibrate size={20}/></button>
            </div>
        </div>
      </main>

      {isSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in" onClick={() => { setIsSelectorOpen(false); setIsCustomizing(false); }}>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                {isCustomizing ? (
                  <form onSubmit={handleSaveCustomDhikr}>
                     <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg flex items-center gap-2"><Edit3 size={18} className="text-emerald-500"/> Buat Dzikir</h3><button type="button" onClick={() => setIsCustomizing(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ArrowLeft size={20}/></button></div>
                     <div className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500">Bacaan (Arab)</label><input type="text" value={customArabic} onChange={e => setCustomArabic(e.target.value)} dir="rtl" className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-arabic text-lg"/></div>
                        <div><label className="text-xs font-bold text-gray-500">Latin (Opsional)</label><input type="text" value={customLatin} onChange={e => setCustomLatin(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700"/></div>
                        <div><label className="text-xs font-bold text-gray-500">Target Hitungan</label><input type="number" value={customTarget} onChange={e => setCustomTarget(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700" placeholder="100"/></div>
                        <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold">Simpan & Mulai</button>
                     </div>
                  </form>
                ) : (
                  <>
                     <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg flex items-center gap-2"><BookOpen size={18} className="text-emerald-500"/> Pilih Wirid</h3><button onClick={() => setIsSelectorOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20}/></button></div>
                     <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {[...DHIKR_SETS, { id: CUSTOM_SET_ID, name: 'Buat Dzikir Sendiri...', sequence: [] }].map(set => (
                            <button key={set.id} onClick={() => handleSelectDhikrSet(set)} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeDhikrSet.id === set.id ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                <div className={`p-2 rounded-md ${set.id === CUSTOM_SET_ID ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'}`}>{set.id === CUSTOM_SET_ID ? <Plus size={16}/> : <Target size={16}/>}</div>
                                <span className="font-bold">{set.name}</span>
                            </button>
                        ))}
                     </div>
                  </>
                )}
            </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsHistoryOpen(false)}>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-sm flex flex-col max-h-[80vh] shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><Clock size={18} className="text-emerald-500"/> Riwayat Dzikir</h3><button onClick={() => setIsHistoryOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.length === 0 ? <p className="text-center text-gray-500 text-sm py-10">Belum ada riwayat.</p> : history.map(log => (
                        <div key={log.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start"><p className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{log.label}</p><span className="text-xs font-mono bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">{log.count}x</span></div>
                            <p className="text-xs text-gray-400 mt-1">{new Date(log.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    ))}
                </div>
                {history.length > 0 && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={handleClearHistory} 
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border-2 border-red-400 dark:border-red-600 rounded-xl transition-colors"
                    >
                        <Trash2 size={16}/> 
                        <span>Hapus Semua Riwayat</span>
                    </button>
                  </div>
                )}
            </div>
        </div>
      )}

      {showFinalCompletion && (
           <div className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={handleResetAll}>
              <div className="text-center" onClick={e => e.stopPropagation()}>
                  <CheckCircle className="w-24 h-24 mx-auto text-emerald-500 mb-6 animate-pulse-once"/>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Alhamdulillah, Selesai!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">Anda telah menyelesaikan <span className="font-bold">{activeDhikrSet.name}</span>.</p>
                  <button onClick={handleResetAll} className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-lg">Ulangi Dzikir</button>
              </div>
           </div>
      )}
    </div>
  );
};

export default TasbihView;