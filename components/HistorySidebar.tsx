import React from 'react';
import { X, Clock, Trash2, ChevronRight, Search, Download } from 'lucide-react';
import { HistoryItem } from '../types.ts';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect, 
  onDelete,
  onClearAll 
}) => {
  // Format tanggal
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(history, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `riwayat-kitab-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Gagal export riwayat", e);
      alert("Gagal mengekspor riwayat.");
    }
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
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-emerald-950 text-white">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-lg">Riwayat Ngaji</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600 text-center">
                <Search className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Belum ada riwayat.</p>
                <p className="text-xs mt-1">Mulai terjemahkan kitab untuk menyimpan otomatis.</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      {formatDate(item.timestamp)}
                    </span>
                    <button 
                      onClick={(e) => onDelete(item.id, e)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-arabic text-lg text-gray-800 dark:text-gray-200 mb-1 line-clamp-1 dir-rtl text-right">
                    {item.arabicPreview}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {item.translationPreview}
                  </p>
                  
                  <div className="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Buka Kembali</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {history.length > 0 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-2">
              
              {/* Tombol Backup */}
              <button 
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Backup Riwayat (JSON)</span>
              </button>

              {/* Tombol Hapus Semua */}
              <button 
                onClick={onClearAll}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Semua</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;