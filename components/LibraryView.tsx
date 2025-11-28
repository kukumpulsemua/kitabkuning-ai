


import React, { useState, useEffect, useContext } from 'react';
import { LibraryBookMetadata, AppSettings } from '../types.ts';
import { getBookTableOfContents, getChapterContent } from '../services/geminiService.ts';
import { 
  Search, ArrowLeft, Loader2, AlignLeft, Sparkles, User, Calendar,
  Book, ChevronRight, ChevronDown, Scale, Feather, Heart, ScrollText, 
  ShieldCheck, BrainCircuit, Gavel, PenTool, BookOpen 
} from 'lucide-react';
import { AppContext } from '../App.tsx';

interface LibraryViewProps {
  onAnalyzeText: (text: string) => void;
  initialQuery?: string;
  onBack?: () => void;
  onOpenAuthor?: (authorName: string) => void;
}

const BOOK_CATEGORIES: Record<string, Array<{title: string, author: string}>> = {
  "Akidah (Tauhid)": [
    { title: "Aqidatul Awam", author: "Syekh Ahmad Al-Marzuki" },
    { title: "Tijan Darori", author: "Syekh Nawawi Al-Bantani" },
    { title: "Kifayatul Awam", author: "Syekh Muhammad Al-Fudhali" },
    { title: "Jauharatut Tauhid", author: "Syekh Ibrahim Al-Laqqani" },
    { title: "Ummul Barahin", author: "Imam As-Sanusi" }
  ],
  "Fiqih": [
    { title: "Safinatun Najah", author: "Syekh Salim bin Sumair" },
    { title: "Fathul Qorib", author: "Syekh Ibnu Qosim" },
    { title: "Riyadhul Badi'ah", author: "Syekh Muhammad Nawawi" },
    { title: "Fathul Mu'in", author: "Syekh Zainuddin Al-Malibari" },
    { title: "Taqrib", author: "Syekh Abu Syuja'" },
    { title: "Minhajut Thalibin", author: "Imam An-Nawawi" }
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
    { title: "Amtsilah Tashrifiyah", author: "Kyai Ma'shum Ali" },
    { title: "Kailani", author: "Syekh Ali bin Hisyam" }
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
    { title: "Ihya Ulumuddin", author: "Imam Al-Ghazali" },
    { title: "Bidayatul Hidayah", author: "Imam Al-Ghazali" }
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
    { title: "Bulughul Maram", author: "Ibnu Hajar Al-Asqalani" },
    { title: "Mukhtarul Ahadits", author: "Sayyid Ahmad Al-Hasyimi" }
  ],
  "Tafsir": [
    { title: "Tafsir Jalalain", author: "Jalaluddin Al-Mahalli & As-Suyuthi" },
    { title: "Tafsir Al-Munir", author: "Syekh Wahbah Az-Zuhaili" }
  ]
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
    case "Tafsir": return <BookOpen className="w-5 h-5" />;
    default: return <Book className="w-5 h-5" />;
  }
};

const LibraryView: React.FC<LibraryViewProps> = ({ onAnalyzeText, initialQuery, onBack, onOpenAuthor }) => {
  const { settings } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewState, setViewState] = useState<'SEARCH' | 'TOC'>('SEARCH');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const [currentBook, setCurrentBook] = useState<LibraryBookMetadata | null>(null);

  useEffect(() => {
    if (initialQuery) {
      handleSearchSubmit(undefined, initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Mencari kitab di rak digital...");
    try {
      // FIX: `getBookTableOfContents` expects only one argument. The API key is handled by the service and should not be passed from components.
      const bookData = await getBookTableOfContents(query);
      setCurrentBook(bookData);
      setViewState('TOC');
    } catch (error) {
      alert("Gagal menemukan kitab. Pastikan judul benar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterClick = async (chapterTitle: string) => {
    if (!currentBook) return;
    setIsLoading(true);
    setLoadingMessage(`Mengambil teks ${chapterTitle}...`);
    
    try {
      // FIX: `getChapterContent` expects only two arguments. The API key is handled by the service and should not be passed from components.
      const content = await getChapterContent(currentBook.title, chapterTitle);
      const contextHeader = `[Kitab: ${currentBook.title}]\n[Bab: ${chapterTitle}]\n\n`;
      const fullTextToAnalyze = `${contextHeader}${content.arabicContent}`;
      setLoadingMessage("Sedang membedah teks dengan AI...");
      onAnalyzeText(fullTextToAnalyze);
    } catch (error) {
      alert("Gagal memuat isi bab. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleBackNav = () => {
    if (onBack) {
      onBack();
    } else {
      setViewState('SEARCH');
      setSearchQuery('');
      setCurrentBook(null);
    }
  };

  const toggleCategory = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };

  if (isLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in p-8 text-center">
         <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
         </div>
         <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Mohon Tunggu</h3>
         <p className="text-gray-500 dark:text-gray-400">{loadingMessage}</p>
      </div>
     );
  }

  if (viewState === 'SEARCH') {
    return (
      <div className="min-h-[80vh] animate-fade-in relative pb-32 flex flex-col">
        
        {/* Header with Back Button */}
        <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
           <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={handleBackNav} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <Book className="w-5 h-5 text-emerald-600" /> Pustaka Kitab
                </h2>
              </div>
           </div>
        </div>

        <div className="max-w-2xl mx-auto w-full px-4 py-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-serif">
                Pustaka Kitab Kuning
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Cari kitab manual jika tidak ada di daftar populer.
              </p>
            </div>

            <form onSubmit={(e) => handleSearchSubmit(e)} className="mb-10 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul kitab..."
                className="w-full p-4 pl-12 rounded-2xl border-2 border-emerald-100 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-emerald-500 focus:ring-0 shadow-lg shadow-emerald-100/20 dark:shadow-none transition-all text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-3 top-3 bottom-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cari"}
              </button>
            </form>

            {/* Book Categories List (Accordion Style) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1 mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Book className="w-4 h-4 text-emerald-500" />
                    Kategori Kitab
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium">Jelajahi koleksi</span>
                </div>

                <div className="space-y-3">
                  {Object.keys(BOOK_CATEGORIES).map((category) => {
                    const isOpen = expandedCategory === category;
                    return (
                      <div key={category} className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
                        <button 
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                {getCategoryIcon(category)}
                            </div>
                            <span className={`font-bold text-sm sm:text-base ${isOpen ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-700 dark:text-gray-300'}`}>
                              {category}
                            </span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                        </button>

                        {/* Increased max-height to prevent cut-off */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="p-4 pt-0 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 space-y-2">
                            {BOOK_CATEGORIES[category].map((book, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleSearchSubmit(undefined, book.title)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:shadow-sm transition-all group text-left"
                              >
                                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0 text-xs font-serif font-bold border border-amber-100 dark:border-amber-800/30">
                                    {idx + 1}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{book.title}</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{book.author}</div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>

            {/* Static Back Button at bottom of list */}
            <div className="mt-10 flex justify-center">
               <button
                 onClick={handleBackNav}
                 className="max-w-md w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold shadow-sm border border-gray-200 dark:border-gray-700 transition-all"
               >
                 <ArrowLeft className="w-5 h-5" />
                 <span>Kembali ke Beranda</span>
               </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-32 animate-fade-in flex flex-col">
       
       {/* Header for TOC View */}
       <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
           <div className="max-w-2xl mx-auto flex items-center gap-3">
              <button onClick={handleBackNav} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                  <h2 className="font-bold text-lg text-gray-800 dark:text-white leading-none">
                    Daftar Isi
                  </h2>
                  {currentBook && <p className="text-xs text-emerald-600 dark:text-emerald-400">{currentBook.title}</p>}
              </div>
           </div>
       </div>

       <div className="px-4 py-8 flex-grow">
         {currentBook && (
           <>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-emerald-500 dark:border-emerald-700 shadow-xl mb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">{currentBook.title}</h2>
                <p className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">{currentBook.author}</p>
                
                {currentBook.authorPeriod && (
                   <div className="flex justify-center mt-2 mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800 shadow-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{currentBook.authorPeriod}</span>
                      </div>
                   </div>
                )}
                
                <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl mx-auto leading-relaxed italic mb-6">"{currentBook.description}"</p>
                
                {onOpenAuthor && (
                  <button 
                     onClick={() => onOpenAuthor(currentBook.author)}
                     className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 mx-auto border-2 border-transparent hover:border-emerald-200"
                  >
                     <User className="w-4 h-4" />
                     <span>Baca Biografi Lengkap</span>
                  </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Daftar Isi Kitab</h3>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                    Klik Bab untuk Bedah
                  </span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentBook.chapters.map((chapter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChapterClick(chapter)}
                      className="w-full text-left px-6 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 font-mono text-sm w-6 shrink-0">{idx + 1}.</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{chapter}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-200">
                           <span className="text-xs font-bold text-emerald-600">Mulai Bedah</span>
                           <Sparkles className="w-4 h-4 text-emerald-500" />
                        </div>
                    </button>
                  ))}
                </div>
            </div>
           </>
         )}
       </div>
    </div>
  );
};

export default LibraryView;
