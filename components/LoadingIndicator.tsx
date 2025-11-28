import React, { useState, useEffect } from 'react';

const TIPS = [
  "Untuk hasil terbaik, pastikan foto halaman kitab lurus dan terang.",
  "Anda bisa menggunakan keyboard Arab virtual untuk mengetik teks gundul.",
  "Gunakan menu 'Kitab' untuk membaca dan menganalisis bab per bab tanpa mengetik.",
  "Hasil analisis bisa dibagikan ke WhatsApp melalui tombol 'Bagikan Hasil'.",
  "AI dapat menganalisis berbagai fan ilmu, mulai dari Fiqih hingga Balaghah.",
  "Cek Riwayat Ngaji Anda melalui menu Pengaturan untuk melihat analisis sebelumnya."
];

const LoadingIndicator: React.FC = () => {
  const [currentTip, setCurrentTip] = useState(TIPS[0]);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(prevTip => {
        const currentIndex = TIPS.indexOf(prevTip);
        const nextIndex = (currentIndex + 1) % TIPS.length;
        return TIPS[nextIndex];
      });
    }, 3500); // Ganti tip setiap 3.5 detik

    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
        {/* The track for the spinner */}
        <div className="absolute inset-0 border-8 border-emerald-100 dark:border-emerald-800 rounded-full"></div>
        {/* The spinning part (3/4 circle) */}
        <div className="absolute inset-0 border-8 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 animate-pulse">
        Sedang Membedah Teks...
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs transition-opacity duration-500">
        {currentTip}
      </p>
    </div>
  );
};

export default LoadingIndicator;
