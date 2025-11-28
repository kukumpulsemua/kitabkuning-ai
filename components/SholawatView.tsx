
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Copy, Check, Share2, 
  Music, ChevronDown, ChevronUp, Sparkles, Heart
} from 'lucide-react';

interface SholawatViewProps {
  onBack: () => void;
  onAnalyze: (text: string) => void;
}

interface SholawatItem {
  id: string;
  title: string;
  category: string; // e.g., "Penyembuh", "Hajat", "Pujian"
  arabic: string;
  latin: string;
  translation: string;
  faedah: string; // Keutamaan
}

const SHOLAWAT_DATA: SholawatItem[] = [
  {
    id: 'nariyah',
    title: 'Sholawat Nariyah',
    category: 'Hajat & Rezeki',
    arabic: 'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَمًا تَامًّا عَلىَ سَيِّدِنَا مُحَمَّدٍ الَّذِيْ تُنْحَلُ بِهَ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيْمِ وَعَلىَ آلِهِ وَصَحْبِهِ فِيْ كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعُْوْمٍ لَكَ',
    latin: 'Allahumma sholli sholaatan kaamilatan wa sallim salaaman taamman \'ala sayyidinaa Muhammadin alladzi tunhallu bihil \'uqadu wa tanfariju bihil kurabu wa tuqdhaa bihil hawaaiju wa tunaalu bihir raghaaibu wa husnul khawaatimi wa yustasqal ghamaamu biwajhihil kariimi wa \'ala aalihi wa shahbihi fii kulli lamhatin wa nafasin bi\'adadi kulli ma\'luumin laka.',
    translation: 'Ya Allah, limpahkanlah shalawat yang sempurna dan curahkanlah salam kesejahteraan yang penuh kepada junjungan kami Nabi Muhammad, yang dengan sebab beliau semua kesulitan dapat terpecahkan, semua kesusahan dapat lenyap, semua keperluan dapat terpenuhi, dan semua yang didambakan serta husnul khatimah dapat diraih, dan berkat dirinya yang mulia hujanpun turun, dan semoga terlimpahkan kepada keluarganya serta para sahabatnya, di setiap detik dan hembusan nafas sebanyak bilangan semua yang diketahui oleh Engkau.',
    faedah: 'Dikenal sebagai Sholawat Tafrijiyah. Para ulama menyebutkan faedahnya untuk mempermudah urusan, melancarkan rezeki, dan menghilangkan kesusahan jika diamalkan secara istiqamah (misal 11x atau 4444x saat hajat besar).'
  },
  {
    id: 'thibbil-qulub',
    title: 'Sholawat Thibbil Qulub',
    category: 'Kesehatan',
    arabic: 'اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوْبِ وَدَوَائِهَا، وَعَافِيَةِ الْأَبْدَانِ وَشِفَائِهَا، وَنُوْرِ الْأَبْصَارِ وَضِيَائِهَا، وَعَلَى اٰلِهِ وَصَحْبِهِ وَسَلِّمْ',
    latin: 'Allahumma sholli \'ala sayyidinaa Muhammadin thibbil quluubi wa dawaa-ihaa, wa \'aafiyatil abdaani wa syifaa-ihaa, wa nuuril abshaari wa dhiyaa-ihaa, wa \'ala aalihi wa shahbihi wa sallim.',
    translation: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad SAW, sebagai obat hati dan penyembuhnya, penyehat badan dan obatnya, sebagai cahaya mata dan sinarnya. Dan semoga rahmat tercurah limpahkan kepada para sahabat beserta keluarganya.',
    faedah: 'Sering diamalkan sebagai wasilah untuk kesembuhan penyakit hati maupun fisik, serta ketenangan jiwa.'
  },
  {
    id: 'munjiyat',
    title: 'Sholawat Munjiyat',
    category: 'Keselamatan',
    arabic: 'اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِيْنَا بِهَا مِنْ جَمِيْعِ الْأَهْوَالِ وَالْاٰفَاتِ، وَتَقْضِيْ لَنَا بِهَا جَمِيْعَ الْحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيْعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيْعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ',
    latin: 'Allahumma sholli \'ala sayyidinaa Muhammadin sholaatan tunjiinaa bihaa min jamii\'il ahwaali wal aafaat, wa taqdhii lanaa bihaa jamii\'al haajaat, wa tuthahhirunaa bihaa min jamii\'is sayyi-aat, wa tarfa\'unaa bihaa \'indaka a\'lad darajaat, wa tuballighunaa bihaa aqshal ghaayaat min jamii\'il khairaati fil hayaati wa ba\'dal mamaat.',
    translation: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, dengan shalawat itu, Engkau akan menyelamatkan kami dari semua keadaan yang menakutkan dan dari semua malapetaka; dengan shalawat itu, Engkau akan memenuhi hajat kami; dengan shalawat itu, Engkau akan menyucikan kami dari segala keburukan; dengan shalawat itu, Engkau akan mengangkat kami ke derajat yang paling tinggi; dengan shalawat itu, Engkau akan menyampaikan kami kepada tujuan yang paling sempurna dalam semua kebaikan, ketika hidup dan setelah mati.',
    faedah: 'Sholawat Penyelamat. Sangat baik dibaca saat menghadapi marabahaya, bencana, atau keinginan mendesak agar dikabulkan Allah SWT.'
  },
  {
    id: 'fatih',
    title: 'Sholawat Al-Fatih',
    category: 'Ilmu & Pembuka',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ الْفَاتِحِ لِمَا أُغْلِقَ وَالْخَاتِمِ لِمَا سَبَقَ نَاصِرِ الْحَقِّ بِالْحَقِّ وَالْهَادِي إِلَى صِرَاطِكَ الْمُسْتَقِيمِ وَعَلَى آلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ الْعَظِيمِ',
    latin: 'Allahumma sholli \'ala sayyidinaa Muhammadin al-faatihi limaa ughliqa, wal khaatimi limaa sabaqa, naashiril haqqi bil haqqi, wal haadii ilaa shiraatikal mustaqiim, wa \'ala aalihi haqqa qadrihi wa miqdaarihil \'azhiim.',
    translation: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, sang pembuka apa yang terkunci, dan penutup apa yang telah lalu, penolong kebenaran dengan kebenaran, dan pemberi petunjuk kepada jalan-Mu yang lurus. Dan kepada keluarganya dengan sebenar-benar pangkat dan kedudukannya yang agung.',
    faedah: 'Dikenal sebagai pembuka pintu ilmu, rezeki, dan pemahaman. Sering diamalkan oleh para santri dan penuntut ilmu.'
  },
  {
    id: 'jibril',
    title: 'Sholawat Jibril',
    category: 'Hajat & Rezeki',
    arabic: 'صَلَّى اللهُ عَلَى مُحَمَّد',
    latin: 'Shollallahu \'ala Muhammad',
    translation: 'Semoga Allah melimpahkan rahmat kepada Nabi Muhammad.',
    faedah: 'Sholawat terpendek namun memiliki fadhilah besar untuk kelancaran rezeki jika dibaca dalam jumlah banyak (misal 1000x) secara istiqamah.'
  },
  {
    id: 'busyro',
    title: 'Sholawat Busyro',
    category: 'Kabar Gembira',
    arabic: 'اَللّهُمَّ صَلِّ وَسَلِّمْ عَلى سَيِّدِنَا مُحَمَّدٍ صَاحِبِ الْبُشْرَى صَلَاةً تُبَشِّرُنَا بِهَا وَأَهْلَنَا وَأَوْلَادَنَا وَجَمِيْعَ مَشَايِخِنَا وَمُعَلِّمِيْنَا وَطُلَّابَنَا وَجَمِيْعَ مُسْلِمِيْنَ مِنْ يَوْمِ هَذَا اِلى يَوْمِ الْآخِرَةِ',
    latin: 'Allahumma Sholli wa sallim \'ala sayyidinaa Muhammadin shaahibil busyro sholaatan tubasysyiruna bihaa wa ahlanaa wa aulaadanaa wa jamii\'a masyaayikhinaa wa mu\'allimiinaa wa thullaabanaa wa jamii\'a muslimiina min yaumi haadza ilaa yaumil aakhirah.',
    translation: 'Ya Allah, limpahkanlah sholawat dan salam kepada junjungan kami Nabi Muhammad, pemilik kabar gembira, dengan sholawat yang dengannya Engkau memberi kabar gembira kepada kami, keluarga kami, anak-anak kami, seluruh guru-guru kami, murid-murid kami, dan seluruh kaum muslimin, dari hari ini hingga hari akhir.',
    faedah: 'Diijazahkan oleh Habib Segaf Baharun. Dibaca 41x setelah Subuh untuk melancarkan urusan dan mendapatkan kabar gembira.'
  },
  {
    id: 'badar',
    title: 'Sholawat Badar',
    category: 'Perjuangan',
    arabic: 'صَـلاَةُ اللهِ سَـلاَمُ اللهِ ، عَـلَى طـهَ رَسُـوْلِ اللهِ\nصَـلاَةُ اللهِ سَـلاَمُ اللهِ ، عَـلَى يـس حَبِيْـبِ اللهِ',
    latin: 'Sholaatullah Salaamullah, \'Alaa Thaaha Rasuulillah. Sholaatullah Salaamullah, \'Alaa Yaasiin Habiibillah.',
    translation: 'Rahmat dan keselamatan Allah, semoga tetap tercurah kepada Taha (Nabi Muhammad) utusan Allah. Rahmat dan keselamatan Allah, semoga tetap tercurah kepada Yasin (Nabi Muhammad) kekasih Allah.',
    faedah: 'Karya Kyai Ali Manshur. Mengandung tawassul kepada Ahli Badar. Sering dibaca untuk menolak bala dan membangkitkan semangat perjuangan.'
  },
  {
    id: 'asyghil',
    title: 'Sholawat Asyghil',
    category: 'Perlindungan',
    arabic: 'اللَّهُمَّ صَلِّ عَلَي سَيِّدِنَا مُحَمَّدٍ وَأَشْغِلِ الظَّالِمِيْنَ بِالظَّالِمِيْنَ وَأَخْرِجْنَا مِنْ بَيْنِهِمْ سَالِمِيْنَ وَعَلَي الِهِ وَصَحْبِهِ أَجْمَعِيْنَ',
    latin: 'Allahumma sholli \'ala sayyidinaa Muhammad, wa asyghilizh zhaalimiin bizh zhaalimiin, wa akhrijnaa min bainihim saalimiin, wa \'ala aalihi wa shahbihi ajma\'iin.',
    translation: 'Ya Allah, berikanlah shalawat kepada pemimpin kami Nabi Muhammad, dan sibukkanlah orang-orang zhalim dengan orang zhalim lainnya. Selamatkanlah kami dari kejahatan mereka. Dan limpahkanlah shalawat kepada seluruh keluarga dan para sahabat beliau.',
    faedah: 'Memohon perlindungan dari orang-orang zalim dan agar kita tidak terlibat dalam konflik kezaliman.'
  },
  {
    id: 'ibrahimiyah',
    title: 'Sholawat Ibrahimiyah',
    category: 'Shalat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    latin: 'Allahumma sholli \'ala Muhammad wa \'ala aali Muhammad kamaa shollaita \'ala Ibraahim wa \'ala aali Ibraahim, wa baarik \'ala Muhammad wa \'ala aali Muhammad kamaa baarakta \'ala Ibraahim wa \'ala aali Ibraahim fil \'aalamiina innaka hamiidum majiid.',
    translation: 'Ya Allah, berilah rahmat kepada Nabi Muhammad dan keluarga Nabi Muhammad sebagaimana Engkau telah memberikan rahmat kepada Nabi Ibrahim dan keluarga Nabi Ibrahim. Dan berilah keberkahan kepada Nabi Muhammad dan keluarga Nabi Muhammad sebagaimana Engkau telah memberikan keberkahan kepada Nabi Ibrahim dan keluarga Nabi Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.',
    faedah: 'Sholawat yang paling utama (afdhal) dibaca, khususnya dalam Tasyahud Akhir shalat.'
  }
];

const SholawatView: React.FC<SholawatViewProps> = ({ onBack, onAnalyze }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(SHOLAWAT_DATA.map(s => s.category));
    return ['Semua', ...Array.from(cats).sort()];
  }, []);

  const filteredSholawat = useMemo(() => {
    return SHOLAWAT_DATA.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.latin.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (item: SholawatItem) => {
    const text = `*${item.title}*\n\n${item.arabic}\n\n${item.latin}\n\n"${item.translation}"\n\nFaedah: ${item.faedah}\n\n(Sumber: Aplikasi Kitab Kuning AI)`;
    if (navigator.share) {
      navigator.share({ title: item.title, text }).catch(console.error);
    } else {
      handleCopy(text, item.id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBedah = (item: SholawatItem) => {
    const prompt = `Bedah Sastra & Makna Sholawat: "${item.title}"\n\nTeks Arab: ${item.arabic}\n\nMohon jelaskan:\n1. Analisis Nahwu/Shorof singkat dari kalimat kuncinya.\n2. Kandungan makna mendalam (balaghah/sastra).\n3. Sejarah atau Asbabul Wurud (jika ada).\n4. Relevansi spiritualnya.`;
    onAnalyze(prompt);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 flex flex-col">
       {/* Sticky Header */}
       <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
         <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
               <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-emerald-600" /> Kumpulan Sholawat
               </h2>
            </div>
         </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-grow">
         
         {/* Search & Filters */}
         <div className="space-y-3 mb-6">
            <div className="relative shadow-sm">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari sholawat (Nariyah, Jibril...)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
               {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                     selectedCategory === cat 
                     ? 'bg-emerald-600 text-white border-emerald-600' 
                     : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
         </div>

         {/* List */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-slide-up">
            {filteredSholawat.length > 0 ? (
               filteredSholawat.map((item, index) => {
                  const isExpanded = expandedId === item.id;
                  
                  return (
                    <div key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 group">
                      <button 
                        onClick={() => toggleExpand(item.id)}
                        className={`w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors ${
                           isExpanded 
                           ? 'bg-emerald-50/50 dark:bg-emerald-900/10' 
                           : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 transition-all ${
                               isExpanded ? 'scale-110 shadow-sm' : ''
                            }`}>
                               <Music className="w-5 h-5" />
                            </div>
                            <div>
                               <h3 className={`font-bold text-base sm:text-lg leading-snug ${
                                  isExpanded ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'
                               }`}>
                                  {item.title}
                               </h3>
                               <p className="text-xs text-gray-400 mt-0.5 font-medium">{item.category}</p>
                            </div>
                         </div>
                         <div className="ml-2 text-gray-400">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                         </div>
                      </button>

                      {isExpanded && (
                        <div className="p-5 sm:p-6 bg-gray-50/30 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 animate-slide-down">
                           
                           <div className="text-right mb-6 pl-4">
                              <p className="font-arabic text-3xl sm:text-4xl leading-[2.3] text-gray-800 dark:text-gray-100" dir="rtl">
                                 {item.arabic}
                              </p>
                           </div>
                           
                           <div className="mb-4">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Latin</h4>
                              <p className="text-emerald-700 dark:text-emerald-400 text-sm sm:text-base font-medium leading-relaxed">
                                 {item.latin}
                              </p>
                           </div>

                           <div className="mb-6 relative">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Arti</h4>
                              <div className="pl-4 border-l-2 border-emerald-300 dark:border-emerald-700">
                                 <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base italic leading-relaxed">
                                    "{item.translation}"
                                 </p>
                              </div>
                           </div>

                           {/* Faedah Box */}
                           <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50 mb-6">
                              <div className="flex items-start gap-3">
                                 <Heart className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                 <div>
                                    <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Faedah / Keutamaan</h5>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                       {item.faedah}
                                    </p>
                                 </div>
                              </div>
                           </div>

                           {/* Actions - Flex Row for Mobile Optimization */}
                           <div className="flex flex-row items-center gap-2 w-full sm:justify-end">
                              <button 
                                onClick={() => handleBedah(item)}
                                className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                              >
                                 <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                 Bedah Sastra
                              </button>

                              <button 
                                onClick={() => handleCopy(`${item.title}\n\n${item.arabic}\n\n${item.latin}\n\n"${item.translation}"`, item.id)}
                                className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors border border-gray-200 dark:border-gray-700 hover:border-emerald-300 whitespace-nowrap"
                              >
                                 {copiedId === item.id ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                 {copiedId === item.id ? 'Disalin' : 'Salin'}
                              </button>
                              
                              <button 
                                onClick={() => handleShare(item)}
                                className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors border border-gray-200 dark:border-gray-700 hover:border-blue-300 whitespace-nowrap"
                              >
                                 <Share2 className="w-3.5 h-3.5 shrink-0" />
                                 Bagikan
                              </button>
                           </div>
                        </div>
                      )}
                    </div>
                  );
               })
            ) : (
               <div className="text-center py-20 text-gray-500">
                  <Music className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Tidak ditemukan sholawat dengan kata kunci tersebut.</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default SholawatView;