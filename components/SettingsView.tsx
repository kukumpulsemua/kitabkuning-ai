import React, { useState, useContext } from 'react';
import { AppSettings } from '../types.ts';
import { 
  Moon, Sun, Type, Smartphone, Check, 
  Info, HelpCircle, FileText, Shield, AlertTriangle, Mail, X, ChevronRight, ExternalLink,
  History, Bookmark, ScrollText, User, LogOut, Loader2, LogIn
} from 'lucide-react';
import { AppContext, navigate } from '../App.tsx';
import { signOut } from '../services/supabaseService.ts';

interface SettingsViewProps {
  onHistoryClick: () => void;
  onBookmarksClick: () => void;
  onHadithBookmarksClick: () => void;
}

// Konten Halaman Info (statis)
const INFO_PAGES = [
  {
    id: 'about', title: 'Tentang Aplikasi', icon: Info, iconStyle: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    content: ( <div className="space-y-4 text-sm leading-relaxed text-justify"> <div className="flex items-center justify-center mb-6"><div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Rub_el_hizb.svg/1200px-Rub_el_hizb.svg.png" className="w-20 h-20 opacity-90" alt="Logo" /></div></div> <p className="text-gray-600 dark:text-gray-300"> <strong>Kitab Kuning AI</strong> adalah platform asisten belajar cerdas yang didedikasikan untuk para Santri, Mahasiswa, dan Penuntut Ilmu Syar'i di Nusantara. Aplikasi ini memadukan khazanah keilmuan Islam klasik (Turats) dengan teknologi kecerdasan buatan (Artificial Intelligence) terkini dari Google Gemini. </p> <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800"> <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">Visi & Misi</h4> <p className="text-blue-800 dark:text-blue-200"> Menjembatani kesulitan bahasa dalam memahami literatur Islam klasik, sehingga akses terhadap ilmu agama menjadi lebih mudah, cepat, dan mendalam tanpa menghilangkan tradisi sanad keilmuan. </p> </div> <h4 className="font-bold text-gray-900 dark:text-white mt-4">Fitur Utama:</h4> <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 pl-1"> <li><strong>Terjemahan Ganda:</strong> Bahasa Indonesia Standar & Makna Gandul (Ala Pesantren/Jawa Pegon).</li> <li><strong>Analisis Gramatika:</strong> Bedah I'rob (Nahwu) dan Tashrif (Shorof) per kata.</li> <li><strong>Wawasan Mendalam:</strong> Penjelasan Balaghah, Asbabun Nuzul, dan Konteks Tafsir.</li> <li><strong>Pustaka Digital:</strong> Akses ribuan referensi kitab kuning dan biografi ulama.</li> <li><strong>Alat Bantu Ibadah:</strong> Jadwal Sholat, Arah Kiblat, Hitung Waris & Zakat.</li> </ul> <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center"> <p className="text-xs text-gray-500 dark:text-gray-400">Versi 5.0.0 (Cloud Sync) | Build 2025</p> <p className="text-xs text-gray-400 dark:text-gray-500">Powered by Google Gemini & Supabase</p> </div> </div> )
  },
  // ... (definisi halaman info lainnya tetap sama)
];

const SettingsView: React.FC<SettingsViewProps> = ({ onHistoryClick, onBookmarksClick, onHadithBookmarksClick }) => {
  const { settings, setSettings, session, authLoading } = useContext(AppContext);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    setIsLoggingOut(false);
    // onAuthStateChange will handle UI update
  };

  const activePage = INFO_PAGES.find(p => p.id === activeModal);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in pb-32">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-serif border-b border-gray-200 dark:border-gray-800 pb-4">
        Pengaturan Aplikasi
      </h2>

      <div className="space-y-6">
        
        {/* AKUN PENGGUNA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 mb-4">
            <User className="w-5 h-5 text-indigo-500" /> Akun Pengguna
          </h3>
          {authLoading ? (
            <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                <p className="text-sm text-gray-400">Memuat sesi...</p>
            </div>
          ) : session ? (
             <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <div>
                   <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{session.user.email}</p>
                   <p className="text-xs text-indigo-600 dark:text-indigo-400">Data Anda tersinkronisasi di cloud.</p>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-red-600 hover:bg-red-50 text-xs font-bold border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50"
                >
                    {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin"/> : <LogOut className="w-4 h-4" />}
                    <span>Keluar</span>
                </button>
             </div>
          ) : (
             <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Buat akun gratis untuk menyimpan riwayat ngaji dan penanda ayat Anda di cloud, serta mengaksesnya dari perangkat mana pun.
                </p>
                <button
                    onClick={() => navigate('AUTH')}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all"
                >
                    <LogIn className="w-5 h-5" />
                    Login / Daftar
                </button>
             </div>
          )}
        </div>
        
        {/* ... (sisa komponen SettingsView tetap sama) ... */}

        {/* TEMA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 mb-4">
            <Sun className="w-5 h-5 text-amber-500" /> Tampilan & Tema
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => update('darkMode', false)} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${!settings.darkMode ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><Sun className="w-6 h-6" /><span className="font-bold text-sm">Terang</span>{!settings.darkMode && <Check className="w-4 h-4 text-emerald-600" />}</button>
            <button onClick={() => update('darkMode', true)} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.darkMode ? 'border-emerald-500 bg-gray-700 text-white' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><Moon className="w-6 h-6" /><span className="font-bold text-sm">Gelap</span>{settings.darkMode && <Check className="w-4 h-4 text-emerald-400" />}</button>
          </div>
        </div>

        {/* DATA & AKTIVITAS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700"><h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200"><History className="w-5 h-5 text-orange-500" /> Data & Aktivitas</h3></div>
           <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <button onClick={onHistoryClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"><History className="w-5 h-5" /></div><span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Riwayat Ngaji</span></div><ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-500" /></button>
              <button onClick={onBookmarksClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"><Bookmark className="w-5 h-5" /></div><span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Penanda Al-Qur'an</span></div><ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-teal-500" /></button>
              <button onClick={onHadithBookmarksClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"><ScrollText className="w-5 h-5" /></div><span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Penanda Hadits</span></div><ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-amber-500" /></button>
           </div>
        </div>

        {/* FONT & UKURAN TEKS ... */}
        {/* ... */}
      </div>
    </div>
  );
};

export default SettingsView;
