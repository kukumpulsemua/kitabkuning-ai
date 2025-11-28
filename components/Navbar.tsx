
import React from 'react';
import { BookOpen } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: 'HOME') => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-center sm:justify-between">
        
        {/* Logo Area */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('HOME')}
          title="Kembali ke Beranda"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 text-white transform group-hover:rotate-3 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Right Actions removed (moved to Settings) */}
      </div>
    </nav>
  );
};

export default Navbar;
