import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Eye, BookOpen, Check, HelpCircle, GraduationCap, Sparkles, AlertCircle, Pencil, CheckCircle, Copy, Keyboard, Delete, X, Mic, MicOff, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { generateReadingPractice, evaluateReadingAnswer } from '../services/geminiService.ts';
import { PracticeMaterial } from '../types.ts';

interface ReadingPracticeViewProps {
  onBack: () => void;
}

const ARABIC_KEYS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ذ'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
];
const ARABIC_NUMBERS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];
const HARAKAT = ['َ', 'ِ', 'ُ', 'ً', 'ٍ', 'ٌ', 'ْ', 'ّ'];

const ReadingPracticeView: React.FC<ReadingPracticeViewProps> = ({ onBack }) => {
  const [material, setMaterial] = useState<PracticeMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'CORRECT' | 'INCORRECT' | null>(null);
  
  // State untuk Evaluasi AI
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState('');

  // Keyboard & Copy States
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Speech to Text State
  const [isListening, setIsListening] = useState(false);
  const [listeningLang, setListeningLang] = useState<'id-ID' | 'ar-SA' | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Timer ref for auto-next
  const nextQuestionTimer = useRef<number | null>(null);

  const fetchNewMaterial = async () => {
    setIsLoading(true);
    setIsRevealed(false);
    setFeedback(null);
    setUserAnswer('');
    setError(null);
    setIsKeyboardOpen(false);
    setEvaluationFeedback('');
    if (nextQuestionTimer.current) clearTimeout(nextQuestionTimer.current);
    try {
      const data = await generateReadingPractice();
      setMaterial(data);
    } catch (err) {
      console.error("Gagal memuat materi latihan:", err);
      setError("Gagal memuat materi. Ini bisa terjadi karena koneksi internet atau server AI sedang sibuk. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!material) fetchNewMaterial();
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (nextQuestionTimer.current) clearTimeout(nextQuestionTimer.current);
    };
  }, []);

  const handleCheckAnswer = async () => {
    if (!userAnswer.trim() || !material) return;
    
    setIsKeyboardOpen(false);
    setIsEvaluating(true);
    setFeedback(null);
    setEvaluationFeedback('');

    try {
        const result = await evaluateReadingAnswer(userAnswer, material.berharakat, material.translation);
        
        setEvaluationFeedback(result.feedback);
        
        if (result.isCorrect) {
            setFeedback('CORRECT');
            setIsRevealed(true);
            nextQuestionTimer.current = window.setTimeout(fetchNewMaterial, 3000); // Give user time to read feedback
        } else {
            setFeedback('INCORRECT');
            // Do not reveal answer, let user try again.
        }
    } catch (err) {
        console.error("Evaluation failed", err);
        setEvaluationFeedback("Gagal mengevaluasi jawaban. Coba lagi.");
        setFeedback('INCORRECT');
    } finally {
        setIsEvaluating(false);
        setTimeout(() => {
          const feedbackEl = document.getElementById('feedback-banner');
          if (feedbackEl) feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  };

  const handleRevealAnswer = () => {
    setIsRevealed(true);
    setEvaluationFeedback("Jangan berkecil hati, teruslah belajar! Berikut adalah jawaban yang benar.");
  };

  const handleCopyGundul = () => {
    if (material?.gundul) {
      navigator.clipboard.writeText(material.gundul);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeechToText = (lang: 'id-ID' | 'ar-SA') => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setListeningLang(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung fitur Speech to Text. Gunakan Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang; 
    recognition.onstart = () => { setIsListening(true); setListeningLang(lang); };
    recognition.onend = () => { setIsListening(false); setListeningLang(null); };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => { console.error("Speech error", event.error); setIsListening(false); setListeningLang(null); };
    recognition.start();
  };

  const handleVirtualKey = (char: string) => {
      const start = textAreaRef.current?.selectionStart ?? userAnswer.length;
      const end = textAreaRef.current?.selectionEnd ?? userAnswer.length;
      const newVal = userAnswer.substring(0, start) + char + userAnswer.substring(end);
      setUserAnswer(newVal);
      setTimeout(() => {
        textAreaRef.current?.focus();
        textAreaRef.current?.setSelectionRange(start + char.length, start + char.length);
      }, 0);
  };

  const handleBackspace = () => {
      const start = textAreaRef.current?.selectionStart ?? userAnswer.length;
      const end = textAreaRef.current?.selectionEnd ?? userAnswer.length;
      if (start === end && start > 0) {
        const newVal = userAnswer.substring(0, start - 1) + userAnswer.substring(end);
        setUserAnswer(newVal);
        setTimeout(() => {
           textAreaRef.current?.focus();
           textAreaRef.current?.setSelectionRange(start - 1, start - 1);
        }, 0);
      } else if (start !== end) {
        const newVal = userAnswer.substring(0, start) + userAnswer.substring(end);
        setUserAnswer(newVal);
        setTimeout(() => {
            textAreaRef.current?.focus();
            textAreaRef.current?.setSelectionRange(start, start);
         }, 0);
      }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 flex flex-col animate-fade-in">
      
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
         <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
               <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" /> Sorogan (Latihan Baca)
               </h2>
            </div>
         </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex-grow flex flex-col">
         
         {isLoading && !material ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">AI sedang menyusun soal...</p>
            </div>
         ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button onClick={fetchNewMaterial} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold">Coba Lagi</button>
            </div>
         ) : material ? (
            <div className="space-y-6 animate-slide-up">
               
               <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Sumber</span>
                     <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" /> {material.sourceBook}
                     </h3>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Topik</span>
                     <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">{material.topic}</span>
                  </div>
               </div>

               <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-amber-200 dark:border-amber-800 shadow-lg p-6 sm:p-8">
                  <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4">Teks Arab Gundul</h4>
                  <p className="font-arabic text-3xl sm:text-4xl leading-[2.2] text-gray-900 dark:text-gray-100 text-right dir-rtl mb-6" dir="rtl">{material.gundul}</p>
                  <div className="flex justify-end"><button onClick={handleCopyGundul} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600 transition-colors">{copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} {copied ? 'Tersalin' : 'Salin'}</button></div>
               </div>

               <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border transition-colors shadow-sm ${feedback === 'CORRECT' ? 'border-emerald-500' : feedback === 'INCORRECT' ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Pencil className="w-4 h-4" /> Coba Jawab (Tulis Bacaan/Arti)
                  </label>
                  <textarea ref={textAreaRef} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} disabled={isRevealed} placeholder="Tulis jawaban Anda di sini..." className={`w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 min-h-[100px] font-arabic text-lg ${isRevealed ? 'opacity-70 cursor-not-allowed' : ''}`} dir="auto" />
                  
                  {!isRevealed && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                       <button onClick={() => setIsKeyboardOpen(!isKeyboardOpen)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isKeyboardOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}><Keyboard size={14} /> Keyboard</button>
                       <button onClick={() => handleSpeechToText('id-ID')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${listeningLang === 'id-ID' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}><Mic size={14} /> Dikte</button>
                    </div>
                  )}

                  {isKeyboardOpen && !isRevealed && (
                     <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3 animate-slide-down"><div className="flex flex-col gap-2 select-none" dir="rtl"><div className="flex justify-center gap-1.5 pb-2 overflow-x-auto no-scrollbar">{HARAKAT.map(char=><button type="button" key={char} onClick={()=>handleVirtualKey(char)} className="w-8 h-8 text-lg bg-white rounded-full border hover:border-emerald-400 text-emerald-700 font-amiri shadow-sm">{char}</button>)}</div><div className="grid grid-cols-12 gap-1">{(showNumbers?ARABIC_NUMBERS:ARABIC_KEYS.flat()).map((char,i)=><button key={i} type="button" onClick={()=>handleVirtualKey(char)} className="h-9 text-lg bg-white rounded-md shadow-sm border hover:bg-emerald-50 transition-colors">{char}</button>)}</div><div className="flex gap-2 mt-1" dir="ltr"><button type="button" onClick={()=>setShowNumbers(!showNumbers)} className="px-3 py-1.5 bg-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-300">{showNumbers?'ABC':'123'}</button><button type="button" onClick={()=>handleSpeechToText('ar-SA')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${listeningLang === 'ar-SA'?'bg-red-100 text-red-600':'bg-gray-200 text-gray-600 hover:bg-gray-300'}`} title="Dikte Arab"><Mic className="w-4 h-4"/>AR</button><button type="button" onClick={()=>handleVirtualKey(' ')} className="flex-1 bg-white border rounded-lg text-xs shadow-sm hover:bg-gray-50">Spasi</button><button type="button" onClick={handleBackspace} className="px-3 py-1.5 bg-gray-200 rounded-lg text-red-500 hover:bg-red-100"><Delete className="w-4 h-4"/></button></div></div></div>
                  )}
               </div>

               {!isRevealed && (
                  <button 
                    onClick={handleCheckAnswer} 
                    disabled={!userAnswer.trim() || isEvaluating} 
                    className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                        !userAnswer.trim() || isEvaluating
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isEvaluating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin"/> Menganalisis Jawaban...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5"/> Cek Jawaban
                        </>
                    )}
                  </button>
               )}

               {feedback && (
                  <div id="feedback-banner" className={`rounded-xl p-4 border-2 flex items-start gap-3 animate-scale-up ${feedback==='CORRECT'?'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300':'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300'}`}>
                     <div className={`p-2 rounded-full ${feedback==='CORRECT'?'bg-green-100 text-green-600':'bg-orange-100 text-orange-600'}`}>{feedback==='CORRECT'?<ThumbsUp className="w-5 h-5"/>:<ThumbsDown className="w-5 h-5"/>}</div>
                     <div>
                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">{feedback==='CORRECT'?'MasyaAllah, Jawaban Benar!':'Jawaban Kurang Tepat'}</h4>
                        <p className="text-xs opacity-90">{evaluationFeedback}</p>
                        {feedback === 'CORRECT' && <p className="text-xs opacity-90 mt-1">Soal berikutnya akan dimuat...</p>}
                     </div>
                  </div>
               )}

               {feedback === 'INCORRECT' && !isRevealed && (
                  <div className="text-center mt-4 animate-fade-in">
                      <button 
                          onClick={handleRevealAnswer}
                          className="text-xs font-bold text-gray-500 underline hover:text-emerald-600"
                      >
                          Menyerah & Lihat Jawaban
                      </button>
                  </div>
               )}

               {isRevealed && (
                  <div className="space-y-6 animate-slide-down">
                     <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
                        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Check className="w-4 h-4"/> Kunci Jawaban</h4>
                        <p className="font-arabic text-2xl sm:text-3xl leading-[2.2] text-emerald-900 dark:text-emerald-100 text-right mb-4" dir="rtl">{material.berharakat}</p>
                        <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800"><p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed">"{material.translation}"</p></div>
                     </div>
                     <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500"/> Analisis I'rob</h4>
                        <div className="grid gap-3">{material.analysis.map((item,idx)=><div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><span className="font-arabic font-bold text-lg">{item.word}</span><span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">{item.irob}</span></div>)}</div>
                     </div>
                  </div>
               )}

               {isRevealed && feedback !== 'CORRECT' && (
                  <button onClick={fetchNewMaterial} className="w-full py-4 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-sm animate-fade-in"><RefreshCw className="w-5 h-5"/> Lanjut Soal Berikutnya</button>
               )}
            </div>
         ) : null}
      </div>
    </div>
  );
};

export default ReadingPracticeView;