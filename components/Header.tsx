import React from 'react';
import { BookOpen } from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="bg-emerald-950 text-amber-50 shadow-lg sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
          onClick={onHomeClick}
          title="Kembali ke Beranda"
        >
          <div className="p-1.5 sm:p-2 bg-emerald-800 rounded-lg border border-emerald-700 group-hover:bg-emerald-700 transition-colors">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-yellow-400 tracking-tight">Kitab Kuning AI</h1>
          </div>
        </div>
        {/* History button removed */}
      </div>
    </header>
  );
};

export default Header;