
import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Sunrise, Sunset, Clock, MapPin, Hourglass, Search, Navigation, X } from 'lucide-react';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

const PRAYER_NAMES: {[key: string]: string} = {
  'Fajr': 'Subuh', 
  'Dhuhr': 'Dzuhur', 
  'Asr': 'Ashar', 
  'Maghrib': 'Maghrib', 
  'Isha': 'Isya'
};

const POPULAR_CITIES = [
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
  { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Medan', lat: 3.5952, lng: 98.6722 },
  { name: 'Semarang', lat: -6.9667, lng: 110.4167 },
  { name: 'Makassar', lat: -5.1477, lng: 119.4328 },
  { name: 'Palembang', lat: -2.9761, lng: 104.7754 },
  { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Malang', lat: -7.9666, lng: 112.6326 },
  { name: 'Denpasar', lat: -8.6705, lng: 115.2126 },
  { name: 'Banda Aceh', lat: 5.5483, lng: 95.3238 },
  { name: 'Samarinda', lat: -0.5022, lng: 117.1536 },
  { name: 'Banjarmasin', lat: -3.3194, lng: 114.5908 },
  { name: 'Pontianak', lat: -0.0263, lng: 109.3425 },
  { name: 'Manado', lat: 1.4748, lng: 124.8428 },
  { name: 'Jayapura', lat: -2.5000, lng: 140.7000 },
  { name: 'Mataram', lat: -8.5833, lng: 116.1167 },
  { name: 'Ambon', lat: -3.6954, lng: 128.1814 },
];

const PrayerCountdown: React.FC = () => {
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; key: string } | null>(null);
  const [allTimings, setAllTimings] = useState<PrayerTimes | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--:--');
  const [loading, setLoading] = useState(true);
  
  // Info Tambahan
  const [hijriDate, setHijriDate] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('Menentukan Lokasi...');
  const [timeZone, setTimeZone] = useState<string>('');

  // Location Modal State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const timerRef = useRef<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: -6.2088, lng: 106.8456 });

  // Reverse Geocoding to get City Name
  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/geocode?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const data = await res.json();
      if (data && data.address) {
        // Prioritize city > town > village > county
        const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state_district || 'Lokasi Saya';
        setLocationName(city);
      }
    } catch (error) {
      console.warn("Failed to fetch location name:", error);
      // Fallback handled by detectTimeZoneAndCity
    }
  };

  // Initial Load & GPS
  useEffect(() => {
    handleUseGPS(true); // Try GPS on mount
  }, []);

  const handleUseGPS = (isInitial = false) => {
    if (navigator.geolocation) {
      if (!isInitial) setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          fetchLocationName(latitude, longitude); // Get accurate name
          detectTimeZoneAndCity(false); // Only timezone
          setShowLocationModal(false);
        },
        (error) => { 
          console.warn("Loc denied", error); 
          if (isInitial) {
             setLocationName("Jakarta (Default)");
             detectTimeZoneAndCity(true); // Use timezone name as fallback
          }
          setLoading(false); 
        }
      );
    } else { 
      setLoading(false); 
    }
  };

  const detectTimeZoneAndCity = (detectCityName = true) => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detectCityName) {
         const city = tz.split('/')[1]?.replace('_', ' ') || 'Indonesia';
         setLocationName(city);
      }

      let abbr = '';
      if (['Asia/Jakarta', 'Asia/Pontianak', 'Asia/Bangkok'].includes(tz)) abbr = 'WIB';
      else if (['Asia/Makassar', 'Asia/Ujung_Pandang', 'Asia/Singapore'].includes(tz)) abbr = 'WITA';
      else if (['Asia/Jayapura'].includes(tz)) abbr = 'WIT';
      else {
        const offset = -new Date().getTimezoneOffset() / 60;
        abbr = `GMT${offset >= 0 ? '+' : ''}${offset}`;
      }
      setTimeZone(abbr);
    } catch (e) {
      if (detectCityName) setLocationName('Indonesia');
      setTimeZone('');
    }
  };

  const handleCitySelect = (city: { name: string, lat: number, lng: number }) => {
    setCoords({ lat: city.lat, lng: city.lng });
    setLocationName(city.name);
    setShowLocationModal(false);
    // Simple timezone guess based on longitude for Indonesia
    if (city.lng < 110) setTimeZone('WIB');
    else if (city.lng < 125) setTimeZone('WITA');
    else setTimeZone('WIT');
  };

  // Fetch Prayer Times when coords change
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true);
      try {
        const date = new Date();
        const timestamp = Math.floor(date.getTime() / 1000);
        const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${coords.lat}&longitude=${coords.lng}&method=20`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.data) {
          const timings = data.data.timings;
          setAllTimings(timings);
          determineNextPrayer(timings);
          const d = data.data.date;
          if (d.hijri) setHijriDate(`${d.hijri.day} ${d.hijri.month.en} ${d.hijri.year} H`);
        }
      } catch (error) { console.error("Failed fetch prayer", error); } 
      finally { setLoading(false); }
    };
    
    fetchPrayerTimes();
    const refreshInterval = setInterval(fetchPrayerTimes, 60 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [coords]);

  const determineNextPrayer = (timings: PrayerTimes) => {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();
    let foundNext = false;

    for (const p of prayers) {
      const [hours, minutes] = timings[p].split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      if (prayerDate > now) {
        setNextPrayer({ name: PRAYER_NAMES[p], time: timings[p], key: p });
        startCountdown(prayerDate);
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      const [hours, minutes] = timings['Fajr'].split(':').map(Number);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hours, minutes, 0, 0);
      setNextPrayer({ name: 'Subuh', time: timings['Fajr'], key: 'Fajr' });
      startCountdown(tomorrow);
    }
  };

  const startCountdown = (targetDate: Date) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) { setCountdown("00:00:00"); return; }
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
  };

  const getIcon = (key: string) => {
    switch(key) {
        case 'Fajr': return <Sunrise className="w-3 h-3" />;
        case 'Dhuhr': return <Sun className="w-3 h-3" />;
        case 'Asr': return <Sunset className="w-3 h-3" />;
        case 'Maghrib': 
        case 'Isha': return <Moon className="w-3 h-3" />;
        default: return <Clock className="w-3 h-3" />;
    }
  };

  const filteredCities = POPULAR_CITIES.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="h-24 bg-emerald-950 w-full animate-pulse"></div>;

  return (
    <>
      <div className="w-full bg-emerald-950 text-emerald-50 relative z-50 shadow-md">
        <div className="max-w-6xl mx-auto">
          
          {/* ROW 1: Prayer Grid */}
          <div className="grid grid-cols-5 border-b border-emerald-900 divide-x divide-emerald-900/50">
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => {
                const isNext = nextPrayer?.key === key;
                const time = allTimings ? allTimings[key] : '--:--';
                
                return (
                    <div 
                      key={key}
                      className={`
                          flex flex-col items-center justify-center py-2 px-1 cursor-default transition-colors
                          ${isNext ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/50 text-emerald-300'}
                      `}
                    >
                      <div className={`mb-1 ${isNext ? 'text-amber-400' : 'opacity-60'}`}>{getIcon(key)}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider opacity-80 mb-0.5">{PRAYER_NAMES[key].toUpperCase()}</div>
                      <div className={`text-xs sm:text-sm font-bold leading-none ${isNext ? 'text-white' : 'text-emerald-100'}`}>{time}</div>
                    </div>
                );
              })}
          </div>

          {/* ROW 2: Location & Date */}
          <div className="flex items-center justify-between px-4 py-2 bg-emerald-900/40 border-b border-emerald-900/50">
              <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowLocationModal(true)}
                    className="flex items-center gap-1.5 text-white hover:text-emerald-300 transition-colors"
                  >
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span className="font-bold text-[10px] sm:text-xs truncate max-w-[120px]">{locationName}</span>
                  </button>
                  
                  <button 
                     onClick={() => { setSearchQuery(''); setShowLocationModal(true); }}
                     className="text-[9px] font-bold text-emerald-300 hover:text-white hover:bg-emerald-800/50 border border-emerald-700 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                  >
                     <Search className="w-2.5 h-2.5" />
                     <span>Cari Lokasi</span>
                  </button>
              </div>

              <div className="text-[10px] text-amber-400 font-serif font-medium truncate pl-2">
                  {hijriDate}
              </div>
          </div>

          {/* ROW 3: Countdown */}
          <div className="flex items-center justify-between px-4 py-2 bg-emerald-950 text-white">
              <div className="flex items-center gap-2 text-emerald-400">
                  <Hourglass className="w-3 h-3 animate-pulse text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">MENUJU {nextPrayer?.name?.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-white">{countdown}</span>
                  <span className="text-[9px] font-bold text-emerald-950 bg-emerald-400 px-1.5 py-0.5 rounded-sm">{timeZone}</span>
              </div>
          </div>

        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-scale-up">
              
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                 <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" /> Pilih Lokasi
                 </h3>
                 <button onClick={() => setShowLocationModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                 </button>
              </div>

              <div className="p-4 space-y-4">
                 {/* Search Input */}
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Cari kota..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 border focus:border-emerald-500 rounded-xl text-sm transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 </div>

                 {/* Use GPS Button */}
                 <button 
                    onClick={() => handleUseGPS()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                 >
                    <Navigation className="w-4 h-4" /> Gunakan Lokasi Saya (GPS)
                 </button>

                 {/* City List */}
                 <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kota Populer</h4>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                       {filteredCities.map((city) => (
                          <button
                             key={city.name}
                             onClick={() => handleCitySelect(city)}
                             className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 flex justify-between items-center group"
                          >
                             <span>{city.name}</span>
                             {locationName === city.name && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                          </button>
                       ))}
                       {filteredCities.length === 0 && (
                          <p className="text-center text-gray-400 text-xs py-4">Kota tidak ditemukan.</p>
                       )}
                    </div>
                 </div>
              </div>

           </div>
        </div>
      )}
    </>
  );
};

export default PrayerCountdown;