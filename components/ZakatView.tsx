
import React, { useState } from 'react';
import { 
  ArrowLeft, Coins, Wallet, Users, 
  AlertCircle, CheckCircle, TrendingUp, Scale,
  Store, Sprout, PawPrint, BookOpen, FileText, Heart, RefreshCcw
} from 'lucide-react';

interface ZakatViewProps {
  onBack: () => void;
}

type ZakatType = 'MAAL' | 'PROFESI' | 'PERDAGANGAN' | 'PERTANIAN' | 'PETERNAKAN' | 'FITRAH';

const ZAKAT_MENU = [
  { id: 'MAAL', label: 'Zakat Maal', desc: 'Harta & Simpanan', icon: Wallet, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: 'PROFESI', label: 'Zakat Profesi', desc: 'Gaji & Penghasilan', icon: TrendingUp, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'PERDAGANGAN', label: 'Perdagangan', desc: 'Aset Usaha', icon: Store, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  { id: 'PERTANIAN', label: 'Pertanian', desc: 'Hasil Panen', icon: Sprout, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  { id: 'PETERNAKAN', label: 'Peternakan', desc: 'Hewan Ternak', icon: PawPrint, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  { id: 'FITRAH', label: 'Zakat Fitrah', desc: 'Jiwa (Ramadhan)', icon: Users, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
] as const;

const ZakatView: React.FC<ZakatViewProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<'MENU' | 'CALCULATOR'>('MENU');
  const [activeTab, setActiveTab] = useState<ZakatType>('MAAL');

  // --- State Data ---
  // Umum
  const [goldPrice, setGoldPrice] = useState<string>('1.300.000');
  
  // Maal
  const [savings, setSavings] = useState<string>('');
  
  // Profesi
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [otherIncome, setOtherIncome] = useState<string>('');
  const [monthlyDebt, setMonthlyDebt] = useState<string>('');
  
  // Perdagangan
  const [tradeStock, setTradeStock] = useState<string>(''); // Modal/Stok Berjalan
  const [tradeCash, setTradeCash] = useState<string>(''); // Uang Kas
  const [tradeReceivables, setTradeReceivables] = useState<string>(''); // Piutang
  const [tradeDebt, setTradeDebt] = useState<string>(''); // Hutang Jatuh Tempo
  
  // Pertanian
  const [harvestResult, setHarvestResult] = useState<string>(''); // Kg
  const [irrigationType, setIrrigationType] = useState<'PAID' | 'FREE'>('PAID');
  const [grainPrice, setGrainPrice] = useState<string>('7.000'); // Harga Gabah/Beras per Kg
  
  // Peternakan
  const [animalType, setAnimalType] = useState<'GOAT' | 'COW'>('GOAT');
  const [animalCount, setAnimalCount] = useState<number>(0);
  
  // Fitrah
  const [familyMembers, setFamilyMembers] = useState<number>(1);
  const [ricePrice, setRicePrice] = useState<string>('45.000'); // Per 3.5 Liter / 2.5 Kg

  const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);
  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const parseInput = (val: string) => parseFloat(val.replace(/[^0-9]/g, '')) || 0;

  const handleInput = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    setter(raw ? formatNumber(parseInt(raw)) : '');
  };

  const handleMenuClick = (type: ZakatType) => {
    setActiveTab(type);
    setViewMode('CALCULATOR');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackNavigation = () => {
    if (viewMode === 'CALCULATOR') {
      setViewMode('MENU');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  const handleReset = () => {
    setSavings('');
    setMonthlyIncome(''); setOtherIncome(''); setMonthlyDebt('');
    setTradeStock(''); setTradeCash(''); setTradeReceivables(''); setTradeDebt('');
    setHarvestResult('');
    setAnimalCount(0);
    setFamilyMembers(1);
  };

  // --- Calculation Logic ---

  const calculateMaal = () => {
    const total = parseInput(savings);
    const nisab = 85 * parseInput(goldPrice); // 85 Gram Emas
    return { 
      nisab, 
      isWajib: total >= nisab, 
      amount: total >= nisab ? total * 0.025 : 0,
      info: "Nisab setara 85 gram emas."
    };
  };

  const calculateProfesi = () => {
    // Pendapatan Bersih = (Gaji + Lainnya) - Hutang Jatuh Tempo
    const totalIncome = parseInput(monthlyIncome) + parseInput(otherIncome);
    const netIncome = Math.max(0, totalIncome - parseInput(monthlyDebt));
    
    // Nisab Profesi diqiyaskan 85gr emas pertahun atau perbulan (tergantung pendapat)
    // Pendapat umum (Baznas): Nisab setara 520kg Beras (approx 6.5jt - 7jt) atau 85gr Emas / 12.
    // Kita gunakan standar aman: 85gr Emas dibagi 12 bulan.
    const nisabAnnual = 85 * parseInput(goldPrice);
    const nisabMonthly = nisabAnnual / 12;

    return { 
      nisab: nisabMonthly, 
      isWajib: netIncome >= nisabMonthly, 
      amount: netIncome >= nisabMonthly ? netIncome * 0.025 : 0,
      info: "Nisab setara 85gr Emas/tahun (dibagi 12 bulan)."
    };
  };

  const calculatePerdagangan = () => {
    // Aset Lancar Bersih = (Stok + Kas + Piutang) - Hutang Jangka Pendek
    const currentAssets = parseInput(tradeStock) + parseInput(tradeCash) + parseInput(tradeReceivables);
    const netAssets = Math.max(0, currentAssets - parseInput(tradeDebt));
    
    const nisab = 85 * parseInput(goldPrice);

    return { 
      nisab, 
      isWajib: netAssets >= nisab, 
      amount: netAssets >= nisab ? netAssets * 0.025 : 0,
      info: "Aset dihitung setelah dikurangi hutang jatuh tempo."
    };
  };

  const calculatePertanian = () => {
    const totalHarvest = parseInput(harvestResult); // Kg
    // Nisab 5 Wasaq ~= 653 Kg Gabah
    const nisabKg = 653; 
    const nisabRp = nisabKg * parseInput(grainPrice);
    
    const totalValue = totalHarvest * parseInput(grainPrice);
    const rate = irrigationType === 'PAID' ? 0.05 : 0.10;
    
    return { 
      nisab: nisabRp, 
      isWajib: totalHarvest >= nisabKg, 
      amount: totalHarvest >= nisabKg ? totalValue * rate : 0,
      info: irrigationType === 'PAID' ? "Irigasi berbiaya: Zakat 5%" : "Irigasi alami/tadah hujan: Zakat 10%"
    };
  };

  const calculatePeternakan = () => {
     let resultText = "";
     let isWajib = false;

     if (animalType === 'GOAT') {
         if (animalCount >= 400) {
             const numGoats = Math.floor(animalCount / 100);
             resultText = `${numGoats} ekor kambing`; isWajib = true;
         } else if (animalCount >= 201) {
             resultText = "3 ekor kambing"; isWajib = true;
         } else if (animalCount >= 121) {
             resultText = "2 ekor kambing"; isWajib = true;
         } else if (animalCount >= 40) {
             resultText = "1 ekor kambing (umur 1-2 th)"; isWajib = true;
         } else {
             resultText = "Belum Wajib (Nisab: 40 Ekor)"; isWajib = false;
         }
     } else if (animalType === 'COW') {
         if (animalCount >= 30) {
             isWajib = true;
             let tabi = 0; let musinnah = 0;
             if (animalCount >= 40 && animalCount % 10 === 0) {
                 musinnah = Math.floor(animalCount / 50);
                 const remainder = animalCount - (musinnah * 50);
                 tabi = remainder / 40;
                 if (musinnah === 0 && tabi === 0) { // case 40
                     musinnah = 1;
                 }
             } else {
                 tabi = Math.floor(animalCount / 30);
             }
             if (tabi > 0 && musinnah > 0) resultText = `${tabi} ekor Tabi' & ${musinnah} ekor Musinnah`;
             else if (tabi > 0) resultText = `${tabi} ekor Tabi' (sapi jantan 1 th)`;
             else if (musinnah > 0) resultText = `${musinnah} ekor Musinnah (sapi betina 2 th)`;
             else if (animalCount >= 40) resultText = `1 ekor Musinnah`; // Fallback for 40-59
             else resultText = `1 ekor Tabi'`; // Fallback for 30-39
         } else {
             resultText = "Belum Wajib (Nisab: 30 Ekor)"; isWajib = false;
         }
     }

     return { 
       isWajib, 
       resultText,
       info: animalType === 'GOAT' ? "Nisab Kambing mulai 40 ekor." : "Nisab Sapi mulai 30 ekor."
     };
  };

  const calculateFitrah = () => { 
    const amount = familyMembers * parseInput(ricePrice);
    return { 
      amount, 
      isWajib: true, 
      nisab: 0,
      info: "Zakat Fitrah wajib bagi setiap jiwa yang hidup di akhir Ramadhan." 
    }; 
  };

  // --- RENDERERS ---

  const getNiatZakat = (type: ZakatType) => {
    const niats = {
      MAAL: { arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى", latin: "Nawaitu an ukhrija zakata maali fardhan lillahi ta'ala", arti: "Aku niat mengeluarkan zakat hartaku, fardhu karena Allah Ta'ala." },
      FITRAH: { arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِي فَرْضًا لِلَّهِ تَعَالَى", latin: "Nawaitu an ukhrija zakatal fithri 'an nafsi fardhan lillahi ta'ala", arti: "Aku niat mengeluarkan zakat fitrah untuk diriku sendiri, fardhu karena Allah Ta'ala." },
      PROFESI: { arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْكَسْبِ/الْمِهْنَةِ فَرْضًا لِلَّهِ تَعَالَى", latin: "Nawaitu an ukhrija zakatal kasbi/mihnati fardhan lillahi ta'ala", arti: "Aku niat mengeluarkan zakat penghasilan/profesi, fardhu karena Allah Ta'ala." },
      PERDAGANGAN: { arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ التِّجَارَةِ فَرْضًا لِلَّهِ تَعَالَى", latin: "Nawaitu an ukhrija zakatat tijarah fardhan lillahi ta'ala", arti: "Aku niat mengeluarkan zakat dagangan, fardhu karena Allah Ta'ala." },
      PERTANIAN: { arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الزَّرْعِ فَرْضًا لِلَّهِ تَعَالَى", latin: "Nawaitu an ukhrija zakataz zar'i fardhan lillahi ta'ala", arti: "Aku niat mengeluarkan zakat pertanian, fardhu karena Allah Ta'ala." },
      PETERNAKAN: { arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ هَذِهِ الْمَاشِيَةِ فَرْضًا لِلَّهِ تَعَالَى", latin: "Nawaitu an ukhrija zakata hadzihil masyiah fardhan lillahi ta'ala", arti: "Aku niat mengeluarkan zakat hewan ternak ini, fardhu karena Allah Ta'ala." },
    };
    return niats[type];
  };

  const renderDalil = (type: ZakatType) => {
    const content = {
      MAAL: {
        source: "Al-Qur'an & Kitab Fathul Qorib",
        icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
        items: [
          { label: "QS. At-Taubah: 34", text: `"...Dan orang-orang yang menyimpan emas dan perak dan tidak menafkahkannya pada jalan Allah..."` },
          { label: "Kitab Fathul Qorib", text: `"Wajib zakat pada emas jika telah mencapai 20 mitsqal (sekitar 85gr) dan haul (satu tahun)..."` }
        ]
      },
      PROFESI: {
        source: "Qiyas & Fiqh Zakat",
        icon: <Scale className="w-4 h-4 text-blue-600" />,
        items: [
          { label: "Kitab Fiqh Zakat (Yusuf Qardhawi)", text: `Zakat Profesi diqiyaskan dengan Zakat Pertanian (waktu pengeluaran: saat menerima) dan Zakat Emas (kadar nisab: 85gr emas).` },
          { label: "MUI", text: "Fatwa MUI No 3 Tahun 2003 tentang Zakat Penghasilan (2.5%)." }
        ]
      },
      PERDAGANGAN: {
        source: "Kitab Kifayatul Akhyar",
        icon: <Store className="w-4 h-4 text-purple-600" />,
        items: [
          { label: "Kitab Kifayatul Akhyar", text: `"Syarat zakat tijarah (dagang): Niat berdagang saat memiliki barang, dan nilainya mencapai nisab di akhir tahun."` }
        ]
      },
      PERTANIAN: {
        source: "Kitab Safinatun Najah",
        icon: <Sprout className="w-4 h-4 text-green-600" />,
        items: [
          { label: "Kitab Safinatun Najah", text: `"Nisab tanaman (kurma/anggur/makanan pokok) adalah 5 wasaq bersih tanpa kulit (sekitar 653kg gabah)..."` }
        ]
      },
      PETERNAKAN: {
        source: "Matan Al-Ghayah wat Taqrib",
        icon: <FileText className="w-4 h-4 text-orange-600" />,
        items: [
          { label: "Matan Ghayah", text: `"Awal nisab unta 5 ekor... Sapi 30 ekor... Kambing 40 ekor..."` }
        ]
      },
      FITRAH: {
        source: "Kitab Safinatun Najah",
        icon: <Users className="w-4 h-4 text-teal-600" />,
        items: [
          { label: "Kitab Safinatun Najah", text: `"Syarat wajib zakat fitrah ada tiga: Islam, menemui akhir Ramadhan & awal Syawal, dan memiliki kelebihan makanan."` }
        ]
      }
    };

    const data = content[type];

    return (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          {data.icon}
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Referensi Kitab Kuning ({data.source})</h4>
        </div>
        <div className="p-5 space-y-4">
           {data.items.map((item, idx) => (
             <div key={idx}>
               <span className="block text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">{item.label}</span>
               <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed border-l-2 border-emerald-200 dark:border-emerald-800 pl-3">
                 {item.text}
               </p>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const renderNiat = (type: ZakatType) => {
    const niat = getNiatZakat(type);
    return (
      <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center">
         <h4 className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-2 mb-3">
           <Heart className="w-4 h-4" /> Niat Zakat
         </h4>
         <p className="font-arabic text-2xl text-emerald-800 dark:text-emerald-100 mb-2 leading-loose" dir="rtl">{niat.arab}</p>
         <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">{niat.latin}</p>
         <p className="text-xs text-emerald-600 dark:text-emerald-500 italic">"{niat.arti}"</p>
      </div>
    );
  };

  const renderInputs = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
         {/* Global Gold Price for Maal, Profesi, Perdagangan */}
         {(activeTab === 'MAAL' || activeTab === 'PROFESI' || activeTab === 'PERDAGANGAN') && (
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                  <span>Harga Emas (per gram)</span>
                  <span className="text-xs text-gray-400 font-normal">Update manual jika perlu</span>
               </label>
               <input type="text" value={goldPrice} onChange={(e) => handleInput(setGoldPrice, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
            </div>
         )}

         {activeTab === 'MAAL' && (
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Tabungan / Aset Emas</label>
               <input type="text" value={savings} onChange={(e) => handleInput(setSavings, e.target.value)} placeholder="Contoh: 100.000.000" className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
            </div>
         )}

         {activeTab === 'PROFESI' && (
            <>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penghasilan Tetap (Bulanan)</label>
                  <input type="text" value={monthlyIncome} onChange={(e) => handleInput(setMonthlyIncome, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penghasilan Lainnya (Bonus/THR)</label>
                  <input type="text" value={otherIncome} onChange={(e) => handleInput(setOtherIncome, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hutang Jatuh Tempo (Bulanan)</label>
                  <input type="text" value={monthlyDebt} onChange={(e) => handleInput(setMonthlyDebt, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
            </>
         )}

         {activeTab === 'PERDAGANGAN' && (
            <>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai Stok Barang Dagangan</label>
                  <input type="text" value={tradeStock} onChange={(e) => handleInput(setTradeStock, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uang Tunai / Saldo Bank Usaha</label>
                  <input type="text" value={tradeCash} onChange={(e) => handleInput(setTradeCash, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Piutang Lancar (Dapat Ditagih)</label>
                  <input type="text" value={tradeReceivables} onChange={(e) => handleInput(setTradeReceivables, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hutang Usaha Jatuh Tempo</label>
                  <input type="text" value={tradeDebt} onChange={(e) => handleInput(setTradeDebt, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
            </>
         )}

         {activeTab === 'PERTANIAN' && (
            <>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hasil Panen (Kg Gabah/Beras)</label>
                  <input type="text" value={harvestResult} onChange={(e) => handleInput(setHarvestResult, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" placeholder="0" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sistem Pengairan</label>
                  <div className="flex gap-2">
                     <button onClick={() => setIrrigationType('PAID')} className={`flex-1 py-2 rounded-lg border transition-all text-sm font-bold ${irrigationType === 'PAID' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>Berbiaya (Mesin/Beli)</button>
                     <button onClick={() => setIrrigationType('FREE')} className={`flex-1 py-2 rounded-lg border transition-all text-sm font-bold ${irrigationType === 'FREE' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>Alami (Hujan/Sungai)</button>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Jual per Kg (Rp)</label>
                  <input type="text" value={grainPrice} onChange={(e) => handleInput(setGrainPrice, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
            </>
         )}

         {activeTab === 'PETERNAKAN' && (
            <>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jenis Hewan</label>
                  <div className="flex gap-2">
                     <button onClick={() => setAnimalType('GOAT')} className={`flex-1 py-2 rounded-lg border transition-all text-sm font-bold ${animalType === 'GOAT' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>Kambing/Domba</button>
                     <button onClick={() => setAnimalType('COW')} className={`flex-1 py-2 rounded-lg border transition-all text-sm font-bold ${animalType === 'COW' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>Sapi/Kerbau</button>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jumlah Ekor</label>
                  <div className="flex items-center justify-between p-2 rounded-2xl border-2 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 w-full shadow-sm">
                      <button 
                          type="button"
                          onClick={() => setAnimalCount(Math.max(0, animalCount - 1))} 
                          className="w-14 h-14 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-3xl transition-transform active:scale-90 hover:bg-gray-300 disabled:opacity-50"
                          disabled={animalCount === 0}
                      >
                          -
                      </button>
                      <input 
                          type="text"
                          inputMode="numeric"
                          value={animalCount} 
                          onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                              setAnimalCount(isNaN(val) ? 0 : val);
                          }} 
                          className="w-full text-center bg-transparent border-none focus:ring-0 font-bold font-mono text-4xl text-gray-800 dark:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                          type="button"
                          onClick={() => setAnimalCount(animalCount + 1)} 
                          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-3xl transition-transform active:scale-90"
                      >
                          +
                      </button>
                  </div>
               </div>
            </>
         )}

         {activeTab === 'FITRAH' && (
            <>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jumlah Jiwa (Keluarga)</label>
                  <div className="flex items-center justify-between p-2 rounded-2xl border-2 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 w-full shadow-sm">
                      <button 
                          type="button"
                          onClick={() => setFamilyMembers(Math.max(1, familyMembers - 1))} 
                          className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-2xl transition-transform active:scale-90 hover:bg-gray-300 disabled:opacity-50"
                          disabled={familyMembers <= 1}
                      >
                          -
                      </button>
                      <input 
                          type="text"
                          inputMode="numeric"
                          value={familyMembers} 
                          onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                              setFamilyMembers(isNaN(val) || val < 1 ? 1 : val);
                          }} 
                          className="w-full text-center bg-transparent border-none focus:ring-0 font-bold font-mono text-3xl text-gray-800 dark:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                          type="button"
                          onClick={() => setFamilyMembers(familyMembers + 1)} 
                          className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-2xl transition-transform active:scale-90"
                      >
                          +
                      </button>
                  </div>
               </div>
               <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Beras (Paket 2.5 Kg / 3.5 Liter)</label>
                  <input type="text" value={ricePrice} onChange={(e) => handleInput(setRicePrice, e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-emerald-500" />
               </div>
            </>
         )}
      </div>
    );
  };

  const renderResult = () => {
    let result = { amount: 0, isWajib: false, nisab: 0, info: "", textResult: "" };

    if (activeTab === 'MAAL') result = { ...calculateMaal(), textResult: "" };
    else if (activeTab === 'PROFESI') result = { ...calculateProfesi(), textResult: "" };
    else if (activeTab === 'PERDAGANGAN') result = { ...calculatePerdagangan(), textResult: "" };
    else if (activeTab === 'PERTANIAN') result = { ...calculatePertanian(), textResult: "" };
    else if (activeTab === 'PETERNAKAN') {
        const res = calculatePeternakan();
        result = { amount: 0, isWajib: res.isWajib, nisab: 0, info: res.info, textResult: res.resultText };
    }
    else if (activeTab === 'FITRAH') result = { ...calculateFitrah(), textResult: "" };

    if (result.isWajib) {
       return (
         <div className="animate-scale-up">
            <div className="rounded-3xl p-6 text-center bg-emerald-600 text-white shadow-lg relative overflow-hidden mb-6">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
               <div className="relative z-10">
                  <h3 className="text-lg font-bold text-emerald-100 mb-1 flex items-center justify-center gap-2">
                     <CheckCircle className="w-5 h-5" /> Wajib Zakat
                  </h3>
                  {result.textResult ? (
                     <div className="text-2xl font-bold my-3 font-serif">{result.textResult}</div>
                  ) : (
                     <div className="text-4xl font-bold my-3 font-mono tracking-tight">{formatRupiah(result.amount)}</div>
                  )}
                  <p className="text-xs text-emerald-200 opacity-80">{result.info}</p>
               </div>
            </div>
            {renderNiat(activeTab)}
         </div>
       );
    }

    return (
       <div className="rounded-2xl p-8 text-center bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 animate-fade-in">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300">Belum Wajib Zakat</h3>
          {result.nisab > 0 && (
             <p className="text-sm text-gray-500 mt-1">
                Harta belum mencapai Nisab ({formatRupiah(result.nisab)}).
             </p>
          )}
          <p className="text-xs text-gray-400 mt-2 italic">{result.info}</p>
       </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in pb-48">
      
      {/* Sticky Header */}
      {viewMode === 'CALCULATOR' && (
        <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 mb-6 -mx-4 shadow-sm flex items-center justify-between">
            <button onClick={handleBackNavigation} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 font-bold text-sm transition-colors">
                <ArrowLeft className="w-5 h-5" /> Kembali
            </button>
            <h2 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{ZAKAT_MENU.find(z => z.id === activeTab)?.label}</h2>
            <button onClick={handleReset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-bold">
                <RefreshCcw className="w-3 h-3" /> Reset
            </button>
        </div>
      )}

      {viewMode === 'MENU' && (
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
            <Coins className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-serif">Kalkulator Zakat</h2>
            <p className="text-gray-600 dark:text-gray-400">Sesuai Syariat & Referensi Kitab Fiqih.</p>
        </div>
      )}

      {viewMode === 'MENU' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-slide-up">
           {ZAKAT_MENU.map((item) => (
             <button
               key={item.id}
               onClick={() => handleMenuClick(item.id as ZakatType)}
               className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all group text-center h-full"
             >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${item.color}`}>
                   <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-emerald-600">{item.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
             </button>
           ))}
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
           {renderInputs()}
           {renderResult()}
           {renderDalil(activeTab)}
        </div>
      )}
    </div>
  );
};

export default ZakatView;
