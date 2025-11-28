
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Compass, MapPin, AlertTriangle, Info, Sparkles, RefreshCcw, Smartphone } from 'lucide-react';

interface QiblaViewProps {
  onBack: () => void;
}

const KAABA_COORDS = {
  lat: 21.422487,
  lng: 39.826206
};

const QiblaView: React.FC<QiblaViewProps> = ({ onBack }) => {
  const [heading, setHeading] = useState<number>(0);
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  
  // Ref untuk throttle getaran
  const lastVibrateTime = useRef<number>(0);

  // Fungsi Menghitung Arah Kiblat (Rumus Haversine/Spherical Law of Cosines)
  const calculateQibla = (lat: number, lng: number) => {
    const PI = Math.PI;
    const latk = KAABA_COORDS.lat * (PI / 180);
    const longk = KAABA_COORDS.lng * (PI / 180);
    const phi = lat * (PI / 180);
    const lambda = lng * (PI / 180);

    const y = Math.sin(longk - lambda);
    const x = Math.cos(phi) * Math.tan(latk) - Math.sin(phi) * Math.cos(longk - lambda);
    let qibla = Math.atan2(y, x) * (180 / PI);
    
    return (qibla + 360) % 360;
  };

  // Handler Lokasi
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          const bearing = calculateQibla(latitude, longitude);
          setQiblaBearing(bearing);
        },
        (err) => {
          setError("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.");
          console.error(err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Browser tidak mendukung Geolocation.");
    }

    // Deteksi iOS untuk Izin Sensor
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setIsIOS(true);
    } else {
      setPermissionGranted(true); // Android biasanya auto-grant
    }
  }, []);

  // Handler Kompas yang Lebih Robust
  const handleOrientation = useCallback((event: any) => {
    let compass = 0;
    
    if (event.webkitCompassHeading) {
      // iOS standard
      compass = event.webkitCompassHeading;
    } else if (event.absolute === true && event.alpha !== null) {
      // Android Absolute Orientation (Chrome 50+)
      compass = 360 - event.alpha;
    } else if (event.alpha !== null) {
      // Android Relative (Fallback, mungkin perlu kalibrasi manual offset)
      compass = 360 - event.alpha;
    }

    setHeading(compass);
  }, []);

  useEffect(() => {
    if (permissionGranted) {
      // Coba gunakan absolute orientation jika tersedia (Android)
      if ((window as any).ondeviceorientationabsolute !== undefined) {
        (window as any).addEventListener('deviceorientationabsolute', handleOrientation, true);
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }
    return () => {
      if ((window as any).ondeviceorientationabsolute !== undefined) {
        (window as any).removeEventListener('deviceorientationabsolute', handleOrientation, true);
      } else {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [permissionGranted, handleOrientation]);

  const requestAccess = async () => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          setError("Izin kompas ditolak.");
        }
      } catch (e) {
        setError("Gagal meminta izin sensor.");
      }
    } else {
      setPermissionGranted(true);
    }
  };

  // Toleransi 3 derajat untuk dianggap "Tepat"
  const diff = Math.abs(qiblaBearing - heading);
  // Handle wrap around 360 (e.g. 359 and 1)
  const isAligned = diff < 3 || Math.abs(diff - 360) < 3;

  // Haptic Feedback Effect
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
      const now = Date.now();
      // Debounce getaran agar tidak terus menerus (min 1 detik sekali)
      if (now - lastVibrateTime.current > 1000) {
        navigator.vibrate(50); // Getar pendek 50ms
        lastVibrateTime.current = now;
      }
    }
  }, [isAligned]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 flex flex-col pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
         <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" /> Arah Kiblat
              </h2>
            </div>
            <button 
              onClick={() => setShowCalibration(true)} 
              className="text-gray-400 hover:text-emerald-600 transition-colors p-2"
              title="Tips Kalibrasi"
            >
              <Info className="w-5 h-5" />
            </button>
         </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
         
         {isIOS && !permissionGranted ? (
            <div className="text-center space-y-4 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-up">
               <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Compass className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse" />
               </div>
               <h3 className="font-bold text-xl text-gray-900 dark:text-white">Izin Kompas Diperlukan</h3>
               <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Aplikasi memerlukan izin akses sensor gerak untuk menampilkan arah kompas yang akurat di iPhone Anda.
               </p>
               <button 
                 onClick={requestAccess}
                 className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                 >
                 Izinkan Akses Sensor
               </button>
            </div>
         ) : error ? (
            <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300">
               <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
               <p className="font-bold">{error}</p>
               <p className="text-sm mt-2">Pastikan GPS aktif dan izinkan lokasi di browser. Coba refresh halaman.</p>
               <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white dark:bg-red-900 border border-red-200 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 mx-auto">
                 <RefreshCcw className="w-4 h-4" /> Refresh
               </button>
            </div>
         ) : (
            <>
               {/* Info Lokasi */}
               <div className="mb-8 text-center animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-800 dark:text-emerald-300 text-sm font-bold mb-2 border border-emerald-100 dark:border-emerald-800">
                     <MapPin className="w-4 h-4" />
                     <span>{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Mencari lokasi..."}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Target Kiblat: {qiblaBearing.toFixed(1)}°</p>
               </div>

               {/* Kompas UI */}
               <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mb-12">
                  
                  {/* Outer Frame (Phone Reference) */}
                  <div className={`absolute inset-0 rounded-full border-[6px] transition-all duration-500 z-0 ${isAligned ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'border-gray-200 dark:border-gray-700'}`}></div>
                  
                  {/* Phone Top Indicator */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAligned ? 'bg-emerald-500' : 'bg-red-500'} shadow-md transition-colors duration-300`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                     </div>
                  </div>

                  {/* Rotating Compass Dial */}
                  <div 
                    className="w-[90%] h-[90%] rounded-full relative transition-transform duration-300 ease-out bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl"
                    style={{ transform: `rotate(${-heading}deg)` }}
                  >
                     {/* Inner Decoration */}
                     <div className="absolute inset-2 rounded-full border border-gray-100 dark:border-gray-700/50 border-dashed"></div>
                     
                     {/* Cardinal Points */}
                     <span className="absolute top-4 left-1/2 -translate-x-1/2 font-bold text-red-500 text-xl">U</span>
                     <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-bold text-gray-400 text-lg">S</span>
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">B</span>
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">T</span>

                     {/* Ticks */}
                     {[...Array(12)].map((_, i) => (
                        <div 
                           key={i}
                           className={`absolute top-0 left-1/2 w-0.5 origin-bottom ${i % 3 === 0 ? 'h-3 bg-gray-400' : 'h-2 bg-gray-200 dark:bg-gray-700'}`}
                           style={{ transform: `translateX(-50%) rotate(${i * 30}deg) translateY(12px)` }}
                        />
                     ))}

                     {/* Qibla Indicator (Kaaba) */}
                     <div 
                        className="absolute top-1/2 left-1/2 w-14 h-1/2 origin-bottom flex flex-col items-center justify-start -translate-x-1/2 -translate-y-full z-10"
                        style={{ transform: `translate(-50%, -50%) rotate(${qiblaBearing}deg)` }}
                     >
                        {/* Pointer Line */}
                        <div className={`w-1 flex-1 bg-gradient-to-b from-emerald-500 via-emerald-500/50 to-transparent rounded-full transition-all duration-300 ${isAligned ? 'opacity-100' : 'opacity-60'}`}></div>
                        
                        {/* Kaaba Icon */}
                        <div className="absolute -top-2">
                           <div className={`relative transition-all duration-500 ${isAligned ? 'scale-125' : 'scale-100 opacity-80'}`}>
                              {/* Glow effect when aligned */}
                              {isAligned && <div className="absolute inset-0 bg-emerald-400 blur-md rounded-full animate-pulse"></div>}
                              
                              <div className="w-10 h-10 bg-black rounded-md border border-amber-400 relative overflow-hidden shadow-lg z-10 flex items-center justify-center">
                                 <div className="absolute top-2 w-full h-1 bg-amber-400/90"></div>
                                 <div className="w-1 h-1 bg-amber-400 rounded-full absolute bottom-2 right-2"></div>
                              </div>
                              
                              {isAligned && (
                                <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-emerald-500 animate-bounce z-20" />
                              )}
                           </div>
                        </div>
                     </div>

                  </div>
                  
                  {/* Center Pivot */}
                  <div className="absolute w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full z-30 border-2 border-white dark:border-gray-900 shadow-sm"></div>
               </div>

               {/* Status Alignment */}
               <div className={`px-8 py-4 rounded-2xl font-bold transition-all duration-500 text-center shadow-lg border transform ${isAligned ? 'bg-emerald-600 text-white border-emerald-500 scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                  {isAligned ? (
                     <div className="flex flex-col items-center animate-bounce-small">
                        <span className="text-xl tracking-tight">Kiblat Tepat!</span>
                        <span className="text-xs font-normal opacity-90 mt-1">Allahu Akbar</span>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center">
                        <span className="text-base">Putar HP Anda</span>
                        <span className="text-xs font-normal opacity-60 mt-1">Sejajarkan Ka'bah dengan Titik Merah Atas</span>
                     </div>
                  )}
               </div>

               <div className="mt-8 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 text-left">
                  <Smartphone className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                  <p>
                     Jauhkan dari magnet (casing magnetik/besi). Jika arah salah, lakukan gerakan angka 8 untuk kalibrasi.
                  </p>
               </div>
            </>
         )}

         {/* Modal Kalibrasi */}
         {showCalibration && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowCalibration(false)}>
               <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-emerald-100 dark:border-emerald-900 relative" onClick={e => e.stopPropagation()}>
                  <div className="text-center">
                     <RefreshCcw className="w-12 h-12 mx-auto text-emerald-500 mb-4 animate-spin-slow" />
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cara Kalibrasi Kompas</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        Gerakkan HP Anda membentuk <strong>angka 8</strong> di udara beberapa kali. Pastikan tidak ada benda magnetik di sekitar.
                     </p>
                     <button 
                       onClick={() => setShowCalibration(false)}
                       className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                     >
                        Saya Mengerti
                     </button>
                  </div>
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

export default QiblaView;
