

import React, { useState, useEffect } from 'react';
import { AuthorExplanation } from '../types.ts';
import { explainAuthor } from '../services/geminiService.ts';
import { 
  ArrowLeft, User, GraduationCap, Book, Users, Globe, 
  Feather, ScrollText, ArrowRight, ChevronRight, Calendar
} from 'lucide-react';

interface AuthorDetailPageProps {
  authorName: string;
  onBack: () => void;
  onOpenAuthor: (authorName: string) => void;
  onOpenBook: (bookTitle: string) => void;
  // FX-981: Removed apiKey prop
}

const AuthorDetailPage: React.FC<AuthorDetailPageProps> = ({ authorName, onBack, onOpenAuthor, onOpenBook }) => {
  const [authorData, setAuthorData] = useState<AuthorExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthorData = async () => {
      setIsLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        // FX-981: Removed apiKey argument
        const data = await explainAuthor(authorName);
        setAuthorData(data);
      } catch (error) {
        console.error("Failed to load author data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthorData();
  }, [authorName]);

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
               <User className="w-5 h-5 text-emerald-600" />
               Biografi Ulama
             </h1>
          </div>
        </div>

        <div className="px-4 sm:px-6">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
               <div className="w-20 h-20 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
               <div className="animate-pulse">
                 <p className="font-bold text-gray-800 dark:text-gray-200 text-xl">Membuka Manakib...</p>
                 <p className="text-gray-500 mt-2">AI sedang menyusun biografi {authorName}.</p>
               </div>
             </div>
          ) : authorData ? (
             <div className="space-y-8 animate-slide-up">
                
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-emerald-500 dark:border-emerald-700 relative overflow-hidden text-center">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400"></div>
                   <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-100 dark:bg-emerald-900/30 rounded-full opacity-50 blur-2xl"></div>
                   <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-100 dark:bg-amber-900/30 rounded-full opacity-50 blur-2xl"></div>

                   <div className="relative z-10 flex flex-col items-center">
                      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mb-4 shadow-inner border-4 border-white dark:border-gray-700">
                        <Feather className="w-10 h-10" />
                      </div>
                      <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
                        {authorData.name}
                      </h2>
                      <span className="inline-block px-4 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-sm font-bold rounded-full mb-2 uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                        {authorData.title_honorific}
                      </span>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm font-bold rounded-full border border-amber-200 dark:border-amber-800 mt-2">
                        <Calendar className="w-4 h-4" />
                        <span>{authorData.life_period}</span>
                      </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    
                    <div className="md:col-span-2 space-y-6">
                       
                       <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-xl border-b pb-2 border-gray-100 dark:border-gray-700">
                            <ScrollText className="w-5 h-5 text-emerald-600" /> Riwayat Hidup
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 leading-loose text-justify text-lg whitespace-pre-line">
                            {authorData.bio_summary}
                          </p>
                       </div>

                       <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border-l-8 border-amber-500 shadow-sm">
                          <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                             <Globe className="w-5 h-5" /> Pengaruh & Kontribusi
                          </h3>
                          <p className="text-gray-800 dark:text-gray-200 italic leading-relaxed">
                             "{authorData.influence}"
                          </p>
                       </div>
                    </div>

                    <div className="space-y-6">
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-emerald-100 dark:border-emerald-900/50">
                           <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
                             <Book className="w-5 h-5" /> Karya Monumental
                           </h3>
                           {authorData.major_works && authorData.major_works.length > 0 ? (
                             <ul className="space-y-2">
                               {authorData.major_works.map((work, idx) => (
                                 <li key={idx}>
                                   <button 
                                      onClick={() => onOpenBook(work)}
                                      className="w-full text-left block p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-200 group"
                                   >
                                     <div className="font-serif font-bold text-lg leading-none mb-1">{work}</div>
                                     <div className="text-xs text-gray-400 group-hover:text-emerald-500 flex items-center gap-1">
                                        Buka di Rak Digital <ChevronRight className="w-3 h-3" />
                                     </div>
                                   </button>
                                 </li>
                               ))}
                             </ul>
                           ) : (
                             <p className="text-gray-500 text-sm italic">Data karya belum tersedia.</p>
                           )}
                        </div>

                        <div className="bg-indigo-50 dark:bg-gray-800 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50">
                           <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                             <Users className="w-5 h-5" /> Sanad Keilmuan
                           </h3>
                           
                           <div className="mb-5">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2 flex items-center gap-1">
                                 <GraduationCap className="w-3 h-3" /> Guru-guru Utama
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {authorData.teachers && authorData.teachers.length > 0 ? (
                                  authorData.teachers.map((t, i) => (
                                   <button 
                                      key={i} 
                                      onClick={() => onOpenAuthor(t)}
                                      className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all shadow-sm text-left"
                                      title={`Lihat Biografi ${t}`}
                                   >
                                      <span>{t}</span>
                                      <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                   </button>
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-sm italic">Data guru tidak tersedia.</span>
                                )}
                              </div>
                           </div>

                           <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2 flex items-center gap-1">
                                 <Users className="w-3 h-3" /> Murid-murid Utama
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {authorData.students && authorData.students.length > 0 ? (
                                  authorData.students.map((s, i) => (
                                   <button 
                                      key={i} 
                                      onClick={() => onOpenAuthor(s)}
                                      className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all shadow-sm text-left"
                                      title={`Lihat Biografi ${s}`}
                                   >
                                      <span>{s}</span>
                                      <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                   </button>
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-sm italic">Data murid tidak tersedia.</span>
                                )}
                              </div>
                           </div>
                        </div>

                    </div>
                </div>

             </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">Data tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorDetailPage;