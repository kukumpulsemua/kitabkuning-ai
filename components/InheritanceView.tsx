import React, { useState } from 'react';
import { 
  ArrowLeft, Calculator, Coins, Users, CheckCircle, 
  AlertCircle, PieChart, BookOpen, ScrollText, FileText, HelpCircle, UserX, Sparkles
} from 'lucide-react';

interface InheritanceViewProps {
  onBack: () => void;
  onAnalyze: (text: string) => void;
  isLoading?: boolean;
}

interface CalculationResult {
  heir: string;
  shareFraction: string; // e.g., "1/8"
  sharePercentage: number;
  amount: number;
  note: string;
  dalil?: string; // Reference specific to this share
  kitabRef?: string; // Kitab Kuning reference
  isBlocked?: boolean; // Status Mahjub
}

const InheritanceView: React.FC<InheritanceViewProps> = ({ onBack, onAnalyze, isLoading }) => {
  const [step, setStep] = useState<1 | 2>(1);
  
  // State Harta
  const [assets, setAssets] = useState<string>('');
  const [debt, setDebt] = useState<string>('');
  const [will, setWill] = useState<string>('');

  // State Ahli Waris
  const [deceasedGender, setDeceasedGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [hasSpouse, setHasSpouse] = useState(true);
  const [hasFather, setHasFather] = useState(true);
  const [hasMother, setHasMother] = useState(true);
  const [sons, setSons] = useState<number>(0);
  const [daughters, setDaughters] = useState<number>(0);
  const [brothers, setBrothers] = useState<number>(0); // Saudara Laki-laki Kandung
  const [sisters, setSisters] = useState<number>(0);   // Saudara Perempuan Kandung

  const [results, setResults] = useState<CalculationResult[]>([]);
  const [netEstate, setNetEstate] = useState<number>(0);
  
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatInput = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(raw));
  };

  const handleBedahRef = (res: CalculationResult) => {
    const prompt = `Bedah Dalil Waris: "${res.dalil || ''}"\n\nKonteks Penerapan: ${res.note}\n\n(Referensi Kitab: ${res.kitabRef || ''})\n\nMohon jelaskan tafsir, istinbath hukum, dan alasan mengapa bagian warisnya demikian berdasarkan dalil tersebut menurut pandangan Mazhab Syafi'i.`;
    onAnalyze(prompt);
  };

  const handleCalculate = () => {
    const rawAssets = parseFloat(assets.replace(/[^0-9]/g, '')) || 0;
    const rawDebt = parseFloat(debt.replace(/[^0-9]/g, '')) || 0;
    const rawWill = parseFloat(will.replace(/[^0-9]/g, '')) || 0;

    const afterDebt = Math.max(0, rawAssets - rawDebt);
    const maxWill = afterDebt / 3;
    const validWill = Math.min(rawWill, maxWill);
    const net = afterDebt - validWill;

    setNetEstate(net);

    if (net <= 0) {
      setResults([]);
      setStep(2);
      return;
    }

    let totalShare = 0;
    const tempResults: CalculationResult[] = [];
    
    const hasChildren = sons > 0 || daughters > 0;
    const hasMaleDescendant = sons > 0; // Anak laki-laki menghalangi saudara
    const siblingsCount = brothers + sisters;
    const isSiblingsBlocked = hasMaleDescendant || hasFather; // Hijab Hirman untuk saudara

    // --- 1. Suami / Istri ---
    if (hasSpouse) {
      if (deceasedGender === 'MALE') {
        // Istri
        const share = hasChildren ? 1/8 : 1/4;
        tempResults.push({
          heir: 'Istri',
          shareFraction: hasChildren ? '1/8' : '1/4',
          sharePercentage: share,
          amount: net * share,
          note: hasChildren ? 'Ada keturunan (Far\'un Warits)' : 'Tidak ada keturunan',
          dalil: hasChildren ? "QS. An-Nisa: 12 (Bagian 1/8)" : "QS. An-Nisa: 12 (Bagian 1/4)",
          kitabRef: "Matan Rahabiyah: Bait 16"
        });
        totalShare += share;
      } else {
        // Suami
        const share = hasChildren ? 1/4 : 1/2;
        tempResults.push({
          heir: 'Suami',
          shareFraction: hasChildren ? '1/4' : '1/2',
          sharePercentage: share,
          amount: net * share,
          note: hasChildren ? 'Ada keturunan' : 'Tidak ada keturunan',
          dalil: hasChildren ? "QS. An-Nisa: 12 (Bagian 1/4)" : "QS. An-Nisa: 12 (Bagian 1/2)",
          kitabRef: "Matan Rahabiyah: Bait 14"
        });
        totalShare += share;
      }
    }

    // --- 2. Ibu ---
    if (hasMother) {
      // Ibu dapat 1/6 jika ada anak ATAU ada 2+ saudara (meski saudara tsb terhalang ayah)
      const motherGetsSixth = hasChildren || siblingsCount >= 2;
      const share = motherGetsSixth ? 1/6 : 1/3;
      
      tempResults.push({
        heir: 'Ibu',
        shareFraction: motherGetsSixth ? '1/6' : '1/3',
        sharePercentage: share,
        amount: net * share,
        note: hasChildren ? 'Ada keturunan' : (siblingsCount >= 2 ? 'Ada 2+ saudara (Hajb Nuqshan)' : 'Tidak ada keturunan/banyak saudara'),
        dalil: motherGetsSixth ? "QS. An-Nisa: 11 (Bagian 1/6)" : "QS. An-Nisa: 11 (Bagian 1/3)",
        kitabRef: "Matan Rahabiyah: Bait 22"
      });
      totalShare += share;
    }

    // --- 3. Ayah ---
    if (hasFather) {
      let share = 0;
      let fraction = '';
      let note = '';
      let kitab = '';

      if (hasMaleDescendant) {
        // Ada Anak Laki -> Ayah hanya dapat 1/6
        share = 1/6;
        fraction = '1/6';
        note = 'Ada anak laki-laki (Hanya Fardhu)';
        kitab = "Fathul Qorib: Bab Faraid";
      } else if (hasChildren) {
        // Ada Anak Perempuan saja -> Ayah dapat 1/6 + Sisa
        share = 1/6;
        fraction = '1/6 + Sisa';
        note = 'Ada anak perempuan (Fardhu + Ashabah)';
        kitab = "Matan Rahabiyah";
      } else {
        // Tidak ada anak -> Ayah Ashabah (Sisa)
        share = 0; // Dihitung nanti di sisa
        fraction = 'Ashabah';
        note = 'Mengambil Sisa (Ashabah bin Nafsi)';
        kitab = "Matan Rahabiyah: Bab Ashabah";
      }

      if (share > 0) {
        tempResults.push({ 
          heir: 'Ayah', 
          shareFraction: fraction, 
          sharePercentage: share, 
          amount: net * share, 
          note, 
          dalil: "QS. An-Nisa: 11", 
          kitabRef: kitab 
        });
        totalShare += share;
      }
    }

    // --- 4. Anak Perempuan (Jika tidak ada Anak Laki) ---
    if (daughters > 0 && !hasMaleDescendant) {
        const portion = daughters === 1 ? 1/2 : 2/3;
        
        // Cek Aul nanti, simpan dulu
        tempResults.push({
          heir: `Anak Perempuan (${daughters})`,
          shareFraction: daughters === 1 ? '1/2' : '2/3',
          sharePercentage: portion,
          amount: net * portion,
          note: 'Farudh (Tanpa anak laki-laki)',
          dalil: daughters === 1 ? "QS. An-Nisa: 11 (Separuh)" : "QS. An-Nisa: 11 (Dua pertiga)",
          kitabRef: "Matan Rahabiyah: Bait 17 & 20"
        });
        totalShare += portion;
    }

    // --- 5. Saudara Kandung (Cek Hijab Dulu) ---
    if (siblingsCount > 0) {
       if (isSiblingsBlocked) {
          // Terhalang
          tempResults.push({
             heir: `Saudara Kandung (${siblingsCount})`,
             shareFraction: '0',
             sharePercentage: 0,
             amount: 0,
             note: `Terhalang (Mahjub) oleh ${hasMaleDescendant ? 'Anak Laki-laki' : 'Ayah'}`,
             dalil: "Ijma' Ulama",
             kitabRef: "Bab Hajb (Penghalang)",
             isBlocked: true
          });
       } else if (!hasMaleDescendant && !hasFather) {
          // Dapat Waris (Kalalah)
          // Jika ada anak perempuan, saudara perempuan jadi Ashabah ma'al Ghair
          // Tapi untuk simplifikasi di kalkulator dasar:
          // Jika tidak ada anak sama sekali -> Saudara jadi Ashabah (Laki) atau Fardhu (Perempuan)
          // Jika ada anak perempuan -> Saudara Laki jadi Ashabah, Saudara Pr jadi Ashabah ma'al ghair
          
          // Kita hitung nanti di Sisa (Ashabah) kecuali Saudara Perempuan Sendiri (tanpa sdr laki & tanpa anak)
          if (brothers === 0 && daughters === 0) {
             // Hanya Saudara Perempuan, Tanpa Anak
             const portion = sisters === 1 ? 1/2 : 2/3;
             tempResults.push({
                heir: `Saudara Pr Kandung (${sisters})`,
                shareFraction: sisters === 1 ? '1/2' : '2/3',
                sharePercentage: portion,
                amount: net * portion,
                note: 'Kalalah (Tanpa Ayah & Anak)',
                dalil: "QS. An-Nisa: 176",
                kitabRef: "Matan Rahabiyah"
             });
             totalShare += portion;
          }
       }
    }

    // --- 6. Distribusi Sisa (Ashabah) & Aul ---
    
    // Cek Aul (Defisit)
    if (totalShare > 1) {
       // Recalculate with Aul
       // Konsep Aul: Pembagi (Asal Masalah) dinaikkan sehingga total bagian = 1
       // Cara termudah di sini: Pro-rata amount berdasarkan totalShare baru
       tempResults.forEach(res => {
          if (!res.isBlocked) {
             res.amount = (res.sharePercentage / totalShare) * net;
             res.note += " (Terkena Aul/Penyusutan)";
          }
       });
       
       setResults(tempResults);
       setStep(2);
       return;
    }

    let remainder = Math.max(0, net - (net * totalShare));

    if (remainder > 0) {
       // Prioritas Ashabah:
       // 1. Anak (Bunuwah)
       // 2. Ayah (Ubuwah) - Jika ada anak pr
       // 3. Saudara (Ukhuwah) - Jika tidak ada anak & ayah

       if (hasMaleDescendant) {
          // Anak Laki-laki (+ Anak Pr jika ada) -> Ashabah bil Ghair
          const totalParts = (sons * 2) + daughters;
          const onePartValue = remainder / totalParts;

          tempResults.push({
             heir: `Anak Laki-laki (${sons})`,
             shareFraction: 'Ashabah',
             sharePercentage: 0, // Dinamis
             amount: onePartValue * 2 * sons,
             note: `Sisa Harta (2 bagian)${daughters > 0 ? ' bersama Anak Pr' : ''}`,
             dalil: "QS. An-Nisa: 11",
             kitabRef: "Matan Rahabiyah"
          });

          if (daughters > 0) {
             tempResults.push({
                heir: `Anak Perempuan (${daughters})`,
                shareFraction: 'Ashabah',
                sharePercentage: 0,
                amount: onePartValue * daughters,
                note: 'Ashabah bil Ghair (1 bagian)',
                dalil: "QS. An-Nisa: 11",
                kitabRef: "Idhahul Mubham"
             });
          }
       } else if (hasFather) {
          // Ayah ambil sisa (setelah ambil 1/6 tadi jika ada anak pr, atau ambil semua sisa jika ga ada anak)
          // Cari entry Ayah
          const fatherEntry = tempResults.find(r => r.heir === 'Ayah');
          if (fatherEntry) {
             fatherEntry.amount += remainder;
             fatherEntry.note += ' + Ashabah (Sisa)';
             fatherEntry.shareFraction += ' + Sisa';
          } else {
             // Ayah belum masuk (karena tidak ada anak), jadi ambil seluruh sisa
             tempResults.push({
                heir: 'Ayah',
                shareFraction: 'Ashabah',
                sharePercentage: remainder/net,
                amount: remainder,
                note: 'Ashabah bin Nafsi',
                dalil: "Hadits Al-Bukhari",
                kitabRef: "Matan Rahabiyah"
             });
          }
       } else if (siblingsCount > 0 && !isSiblingsBlocked) {
          // Saudara ambil sisa
          // Jika ada Saudara Laki -> Ashabah bin Nafsi / bil Ghair
          // Jika cuma Saudara Pr tapi ada Anak Pr -> Ashabah ma'al Ghair (Ambil sisa setelah anak pr)
          
          if (brothers > 0) {
             const totalParts = (brothers * 2) + sisters;
             const onePartValue = remainder / totalParts;
             
             tempResults.push({
                heir: `Sdr Laki Kandung (${brothers})`,
                shareFraction: 'Ashabah',
                sharePercentage: 0,
                amount: onePartValue * 2 * brothers,
                note: `Sisa (Kalalah)${sisters > 0 ? ' bil Ghair' : ' bin Nafsi'}`,
                dalil: "QS. An-Nisa: 176",
                kitabRef: "Matan Rahabiyah"
             });

             if (sisters > 0) {
                tempResults.push({
                   heir: `Sdr Pr Kandung (${sisters})`,
                   shareFraction: 'Ashabah',
                   sharePercentage: 0,
                   amount: onePartValue * sisters,
                   note: 'Ashabah bil Ghair',
                   dalil: "QS. An-Nisa: 176",
                   kitabRef: "Matan Rahabiyah"
                });
             }
          } else if (sisters > 0 && daughters > 0) {
             // Saudara Pr bersama Anak Pr -> Ashabah ma'al Ghair
             tempResults.push({
                heir: `Sdr Pr Kandung (${sisters})`,
                shareFraction: 'Ashabah',
                sharePercentage: 0,
                amount: remainder,
                note: "Ashabah ma'al Ghair (Bersama Anak Pr)",
                dalil: "Hadits: Jadikan sdr perempuan bersama anak perempuan sebagai ashabah",
                kitabRef: "Fathul Qorib"
             });
          }
       } else {
          // Tidak ada Ashabah (Radd / Baitul Mal)
          // Untuk simplifikasi, kita masukkan ke "Sisa Tak Terbagi"
          tempResults.push({
             heir: 'Sisa Harta (Radd/Baitul Mal)',
             shareFraction: '-',
             sharePercentage: 0,
             amount: remainder,
             note: 'Tidak ada ahli waris ashabah',
             dalil: "-",
             kitabRef: "-"
          });
       }
    }

    setResults(tempResults);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 flex flex-col animate-fade-in relative">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center border-2 border-emerald-500/50 max-w-xs w-full mx-4 animate-scale-up">
            <div className="relative mb-6">
               <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"></div>
               <div className="w-16 h-16 border-4 border-emerald-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mohon Tunggu</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Sedang membedah teks dengan AI...</p>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
         <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
               <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600" /> Hitung Waris Islam
               </h2>
            </div>
         </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-grow flex flex-col">
      
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400">Kalkulator Faraid lengkap dengan Hijab (Penghalang) & Ashabah.</p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            
            {/* Card Harta */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Coins className="w-5 h-5 text-amber-500" /> Data Harta Tirkah
              </h3>
              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Harta (Rp)</label>
                    <input 
                      type="text" 
                      value={assets}
                      onChange={(e) => setAssets(formatInput(e.target.value))}
                      placeholder="Contoh: 100.000.000"
                      className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hutang & Tajhiz</label>
                      <input 
                        type="text" 
                        value={debt}
                        onChange={(e) => setDebt(formatInput(e.target.value))}
                        placeholder="0"
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wasiat (Max 1/3)</label>
                      <input 
                        type="text" 
                        value={will}
                        onChange={(e) => setWill(formatInput(e.target.value))}
                        placeholder="0"
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                  </div>
              </div>
            </div>

            {/* Card Ahli Waris */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Users className="w-5 h-5 text-emerald-500" /> Kondisi Ahli Waris
              </h3>
              
              <div className="space-y-6">
                  {/* Gender Mayit */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Siapa yang Meninggal?</label>
                    <div className="flex gap-3">
                        <button 
                          onClick={() => setDeceasedGender('MALE')}
                          className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-all ${deceasedGender === 'MALE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}
                        >
                          Suami (Laki-laki)
                        </button>
                        <button 
                          onClick={() => setDeceasedGender('FEMALE')}
                          className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-all ${deceasedGender === 'FEMALE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}
                        >
                          Istri (Perempuan)
                        </button>
                    </div>
                  </div>

                  {/* Pasangan & Ortu */}
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={() => setHasSpouse(!hasSpouse)}
                        className={`p-3 rounded-xl border text-center transition-all ${hasSpouse ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                    >
                        <div className="text-xs font-bold mb-1">{deceasedGender === 'MALE' ? 'Istri' : 'Suami'}</div>
                        {hasSpouse ? <CheckCircle className="w-5 h-5 mx-auto" /> : <div className="w-5 h-5 mx-auto rounded-full border-2 border-gray-300"></div>}
                    </button>
                    <button 
                        onClick={() => setHasFather(!hasFather)}
                        className={`p-3 rounded-xl border text-center transition-all ${hasFather ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                    >
                        <div className="text-xs font-bold mb-1">Ayah</div>
                        {hasFather ? <CheckCircle className="w-5 h-5 mx-auto" /> : <div className="w-5 h-5 mx-auto rounded-full border-2 border-gray-300"></div>}
                    </button>
                    <button 
                        onClick={() => setHasMother(!hasMother)}
                        className={`p-3 rounded-xl border text-center transition-all ${hasMother ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                    >
                        <div className="text-xs font-bold mb-1">Ibu</div>
                        {hasMother ? <CheckCircle className="w-5 h-5 mx-auto" /> : <div className="w-5 h-5 mx-auto rounded-full border-2 border-gray-300"></div>}
                    </button>
                  </div>

                  {/* Anak */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Anak Kandung</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Laki-laki</label>
                            <div className="flex items-center gap-2">
                            <button onClick={() => setSons(Math.max(0, sons - 1))} className="w-8 h-8 bg-gray-200 rounded-lg font-bold text-gray-600">-</button>
                            <input type="number" value={sons} readOnly className="w-full text-center bg-transparent font-bold text-gray-800 dark:text-gray-200" />
                            <button onClick={() => setSons(sons + 1)} className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg font-bold">+</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Perempuan</label>
                            <div className="flex items-center gap-2">
                            <button onClick={() => setDaughters(Math.max(0, daughters - 1))} className="w-8 h-8 bg-gray-200 rounded-lg font-bold text-gray-600">-</button>
                            <input type="number" value={daughters} readOnly className="w-full text-center bg-transparent font-bold text-gray-800 dark:text-gray-200" />
                            <button onClick={() => setDaughters(daughters + 1)} className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg font-bold">+</button>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Saudara Kandung */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1">
                       Saudara Kandung 
                       <span className="text-[10px] normal-case font-normal text-gray-400">(Seayah Seibu)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Saudara Lk</label>
                            <div className="flex items-center gap-2">
                            <button onClick={() => setBrothers(Math.max(0, brothers - 1))} className="w-8 h-8 bg-gray-200 rounded-lg font-bold text-gray-600">-</button>
                            <input type="number" value={brothers} readOnly className="w-full text-center bg-transparent font-bold text-gray-800 dark:text-gray-200" />
                            <button onClick={() => setBrothers(brothers + 1)} className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg font-bold">+</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Saudara Pr</label>
                            <div className="flex items-center gap-2">
                            <button onClick={() => setSisters(Math.max(0, sisters - 1))} className="w-8 h-8 bg-gray-200 rounded-lg font-bold text-gray-600">-</button>
                            <input type="number" value={sisters} readOnly className="w-full text-center bg-transparent font-bold text-gray-800 dark:text-gray-200" />
                            <button onClick={() => setSisters(sisters + 1)} className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg font-bold">+</button>
                            </div>
                        </div>
                    </div>
                    {(sons > 0 || hasFather) && (brothers > 0 || sisters > 0) && (
                       <div className="mt-3 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg flex items-start gap-2 text-xs text-red-600 dark:text-red-300">
                          <UserX className="w-4 h-4 shrink-0" />
                          <p>Saudara akan terhalang (Mahjub) karena ada Ayah atau Anak Laki-laki.</p>
                       </div>
                    )}
                  </div>

              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Hitung Pembagian
            </button>

          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            
            {/* Ringkasan Netto */}
            <div className="bg-emerald-600 text-white rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                <h3 className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-2 relative z-10">Total Harta Bersih (Netto)</h3>
                <div className="text-3xl sm:text-4xl font-bold font-mono relative z-10">
                  {formatRupiah(netEstate)}
                </div>
            </div>

            {/* Tabel Hasil */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-500" /> Hasil Pembagian
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {results.length > 0 ? results.map((res, idx) => (
                      <div key={idx} className={`p-5 transition-colors ${res.isBlocked ? 'bg-gray-50 dark:bg-gray-900/50 opacity-70' : 'hover:bg-gray-50 dark:hover:bg-gray-750'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`min-w-[2.5rem] h-10 px-2 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${res.isBlocked ? 'bg-gray-200 text-gray-500' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                  {res.shareFraction}
                                </div>
                                <div>
                                  <h4 className={`font-bold text-lg ${res.isBlocked ? 'text-gray-500 line-through decoration-red-500' : 'text-gray-900 dark:text-white'}`}>{res.heir}</h4>
                                  <p className={`text-xs ${res.isBlocked ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>{res.note}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold text-lg ${res.isBlocked ? 'text-gray-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {formatRupiah(res.amount)}
                                </div>
                            </div>
                        </div>
                        
                        {/* Contextual Dalil with Bedah Feature */}
                        {(!res.isBlocked && (res.dalil || res.kitabRef)) && (
                          <button 
                            onClick={() => handleBedahRef(res)}
                            className="mt-3 w-full text-left bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl p-3 border-2 border-indigo-200 dark:border-indigo-800 transition-colors group relative"
                            title="Klik untuk Bedah AI"
                          >
                              {res.dalil && (
                                <div className="flex items-start gap-2 mb-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{res.dalil}</span>
                                </div>
                              )}
                              {res.kitabRef && (
                                <div className="flex items-start gap-2">
                                  <ScrollText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                                  <span className="text-xs text-purple-700 dark:text-purple-300 italic font-medium">{res.kitabRef}</span>
                                </div>
                              )}
                              <div className="absolute top-3 right-3 flex items-center gap-1 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/50 px-2 py-1 rounded-lg text-[10px] font-bold">
                                <Sparkles className="w-3 h-3" /> Bedah Dalil
                              </div>
                          </button>
                        )}
                      </div>
                  )) : (
                    <div className="p-8 text-center text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Harta habis untuk membayar hutang/wasiat.</p>
                    </div>
                  )}
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Hitung Ulang
                </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex gap-3">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Catatan Penting:</strong> Perhitungan ini menggunakan kaidah umum (Ashabul Furudh Utama & Asabah) sesuai Mazhab Syafi'i. Kami menyertakan logika <strong>Hijab Hirman</strong> (Penghalang total) untuk Saudara. Untuk kasus Kakek/Nenek atau Musyarakah, disarankan berkonsultasi dengan Ulama.
                </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

export default InheritanceView;