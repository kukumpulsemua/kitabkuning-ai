import React, { useState, useRef, useEffect, useContext } from 'react';
import { X, Image as ImageIcon, Send, Keyboard, Delete, Trash2, Book, ChevronRight, ChevronDown, Scale, Feather, Heart, ScrollText, ShieldCheck, BrainCircuit, Gavel, PenTool, Sparkles, Radio, Tv, MapPin, Calendar, Compass, Coins, Music, Orbit, Calculator, BookHeart, GraduationCap, Camera, Mic, Loader2 } from 'lucide-react';
import { AppSettings } from '../types.ts';
import { AppContext } from '../App.tsx';
import * as supabaseService from '../services/supabaseService.ts';

interface InputSectionProps {
  onAnalyze: (text: string, image: string | undefined) => void;
  onBookSelect: (bookTitle: string) => void;
  isAnalyzing: boolean;
  onHistoryClick: () => void;
  initialValue?: string;
  onOpenTool: (toolId: string) => void;
  onSelectPublicAnalysis: (analysis: any) => void;
}
// ... (ARABIC_KEYS, QUICK_TOOLS, BOOK_CATEGORIES, etc. remain the same) ...

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, onBookSelect, isAnalyzing, initialValue, onOpenTool, onSelectPublicAnalysis }) => {
  const { settings } = useContext(AppContext);
  const [publicAnalyses, setPublicAnalyses] = useState<any[]>([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(true);

  // ... (all other state hooks remain the same) ...
  const [text, setText] = useState(initialValue || '');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  // ...

  useEffect(() => {
    const fetchPublicAnalyses = async () => {
        setIsLoadingPublic(true);
        const data = await supabaseService.getRecentPublicAnalyses(5);
        setPublicAnalyses(data);
        setIsLoadingPublic(false);
    };
    fetchPublicAnalyses();
  }, []);

  // ... (all other useEffects and handlers remain the same) ...

  return (
    <div className="w-full max-w-4xl mx-auto transition-all duration-300">
      
      {/* ... (Form section remains the same) ... */}
      
      <div className="space-y-4 animate-fade-in mt-10">
        {/* KAJIAN AI TERBARU */}
        <div className="mb-10">
             <div className="flex items-center justify-between px-1 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" /> Kajian AI Terbaru
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">Hasil Analisis Publik</span>
             </div>
             {isLoadingPublic ? (
                <div className="text-center py-8 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
             ) : publicAnalyses.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    Belum ada kajian. Jadilah yang pertama!
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {publicAnalyses.map((item, idx) => (
                        <button key={idx} onClick={() => onSelectPublicAnalysis(item)} className="w-full flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:shadow-md transition-all group text-left">
                            <div className="min-w-0 flex-1">
                                <p className="font-arabic text-lg text-gray-800 dark:text-gray-200 line-clamp-2 dir-rtl text-right group-hover:text-purple-700 dark:group-hover:text-purple-400">
                                    {item.full_result.arabicText}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-2">
                                    "{item.full_result.translationIndonesia}"
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-transform mt-1" />
                        </button>
                    ))}
                </div>
             )}
        </div>

        {/* ... (PUSTAKA KITAB KUNING section remains the same) ... */}
      </div>
    </div>
  );
};

export default InputSection;
