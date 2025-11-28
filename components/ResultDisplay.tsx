


import React, { useState, useEffect, useContext } from 'react';
import { TranslationResult, AppSettings, ReferenceSource, AnalysisPoint, TextReference, RhetoricPoint } from '../types.ts';
import { 
  Book, BookOpenCheck, GraduationCap, ChevronDown, Sparkles, ArrowRight, Info, Copy, Check, 
  Share2, Languages, Feather, Quote, ScrollText, User, Library, Layers, 
  Mic2, BrainCircuit, Scale, ShieldCheck, Orbit, Hourglass, Search, ArrowLeft,
  LayoutGrid, MessageCircle, TextSelect, Bookmark, GitMerge, Link, FileText
} from 'lucide-react';
import { AppContext } from '../App.tsx';

interface ResultDisplayProps {
  result: TranslationResult | null;
  onOpenBookTOC: (title: string, author?: string) => void;
  onBack: () => void;
}

const QUOTES = [
  { text: "Barangsiapa yang dikehendaki kebaikan oleh Allah, maka Allah akan memahamkannya dalam urusan agama.", source: "HR. Bukhari & Muslim" },
  { text: "Ilmu itu bukan yang dihafal, tetapi yang memberi manfaat.", source: "Imam As-Syafi'i" },
  { text: "Dan janganlah kamu mengikuti sesuatu yang tidak kamu ketahui. Karena pendengaran, penglihatan dan hati, semuanya itu akan diminta pertanggungjawabannya.", source: "QS. Al-Isra': 36" },
  { text: "Orang berilmu lebih utama dari orang yang berpuasa, shalat, dan berjihad.", source: "HR. Ad-Dailami" },
  { text: "Siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan mudahkan baginya jalan menuju surga.", source: "HR. Muslim" },
  { text: "Orang yang paling aku sukai adalah dia yang menunjukkan kesalahanku.", source: "Umar bin Khattab" }
];

type ViewState = 'DASHBOARD' | 'TERJEMAH' | 'GANDUL' | 'NAHWU' | 'LUGHAH' | 'BALAGHAH' | 'TAFSIR' | 'REFERENSI' | 'SCIENTIFIC_TAJWID' | 'SCIENTIFIC_TAFSIR' | 'SCIENTIFIC_USHUL' | 'SCIENTIFIC_MANTIQ' | 'SCIENTIFIC_TAUHID' | 'SCIENTIFIC_HADITH' | 'SCIENTIFIC_FALAK' | 'SCIENTIFIC_TARIKH' | 'DALIL';

const CopyButton = ({ text, className = "", label = "Salin" }: { text: string, className?: string, label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200 border-2 shadow-sm group/btn ${
        copied
          ? 'bg-emerald-100 text-emerald-700 border-emerald-400 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-600'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:text-emerald-300 hover:border-emerald-400'
      } ${className}`}
      title="Salin teks ke clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-gray-400 group-hover/btn:text-emerald-600" />}
      <span>{copied ? 'Disalin' : label}</span>
    </button>
  );
};

const SourceBadge = ({ source, onClick }: { source?: ReferenceSource, onClick: (title: string, author?: string) => void }) => {
  if (!source || source.type === 'UNKNOWN') return null;

  let Icon = Book;
  let bgColor = "bg-blue-50 dark:bg-blue-900/20";
  let textColor = "text-blue-800 dark:text-blue-200";
  let borderColor = "border-blue-400 dark:border-blue-600"; 
  let hoverColor = "hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-500";
  let label = "Referensi";

  if (source.type === 'QURAN') { Icon = BookOpenCheck; bgColor = "bg-emerald-50 dark:bg-emerald-900/20"; textColor = "text-emerald-800 dark:text-emerald-200"; borderColor = "border-emerald-500 dark:border-emerald-600"; hoverColor = "hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-600"; label = "Al-Qur'an"; } 
  else if (source.type === 'HADITH') { Icon = ScrollText; bgColor = "bg-amber-50 dark:bg-amber-900/20"; textColor = "text-amber-800 dark:text-amber-200"; borderColor = "border-amber-400 dark:border-amber-600"; hoverColor = "hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-500"; label = "Hadits"; } 
  else if (source.type === 'POETRY') { Icon = Feather; bgColor = "bg-rose-50 dark:bg-rose-900/20"; textColor = "text-rose-800 dark:text-rose-200"; borderColor = "border-rose-400 dark:border-rose-600"; hoverColor = "hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:border-rose-500"; label = "Sya'ir"; } 
  else if (source.type === 'KITAB' || source.type === 'ULAMA_QUOTE') { Icon = Quote; bgColor = "bg-indigo-50 dark:bg-indigo-900/20"; textColor = "text-indigo-800 dark:text-indigo-200"; borderColor = "border-indigo-400 dark:border-indigo-600"; hoverColor = "hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:border-indigo-500"; label = "Kutipan Kitab"; }

  return (
    <button onClick={() => onClick(source.title, source.author)} className={`w-full group flex flex-col sm:flex-row items-center sm:items-start gap-3 mt-6 px-5 py-4 rounded-xl border-2 ${bgColor} ${borderColor} ${hoverColor} shadow-md max-w-2xl mx-auto text-left relative overflow-hidden transition-all duration-300 cursor-pointer`}>
       <div className={`absolute top-0 left-0 w-1 h-full ${textColor.replace('text', 'bg')} opacity-20`}></div>
       <Sparkles className={`absolute top-2 right-2 w-4 h-4 ${textColor} opacity-0 group-hover:opacity-50 transition-opacity`} />
       <div className={`p-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm shrink-0 ${textColor} border border-current group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6" /></div>
       <div className="text-center sm:text-left flex-1 w-full">
          <span className={`block text-[11px] font-black uppercase tracking-widest opacity-70 mb-1 ${textColor}`}>{label}</span>
          <div className={`font-bold text-lg sm:text-xl ${textColor} leading-snug font-serif underline decoration-transparent group-hover:decoration-current transition-all`}>{source.title}</div>
          <div className="flex flex-col gap-2 mt-2">
             {source.chapter && (<div className={`flex items-center justify-center sm:justify-start gap-1.5 ${textColor} font-bold text-sm bg-white/60 dark:bg-black/20 px-3 py-1 rounded-md self-center sm:self-start border border-current/20`}><Layers className="w-4 h-4" /><span>{source.chapter}</span></div>)}
             <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm opacity-90 font-medium">{source.author && <span className={`flex items-center gap-1.5 ${textColor}`}><User className="w-3.5 h-3.5" /> {source.author}</span>}</div>
             {source.type !== 'DICTIONARY' && (<div className={`mt-3 flex items-center justify-center sm:justify-start gap-1 text-xs font-bold uppercase tracking-wide ${textColor} group-hover:translate-x-1 transition-transform`}><span>Buka Daftar Isi</span><ArrowRight className="w-3 h-3" /></div>)}
          </div>
       </div>
    </button>
  );
};

const MenuCard = ({ title, icon, onClick, color = 'emerald', description }: { title: string, icon: React.ReactNode, onClick: () => void, color?: string, description: string }) => {
  const colorClasses: {[key: string]: string} = { emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/40', amber: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-400 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/40', blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 hover:border-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/40', indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100 hover:border-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/40', rose: 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 hover:border-rose-400 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/40', orange: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100 hover:border-orange-400 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/40', violet: 'bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100 hover:border-violet-400 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-900/40', sky: 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100 hover:border-sky-400 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-900/40', teal: 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 hover:border-teal-400 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-900/40', };
  return (<button onClick={onClick} className={`flex flex-col p-3 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md group text-left h-full ${colorClasses[color] || colorClasses['emerald']}`}><div className="mb-2 p-1.5 rounded-lg bg-white dark:bg-gray-800 w-fit shadow-sm border border-current group-hover:scale-110 transition-transform">{React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" })}</div><h3 className="font-bold text-sm mb-0.5 leading-tight">{title}</h3><p className="text-[10px] opacity-80 leading-snug line-clamp-2">{description}</p><div className="mt-auto pt-2 flex justify-end"><div className="p-1 rounded-full bg-white/50 dark:bg-black/20 group-hover:translate-x-1 transition-transform"><ArrowRight className="w-3 h-3" /></div></div></button>);
};

const ScientificList = ({ items, colorName, title, fontClass }: { items: AnalysisPoint[], colorName: string, title: string, fontClass: string }) => {
  if (!items || items.length === 0) return null;
  const colors: any = { emerald: { title: 'text-emerald-600', dot: 'bg-emerald-500', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', border: 'border-emerald-200' }, amber: { title: 'text-amber-600', dot: 'bg-amber-500', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', border: 'border-amber-200' }, blue: { title: 'text-blue-600', dot: 'bg-blue-500', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', border: 'border-blue-200' }, violet: { title: 'text-violet-600', dot: 'bg-violet-500', badgeBg: 'bg-violet-100', badgeText: 'text-violet-800', border: 'border-violet-200' }, rose: { title: 'text-rose-600', dot: 'bg-rose-500', badgeBg: 'bg-rose-100', badgeText: 'text-rose-800', border: 'border-rose-200' }, sky: { title: 'text-sky-600', dot: 'bg-sky-500', badgeBg: 'bg-sky-100', badgeText: 'text-sky-800', border: 'border-sky-200' }, orange: { title: 'text-orange-600', dot: 'bg-orange-500', badgeBg: 'bg-orange-100', badgeText: 'text-orange-800', border: 'border-orange-200' } };
  const c = colors[colorName] || colors.emerald;
  return (<div className="animate-fade-in"><h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${c.title} dark:text-gray-300`}><span className={`w-3 h-3 rounded-full ${c.dot}`}></span>{title}</h4><ul className="space-y-4">{items.map((item, idx) => (<li key={idx} className={`flex flex-col sm:flex-row gap-4 items-start bg-white dark:bg-gray-800 p-5 rounded-xl border-2 ${c.border} dark:border-gray-700 shadow-sm`}><div className={`${c.badgeBg} dark:bg-gray-700 ${c.badgeText} dark:text-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold shrink-0 border border-current`}>{item.term}</div><div><p className={`${fontClass} text-gray-700 dark:text-gray-300 leading-relaxed`}>{item.explanation}</p></div></li>))}</ul></div>);
};

const PageWrapper = ({ title, children, color = "emerald", onBack }: { title: string, children?: React.ReactNode, color?: string, onBack: () => void }) => {
  const borderColors: any = { emerald: 'border-emerald-500', amber: 'border-amber-500', blue: 'border-blue-500', indigo: 'border-indigo-500', rose: 'border-rose-500', orange: 'border-orange-500', violet: 'border-violet-500', sky: 'border-sky-500', teal: 'border-teal-500' };
  return (<div className="bg-white dark:bg-gray-800 min-h-[60vh] rounded-3xl shadow-xl overflow-hidden animate-fade-in flex flex-col relative pb-10"><div className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20 flex items-center justify-center`}><h2 className="text-lg font-bold text-gray-800 dark:text-white text-center">{title}</h2></div><div className={`p-6 sm:p-8 border-t-4 ${borderColors[color] || 'border-emerald-500'} flex-grow`}>{children}</div><div className="px-6 pb-6"><button onClick={onBack} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold transition-all active:scale-95 group"><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /><span>Kembali</span></button></div></div>);
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onOpenBookTOC, onBack }) => {
  const { settings } = useContext(AppContext);
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [expandedNahwuIndex, setExpandedNahwuIndex] = useState<number | null>(null);
  const [randomQuote, setRandomQuote] = useState(QUOTES[0]);
  
  useEffect(() => { if (result) { setActiveView('DASHBOARD'); setRandomQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]); } }, [result]);

  if (!result) return null;

  const getArabicClass = () => {
    const font = settings.arabicFont === 'amiri' ? 'font-amiri' : 'font-arabic';
    const size = settings.textSize === 'small' ? 'text-2xl leading-loose' : settings.textSize === 'large' ? 'text-5xl leading-[2.5]' : 'text-4xl leading-[2.3]';
    return `${font} ${size}`;
  };

  const getLatinClass = () => {
    const font = settings.latinFont === 'serif' ? 'font-serif' : 'font-sans';
    const size = settings.textSize === 'small' ? 'text-sm' : settings.textSize === 'large' ? 'text-xl' : 'text-lg'; 
    return `${font} ${size}`;
  };

  const handleShareWA = () => { const text = `*KITAB KUNING AI* 📖\n\n${result.arabicText}\n\n*Terjemah:*\n${result.translationIndonesia}\n\n*Makna Gandul:*\n${result.maknaGandul}\n\n_Dibuat dengan Kitab Kuning AI_`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); };
  const toggleNahwuItem = (index: number) => { setExpandedNahwuIndex(expandedNahwuIndex === index ? null : index); };

  const sa = result.scientificAnalysis;
  const hasDalil = (result.similarVerses && result.similarVerses.length > 0) || (result.similarHadiths && result.similarHadiths.length > 0);
  const hasTajwid = sa?.tajwid && sa.tajwid.length > 0;
  const hasBalaghah = result.balaghahAnalysis && ((result.balaghahAnalysis.bayan && result.balaghahAnalysis.bayan.length > 0) || (result.balaghahAnalysis.maani && result.balaghahAnalysis.maani.length > 0) || (result.balaghahAnalysis.badi && result.balaghahAnalysis.badi.length > 0));

  const renderDashboard = () => (
    <div className="space-y-8 animate-slide-up">
       <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-amber-400 dark:border-amber-600 overflow-hidden p-6 sm:p-8 relative"><div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] z-0"></div><div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-400"></div><div className="relative z-10"><h3 className="text-xs sm:text-sm uppercase tracking-[0.2em] text-emerald-900 dark:text-emerald-400 font-bold mb-6 flex items-center justify-center gap-3 bg-emerald-100 dark:bg-emerald-900/30 py-1.5 px-4 rounded-full mx-auto w-fit border border-emerald-200 dark:border-emerald-800"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Teks Asli (Matan)</h3><p className={`${getArabicClass()} text-center text-emerald-950 dark:text-emerald-100 break-words font-medium drop-shadow-sm mb-8 px-2 leading-loose`} dir="rtl">{result.arabicText}</p><div className="flex justify-center gap-3"><SourceBadge source={result.referenceSource} onClick={onOpenBookTOC} /></div></div></div>
       <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <MenuCard title="Terjemahan" description="Bahasa Indonesia." icon={<BookOpenCheck />} onClick={() => setActiveView('TERJEMAH')} color="emerald" />
          <MenuCard title="Makna Gandul" description="Makna pesantren." icon={<Book />} onClick={() => setActiveView('GANDUL')} color="amber" />
          <MenuCard title="Nahwu & Shorof" description="Analisis gramatika." icon={<GraduationCap />} onClick={() => setActiveView('NAHWU')} color="blue" />
          {hasDalil && ( <MenuCard title="Dalil" description="Ayat & Hadits." icon={<Bookmark />} onClick={() => setActiveView('DALIL')} color="teal" /> )}
          {hasTajwid && ( <MenuCard title="Tajwid" description="Hukum bacaan." icon={<Mic2 />} onClick={() => setActiveView('SCIENTIFIC_TAJWID')} color="emerald" /> )}
          {result.lughahAnalysis && result.lughahAnalysis.length > 0 && ( <MenuCard title="Lughah" description="Mufradat sulit." icon={<Languages />} onClick={() => setActiveView('LUGHAH')} color="orange" /> )}
          {hasBalaghah && ( <MenuCard title="Balaghah" description="Keindahan bahasa." icon={<Feather />} onClick={() => setActiveView('BALAGHAH')} color="rose" /> )}
          {(sa?.tafsir?.length ?? 0) > 0 && ( <MenuCard title="Tafsir" description="Kandungan makna." icon={<BookOpenCheck />} onClick={() => setActiveView('SCIENTIFIC_TAFSIR')} color="emerald" /> )}
          {(sa?.ushulFiqh?.length ?? 0) > 0 && ( <MenuCard title="Ushul Fiqih" description="Istinbath hukum." icon={<Scale />} onClick={() => setActiveView('SCIENTIFIC_USHUL')} color="blue" /> )}
          {(sa?.mantiq?.length ?? 0) > 0 && ( <MenuCard title="Mantiq" description="Logika & premis." icon={<BrainCircuit />} onClick={() => setActiveView('SCIENTIFIC_MANTIQ')} color="violet" /> )}
          {(sa?.tauhid?.length ?? 0) > 0 && ( <MenuCard title="Tauhid" description="Poin keimanan." icon={<ShieldCheck />} onClick={() => setActiveView('SCIENTIFIC_TAUHID')} color="blue" /> )}
          {(sa?.hadith?.length ?? 0) > 0 && ( <MenuCard title="Hadits" description="Status sanad." icon={<ScrollText />} onClick={() => setActiveView('SCIENTIFIC_HADITH')} color="orange" /> )}
          {(sa?.falak?.length ?? 0) > 0 && ( <MenuCard title="Falak" description="Astronomi Islam." icon={<Orbit />} onClick={() => setActiveView('SCIENTIFIC_FALAK')} color="sky" /> )}
          {(sa?.tarikh?.length ?? 0) > 0 && ( <MenuCard title="Tarikh" description="Sejarah Islam." icon={<Hourglass />} onClick={() => setActiveView('SCIENTIFIC_TARIKH')} color="amber" /> )}
          <MenuCard title="Hikmah" description="Kesimpulan." icon={<MessageCircle />} onClick={() => setActiveView('TAFSIR')} color="emerald" />
          <MenuCard title="Referensi" description="Kitab serupa." icon={<Library />} onClick={() => setActiveView('REFERENSI')} color="indigo" />
       </div>
       <div className="flex justify-center pt-6"><button onClick={handleShareWA} className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-400 font-bold rounded-full border border-gray-200 dark:border-gray-700 shadow-sm transition-all"><Share2 className="w-5 h-5" /><span>Bagikan Hasil</span></button></div>
    </div>
  );

  if (activeView === 'DASHBOARD') { return (<div className="max-w-5xl mx-auto pb-32">{renderDashboard()}<div className="mt-10 flex justify-center"><button onClick={onBack} className="max-w-md w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-400 font-bold shadow-lg border border-gray-200 dark:border-gray-700 transition-all group"><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /><span>Kembali ke Pencarian</span></button></div></div>); }
  if (activeView === 'TERJEMAH') { return (<div className="max-w-4xl mx-auto"><PageWrapper title="Terjemahan Standar" color="emerald" onBack={() => setActiveView('DASHBOARD')}><p className={`${getLatinClass()} text-gray-800 dark:text-gray-200 leading-relaxed text-justify mb-6`}>{result.translationIndonesia}</p><div className="flex justify-end"><CopyButton text={result.translationIndonesia} label="Salin Terjemah" /></div></PageWrapper></div>); }
  if (activeView === 'GANDUL') { return (<div className="max-w-4xl mx-auto"><PageWrapper title="Makna Gandul (Pesantren)" color="amber" onBack={() => setActiveView('DASHBOARD')}><div className="flex justify-start items-center mb-6"><div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-2"><Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" /><p className="text-sm font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Gaya Pegon / Utami-Iku</p></div></div><div className="bg-[#FFFCF5] dark:bg-gray-800 border-l-4 border-amber-400 p-6 shadow-sm rounded-r-xl mb-6"><p className={`${getLatinClass()} text-gray-800 dark:text-gray-200 leading-loose font-serif italic`}>{result.maknaGandul}</p></div><div className="flex justify-end"><CopyButton text={result.maknaGandul} label="Salin Gandul" /></div></PageWrapper></div>); }
  if (activeView === 'NAHWU') { return (<div className="max-w-4xl mx-auto"><PageWrapper title="Analisis Nahwu & Shorof" color="blue" onBack={() => setActiveView('DASHBOARD')}><div className="space-y-4">{result.nahwuShorofAnalysis?.length === 0 ? (<p className="text-gray-500 text-center italic">Tidak ada analisis nahwu spesifik.</p>) : (result.nahwuShorofAnalysis?.map((item, idx) => { const isExpanded = expandedNahwuIndex === idx; return (<div key={idx} className={`border-2 rounded-xl transition-all duration-200 overflow-hidden ${isExpanded ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}><button onClick={() => toggleNahwuItem(idx)} className="w-full flex items-center justify-between p-4 text-left focus:outline-none"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors border-2 ${isExpanded ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}>{idx + 1}</div><div><h4 className={`font-arabic font-bold text-gray-900 dark:text-gray-100 leading-none mb-1.5 ${settings.textSize === 'large' ? 'text-3xl' : 'text-xl'}`}>{item.word}</h4><span className="text-[10px] font-black text-white uppercase tracking-wider bg-blue-600 px-2 py-0.5 rounded shadow-sm">{item.role}</span></div></div><ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} /></button>{isExpanded && (<div className="p-4 pt-0 sm:pl-[4.5rem] text-gray-700 dark:text-gray-300 leading-relaxed border-t border-blue-200 dark:border-blue-800/50 mt-2"><p className={getLatinClass()}>{item.explanation}</p></div>)}</div>); }))}</div></PageWrapper></div>); }
  
  const RenderDalilList = ({ items, title, icon, color }: { items: TextReference[], title: string, icon: React.ReactNode, color: string }) => { const colorMap: any = { emerald: { text900: 'text-emerald-900 dark:text-emerald-200', border100: 'border-emerald-100 dark:border-emerald-800', bg50: 'bg-emerald-50 dark:bg-emerald-900/20', border200: 'border-emerald-200 dark:border-emerald-800', bg200: 'bg-emerald-200 dark:bg-emerald-800', text800: 'text-emerald-800 dark:text-emerald-200', text700: 'text-emerald-700 dark:text-emerald-400' }, amber: { text900: 'text-amber-900 dark:text-amber-200', border100: 'border-amber-100 dark:border-amber-800', bg50: 'bg-amber-50 dark:bg-amber-900/20', border200: 'border-amber-200 dark:border-amber-800', bg200: 'bg-amber-200 dark:bg-amber-800', text800: 'text-amber-800 dark:text-amber-200', text700: 'text-amber-700 dark:text-amber-400' } }; const c = colorMap[color] || colorMap.emerald; return (<div className="space-y-4 mb-8 animate-fade-in"><h3 className={`flex items-center gap-2 font-bold text-lg ${c.text900} border-b ${c.border100} pb-2`}>{icon} {title}</h3>{items.map((item, idx) => (<div key={idx} className={`${c.bg50} rounded-xl border ${c.border200} p-5 shadow-sm`}><div className="flex items-center gap-2 mb-3"><span className={`px-2 py-1 rounded ${c.bg200} ${c.text800} text-xs font-bold`}>{item.reference}</span></div><p className={`${settings.arabicFont === 'amiri' ? 'font-amiri' : 'font-arabic'} text-2xl text-right text-gray-800 dark:text-gray-200 leading-loose mb-3`} dir="rtl">{item.arabic}</p><p className="text-gray-600 dark:text-gray-400 italic text-sm mb-3 border-l-2 border-teal-300 pl-3">"{item.translation}"</p><div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300"><strong className={`${c.text700} block mb-1 text-xs uppercase tracking-wider`}>Hubungan Makna:</strong>{item.relevance}</div></div>))}</div>); };
  if (activeView === 'DALIL') { return (<div className="max-w-4xl mx-auto"><PageWrapper title="Dalil & Munasabah" color="teal" onBack={() => setActiveView('DASHBOARD')}>{result.similarVerses && result.similarVerses.length > 0 && ( <RenderDalilList items={result.similarVerses} title="Munasabah Ayat Al-Qur'an" icon={<BookOpenCheck className="w-5 h-5 text-emerald-600" />} color="emerald" /> )}{result.similarHadiths && result.similarHadiths.length > 0 && ( <RenderDalilList items={result.similarHadiths} title="Syawahid Hadits" icon={<ScrollText className="w-5 h-5 text-amber-600" />} color="amber" /> )}{(!result.similarVerses?.length && !result.similarHadiths?.length) && ( <p className="text-center text-gray-500 italic">Tidak ditemukan dalil spesifik yang serupa.</p> )}</PageWrapper></div>); }
  if (activeView === 'LUGHAH') { return (<div className="max-w-4xl mx-auto"><PageWrapper title="Kosakata (Lughah)" color="orange" onBack={() => setActiveView('DASHBOARD')}><div className="grid gap-4 sm:grid-cols-2">{result.lughahAnalysis?.map((item, idx) => (<div key={idx} className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 p-5 rounded-xl shadow-sm"><h5 className={`font-arabic font-bold text-orange-700 dark:text-orange-400 mb-2 ${settings.textSize === 'large' ? 'text-2xl' : 'text-lg'}`} dir="rtl">{item.word}</h5><p className={`${getLatinClass()} text-gray-700 dark:text-gray-300 leading-snug`}>{item.meaning}</p></div>))}</div></PageWrapper></div>); }

  const balaghahData = result.balaghahAnalysis; const hasBayan = balaghahData?.bayan && balaghahData.bayan.length > 0; const hasMaani = balaghahData?.maani && balaghahData.maani.length > 0; const hasBadi = balaghahData?.badi && balaghahData.badi.length > 0; const hasAny = hasBayan || hasMaani || hasBadi; const renderPoints = (points: RhetoricPoint[]) => (<ul className="space-y-4">{points.map((item, idx) => (<li key={idx} className="flex flex-col sm:flex-row gap-4 items-start bg-rose-50/50 dark:bg-rose-900/20 p-6 rounded-xl border-2 border-rose-200 dark:border-rose-800"><div className="bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-lg px-3 py-1 shrink-0 text-xs font-bold uppercase tracking-wider border border-rose-300">{item.feature}</div><p className={`${getLatinClass()} text-gray-700 dark:text-gray-300 leading-relaxed`}>{item.explanation}</p></li>))}</ul>);
  if (activeView === 'BALAGHAH') { return (<div className="max-w-4xl mx-auto"><PageWrapper title="Analisis Balaghah" color="rose" onBack={() => setActiveView('DASHBOARD')}>{hasAny ? (<div className="space-y-8">{hasBayan && (<div><h4 className="text-sm font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 mb-4 pb-2 border-b-2 border-rose-200 dark:border-rose-800">Ilmu Bayan (Seni Mengungkapkan)</h4>{renderPoints(balaghahData!.bayan!)}</div>)}{hasMaani && (<div><h4 className="text-sm font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 mb-4 pb-2 border-b-2 border-rose-200 dark:border-rose-800">Ilmu Ma'ani (Seni Menyusun Kalimat)</h4>{renderPoints(balaghahData!.maani!)}</div>)}{hasBadi && (<div><h4 className="text-sm font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 mb-4 pb-2 border-b-2 border-rose-200 dark:border-rose-800">Ilmu Badi' (Keindahan Lafaz & Makna)</h4>{renderPoints(balaghahData!.badi!)}</div>)}</div>) : (<p className="text-gray-500 italic text-center">Tidak ditemukan analisis balaghah yang signifikan pada teks ini.</p>)}</PageWrapper></div>); }

  const sciProps = { fontClass: getLatinClass() };
  if (activeView === 'SCIENTIFIC_TAJWID') return <div className="max-w-4xl mx-auto"><PageWrapper title="Ilmu Tajwid & Qira'at" color="emerald" onBack={() => setActiveView('DASHBOARD')}><div className="space-y-8"><ScientificList items={sa?.tajwid || []} title="Hukum Tajwid" colorName="emerald" {...sciProps} /><ScientificList items={sa?.qiraat || []} title="Ragam Qira'at" colorName="emerald" {...sciProps} /></div></PageWrapper></div>;
  if (activeView === 'SCIENTIFIC_TAFSIR') return <div className="max-w-4xl mx-auto"><PageWrapper title="Poin Tafsir" color="emerald" onBack={() => setActiveView('DASHBOARD')}><ScientificList items={sa?.tafsir || []} title="Tafsir" colorName="emerald" {...sciProps} /></PageWrapper></div>;
  if (activeView === 'SCIENTIFIC_USHUL') return <div className="max-w-4xl mx-auto"><PageWrapper title="Ushul Fiqih" color="blue" onBack={() => setActiveView('DASHBOARD')}><ScientificList items={sa?.ushulFiqh || []} title="Istinbath Hukum" colorName="blue" {...sciProps} /></PageWrapper></div>;
  if (activeView === 'SCIENTIFIC_MANTIQ') return <div className="max-w-4xl mx-auto"><PageWrapper title="Mantiq (Logika)" color="violet" onBack={() => setActiveView('DASHBOARD')}><ScientificList items={sa?.mantiq || []} title="Logika" colorName="violet" {...sciProps} /></PageWrapper></div>;
  if (activeView === 'SCIENTIFIC_TAUHID') return <div className="max-w-4xl mx-auto"><PageWrapper title="Tauhid" color="blue" onBack={() => setActiveView('DASHBOARD')}><ScientificList items={sa?.tauhid || []} title="Aqidah" colorName="blue" {...sciProps} /></PageWrapper></div>;
  if (activeView === 'SCIENTIFIC_HADITH') return <div className="max-w-4xl mx-auto"><PageWrapper title="Ilmu Hadits" color="orange" onBack={() => setActiveView('DASHBOARD')}><ScientificList items={sa?.hadith || []} title="Musthalah Hadits" colorName="orange" {...sciProps} /></PageWrapper></div>;
  if (activeView === 'SCIENTIFIC_FALAK') return <div className="max-w-4xl mx-auto"><PageWrapper title="Ilmu Falak" color="sky" onBack={() => setActiveView('DASHBOARD')}><ScientificList items={sa?.falak || []} title="Astronomi" colorName="sky" {...sciProps} /></PageWrapper></div>;
  if (activeView === 'SCIENTIFIC_TARIKH') return <div className="max-w-4xl mx-auto"><PageWrapper title="Tarikh" color="amber" onBack={() => setActiveView('DASHBOARD')}><ScientificList items={sa?.tarikh || []} title="Sejarah" colorName="amber" {...sciProps} /></PageWrapper></div>;
  if (activeView === 'TAFSIR') { return (<div className="max-w-4xl mx-auto"><PageWrapper title="Hikmah & Penjelasan" color="emerald" onBack={() => setActiveView('DASHBOARD')}><div className="prose prose-emerald dark:prose-invert sm:prose-lg max-w-none"><p className={`${getLatinClass()} text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-line`}>{result.tafsirContext}</p></div>{randomQuote && (<div className="mt-8 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-800 shadow-sm flex flex-col gap-3"><div className="flex gap-4 items-start"><div className="bg-amber-200 dark:bg-amber-800 p-3 rounded-full shrink-0 mt-1"><Quote className="w-6 h-6 text-amber-800 dark:text-amber-200" /></div><p className="flex-1 text-base text-amber-900 dark:text-amber-200 italic font-medium font-serif">"{randomQuote.text}"</p></div><p className="text-right text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">- {randomQuote.source}</p></div>)}</PageWrapper></div>); }
  if (activeView === 'REFERENSI') { return (<div className="max-w-4xl mx-auto"><PageWrapper title="Tahqiq Kitab & Referensi" color="indigo" onBack={() => setActiveView('DASHBOARD')}><div className="space-y-4">{(!result.relatedReferences || result.relatedReferences.length === 0) ? (<p className="text-gray-500 italic">Tidak ada rekomendasi khusus.</p>) : (<div className="grid gap-4 sm:grid-cols-1">{result.relatedReferences.map((item, idx) => { let RelationIcon = Book; let relationLabel = "Referensi Umum"; let badgeColor = "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"; if (item.relationType === 'MATAN') { RelationIcon = Layers; relationLabel = "KITAB MATAN (ASAL)"; badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"; } else if (item.relationType === 'SYARAH') { RelationIcon = BookOpenCheck; relationLabel = "KITAB SYARAH (PENJELAS)"; badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"; } else if (item.relationType === 'HASHIYAH') { RelationIcon = ScrollText; relationLabel = "HASHIYAH (CATATAN PINGGIR)"; badgeColor = "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"; } return (<button key={idx} onClick={() => onOpenBookTOC(item.title, item.author)} className="w-full text-left group flex flex-col sm:flex-row gap-5 p-6 rounded-2xl bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-indigo-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer relative"><div className="shrink-0"><div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-700 group-hover:scale-105 transition-transform"><RelationIcon className="w-7 h-7" /></div></div><div className="flex-1"><div className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${badgeColor}`}>{relationLabel}</div><h5 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{item.title}</h5><div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3 bg-indigo-50 dark:bg-indigo-900/50 w-fit px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800"><User className="w-3 h-3" /><span>{item.author}</span></div><p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic border-l-4 border-indigo-300 pl-4 mb-3">"{item.relevance}"</p><div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform"><span>Buka Daftar Isi</span><ArrowRight className="w-3 h-3" /></div></div></button>); })}</div>)}</div></PageWrapper></div>); }

  return null;
};

export default ResultDisplay;