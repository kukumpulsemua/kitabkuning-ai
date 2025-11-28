

import React, { useState, useContext } from 'react';
import { AppSettings } from '../types.ts';
import { 
  Moon, Sun, Type, Smartphone, Check, 
  Info, HelpCircle, FileText, Shield, AlertTriangle, Mail, X, ChevronRight, ExternalLink,
  History, Bookmark, ScrollText
} from 'lucide-react';
import { AppContext } from '../App.tsx';

interface SettingsViewProps {
  onHistoryClick: () => void;
  onBookmarksClick: () => void;
  onHadithBookmarksClick: () => void;
}

const INFO_PAGES = [
  {
    id: 'about',
    title: 'Tentang Aplikasi',
    icon: Info,
    iconStyle: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-justify">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Rub_el_hizb.svg/1200px-Rub_el_hizb.svg.png" className="w-20 h-20 opacity-90" alt="Logo" />
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Kitab Kuning AI</strong> adalah platform asisten belajar cerdas yang didedikasikan untuk para Santri, Mahasiswa, dan Penuntut Ilmu Syar'i di Nusantara. Aplikasi ini memadukan khazanah keilmuan Islam klasik (Turats) dengan teknologi kecerdasan buatan (Artificial Intelligence) terkini dari Google Gemini.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
           <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">Visi & Misi</h4>
           <p className="text-blue-800 dark:text-blue-200">
             Menjembatani kesulitan bahasa dalam memahami literatur Islam klasik, sehingga akses terhadap ilmu agama menjadi lebih mudah, cepat, dan mendalam tanpa menghilangkan tradisi sanad keilmuan.
           </p>
        </div>

        <h4 className="font-bold text-gray-900 dark:text-white mt-4">Fitur Utama:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 pl-1">
          <li><strong>Terjemahan Ganda:</strong> Bahasa Indonesia Standar & Makna Gandul (Ala Pesantren/Jawa Pegon).</li>
          <li><strong>Analisis Gramatika:</strong> Bedah I'rob (Nahwu) dan Tashrif (Shorof) per kata.</li>
          <li><strong>Wawasan Mendalam:</strong> Penjelasan Balaghah, Asbabun Nuzul, dan Konteks Tafsir.</li>
          <li><strong>Pustaka Digital:</strong> Akses ribuan referensi kitab kuning dan biografi ulama.</li>
          <li><strong>Alat Bantu Ibadah:</strong> Jadwal Sholat, Arah Kiblat, Hitung Waris & Zakat.</li>
        </ul>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Versi 4.7.0 (Stable) | Build 2025</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Powered by Google Gemini 2.5 Flash</p>
        </div>
      </div>
    )
  },
  {
    id: 'help',
    title: 'Panduan Penggunaan',
    icon: HelpCircle,
    iconStyle: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    content: (
      <div className="space-y-5 text-sm leading-relaxed text-justify">
        <section>
          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base mb-2 flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded text-xs text-emerald-800 dark:text-emerald-300">1</span> Bedah Teks Arab
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Fitur utama untuk menerjemahkan dan menganalisis teks kitab.
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 pl-2 marker:text-emerald-500">
            <li><strong>Input Teks:</strong> Ketik atau tempel (paste) teks Arab di kolom utama. Bisa berharakat atau gundul.</li>
            <li><strong>Input Foto:</strong> Klik ikon Gambar untuk memfoto halaman kitab. Pastikan foto terang dan teks terbaca jelas.</li>
            <li><strong>Proses:</strong> Klik tombol <strong>"Bedah Teks"</strong>. AI akan menganalisis dalam beberapa detik.</li>
            <li><strong>Hasil:</strong> Pilih tab di bawah hasil untuk melihat Terjemah, Makna Gandul, atau Analisis Nahwu.</li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base mb-2 flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded text-xs text-emerald-800 dark:text-emerald-300">2</span> Pustaka & Referensi
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Gunakan menu <strong>"Kitab"</strong> di navigasi bawah untuk mencari kitab-kitab populer. Anda bisa memilih Bab tertentu, dan AI akan otomatis menampilkan teks asli beserta penjelasannya tanpa perlu mengetik manual.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base mb-2 flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded text-xs text-emerald-800 dark:text-emerald-300">3</span> Alat Bantu (Tools)
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Akses fitur seperti <strong>Hitung Waris</strong>, <strong>Kalkulator Zakat</strong>, atau <strong>Cek Kiblat</strong> melalui ikon-ikon cepat di halaman Beranda. Pastikan GPS aktif untuk fitur Kiblat & Jadwal Sholat.
          </p>
        </section>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
           <p className="text-amber-800 dark:text-amber-200 text-xs">
             <strong>Tips:</strong> Semakin jelas teks/foto input yang Anda berikan, semakin akurat hasil analisis AI. Untuk pertanyaan fiqih yang kompleks, gunakan kalimat tanya yang spesifik pada kolom input.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'contact',
    title: 'Hubungi Kami',
    icon: Mail,
    iconStyle: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Kami senantiasa terbuka untuk kritik, saran pengembangan, laporan <em>bug</em>, atau kerjasama untuk kemajuan pendidikan Islam digital.
        </p>
        
        <div className="grid gap-3 mt-6">
          <a href="mailto:dev@bedahkitab.id" className="flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-400 transition-all group text-left">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-300 mr-4 group-hover:scale-110 transition-transform">
               <Mail className="w-6 h-6" />
            </div>
            <div>
               <h5 className="font-bold text-gray-900 dark:text-white">Email Resmi</h5>
               <p className="text-xs text-gray-500 dark:text-gray-400">dev@bedahkitab.id</p>
            </div>
          </a>

          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-400 transition-all group text-left">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-300 mr-4 group-hover:scale-110 transition-transform">
               <ExternalLink className="w-6 h-6" />
            </div>
            <div>
               <h5 className="font-bold text-gray-900 dark:text-white">WhatsApp Support</h5>
               <p className="text-xs text-gray-500 dark:text-gray-400">Chat Admin (Jam Kerja)</p>
            </div>
          </a>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          Alamat Kantor: Pondok Pesantren Digital, Yogyakarta, Indonesia.
        </p>
      </div>
    )
  },
  {
    id: 'terms',
    title: 'Syarat & Ketentuan',
    icon: FileText,
    iconStyle: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-justify">
        <p className="text-gray-600 dark:text-gray-300">
          Dengan menggunakan aplikasi Kitab Kuning AI, Anda menyetujui ketentuan berikut:
        </p>
        
        <ol className="list-decimal list-outside pl-4 space-y-3 text-gray-600 dark:text-gray-300 marker:font-bold marker:text-amber-600 dark:marker:text-amber-500">
          <li>
            <strong>Tujuan Penggunaan:</strong> Aplikasi ini adalah alat bantu pendidikan (edukasi) dan referensi. Dilarang keras menggunakannya untuk tujuan ilegal, penipuan, atau menyebarkan paham kebencian/SARA.
          </li>
          <li>
            <strong>Batasan Tanggung Jawab:</strong> Pengembang tidak bertanggung jawab atas kesalahan interpretasi atau kerugian materiil/immateriil yang timbul akibat penggunaan hasil analisis AI tanpa verifikasi.
          </li>
          <li>
            <strong>Hak Kekayaan Intelektual:</strong> Konten teks kitab klasik (Turats) adalah milik publik (Public Domain). Namun, antarmuka, kode program, logo, dan hasil olahan AI spesifik dalam aplikasi ini dilindungi hak cipta pengembang.
          </li>
          <li>
            <strong>Ketersediaan Layanan:</strong> Kami berupaya menjaga aplikasi tetap online 24/7, namun tidak menjamin bebas dari gangguan teknis, pemeliharaan server, atau limitasi kuota API pihak ketiga.
          </li>
          <li>
            <strong>Perubahan Ketentuan:</strong> Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu demi penyesuaian layanan.
          </li>
        </ol>
      </div>
    )
  },
  {
    id: 'privacy',
    title: 'Kebijakan Privasi',
    icon: Shield,
    iconStyle: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-justify">
        <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800 mb-4">
           <p className="font-bold text-teal-800 dark:text-teal-200 text-center">
             "Privasi Anda adalah Amanah bagi Kami."
           </p>
        </div>

        <h4 className="font-bold text-gray-900 dark:text-white">1. Pengumpulan Data</h4>
        <p className="text-gray-600 dark:text-gray-300">
          Kami <strong>TIDAK</strong> menyimpan teks kitab atau foto yang Anda analisis di server database kami secara permanen. Data tersebut hanya dikirim sementara ke penyedia AI (Google) untuk diproses menjadi jawaban, lalu dihapus dari memori pemrosesan.
        </p>

        <h4 className="font-bold text-gray-900 dark:text-white">2. Penyimpanan Lokal</h4>
        <p className="text-gray-600 dark:text-gray-300">
          Riwayat analisis, penanda (bookmark), dan pengaturan aplikasi disimpan secara lokal di perangkat (Browser Local Storage) Anda. Jika Anda menghapus cache browser, data ini akan hilang. Anda memiliki kendali penuh atas data ini.
        </p>

        <h4 className="font-bold text-gray-900 dark:text-white">3. Izin Akses Perangkat</h4>
        <ul className="list-disc list-inside pl-1 text-gray-600 dark:text-gray-300">
           <li><strong>Kamera:</strong> Hanya digunakan saat Anda menggunakan fitur Scan Teks.</li>
           <li><strong>Lokasi (GPS):</strong> Hanya digunakan untuk menghitung Jadwal Sholat dan Arah Kiblat yang akurat sesuai posisi Anda.</li>
        </ul>

        <h4 className="font-bold text-gray-900 dark:text-white">4. API Key Pihak Ketiga</h4>
        <p className="text-gray-600 dark:text-gray-300">
          Jika Anda memasukkan API Key Google Gemini milik pribadi di menu Pengaturan, kunci tersebut disimpan terenkripsi di penyimpanan lokal perangkat Anda dan hanya digunakan untuk autentikasi ke Google. Kami tidak bisa melihat kunci tersebut.
        </p>
      </div>
    )
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer (Penyangkalan)',
    icon: AlertTriangle,
    iconStyle: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-justify">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl">
           <p className="font-bold text-red-700 dark:text-red-300">PENTING UNTUK DIPAHAMI</p>
        </div>

        <p className="text-gray-600 dark:text-gray-300">
          1. <strong>AI Bukan Ulama:</strong> Hasil terjemahan, analisis nahwu, dan tafsir yang ditampilkan dihasilkan oleh mesin kecerdasan buatan (AI). Meskipun tingkat akurasinya tinggi, tetap ada kemungkinan kesalahan (halusinasi AI) dalam memahami konteks agama yang mendalam.
        </p>

        <p className="text-gray-600 dark:text-gray-300">
          2. <strong>Bukan Fatwa Hukum:</strong> Informasi hukum Islam (Fiqih) atau Waris yang dihasilkan aplikasi ini bersifat referensi awal/akademis. <strong>TIDAK BOLEH</strong> dijadikan satu-satunya landasan untuk memutuskan perkara hukum agama yang krusial (seperti talak, waris sengketa, atau hukum pidana).
        </p>

        <p className="text-gray-600 dark:text-gray-300">
          3. <strong>Validasi Sanad:</strong> Kami sangat menyarankan pengguna untuk tetap memverifikasi hasil aplikasi ini dengan merujuk kembali kepada Kitab Asli, atau berkonsultasi dengan Guru/Kyai/Ustadz yang memiliki kompetensi keilmuan yang bersanad (muttashil).
        </p>

        <p className="text-gray-600 dark:text-gray-300">
          4. <strong>Kemandirian Belajar:</strong> Gunakan aplikasi ini untuk mempercepat proses belajar dan memahami teks, bukan untuk menumbuhkan sifat malas menelaah kitab secara manual.
        </p>
      </div>
    )
  }
];

const SettingsView: React.FC<SettingsViewProps> = ({ onHistoryClick, onBookmarksClick, onHadithBookmarksClick }) => {
  const { settings, setSettings } = useContext(AppContext);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  const activePage = INFO_PAGES.find(p => p.id === activeModal);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in pb-32">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-serif border-b border-gray-200 dark:border-gray-800 pb-4">
        Pengaturan Aplikasi
      </h2>

      <div className="space-y-6">
        
        {/* TEMA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 mb-4">
            <Sun className="w-5 h-5 text-amber-500" /> Tampilan & Tema
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => update('darkMode', false)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${!settings.darkMode ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <Sun className="w-6 h-6" />
              <span className="font-bold text-sm">Terang</span>
              {!settings.darkMode && <Check className="w-4 h-4 text-emerald-600" />}
            </button>
            <button 
              onClick={() => update('darkMode', true)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.darkMode ? 'border-emerald-500 bg-gray-700 text-white' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <Moon className="w-6 h-6" />
              <span className="font-bold text-sm">Gelap</span>
              {settings.darkMode && <Check className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* DATA & AKTIVITAS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                <History className="w-5 h-5 text-orange-500" /> Data & Aktivitas
              </h3>
           </div>
           <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <button 
                  onClick={onHistoryClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                         <History className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        Riwayat Ngaji
                      </span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-500" />
                </button>

                <button 
                  onClick={onBookmarksClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                         <Bookmark className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        Penanda Al-Qur'an
                      </span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-teal-500" />
                </button>

                <button 
                  onClick={onHadithBookmarksClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                         <ScrollText className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Penanda Hadits
                      </span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-amber-500" />
                </button>
           </div>
        </div>

        {/* FONT ARAB */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 mb-4">
            <Type className="w-5 h-5 text-emerald-500" /> Jenis Huruf Arab
          </h3>
          <div className="space-y-3">
             <button 
               onClick={() => update('arabicFont', 'scheherazade')}
               className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${settings.arabicFont === 'scheherazade' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}
             >
                <div className="text-left">
                  <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Scheherazade New (Standar)</span>
                  <p className="text-2xl font-arabic text-gray-800 dark:text-gray-100">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
                </div>
                {settings.arabicFont === 'scheherazade' && <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>}
             </button>

             <button 
               onClick={() => update('arabicFont', 'amiri')}
               className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${settings.arabicFont === 'amiri' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}
             >
                <div className="text-left">
                  <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Amiri (Klasik/Naskhi)</span>
                  <p className="text-2xl font-amiri text-gray-800 dark:text-gray-100">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
                </div>
                {settings.arabicFont === 'amiri' && <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>}
             </button>
          </div>
        </div>

        {/* UKURAN TEKS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 mb-4">
            <Smartphone className="w-5 h-5 text-blue-500" /> Ukuran Teks
          </h3>
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
             {['small', 'medium', 'large'].map((size) => (
               <button
                 key={size}
                 onClick={() => update('textSize', size as any)}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${settings.textSize === size ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                 {size === 'small' ? 'Kecil' : size === 'medium' ? 'Sedang' : 'Besar'}
               </button>
             ))}
          </div>
          <div className="mt-4 text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
             <p className={`font-arabic text-gray-800 dark:text-gray-200 transition-all ${settings.textSize === 'small' ? 'text-lg' : settings.textSize === 'large' ? 'text-3xl' : 'text-2xl'}`}>
                الْعِلْمُ نُورٌ
             </p>
             <p className={`mt-2 text-gray-600 dark:text-gray-400 transition-all ${settings.textSize === 'small' ? 'text-xs' : settings.textSize === 'large' ? 'text-lg' : 'text-sm'}`}>
                Ilmu itu adalah cahaya.
             </p>
          </div>
        </div>

        {/* INFO & BANTUAN (NEW SECTION) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <h3 className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                <Info className="w-5 h-5 text-indigo-500" /> Informasi & Bantuan
              </h3>
           </div>
           <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {INFO_PAGES.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveModal(item.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.iconStyle}`}>
                         <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500" />
                </button>
              ))}
           </div>
        </div>

        <div className="text-center pt-4 opacity-50">
           <p className="text-xs text-gray-500 dark:text-gray-400 font-serif">Kitab Kuning AI &copy; 2025</p>
           <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Dibuat dengan ❤️ untuk Santri Indonesia</p>
        </div>

      </div>

      {/* INFO MODAL */}
      {activeModal && activePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal(null)}>
           <div 
             className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up max-h-[80vh]"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                 <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${activePage.iconStyle}`}>
                       <activePage.icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{activePage.title}</h3>
                 </div>
                 <button onClick={() => setActiveModal(null)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto text-gray-700 dark:text-gray-300 leading-relaxed custom-scrollbar">
                 {activePage.content}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                 <button 
                   onClick={() => setActiveModal(null)}
                   className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-600/20"
                 >
                    Tutup
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default SettingsView;