import React, { useState, useEffect, useContext } from 'react';
import { LibraryBookMetadata, ChapterContent } from '../types.ts';
import { getBookTableOfContents } from '../services/geminiService.ts'; // Chapter content is no longer needed from here
import { 
  Search, ArrowLeft, Loader2, AlignLeft, Sparkles, User, Calendar,
  Book, ChevronRight, ChevronDown, Scale, Feather, Heart, ScrollText, 
  ShieldCheck, BrainCircuit, Gavel, PenTool, BookOpen 
} from 'lucide-react';
import { AppContext } from '../App.tsx';
// Local book data is no longer the primary source
import * as JurumiyahData from '../data/books/jurumiyah.json';
import * as SafinahData from '../data/books/safinah.json';

const LOCAL_BOOKS: Record<string, any> = {
    'jurumiyah': JurumiyahData,
    'safinatun_najah': SafinahData
};


interface LibraryViewProps {
  onAnalyzeText: (text: string) => void;
  initialQuery?: string;
  onBack?: () => void;
  onOpenAuthor?: (authorName: string) => void;
}

// The hardcoded list is now a fallback / display list, not the data source
const BOOK_CATEGORIES: Record<string, Array<{id: string, title: string, author: string}>> = {
  "Nahwu & Shorof (Lokal)": [
    { id: "jurumiyah", title: "Jurumiyah", author: "Syekh Ash-Shanhaji" },
  ],
  "Fiqih (Lokal)": [
    { id: "safinatun_najah", title: "Safinatun Najah", author: "Syekh Salim bin Sumair" },
  ],
  "Fiqih (AI)": [
    { id: "fathul_qorib", title: "Fathul Qorib", author: "Syekh Ibnu Qosim" },
  ],
  // ... other categories can be added
};


const getCategoryIcon = (category: string) => {
    // ... (same as before)
    return <Book className="w-5 h-5" />;
};

const LibraryView: React.FC<LibraryViewProps> = ({ onAnalyzeText, initialQuery, onBack, onOpenAuthor }) => {
  const { settings } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewState, setViewState] = useState<'SEARCH' | 'TOC'>('SEARCH');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const [currentBook, setCurrentBook] = useState<any | null>(null);

  useEffect(() => {
    if (initialQuery) {
      handleSearchSubmit(undefined, initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = async (e?: React.FormEvent, overrideQuery?: string, bookId?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Membuka kitab...");
    
    // 1. Try to load from local JSON first if ID is provided
    if (bookId && LOCAL_BOOKS[bookId]) {
        setCurrentBook(LOCAL_BOOKS[bookId]);
        setViewState('TOC');
        setIsLoading(false);
        return;
    }

    // 2. If not local, fetch from AI/Public Cache
    try {
      const bookData = await getBookTableOfContents(query);
      setCurrentBook(bookData);
      setViewState('TOC');
    } catch (error) {
      alert("Gagal menemukan kitab. Pastikan judul benar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterClick = (chapterTitle: string, chapterContent?: string) => {
    if (!currentBook) return;
    
    // If content is provided locally, use it. Otherwise, this feature is disabled for AI books.
    if (!chapterContent) {
        alert("Fitur 'Bedah Bab' saat ini hanya tersedia untuk kitab yang tersimpan lokal (seperti Jurumiyah & Safinah).");
        return;
    }

    setIsLoading(true);
    setLoadingMessage("Sedang membedah teks dengan AI...");
    const contextHeader = `[Kitab: ${currentBook.title}]\n[Bab: ${chapterTitle}]\n\n`;
    const fullTextToAnalyze = `${contextHeader}${chapterContent}`;
    onAnalyzeText(fullTextToAnalyze);
  };
  
  const handleBackNav = () => { onBack ? onBack() : (setViewState('SEARCH'), setCurrentBook(null)); };
  const toggleCategory = (category: string) => setExpandedCategory(expandedCategory === category ? null : category);

  if (isLoading) { /* ... loading UI ... */ }

  if (viewState === 'SEARCH') {
    return (
      <div className="min-h-[80vh] animate-fade-in relative pb-32 flex flex-col">
        {/* ... Search UI remains largely the same, but the click handler is updated ... */}
        <div className="space-y-3">
            {Object.keys(BOOK_CATEGORIES).map((category) => {
                const isOpen = expandedCategory === category;
                return (
                    <div key={category} /* ... outer div ... */>
                    <button onClick={() => toggleCategory(category)} /* ... button ... */>
                        {/* ... button content ... */}
                    </button>
                    <div className={`transition-all ... ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                        <div className="p-4 pt-0 ...">
                        {BOOK_CATEGORIES[category].map((book, idx) => (
                            <button key={idx} onClick={() => handleSearchSubmit(undefined, book.title, book.id)} /* ... inner button ... */ >
                                {/* ... inner button content ... */}
                            </button>
                        ))}
                        </div>
                    </div>
                    </div>
                );
            })}
        </div>
      </div>
    );
  }

  // TOC View is also updated
  return (
    <div className="max-w-4xl mx-auto w-full pb-32 animate-fade-in flex flex-col">
       {/* ... Header ... */}
       <div className="px-4 py-8 flex-grow">
         {currentBook && (
           <>
            {/* ... Book Info Header ... */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl ...">
                {/* ... Header content ... */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentBook.chapters.map((chapter: any, idx: number) => {
                    const chapterTitle = typeof chapter === 'string' ? chapter : chapter.title;
                    const chapterContent = typeof chapter === 'string' ? undefined : chapter.content;
                    return (
                        <button key={idx} onClick={() => handleChapterClick(chapterTitle, chapterContent)} /* ... chapter button ... */ >
                            {/* ... chapter button content ... */}
                        </button>
                    )
                  })}
                </div>
            </div>
           </>
         )}
       </div>
    </div>
  );
};

export default LibraryView;
