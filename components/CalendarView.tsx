import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalIcon, 
  Moon, Sun, Info, Star
} from 'lucide-react';

interface CalendarViewProps {
  onBack: () => void;
}

interface DayInfo {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hijriDate: string; // "1 Ramadhan"
  hijriDay: number; // 1
  hijriMonth: string; // "Ramadhan"
  hijriYear: string; // "1445"
  events: string[];
  isFasting: boolean; // Senin/Kamis/Ayyamul Bidh
  isJumuah: boolean;
}

const DAYS_ID = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const CalendarView: React.FC<CalendarViewProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<DayInfo | null>(null);
  const [calendarGrid, setCalendarGrid] = useState<DayInfo[]>([]);

  // Formatters
  const monthYearFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
  const hijriFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    generateCalendar(currentDate);
  }, [currentDate]);

  const getHijriInfo = (date: Date) => {
    try {
        // Format: "14 Syawal 1445"
        const parts = hijriFormatter.formatToParts(date);
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
        const month = parts.find(p => p.type === 'month')?.value || '';
        const year = parts.find(p => p.type === 'year')?.value || '';
        
        return { day, month, year, full: `${day} ${month} ${year}` };
    } catch (e) {
        return { day: 0, month: '', year: '', full: '' };
    }
  };

  const generateCalendar = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 0 = Sunday, 1 = Monday, ...
    const startDayOfWeek = firstDayOfMonth.getDay(); 
    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month days to fill grid
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const daysFromPrevMonth = startDayOfWeek; 

    const grid: DayInfo[] = [];
    const today = new Date();

    // 1. Add previous month filler
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      grid.push(createDayInfo(d, false, today));
    }

    // 2. Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      grid.push(createDayInfo(d, true, today));
    }

    // 3. Add next month filler to complete 42 cells (6 rows x 7 cols)
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      grid.push(createDayInfo(d, false, today));
    }

    setCalendarGrid(grid);
    
    // Select today if in current view, else select 1st of month
    const todayInGrid = grid.find(d => d.isToday);
    if (todayInGrid) setSelectedDate(todayInGrid);
    else setSelectedDate(grid.find(d => d.day === 1 && d.isCurrentMonth) || null);
  };

  const createDayInfo = (date: Date, isCurrentMonth: boolean, today: Date): DayInfo => {
    const hijri = getHijriInfo(date);
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, 4=Thu, 5=Fri
    
    const events: string[] = [];
    let isFasting = false;
    const isJumuah = dayOfWeek === 5;

    // Puasa Senin Kamis
    if (dayOfWeek === 1 || dayOfWeek === 4) {
      events.push("Puasa Sunnah (Senin/Kamis)");
      isFasting = true;
    }

    // Ayyamul Bidh (13, 14, 15 Hijri)
    if ([13, 14, 15].includes(hijri.day)) {
      events.push("Puasa Ayyamul Bidh");
      isFasting = true;
    }

    // Jumat
    if (isJumuah) {
      events.push("Sayyidul Ayyam (Jumat)");
    }

    // Cek Hari Ini
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();

    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday,
      hijriDate: hijri.full,
      hijriDay: hijri.day,
      hijriMonth: hijri.month,
      hijriYear: hijri.year,
      events,
      isFasting,
      isJumuah
    };
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 relative flex flex-col">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
         <div className="flex items-center justify-between max-w-md mx-auto">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
               <CalIcon className="w-5 h-5 text-emerald-600" /> Kalender Islam
            </h2>
            <div className="w-8"></div> {/* Spacer */}
         </div>
      </div>

      <div className="max-w-md mx-auto w-full px-4 py-6 flex-grow">
         
         {/* Controls */}
         <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
               <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {monthYearFormatter.format(currentDate)}
               </h3>
               <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedDate?.hijriMonth} {selectedDate?.hijriYear} H
               </p>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
               <ChevronRight className="w-5 h-5" />
            </button>
         </div>

         {/* Calendar Grid */}
         <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-xl border border-gray-200 dark:border-gray-700 mb-6 animate-slide-up">
            
            {/* Days Header */}
            <div className="grid grid-cols-7 mb-4">
               {DAYS_ID.map((day, i) => (
                  <div key={i} className={`text-center text-[10px] font-bold uppercase tracking-wider py-2 ${i === 5 ? 'text-emerald-600' : 'text-gray-400'}`}>
                     {day.substring(0, 3)}
                  </div>
               ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-1">
               {calendarGrid.map((dayInfo, idx) => {
                  const isSelected = selectedDate?.date.toDateString() === dayInfo.date.toDateString();
                  
                  return (
                     <button
                        key={idx}
                        onClick={() => setSelectedDate(dayInfo)}
                        className={`
                           relative flex flex-col items-center justify-start h-14 rounded-xl transition-all duration-200
                           ${!dayInfo.isCurrentMonth ? 'opacity-30 grayscale' : 'opacity-100'}
                           ${isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105 z-10' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}
                           ${dayInfo.isToday && !isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}
                        `}
                     >
                        <span className={`text-sm font-bold mt-1 ${dayInfo.isJumuah && !isSelected ? 'text-emerald-600' : ''}`}>
                           {dayInfo.day}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                           {dayInfo.hijriDay}
                        </span>

                        {/* Indicators */}
                        <div className="flex gap-0.5 mt-1">
                           {dayInfo.isFasting && (
                              <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`}></div>
                           )}
                           {dayInfo.isJumuah && (
                              <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-emerald-200' : 'bg-emerald-500'}`}></div>
                           )}
                        </div>
                     </button>
                  );
               })}
            </div>
         </div>

         {/* Detail Section */}
         {selectedDate && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg animate-fade-in">
               <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                  <div>
                     <h4 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {DAYS_ID[selectedDate.date.getDay()]}, {selectedDate.day}
                     </h4>
                     <p className="text-gray-500 dark:text-gray-400">
                        {monthYearFormatter.format(selectedDate.date)}
                     </p>
                  </div>
                  <div className="text-right">
                     <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-serif">
                        {selectedDate.hijriDay} {selectedDate.hijriMonth}
                     </h4>
                     <p className="text-emerald-800 dark:text-emerald-200 text-sm font-bold bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md inline-block mt-1">
                        {selectedDate.hijriYear} H
                     </p>
                  </div>
               </div>

               <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                     <Info className="w-3 h-3" /> Agenda & Amalan
                  </h5>
                  
                  {selectedDate.events.length > 0 ? (
                     selectedDate.events.map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                           {ev.includes("Puasa") ? (
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Moon className="w-4 h-4" /></div>
                           ) : ev.includes("Jumat") ? (
                              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><Star className="w-4 h-4" /></div>
                           ) : (
                              <div className="p-2 bg-amber-100 text-amber-600 rounded-full"><Sun className="w-4 h-4" /></div>
                           )}
                           <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{ev}</span>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-4 text-gray-400 text-sm italic bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        Tidak ada agenda khusus hari ini.
                     </div>
                  )}
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

export default CalendarView;