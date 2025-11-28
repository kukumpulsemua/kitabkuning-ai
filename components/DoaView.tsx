
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Search, Copy, Check, Share2, 
  BookHeart, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Quote, Sparkles
} from 'lucide-react';

interface DoaViewProps {
  onBack: () => void;
  onAnalyze: (text: string) => void;
}

interface DoaItem {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  category: string;
  source?: string | null; // Tambahan untuk Riwayat/Hadis
}

// Interface sesuai struktur JSON asli dari https://github.com/Kopeahku/hadisku/blob/main/assets/file/doa-harian.json
interface RawDoaItem {
  nama: string;
  arab: string;
  latin: string;
  arti: string;
  riwayat: string;
}

const DoaView: React.FC<DoaViewProps> = ({ onBack, onAnalyze }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // State untuk Data Fetching
  const [doaCollection, setDoaCollection] = useState<DoaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: Format Judul (Title Case & Hapus Angka)
  const formatTitle = (rawTitle: string): string => {
    if (!rawTitle) return "";
    
    // 1. Hapus angka di depan (contoh: "1. Doa..." atau "01. Doa...")
    let clean = rawTitle.replace(/^\d+\s*[\.-]?\s*/, '');
    
    // 2. Ubah ke Title Case jika inputnya UPPERCASE semua atau lowercase semua
    const isAllUpper = clean === clean.toUpperCase();
    const isAllLower = clean === clean.toLowerCase();
    
    if (isAllUpper || isAllLower) {
      return clean.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }
    
    return clean;
  };

  // Fungsi kategorisasi otomatis berdasarkan judul
  const categorizeDoa = (title: string): string => {
    if (!title) return 'Harian Lainnya';
    const t = title.toLowerCase();
    if (t.includes('tidur') || t.includes('bangun')) return 'Tidur';
    if (t.includes('makan') || t.includes('puasa') || t.includes('berbuka')) return 'Makan & Minum';
    if (t.includes('masjid')) return 'Masjid';
    if (t.includes('rumah') || t.includes('keluar') || t.includes('masuk')) return 'Rumah';
    if (t.includes('pakaian') || t.includes('bercermin')) return 'Pakaian & Hiasan';
    if (t.includes('kamar mandi') || t.includes('wc') || t.includes('istinja')) return 'Toilet';
    if (t.includes('perjalanan') || t.includes('kendaraan')) return 'Perjalanan';
    if (t.includes('sakit') || t.includes('menjenguk')) return 'Kesehatan';
    if (t.includes('jenazah') || t.includes('kubur') || t.includes('takziah')) return 'Jenazah';
    if (t.includes('istri') || t.includes('suami') || t.includes('jimak') || t.includes('pengantin')) return 'Keluarga';
    return 'Harian Lainnya';
  };

  const fetchDoa = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mengambil data dari repo Hadisku (Raw Content)
      const response = await fetch('https://raw.githubusercontent.com/Kopeahku/hadisku/main/assets/file/doa-harian.json');
      
      if (!response.ok) throw new Error('Gagal mengambil data doa');
      
      const rawData: RawDoaItem[] = await response.json();
      
      // Transformasi data ke format aplikasi kita dengan field yang benar
      const processedData: DoaItem[] = rawData.map((item, index) => {
        const rawTitle = item.nama || 'Doa Tanpa Judul';
        const cleanTitle = formatTitle(rawTitle);
        
        return {
          id: `doa-${index}`,
          title: cleanTitle,
          arabic: item.arab || '',
          latin: item.latin || '',
          translation: item.arti || '',
          category: categorizeDoa(cleanTitle),
          source: item.riwayat || null
        };
      });

      setDoaCollection(processedData);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat kumpulan doa. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoa();
  }, []);

  // Ambil list kategori unik dari data yang sudah di-fetch
  const categories = useMemo(() => {
    if (doaCollection.length === 0) return ['Semua'];
    const cats = new Set(doaCollection.map(d => d.category));
    return ['Semua', ...Array.from(cats).sort()];
  }, [doaCollection]);

  // Filter Data
  const filteredDoa = useMemo(() => {
    return doaCollection.filter(item => {
      const title = item.title || "";
      const translation = item.translation || "";
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = 
        title.toLowerCase().includes(query) ||
        translation.toLowerCase().includes(query);
      
      const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, doaCollection]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (item: DoaItem) => {
    const text = `*${item.title}*\n\n${item.arabic}\n\n${item.latin}\n\n"${item.translation}"\n${item.source ? `(${item.source})` : ''}\n\n(Sumber: Aplikasi Kitab Kuning AI)`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: text,
      }).catch(console.error);
    } else {
      handleCopy(text, item.id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBedahDoa = (item: DoaItem) => {
    const prompt = `Bedah Doa: "${item.title}"\n\nTeks Arab: ${item.arabic}\n\nArti: "${item.translation}"\n\n${item.source ? `Riwayat: ${item.source}` : ''}\n\nMohon jelaskan kandungan makna, asbabul wurud (jika ada), dan faedah dari doa ini secara mendalam.`;
    onAnalyze(prompt);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 flex flex-col">
      
      {/* Header Sticky */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
         <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
               <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <BookHeart className="w-5 h-5 text-emerald-600" /> Doa-doa Harian
               </h2>
            </div>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />}
         </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-grow">
         
         {/* Search & Filter - Static (Not Sticky) */}
         <div className="space-y-3 mb-6">
            <div className="relative shadow-sm">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul doa..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
               {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                     selectedCategory === cat 
                     ? 'bg-emerald-600 text-white border-emerald-600' 
                     : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
         </div>

         {/* Content Area */}
         {isLoading ? (
            <div className="space-y-4">
               {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse flex items-center gap-4">
                     <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
               ))}
            </div>
         ) : error ? (
            <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
               <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
               <p className="text-red-700 dark:text-red-300 font-medium mb-4">{error}</p>
               <button 
                  onClick={fetchDoa}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold"
               >
                  Coba Lagi
               </button>
            </div>
         ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-slide-up">
               {filteredDoa.length > 0 ? (
                  filteredDoa.map((item, index) => {
                     const isExpanded = expandedId === item.id;
                     const displayNum = index + 1;
                     
                     return (
                       <div key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 group">
                         {/* Accordion Header */}
                         <button 
                           onClick={() => toggleExpand(item.id)}
                           className={`w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors ${
                              isExpanded 
                              ? 'bg-emerald-50/50 dark:bg-emerald-900/10' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                           }`}
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                                  isExpanded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600'
                               }`}>
                                  {displayNum}
                               </div>
                               <div>
                                  <h3 className={`font-bold text-base sm:text-lg leading-snug ${
                                     isExpanded ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'
                                  }`}>
                                     {item.title}
                                  </h3>
                                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{item.category}</p>
                               </div>
                            </div>
                            <div className="ml-2 text-gray-400">
                               {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                         </button>

                         {/* Accordion Body */}
                         {isExpanded && (
                           <div className="p-5 sm:p-6 bg-gray-50/30 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 animate-slide-down">
                              
                              {/* Arab */}
                              <div className="text-right mb-6 pl-4">
                                 <p className="font-arabic text-3xl sm:text-4xl leading-[2.3] text-gray-800 dark:text-gray-100" dir="rtl">
                                    {item.arabic}
                                 </p>
                              </div>
                              
                              {/* Latin */}
                              <div className="mb-4">
                                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Latin</h4>
                                 <p className="text-emerald-700 dark:text-emerald-400 text-sm sm:text-base font-medium leading-relaxed">
                                    {item.latin}
                                 </p>
                              </div>

                              {/* Terjemah */}
                              <div className="mb-6 relative">
                                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Arti</h4>
                                 <div className="pl-4 border-l-2 border-emerald-300 dark:border-emerald-700">
                                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base italic leading-relaxed">
                                       "{item.translation}"
                                    </p>
                                 </div>
                              </div>

                              {/* Sumber / Riwayat (Jika Ada) */}
                              {item.source && (
                                 <div className="mt-6 border-t border-gray-200 dark:border-gray-700/50 pt-4">
                                     <div className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full text-emerald-600 dark:text-emerald-400">
                                           <Quote className="w-3.5 h-3.5 fill-current" />
                                        </div>
                                        <div>
                                           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Riwayat / Dalil</span>
                                           <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{item.source}</span>
                                        </div>
                                     </div>
                                 </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-row items-center gap-2 pt-6 mt-2 w-full sm:justify-end">
                                 <button 
                                   onClick={() => handleBedahDoa(item)}
                                   className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 transition-colors border border-amber-200 dark:border-amber-800 whitespace-nowrap"
                                 >
                                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                    Bedah Doa
                                 </button>

                                 <button 
                                   onClick={() => handleCopy(item.arabic + "\n\n" + item.translation + (item.source ? `\n(${item.source})` : ''), item.id)}
                                   className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors border border-gray-200 dark:border-gray-700 hover:border-emerald-300 whitespace-nowrap"
                                 >
                                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                    {copiedId === item.id ? 'Disalin' : 'Salin Teks'}
                                 </button>
                                 <button 
                                   onClick={() => handleShare(item)}
                                   className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors border border-gray-200 dark:border-gray-700 hover:border-blue-300 whitespace-nowrap"
                                 >
                                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                                    Bagikan
                                 </button>
                              </div>
                           </div>
                         )}
                       </div>
                     );
                  })
               ) : (
                  <div className="text-center py-20 text-gray-500">
                     <BookHeart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                     <p>Tidak ditemukan doa dengan kata kunci tersebut.</p>
                  </div>
               )}
            </div>
         )}

      </div>
    </div>
  );
};

export default DoaView;