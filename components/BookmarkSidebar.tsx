import React, { useState, useEffect } from 'react';
import { X, Bookmark, Trash2, ChevronRight, Loader2 } from 'lucide-react';

interface BookmarkSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (surah: number, ayah: number) => void;
}

const BookmarkSidebar: React.FC<BookmarkSidebarProps> = ({ isOpen, onClose, onSelect }) => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [surahNames, setSurahNames] = useState<Record<number, string>>({});
  const [isLoadingNames, setIsLoadingNames] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBookmarks();
      loadSurahNames();
    }
  }, [isOpen]);

  const loadBookmarks = () => {
    try {
      const saved = localStorage.getItem('quranBookmarks');
      if (saved) {
        // Reverse agar yang terakhir ditambahkan muncul paling atas
        setBookmarks(JSON.parse(saved).reverse()); 
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSurahNames = async () => {
    if (Object.keys(surahNames).length > 0) return; // Sudah diload
    
    setIsLoadingNames(true);
    try {
      const res = await fetch('https://equran.id/api/v2/surat');
      const data = await res.json();
      if (data.code === 200) {
        const map: Record<number, string> = {};
        data.data.forEach((s: any) => {
          map[s.nomor] = s.namaLatin;
        });
        setSurahNames(map);
      }
    } catch (e) {
      console.error("Failed to fetch surah names", e);
    } finally {
      setIsLoadingNames(false);
    }
  };

  const deleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarks = bookmarks.filter(b => b !== id);
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks.reverse())); // Simpan urutan asli
  };

  const handleSelect = (id: string) => {
    const [surah, ayah] = id.split(':').map(Number);
    onSelect(surah, ayah);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-teal-950 text-white">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-teal-400" />
              <h2 className="font-bold text-lg">Penanda Ayat</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-teal-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600 text-center">
                <Bookmark className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Belum ada penanda.</p>
                <p className="text-xs mt-1">Tandai ayat saat membaca Al-Qur'an.</p>
              </div>
            ) : (
              bookmarks.map((id) => {
                const [surahNum, ayahNum] = id.split(':').map(Number);
                const surahName = surahNames[surahNum] || `Surah ${surahNum}`;

                return (
                  <div 
                    key={id}
                    onClick={() => handleSelect(id)}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex justify-between items-center"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div>
                       {isLoadingNames && !surahNames[surahNum] ? (
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                       ) : (
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-0.5">
                             {surahName}
                          </h3>
                       )}
                       <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded font-medium border border-teal-100 dark:border-teal-800">
                             Ayat {ayahNum}
                          </span>
                       </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="p-2 text-gray-300 group-hover:text-teal-500 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <button 
                        onClick={(e) => deleteBookmark(id, e)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors z-10"
                        title="Hapus Penanda"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookmarkSidebar;