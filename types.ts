


export interface TranslationResult {
  arabicText: string;
  translationIndonesia: string;
  maknaGandul: string;
  nahwuShorofAnalysis: GrammarPoint[];
  lughahAnalysis: VocabularyPoint[];
  balaghahAnalysis?: BalaghahAnalysis;
  tafsirContext: string;
  scientificAnalysis?: ScientificAnalysis; // New Field for Multi-discipline
  referenceSource?: ReferenceSource;
  relatedReferences?: RelatedReference[];
  similarVerses?: TextReference[]; // NEW: Munasabah Ayat
  similarHadiths?: TextReference[]; // NEW: Syawahid Hadits
}

export interface BalaghahAnalysis {
  bayan?: RhetoricPoint[];
  maani?: RhetoricPoint[];
  badi?: RhetoricPoint[];
}

export interface TextReference {
  arabic: string;
  translation: string;
  reference: string; // Nama Surat/Ayat atau Perawi
  relevance: string; // Hubungan makna (Munasabah)
}

export interface ScientificAnalysis {
  tajwid?: AnalysisPoint[]; // Added Tajwid specifically
  mantiq?: AnalysisPoint[];
  ushulFiqh?: AnalysisPoint[];
  tauhid?: AnalysisPoint[];
  hadith?: AnalysisPoint[];
  tarikh?: AnalysisPoint[];
  falak?: AnalysisPoint[];
  qiraat?: AnalysisPoint[];
  tafsir?: AnalysisPoint[]; 
}

export interface AnalysisPoint {
  term: string; // Istilah kunci (misal: Idgham Bighunnah, Qiyas, Premis Mayor)
  explanation: string;
}

export interface ReferenceSource {
  type: 'QURAN' | 'HADITH' | 'KITAB' | 'ULAMA_QUOTE' | 'POETRY' | 'UNKNOWN' | 'DICTIONARY';
  title: string; 
  author?: string; 
  chapter?: string; 
  detail: string; 
}

export interface RelatedReference {
  title: string;
  author: string;
  relevance: string; 
  relationType?: 'MATAN' | 'SYARAH' | 'HASHIYAH' | 'SIMILAR_TOPIC' | 'OTHER'; // NEW: Jenis hubungan kitab
}

export interface GrammarPoint {
  word: string;
  role: string;
  explanation: string;
}

export interface VocabularyPoint {
  word: string;
  meaning: string;
}

export interface RhetoricPoint {
  feature: string;
  explanation: string;
}

// Interface for AI Book Explanation
export interface BookExplanation {
  title: string;
  author: string;
  field: string; // Fan Ilmu (e.g., Fiqh Syafi'i, Nahwu)
  period: string; // Abad ke berapa / Tahun wafat
  author_life_period?: string; // NEW: Konsistensi Tahun Lahir/Wafat Pengarang
  summary: string; // Ringkasan isi kitab
  keyTopics: string[]; // Poin bahasan utama
  significance: string; // Kenapa kitab ini penting?
}

// New Interface for Author Biography
export interface AuthorExplanation {
  name: string;
  title_honorific: string; // Gelar (e.g., Hujjatul Islam, Syaikhul Islam)
  life_period: string; // Tahun Lahir - Wafat (Hijriah & Masehi)
  bio_summary: string; // Ringkasan perjalanan hidup & keilmuan
  specialization: string; // Bidang keilmuan utama yang dikuasai
  teachers: string[]; // Nama guru-guru terkenal
  students: string[]; // Nama murid-murid terkenal
  major_works: string[]; // Daftar karya tulis terkenal lainnya
  influence: string; // Pengaruhnya dalam dunia Islam
}

// --- LIBRARY INTERFACES ---
export interface LibraryBookMetadata {
  title: string;
  author: string;
  authorPeriod?: string; // NEW: Tahun Lahir/Wafat
  description: string;
  chapters: string[]; // List of Chapter Titles (Bab)
}

export interface ChapterContent {
  chapterTitle: string;
  arabicContent: string; // Teks Arab Matan
  translation: string; // Terjemahan Indonesia
  keyPoints: string[]; // Poin-poin penting dari bab ini
}

export enum AnalysisMode {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}

export interface AppSettings {
  arabicFont: 'scheherazade' | 'amiri';
  latinFont: 'sans' | 'serif';
  textSize: 'small' | 'medium' | 'large';
  darkMode: boolean;
  // customApiKey?: string; // FX-981: Removed custom API key to align with guidelines
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  arabicPreview: string;
  translationPreview: string;
  fullResult: TranslationResult;
}

// Schema for Practice Material (Latihan Baca)
export interface PracticeMaterial {
  sourceBook: string;
  topic: string;
  gundul: string;
  berharakat: string;
  translation: string;
  analysis: { word: string; irob: string }[];
}

// Schema for Quiz Question (Multiple Choice)
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Schema for Essay/Challenge Question
export interface EssayQuestion {
  type: 'SOROGAN' | 'SAMBUNG_AYAT' | 'TEBAK_TOKOH' | 'FIQIH_KASUS' | 'KAIDAH';
  question: string; // Soal utama (Teks gundul / Potongan ayat / Kasus)
  clue?: string; // Petunjuk tambahan
  answerKey: string; // Jawaban lengkap/benar
  explanation: string; // Penjelasan jawaban
}