

import React, { useState, useEffect } from 'react';
import { BookExplanation } from '../types.ts';
import { explainBook, explainSpecificTopic } from '../services/geminiService.ts';
import { 
  ArrowLeft, BookOpenCheck, Layers, ScrollText, Sparkles, 
  Bot, Loader2, ExternalLink, User, X, Calendar
} from 'lucide-react';

interface BookDetailPageProps {
  title: string;
  author?: string;
  onBack: () => void;
  onOpenAuthor: (authorName: string) => void;
  // FX-981: Removed apiKey prop
}

const BookDetailPage: React.FC<BookDetailPageProps> = ({ title, author, onBack, onOpenAuthor }) => {
  const [bookData, setBookData] = useState<BookExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicExplanation, setTopicExplanation] = useState<string | null>(null);
  const [isTopicLoading, setIsTopicLoading] = useState(false);

  useEffect(() => {
    const loadBookData = async () => {
      setIsLoading(true);
      try {
        // FX-981: Removed apiKey argument
        const data = await explainBook(title, author);
        setBookData(data);
      } catch (error) {
        console.error("Failed to load book data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBookData();
  }, [title, author]);

  const handleTopicClick = async (topic: string) => {
    if (!bookData) return;
    
    setSelectedTopic(topic);
    setIsTopicLoading(true);
    setTopicExplanation(null);

    try {
      // FX-981: Removed apiKey argument
      const explanation = await explainSpecificTopic(bookData.title, topic);
      setTopicExplanation(explanation);
    } catch (error) {
      setTopicExplanation("Gagal memuat penjelasan untuk topik ini.");
    } finally {
      setIsTopicLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTopic(null);
    setTopicExplanation(null);
  };

  const getBookSearchUrl = (title: string, author?: string) => {
    const query = encodeURIComponent(`Kitab ${title} ${author || ''} pdf maktabah`);
    return `https://www.google.com/search?q=${query}`;
  };

  const getCleanAuthorName = (name: string) => {
    return name.replace(/^Karya[:\s]+/i, '').trim();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-900 text-gray-800 dark:text-gray-100 animate-fade-in flex flex-col">
      <div className="max-w-4xl mx-auto w-full pb-28">
        
        {/* Sticky Header with Back Button */}
        <div className="sticky top-0 z-20 bg-[#FDFBF7]/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6" />
             </button>
             <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
               <BookOpenCheck className="w-5 h-5 text-emerald-600" />
               Kitab Kuning AI
             </h1>
          </div>
        </div>

        <div className="px-4 sm:px-6">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
               <div className="relative">
                 <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                 <div className="w-20 h-20 border-4 border-emerald-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                 <BookOpenCheck className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
               </div>
               <div className="animate-pulse">
                 <p className="font-bold text-gray-800 dark:text-gray-200 text-xl">Membuka Lembaran Kitab...</p>
                 <p className="text-gray-500 mt-2">AI sedang menelusuri referensi tentang {title}.</p>
               </div>
             </div>
          ) : bookData ? (
             <div className="space-y-8 animate-slide-up">
                
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-amber-400 dark:border-amber-700 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full z-0"></div>
                   <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] z-0"></div>
                   
                   <div className="relative z-10 flex flex-col items-center text-center">
                      <span className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-sm font-bold rounded-full mb-4 uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 shadow-sm">
                          {bookData.field}
                      </span>
                      <h2 className="font-amiri text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-relaxed drop-shadow-sm">{bookData.title}</h2>
                      
                      <div className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 font-serif mb-4">
                         <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                           {getCleanAuthorName(bookData.author)}
                         </span>
                         {bookData.author_life_period ? (
                             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800 mt-1 shadow-sm">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{bookData.author_life_period}</span>
                             </div>
                         ) : (
                             <span className="text-base opacity-90 font-medium">({bookData.period})</span>
                         )}
                      </div>

                      <button 
                         onClick={() => onOpenAuthor(getCleanAuthorName(bookData.author))}
                         className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
                      >
                         <User className="w-4 h-4" />
                         Baca Biografi Lengkap
                      </button>
                   </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border-l-8 border-amber-500 shadow-sm">
                  <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                     <Sparkles className="w-5 h-5" /> Keistimewaan Kitab
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed italic font-serif">
                    "{bookData.significance}"
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                       <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-xl border-b pb-2 border-gray-100 dark:border-gray-700">
                         <ScrollText className="w-6 h-6 text-emerald-600" /> Ringkasan Isi
                       </h4>
                       <p className="text-gray-700 dark:text-gray-300 leading-loose text-justify text-lg">
                         {bookData.summary}
                       </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
                           <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
                             <Layers className="w-5 h-5" /> Topik Utama
                           </h4>
                           <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-4">
                             Klik topik untuk mendapatkan penjelasan mendalam dari AI.
                           </p>
                           <div className="flex flex-wrap gap-2">
                             {bookData.keyTopics.map((topic, i) => (
                               <button 
                                 key={i} 
                                 onClick={() => handleTopicClick(topic)}
                                 disabled={isTopicLoading}
                                 className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border font-medium transition-all cursor-pointer shadow-sm hover:shadow-md ${
                                    selectedTopic === topic 
                                    ? 'bg-emerald-600 text-white border-emerald-600' 
                                    : 'bg-white dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300 border-emerald-100 dark:border-gray-700'
                                 }`}
                               >
                                 <span className="flex items-center gap-2">
                                    <Bot className={`w-4 h-4 ${selectedTopic === topic ? 'text-white' : 'text-emerald-500'}`} />
                                    {topic}
                                 </span>
                                 {selectedTopic === topic && isTopicLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                               </button>
                             ))}
                           </div>
                        </div>

                        <a 
                          href={getBookSearchUrl(bookData.title, getCleanAuthorName(bookData.author))} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-4 bg-gray-800 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <span>Cari PDF / Maktabah</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {selectedTopic && (
                  <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={handleCloseModal}
                  >
                    <div 
                      className="bg-white dark:bg-gray-800 w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border-2 border-emerald-500 dark:border-emerald-600"
                      onClick={(e) => e.stopPropagation()} 
                    >
                       <div className="bg-emerald-600 p-4 sm:p-5 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-3 text-white">
                             <Sparkles className="w-6 h-6 text-yellow-300" />
                             <h3 className="font-bold text-lg sm:text-xl">Bedah Masalah: {selectedTopic}</h3>
                          </div>
                          <button 
                            onClick={handleCloseModal}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                          >
                             <X className="w-6 h-6" />
                          </button>
                       </div>
                       
                       <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                          {isTopicLoading ? (
                             <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-500" />
                                <p className="text-lg font-medium">Sedang menelaah referensi kitab...</p>
                                <p className="text-sm opacity-75">AI sedang mencari dalil dan syarah terkait.</p>
                             </div>
                          ) : (
                             <div className="prose prose-lg prose-emerald dark:prose-invert max-w-none">
                                <div className="text-gray-800 dark:text-gray-200 leading-loose whitespace-pre-line">
                                  {topicExplanation}
                                </div>
                             </div>
                          )}
                       </div>

                       {!isTopicLoading && (
                         <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-right">
                            <a 
                              href={`https://www.google.com/search?q=${encodeURIComponent("pembahasan " + selectedTopic + " kitab " + bookData.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-end gap-1"
                            >
                              Telusuri lebih lanjut di Google <ExternalLink className="w-3 h-3" />
                            </a>
                         </div>
                       )}
                    </div>
                  </div>
                )}

             </div>
          ) : (
            <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
              <BookOpenCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Maaf, data kitab tidak ditemukan.</p>
              <button onClick={onBack} className="mt-4 text-emerald-600 hover:underline font-medium">Kembali ke halaman utama</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;