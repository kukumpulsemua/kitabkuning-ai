import React, { useState, useEffect } from 'react';
import { X, ScrollText, Trash2, ChevronRight } from 'lucide-react';

interface HadithBookmarkSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bookId: string, hadithNumber: number) => void;
}

// MAPPING NAMA KITAB
const HADITH_BOOK_NAMES: Record<string, string> = {
  'bukhari': 'Sahih Bukhari',
  'muslim': 'Sahih Muslim',
  'abu-daud': 'Sunan Abu Daud',
  'tirmidzi': 'Jami\' Tirmidzi',
  'nasai': 'Sunan An-Nasa\'i',
  'ibnu-majah': 'Sunan Ibnu Majah',
  'ahmad': 'Musnad Ahmad',
  'malik': 'Muwatha\' Malik',
  'darimi': 'Sunan Ad-Darimi'
};

const HadithBookmarkSidebar: React.FC<HadithBookmarkSidebarProps> = ({ isOpen, onClose, onSelect }) => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadBookmarks();
    }
  }, [isOpen]);

  const loadBookmarks = () => {
    try {
      const saved = localStorage.getItem('hadithBookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved).reverse());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarks = bookmarks.filter(b => b !== id);
    setBookmarks(newBookmarks);
    localStorage.setItem('hadithBookmarks', JSON.stringify(newBookmarks.reverse()));
  };

  const handleSelect = (id: string) => {
    const [bookId, hadithNum] = id.split(':');
    onSelect(bookId, parseInt(hadithNum));
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-amber-950 text-white">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-lg">Penanda Hadits</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-amber-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600 text-center">
                <ScrollText className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Belum ada penanda.</p>
                <p className="text-xs mt-1">Tandai hadits favorit Anda saat membaca.</p>
              </div>
            ) : (
              bookmarks.map((id) => {
                const [bookId, hadithNum] = id.split(':');
                const bookName = HADITH_BOOK_NAMES[bookId] || bookId;

                return (
                  <div 
                    key={id}
                    onClick={() => handleSelect(id)}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex justify-between items-center"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div>
                       <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-0.5">
                          {bookName}
                       </h3>
                       <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-medium border border-amber-100 dark:border-amber-800">
                             Hadits No. {hadithNum}
                          </span>
                       </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="p-2 text-gray-300 group-hover:text-amber-500 transition-colors">
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

export default HadithBookmarkSidebar;