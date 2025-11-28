import React, { useState, useRef, useEffect, useContext } from 'react';
import { X, Image as ImageIcon, Send, Keyboard, Delete, Trash2, Book, ChevronRight, ChevronDown, Scale, Feather, Heart, ScrollText, ShieldCheck, BrainCircuit, Gavel, PenTool, Sparkles, Radio, Tv, MapPin, Calendar, Compass, Coins, Music, Orbit, Calculator, BookHeart, GraduationCap, Camera, Mic } from 'lucide-react';
import { AppSettings } from '../types.ts';
import { AppContext } from '../App.tsx';

interface InputSectionProps {
  onAnalyze: (text: string, image: string | undefined) => void;
  onBookSelect: (bookTitle: string) => void;
  isAnalyzing: boolean;
  onHistoryClick: () => void;
  initialValue?: string;
  onOpenTool: (toolId: string) => void;
}

const ARABIC_KEYS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ذ'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
];
const ARABIC_NUMBERS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];
const HARAKAT = ['َ', 'ِ', 'ُ', 'ً', 'ٍ', 'ٌ', 'ْ', 'ّ'];

const QUICK_TOOLS = [
  { id: 'READING_PRACTICE', label: 'Latihan Baca', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400' },
  { id: 'QUIZ', label: 'Cerdas Cermat', icon: BrainCircuit, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400' },
  { id: 'TASBIH', label: 'Tasbih', icon: Orbit, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400' },
  { id: 'QIBLA', label: 'Arah Kiblat', icon: Compass, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40 dark:text-teal-400' },
  { id: 'CALENDAR', label: 'Kalender', icon: Calendar, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400' },
  { id: 'ZAKAT', label: 'Hitung Zakat', icon: Coins, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400' },
  { id: 'INHERITANCE', label: 'Waris', icon: Calculator, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-400' },
  { id: 'DOA', label: 'Doa-doa', icon: BookHeart, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/40 dark:text-cyan-400' },
];

const BOOK_CATEGORIES: Record<string, Array<{title: string, author: string}>> = {
  "Akidah (Tauhid)": [
    { title: "Aqidatul Awam", author: "Syekh Ahmad Al-Marzuki" },
    { title: "Tijan Darori", author: "Syekh Nawawi Al-Bantani" },
    { title: "Kifayatul Awam", author: "Syekh Muhammad Al-Fudhali" },
    { title: "Jauharatut Tauhid", author: "Syekh Ibrahim Al-Laqqani" }
  ],
  "Fiqih": [
    { title: "Safinatun Najah", author: "Syekh Salim bin Sumair" },
    { title: "Fathul Qorib", author: "Syekh Ibnu Qosim" },
    { title: "Riyadhul Badi'ah", author: "Syekh Muhammad Nawawi" },
    { title: "Fathul Mu'in", author: "Syekh Zainuddin Al-Malibari" }
  ],
  "Ushul Fiqih": [
    { title: "Al-Waraqat", author: "Imam Al-Haramain" },
    { title: "Lathaiful Isyarat", author: "Syekh Abdul Hamid" },
    { title: "Ghayatul Wushul", author: "Syekh Zakariya Al-Anshari" },
    { title: "Jam'ul Jawami'", author: "Imam Tajuddin As-Subki" }
  ],
  "Nahwu & Shorof": [
    { title: "Jurumiyah", author: "Syekh Ash-Shanhaji" },
    { title: "Nadhom Imriti", author: "Syekh Syarafuddin Al-Imriti" },
    { title: "Alfiyah Ibnu Malik", author: "Imam Ibnu Malik" },
    { title: "Amtsilah Tashrifiyah", author: "Kyai Ma'shum Ali" }
  ],
  "Mantiq (Logika)": [
    { title: "Sullamul Munawraq", author: "Syekh Abdurrahman Al-Akhdari" },
    { title: "Isaghuji", author: "Imam Al-Abhari" },
    { title: "Idhul Mubham", author: "Syekh Ad-Damanhuri" }
  ],
  "Balaghah (Sastra)": [
    { title: "Jauharul Maknun", author: "Syekh Abdurrahman Al-Akhdari" },
    { title: "Uqudul Juman", author: "Imam As-Suyuthi" },
    { title: "Al-Balaghah Al-Wadhihah", author: "Ali Al-Jarim & Musthafa Amin" }
  ],
  "Akhlak & Tasawuf": [
    { title: "Ta'lim Muta'allim", author: "Syekh Az-Zarnuji" },
    { title: "Nashoihul Ibad", author: "Syekh Nawawi Al-Bantani" },
    { title: "Al-Hikam", author: "Ibnu Atha'illah" },
    { title: "Ihya Ulumuddin", author: "Imam Al-Ghazali" }
  ],
  "Maulid & Ratib": [
    { title: "Maulid Simtudduror", author: "Habib Ali bin Muhammad Al-Habsyi" },
    { title: "Maulid Al-Barzanji", author: "Syekh Ja'far Al-Barzanji" },
    { title: "Ratib Al-Haddad", author: "Habib Abdullah bin Alwi Al-Haddad" },
    { title: "Ratib Al-Attas", author: "Habib Umar bin Abdurrahman Al-Attas" },
    { title: "Qashidah Burdah", author: "Imam Al-Bushiri" }
  ],
  "Hadits": [
    { title: "Arba'in Nawawi", author: "Imam An-Nawawi" },
    { title: "Riyadhus Shalihin", author: "Imam An-Nawawi" },
    { title: "Bulughul Maram", author: "Ibnu Hajar Al-Asqalani" }
  ],
  "Sholawat & Wirid": [
    { title: "Buka Kumpulan Sholawat", author: "Koleksi Populer" },
    { title: "Dalailul Khairat", author: "Imam Al-Jazuli" }
  ],
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Akidah (Tauhid)": return <ShieldCheck className="w-5 h-5" />;
    case "Fiqih": return <Scale className="w-5 h-5" />;
    case "Ushul Fiqih": return <Gavel className="w-5 h-5" />;
    case "Nahwu & Shorof": return <Feather className="w-5 h-5" />;
    case "Mantiq (Logika)": return <BrainCircuit className="w-5 h-5" />;
    case "Balaghah (Sastra)": return <PenTool className="w-5 h-5" />;
    case "Akhlak & Tasawuf": return <Heart className="w-5 h-5" />;
    case "Maulid & Ratib": return <Sparkles className="w-5 h-5" />;
    case "Hadits": return <ScrollText className="w-5 h-5" />;
    case "Sholawat & Wirid": return <Music className="w-5 h-5" />;
    default: return <Book className="w-5 h-5" />;
  }
};

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, onBookSelect, isAnalyzing, initialValue, onOpenTool }) => {
  const { settings } = useContext(AppContext);

  const [text, setText] = useState(initialValue || '');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const mediaMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mediaMenuRef.current && !mediaMenuRef.current.contains(event.target as Node)) {
        setShowMediaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressedBase64 = await resizeImage(file);
        setSelectedImage(compressedBase64);
        setPreviewUrl(compressedBase64);
      } catch (err) {
        console.error("Gagal memproses gambar", err);
        alert("Gagal memproses gambar. Coba gunakan gambar lain.");
      } finally {
        setIsProcessingImage(false);
        setShowMediaMenu(false);
      }
    }
    e.target.value = ''; 
  };

  const handleSpeechToText = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung fitur Speech to Text. Gunakan Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = isKeyboardOpen ? 'ar-SA' : 'id-ID'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (textAreaRef.current) {
        const start = textAreaRef.current.selectionStart;
        const end = textAreaRef.current.selectionEnd;
        const newVal = text.substring(0, start) + transcript + " " + text.substring(end);
        setText(newVal);
        setTimeout(() => {
           if (textAreaRef.current) {
             textAreaRef.current.focus();
             const newCursorPos = start + transcript.length + 1;
             textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
           }
        }, 0);
      } else {
        setText(prev => prev + transcript + " ");
      }
    };

    recognition.onerror = (event: any) => { console.error("Speech recognition error", event.error); setIsListening(false); };
    recognition.start();
  };

  const clearImage = () => { setSelectedImage(undefined); setPreviewUrl(undefined); if (fileInputRef.current) fileInputRef.current.value = ''; if (cameraInputRef.current) cameraInputRef.current.value = ''; };
  const clearAll = () => { setText(''); clearImage(); if (textAreaRef.current) textAreaRef.current.focus(); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedImage) return;
    onAnalyze(text, selectedImage);
  };

  const handleVirtualKey = (char: string) => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart; const end = textAreaRef.current.selectionEnd;
      const newVal = text.substring(0, start) + char + text.substring(end);
      setText(newVal);
      setTimeout(() => { if(textAreaRef.current) { textAreaRef.current.focus(); textAreaRef.current.setSelectionRange(start + char.length, start + char.length); } }, 0);
    } else { setText(prev => prev + char); }
  };

  const handleBackspace = () => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart; const end = textAreaRef.current.selectionEnd;
      if (start === end && start > 0) {
        const newVal = text.substring(0, start - 1) + text.substring(end);
        setText(newVal);
        setTimeout(() => { if(textAreaRef.current) { textAreaRef.current.focus(); textAreaRef.current.setSelectionRange(start - 1, start - 1); } }, 0);
      } else if (start !== end) {
        const newVal = text.substring(0, start) + text.substring(end);
        setText(newVal);
        setTimeout(() => { if(textAreaRef.current) { textAreaRef.current.focus(); textAreaRef.current.setSelectionRange(start, start); } }, 0);
      }
    }
  };

  const toggleCategory = (categoryName: string) => { setExpandedCategory(expandedCategory === categoryName ? null : categoryName); };

  const handleToolClick = (toolId: string) => {
    onOpenTool(toolId);
  };

  const fontClass = settings.arabicFont === 'amiri' ? 'font-amiri' : 'font-arabic';
  const textSizeClass = settings.textSize === 'small' ? 'text-base sm:text-lg' : settings.textSize === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';

  return (
    <div className="w-full max-w-4xl mx-auto transition-all duration-300">
      
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-emerald-900/5 dark:shadow-black/30 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:border-emerald-300/50 z-20 relative group">
          {previewUrl && (
            <div className="relative w-full bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-100 dark:border-gray-700">
               <div className="relative inline-block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm group">
                  <img src={previewUrl} alt="Upload Preview" className="h-40 object-contain bg-white" />
                  <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-white/90 hover:bg-red-100 p-1.5 rounded-full text-gray-600 hover:text-red-600 transition-colors backdrop-blur-sm shadow-sm"><X className="w-4 h-4" /></button>
               </div>
            </div>
          )}

          <textarea ref={textAreaRef} value={text} onChange={(e) => setText(e.target.value)} placeholder={selectedImage ? "Tambahkan pertanyaan atau konteks untuk gambar ini..." : "Ketik teks Arab, tempel teks, atau pilih kitab di bawah..."} className={`w-full min-h-[180px] sm:min-h-[200px] p-6 bg-transparent border-none focus:ring-0 resize-none leading-loose text-right dir-rtl placeholder:text-left placeholder:font-sans placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 ${fontClass} ${textSizeClass}`} dir="auto" />

          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
              
              <div className="relative" ref={mediaMenuRef}>
                <button type="button" disabled={isProcessingImage} onClick={() => setShowMediaMenu(!showMediaMenu)} className={`p-2 rounded-lg transition-colors flex items-center gap-2 group ${showMediaMenu ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`} title="Upload Foto">
                  {isProcessingImage ? <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <ImageIcon className="w-6 h-6" />}
                </button>
                {showMediaMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scale-up origin-bottom-left">
                     <button type="button" onClick={() => { setShowMediaMenu(false); cameraInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-sm text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-100 dark:border-gray-700"><div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600"><Camera className="w-4 h-4" /></div><div><span className="block font-bold text-xs">Kamera</span><span className="block text-[10px] text-gray-400">Ambil foto baru</span></div></button>
                     <button type="button" onClick={() => { setShowMediaMenu(false); fileInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-sm text-gray-700 dark:text-gray-200 transition-colors"><div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><ImageIcon className="w-4 h-4" /></div><div><span className="block font-bold text-xs">Galeri</span><span className="block text-[10px] text-gray-400">Pilih dari HP</span></div></button>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => setIsKeyboardOpen(!isKeyboardOpen)} className={`p-2 rounded-lg transition-colors ${isKeyboardOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`} title="Keyboard Arab"><Keyboard className="w-6 h-6" /></button>
            </div>
            {(text || selectedImage) && (<button type="button" onClick={clearAll} className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors" title="Hapus Semua"><Trash2 className="w-5 h-5" /></button>)}
          </div>
          <div className="p-4 bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 backdrop-blur-sm">
            <button type="submit" disabled={isAnalyzing || (!text && !selectedImage) || isProcessingImage} className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all transform active:scale-95 ${ isAnalyzing || (!text && !selectedImage) || isProcessingImage ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30' }`}>
              {isAnalyzing ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Memproses...</span></>) : (<><span>Bedah Teks</span><Send className="w-4 h-4" /></>)}
            </button>
          </div>
          {isKeyboardOpen && (<div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 animate-slide-down transition-all duration-300"><div className="flex flex-col gap-3 select-none" dir="rtl"><div className="flex justify-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">{HARAKAT.map(char => (<button type="button" key={char} onClick={() => handleVirtualKey(char)} className="w-9 h-9 text-xl leading-none bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300 font-amiri transition-all shadow-sm">{char}</button>))}</div><div className="grid grid-cols-12 gap-1 sm:gap-1.5 justify-center">{(showNumbers ? ARABIC_NUMBERS : ARABIC_KEYS.flat()).map((char, i) => (<button key={i} type="button" onClick={() => handleVirtualKey(char)} className="h-10 text-xl sm:text-2xl bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-95">{char}</button>))}</div><div className="flex gap-2 mt-2" dir="ltr"><button type="button" onClick={() => setShowNumbers(!showNumbers)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300">{showNumbers ? 'ABC' : '123'}</button><button type="button" onClick={handleSpeechToText} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}><Mic className="w-5 h-5" /></button><button type="button" onClick={() => handleVirtualKey(' ')} className="flex-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50">Spasi</button><button type="button" onClick={handleBackspace} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"><Delete className="w-5 h-5" /></button></div></div></div>)}
        </div>
      </form>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3 mb-10 px-2 animate-slide-up">
         {QUICK_TOOLS.map((tool) => (<button key={tool.id} onClick={() => handleToolClick(tool.id)} className="flex flex-col items-center gap-2 group"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all transform group-hover:scale-110 group-hover:shadow-md ${tool.color}`}><tool.icon className="w-6 h-6" /></div><span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-center leading-tight">{tool.label}</span></button>))}
      </div>

      <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between px-1 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2"><h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2"><Book className="w-4 h-4 text-emerald-500" /> Pustaka Kitab Kuning</h3><span className="text-[10px] text-gray-400 font-medium">Pilih kategori & kitab</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(BOOK_CATEGORIES).map((category) => {
              const isOpen = expandedCategory === category;
              return (<div key={category} className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}><button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><div className="flex items-center gap-3"><div className={`p-2.5 rounded-xl ${isOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{getCategoryIcon(category)}</div><span className={`font-bold text-sm sm:text-base ${isOpen ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-700 dark:text-gray-300'}`}>{category}</span></div><ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} /></button><div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}><div className="p-4 pt-0 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 space-y-2">{BOOK_CATEGORIES[category].map((book, idx) => (<button key={idx} onClick={() => { if (book.title === "Buka Kumpulan Sholawat") { onOpenTool('SHOLAWAT'); } else { onBookSelect(book.title); } }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:shadow-sm transition-all group text-left"><div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0 text-xs font-serif font-bold border border-amber-100 dark:border-amber-800/30">{idx + 1}</div><div className="min-w-0 flex-1"><div className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{book.title}</div><div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{book.author}</div></div><ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" /></button>))}</div></div></div>);
            })}
          </div>
      </div>
    </div>
  );
};

export default InputSection;
