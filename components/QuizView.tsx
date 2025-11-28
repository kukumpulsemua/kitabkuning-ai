import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, BrainCircuit, Trophy, CheckCircle, XCircle, 
  Loader2, AlertCircle, Sparkles, Flame, RefreshCcw, LogOut, Shuffle, PenTool, Lightbulb, Check, X, Send, ThumbsUp, AlertTriangle
} from 'lucide-react';
import { generateQuizQuestion, generateEssayQuestion } from '../services/geminiService.ts';
import { QuizQuestion, EssayQuestion } from '../types.ts';

interface QuizViewProps {
  onBack: () => void;
  // FX-981: Removed apiKey prop
}

const TOPICS = [
  { id: 'NAHWU', label: 'Nahwu & Shorof', color: 'blue' },
  { id: 'FIQIH', label: 'Fiqih Ibadah', color: 'emerald' },
  { id: 'TAUHID', label: 'Aqidah Tauhid', color: 'indigo' },
  { id: 'TARIKH', label: 'Sejarah Islam', color: 'amber' },
  { id: 'TAJWID', label: 'Ilmu Tajwid', color: 'teal' },
  { id: 'AKHLAK', label: 'Akhlak & Tasawuf', color: 'rose' }
];

type GameMode = 'MULTIPLE_CHOICE' | 'ESSAY';

const QuizView: React.FC<QuizViewProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'RESULT'>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('MULTIPLE_CHOICE');
  const [selectedTopic, setSelectedTopic] = useState<{id: string, label: string} | null>(null);
  
  // State untuk Pilihan Ganda
  const [currentMCQuestion, setCurrentMCQuestion] = useState<QuizQuestion | null>(null);
  const [selectedMCOption, setSelectedMCOption] = useState<number | null>(null);
  
  // State untuk Esai/Tantangan
  const [currentEssayQuestion, setCurrentEssayQuestion] = useState<EssayQuestion | null>(null);
  const [essayRevealed, setEssayRevealed] = useState(false);
  const [userEssayAnswer, setUserEssayAnswer] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // State untuk Popup Hasil (Feedback)
  const [feedbackModal, setFeedbackModal] = useState<'CORRECT' | 'INCORRECT' | null>(null);

  // Function accepts explicit streak to avoid closure staleness during startGame
  const loadNewQuestion = async (topic: string, currentStreak: number) => {
    setIsLoading(true);
    setError(null);
    // Reset States
    setSelectedMCOption(null);
    setIsAnswerRevealed(false);
    setEssayRevealed(false);
    setUserEssayAnswer(''); // Reset input esai
    setFeedbackModal(null); // Close modal if open
    
    // Determine difficulty based on streak
    let difficulty = "Mudah";
    if (currentStreak > 3) difficulty = "Sedang";
    if (currentStreak > 7) difficulty = "Sulit";
    if (currentStreak > 12) difficulty = "Sangat Sulit (Bahtsul Masail)";

    try {
      if (gameMode === 'MULTIPLE_CHOICE') {
         // FX-981: Removed apiKey argument
         const question = await generateQuizQuestion(topic, difficulty);
         setCurrentMCQuestion(question);
         setCurrentEssayQuestion(null);
      } else {
         // FX-981: Removed apiKey argument
         const question = await generateEssayQuestion(topic, difficulty);
         setCurrentEssayQuestion(question);
         setCurrentMCQuestion(null);
      }
    } catch (err) {
      setError("Gagal memuat soal. Koneksi bermasalah.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = (topic: typeof TOPICS[0]) => {
    setSelectedTopic(topic);
    setGameState('PLAYING');
    setScore(0);
    setStreak(0);
    // Explicitly pass 0 as streak for new game
    loadNewQuestion(topic.label, 0);
  };

  const handleRandomGame = () => {
    const randomIndex = Math.floor(Math.random() * TOPICS.length);
    const randomTopic = TOPICS[randomIndex];
    handleStartGame(randomTopic);
  };

  // Logic Pilihan Ganda
  const handleMCAnswer = (index: number) => {
    if (isAnswerRevealed || !currentMCQuestion) return;
    
    setSelectedMCOption(index);
    setIsAnswerRevealed(true);

    if (index === currentMCQuestion.correctIndex) {
      setScore(prev => prev + 10 + (streak * 2)); // Bonus points for streak
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Logic Esai (Self Assessment)
  const handleEssayRate = (correct: boolean) => {
     if (correct) {
        setScore(prev => prev + 15 + (streak * 3)); // Higher points for essay
        setStreak(prev => prev + 1);
        setFeedbackModal('CORRECT');
     } else {
        setStreak(0);
        setFeedbackModal('INCORRECT');
     }
     // Note: We don't call handleNext() here anymore. We wait for modal interaction.
  };

  const handleNext = () => {
    if (selectedTopic) {
      // For next question, use current streak state
      loadNewQuestion(selectedTopic.label, streak);
    }
  };

  const handleNextFromFeedback = () => {
    setFeedbackModal(null);
    handleNext();
  };

  const handleQuit = () => {
    if (confirm("Yakin ingin keluar? Skor Anda akan direset.")) {
      setGameState('MENU');
      setCurrentMCQuestion(null);
      setCurrentEssayQuestion(null);
      setFeedbackModal(null);
    }
  };

  const getColorClass = (color: string) => {
    const colors: {[key: string]: string} = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    };
    return colors[color] || colors['emerald'];
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 flex flex-col animate-fade-in">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
         <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                  <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-600" /> Cerdas Cermat
                  </h2>
              </div>
            </div>
            
            {gameState === 'PLAYING' && (
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 text-amber-500 font-bold text-sm animate-pulse">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{streak}</span>
                 </div>
                 <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{score}</span>
                 </div>
              </div>
            )}
         </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex-grow flex flex-col">
         
         {gameState === 'MENU' && (
            <div className="space-y-6 animate-slide-up">
               <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <Trophy className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Uji Wawasan Santri</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
                    Pilih mode permainan dan topik di bawah ini.
                  </p>
                  
                  {/* Mode Selection */}
                  <div className="flex justify-center gap-2 mb-6 px-4">
                     <button 
                       onClick={() => setGameMode('MULTIPLE_CHOICE')}
                       className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${gameMode === 'MULTIPLE_CHOICE' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'}`}
                     >
                        Pilihan Ganda
                     </button>
                     <button 
                       onClick={() => setGameMode('ESSAY')}
                       className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${gameMode === 'ESSAY' ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'}`}
                     >
                        <PenTool className="w-4 h-4" />
                        Tantangan Santri
                     </button>
                  </div>

                  <button 
                    onClick={handleRandomGame}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full font-bold shadow-lg transform transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <Shuffle className="w-5 h-5" />
                    <span>Acak Topik (Random)</span>
                  </button>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleStartGame(topic)}
                      className={`p-5 rounded-2xl text-left font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-md ${getColorClass(topic.color)}`}
                    >
                       {topic.label}
                    </button>
                  ))}
               </div>
            </div>
         )}

         {gameState === 'PLAYING' && (
            <div className="flex-1 flex flex-col">
               
               {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                     <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-purple-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                     </div>
                     <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                        AI sedang menyusun soal {gameMode === 'ESSAY' ? 'tantangan' : 'kuis'}...
                     </p>
                  </div>
               ) : error ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                     <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                     <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
                     <button 
                       onClick={() => selectedTopic && loadNewQuestion(selectedTopic.label, streak)}
                       className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors"
                     >
                        Coba Lagi
                     </button>
                  </div>
               ) : (
                  <div className="flex flex-col h-full animate-slide-up">
                     
                     {/* --- MODE PILIHAN GANDA --- */}
                     {gameMode === 'MULTIPLE_CHOICE' && currentMCQuestion && (
                        <>
                           <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border-2 border-purple-100 dark:border-gray-700 shadow-lg mb-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-bl-full -mr-4 -mt-4"></div>
                              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed relative z-10">
                                 {currentMCQuestion.question}
                              </h3>
                           </div>

                           <div className="space-y-3 flex-1">
                              {currentMCQuestion.options.map((opt, idx) => {
                                 let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
                                 
                                 if (isAnswerRevealed) {
                                    if (idx === currentMCQuestion.correctIndex) {
                                       btnClass = "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600";
                                    } else if (idx === selectedMCOption) {
                                       btnClass = "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200 dark:border-red-600";
                                    } else {
                                       btnClass = "bg-gray-100 dark:bg-gray-800/50 text-gray-400 border-transparent opacity-60";
                                    }
                                 } else if (selectedMCOption === idx) {
                                    btnClass = "bg-purple-100 border-purple-500 text-purple-800";
                                 }

                                 return (
                                    <button
                                       key={idx}
                                       onClick={() => handleMCAnswer(idx)}
                                       disabled={isAnswerRevealed}
                                       className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between ${btnClass}`}
                                    >
                                       <span>{opt}</span>
                                       {isAnswerRevealed && idx === currentMCQuestion.correctIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
                                       {isAnswerRevealed && idx === selectedMCOption && idx !== currentMCQuestion.correctIndex && <XCircle className="w-5 h-5 text-red-600" />}
                                    </button>
                                 );
                              })}
                           </div>

                           {isAnswerRevealed && (
                              <div className="mt-6 animate-slide-down">
                                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                       <Sparkles className="w-3 h-3" /> Penjelasan
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                       {currentMCQuestion.explanation}
                                    </p>
                                 </div>
                                 
                                 <div className="flex gap-3">
                                    <button onClick={handleQuit} className="px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold"><LogOut className="w-5 h-5" /></button>
                                    <button onClick={handleNext} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"><span>Soal Berikutnya</span><RefreshCcw className="w-4 h-4" /></button>
                                 </div>
                              </div>
                           )}
                        </>
                     )}

                     {/* --- MODE ESAI / TANTANGAN --- */}
                     {gameMode === 'ESSAY' && currentEssayQuestion && (
                        <>
                           <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 dark:border-amber-700 shadow-lg mb-6 relative overflow-hidden text-center">
                              <div className="absolute top-0 left-0 w-full h-2 bg-amber-400"></div>
                              <span className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full mb-3">
                                 TANTANGAN {currentEssayQuestion.type.replace('_', ' ')}
                              </span>
                              <h3 className="text-2xl sm:text-3xl font-arabic leading-loose text-gray-900 dark:text-white mb-4" dir="auto">
                                 {currentEssayQuestion.question}
                              </h3>
                              {currentEssayQuestion.clue && !essayRevealed && (
                                 <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg inline-block mx-auto">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    <span className="italic">{currentEssayQuestion.clue}</span>
                                 </div>
                              )}
                           </div>

                           {!essayRevealed ? (
                              <div className="flex-1 flex flex-col justify-end pb-4 space-y-4">
                                 {/* User Input Column */}
                                 <div className="relative">
                                    <textarea
                                       value={userEssayAnswer}
                                       onChange={(e) => setUserEssayAnswer(e.target.value)}
                                       placeholder="Ketik jawaban Anda di sini sebelum melihat kunci..."
                                       className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[120px] resize-none transition-all"
                                       dir="auto"
                                    />
                                 </div>

                                 <button 
                                    onClick={() => setEssayRevealed(true)}
                                    disabled={!userEssayAnswer.trim()} // Optional: Force user to type something
                                    className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                                       userEssayAnswer.trim() 
                                       ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                       : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    }`}
                                 >
                                    <Send className="w-5 h-5" />
                                    Cek Jawaban
                                 </button>
                              </div>
                           ) : (
                              <div className="animate-slide-down space-y-6">
                                 {/* Jawaban Pengguna */}
                                 <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Jawaban Anda</h4>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-arabic" dir="auto">
                                       {userEssayAnswer}
                                    </p>
                                 </div>

                                 {/* Kunci Jawaban */}
                                 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Kunci Jawaban Benar</h4>
                                    <p className="text-xl font-arabic font-bold text-emerald-900 dark:text-emerald-100 leading-loose mb-4" dir="auto">
                                       {currentEssayQuestion.answerKey}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 border-t border-emerald-200 dark:border-emerald-800 pt-3">
                                       {currentEssayQuestion.explanation}
                                    </p>
                                 </div>

                                 <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-3">Apakah jawaban Anda mirip/benar?</p>
                                    <div className="flex gap-3">
                                       <button 
                                          onClick={() => handleEssayRate(false)}
                                          className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                       >
                                          <X className="w-5 h-5" /> Salah / Kurang Tepat
                                       </button>
                                       <button 
                                          onClick={() => handleEssayRate(true)}
                                          className="flex-1 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                       >
                                          <Check className="w-5 h-5" /> Benar / Mirip
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </>
                     )}

                  </div>
               )}
            </div>
         )}

         {/* FEEDBACK MODAL */}
         {feedbackModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
               <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border-4 text-center relative animate-scale-up ${
                  feedbackModal === 'CORRECT' 
                  ? 'bg-white dark:bg-gray-900 border-emerald-500' 
                  : 'bg-white dark:bg-gray-900 border-red-500'
               }`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                     feedbackModal === 'CORRECT' 
                     ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                     : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                     {feedbackModal === 'CORRECT' ? <ThumbsUp className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${
                     feedbackModal === 'CORRECT' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                     {feedbackModal === 'CORRECT' ? 'Selamat! Jawaban Benar' : 'Maaf, Jawaban Kurang Tepat'}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                     {feedbackModal === 'CORRECT' 
                        ? 'Selamat jawaban anda Benar dan poin anda bertambah, silahkan untuk melanjutkan ke pertanyaan selanjutnya' 
                        : 'Maaf jawaban anda salah atau kurang tepat silahkan coba lagi'}
                  </p>

                  <button 
                     onClick={handleNextFromFeedback}
                     className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                        feedbackModal === 'CORRECT' 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-red-600 hover:bg-red-700'
                     }`}
                  >
                     {feedbackModal === 'CORRECT' ? 'Lanjut Pertanyaan Berikutnya' : 'Coba Soal Lainnya'}
                     <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

export default QuizView;