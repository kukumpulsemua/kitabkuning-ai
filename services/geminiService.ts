import { Type } from "@google/genai";
import { TranslationResult, BookExplanation, AuthorExplanation, LibraryBookMetadata, ChapterContent, PracticeMaterial, QuizQuestion, EssayQuestion } from "../types.ts";
import * as supabaseService from './supabaseService.ts';

// Helper: Simple Hash untuk membuat Key unik dari string panjang
const generateHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};


// --- HELPER: BACKEND PROXY CALLER ---
const generateContentFromBackend = async (payload: { model?: string; contents: any; config?: any; analysisType?: string; cacheId?: string; }) => {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.statusText}` }));
        throw new Error(errorData.error || `An error occurred: ${response.status}`);
    }

    return response.json();
};


// --- HELPER: SAFE JSON PARSE (AUTO REPAIR TRUNCATED JSON) ---
const safeJsonParse = (jsonStr: string, fallbackValue: any = null) => {
  if (!jsonStr || typeof jsonStr !== 'string' || !jsonStr.trim()) {
      if (fallbackValue) return fallbackValue;
      throw new Error("Respon AI kosong atau tidak valid.");
  }

  let cleanStr = jsonStr.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
  
  try {
    return JSON.parse(cleanStr);
  } catch (e) {
    console.warn("JSON Parse failed, attempting repair...", e);
    
    // Simple repair logic (can be improved)
    let repaired = cleanStr.trim();
    const stack = []; let inString = false;
    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (char === '"' && (i === 0 || repaired[i-1] !== '\\')) inString = !inString; 
      if (!inString) {
        if (char === '{') stack.push('}');
        else if (char === '[') stack.push(']');
        else if (char === '}' || char === ']') {
          if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop();
        }
      }
    }
    while (stack.length > 0) repaired += stack.pop();

    try {
      return JSON.parse(repaired);
    } catch (e2) {
      console.error("JSON Repair failed completely.", e2);
      if (fallbackValue) return fallbackValue;
      throw new Error("Format data AI rusak. Silakan coba lagi.");
    }
  }
};


// --- HELPER: EXTRACT TEXT FROM RESPONSE ---
const extractTextFromResponse = (responseData: any): string => {
  if (!responseData) throw new Error("Menerima respons kosong dari AI.");
  if (responseData.candidates?.[0]?.finishReason === 'SAFETY') throw new Error("Konten diblokir oleh filter keamanan AI (Safety Filter).");
  
  const text = responseData.text;
  if (typeof text === 'string' && text.trim()) return text;
  
  const firstPartText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof firstPartText === 'string' && firstPartText.trim()) return firstPartText;
  
  throw new Error("Gagal mengekstrak teks dari respons AI. Format tidak terduga atau teks kosong.");
};

// --- SCHEMAS (Defined as before) ---
const analysisPointSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { term: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["term", "explanation"] } };
const textReferenceSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, translation: { type: Type.STRING }, reference: { type: Type.STRING }, relevance: { type: Type.STRING } }, required: ["arabic", "translation", "reference", "relevance"] } };
const rhetoricPointArraySchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { feature: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["feature", "explanation"] } };

const bookExplanationSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, author: { type: Type.STRING }, field: { type: Type.STRING }, period: { type: Type.STRING }, author_life_period: { type: Type.STRING }, summary: { type: Type.STRING }, keyTopics: { type: Type.ARRAY, items: { type: Type.STRING } }, significance: { type: Type.STRING } }, required: ["title", "author", "field", "summary", "keyTopics", "significance", "author_life_period"] };
const authorExplanationSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, title_honorific: { type: Type.STRING }, life_period: { type: Type.STRING }, bio_summary: { type: Type.STRING }, specialization: { type: Type.STRING }, teachers: { type: Type.ARRAY, items: { type: Type.STRING } }, students: { type: Type.ARRAY, items: { type: Type.STRING } }, major_works: { type: Type.ARRAY, items: { type: Type.STRING } }, influence: { type: Type.STRING } }, required: ["name", "title_honorific", "life_period", "bio_summary", "major_works", "influence", "teachers", "students"] };
const translationSchema = { type: Type.OBJECT, properties: { arabicText: { type: Type.STRING }, translationIndonesia: { type: Type.STRING }, maknaGandul: { type: Type.STRING }, nahwuShorofAnalysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, role: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["word", "role", "explanation"] } }, lughahAnalysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["word", "meaning"] } }, balaghahAnalysis: { type: Type.OBJECT, properties: { bayan: rhetoricPointArraySchema, maani: rhetoricPointArraySchema, badi: rhetoricPointArraySchema } }, scientificAnalysis: { type: Type.OBJECT, properties: { tajwid: analysisPointSchema, qiraat: analysisPointSchema, tafsir: analysisPointSchema, mantiq: analysisPointSchema, ushulFiqh: analysisPointSchema, tauhid: analysisPointSchema, hadith: analysisPointSchema, tarikh: analysisPointSchema, falak: analysisPointSchema } }, tafsirContext: { type: Type.STRING }, referenceSource: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['QURAN', 'HADITH', 'KITAB', 'ULAMA_QUOTE', 'POETRY', 'UNKNOWN', 'DICTIONARY'] }, title: { type: Type.STRING }, author: { type: Type.STRING }, chapter: { type: Type.STRING }, detail: { type: Type.STRING } } }, relatedReferences: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, author: { type: Type.STRING }, relevance: { type: Type.STRING }, relationType: { type: Type.STRING, enum: ['MATAN', 'SYARAH', 'HASHIYAH', 'SIMILAR_TOPIC', 'OTHER'] } } } }, similarVerses: textReferenceSchema, similarHadiths: textReferenceSchema }, required: ["arabicText", "translationIndonesia", "maknaGandul", "nahwuShorofAnalysis", "lughahAnalysis", "tafsirContext"] };
const libraryBookSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, author: { type: Type.STRING }, authorPeriod: { type: Type.STRING }, description: { type: Type.STRING }, chapters: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "author", "authorPeriod", "description", "chapters"] };
const chapterContentSchema = { type: Type.OBJECT, properties: { chapterTitle: { type: Type.STRING }, arabicContent: { type: Type.STRING }, translation: { type: Type.STRING }, keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["chapterTitle", "arabicContent", "translation", "keyPoints"] };
const practiceMaterialSchema = { type: Type.OBJECT, properties: { sourceBook: { type: Type.STRING }, topic: { type: Type.STRING }, gundul: { type: Type.STRING }, berharakat: { type: Type.STRING }, translation: { type: Type.STRING }, analysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, irob: { type: Type.STRING } } } } }, required: ["sourceBook", "topic", "gundul", "berharakat", "translation", "analysis"] };
const quizQuestionSchema = { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctIndex: { type: Type.INTEGER }, explanation: { type: Type.STRING } }, required: ["question", "options", "correctIndex", "explanation"] };
const essayQuestionSchema = { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['SOROGAN', 'SAMBUNG_AYAT', 'TEBAK_TOKOH', 'FIQIH_KASUS', 'KAIDAH'] }, question: { type: Type.STRING }, clue: { type: Type.STRING }, answerKey: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["type", "question", "answerKey", "explanation"] };

// --- MAIN ANALYSIS FUNCTION ---
export const analyzeKitabText = async (
  text: string,
  imageBase64?: string
): Promise<TranslationResult> => {
  const parts: any[] = [];
  if (imageBase64) {
    let mimeType = "image/jpeg"; let data = imageBase64;
    const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
    if (match) { mimeType = match[1]; data = match[2]; }
    parts.push({ inlineData: { data: data, mimeType: mimeType } });
    parts.push({ text: "Transkripsikan dan analisis teks kitab ini." });
  }
  if (text) parts.push({ text: `Analisis input ini: "${text}".` });

  const contents = { parts };
  const hash = generateHash(JSON.stringify(contents));
  
  // 1. Check public cache first
  const cached = await supabaseService.getPublicAnalysis(hash);
  if (cached) {
      console.log("Public cache hit for analysis.");
      return cached;
  }

  // 2. If not in cache, call AI via backend
  const payload = {
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: `Anda adalah 'Allamah (Sangat Alim), Ahli Tahqiq (Peneliti Kitab), dan Pakar Bahasa Arab...`,
      responseMimeType: "application/json",
      responseSchema: translationSchema,
      temperature: 0.3,
    },
    analysisType: 'text_analysis'
  };

  const responseData = await generateContentFromBackend(payload);
  const cleanText = extractTextFromResponse(responseData);
  if (!cleanText) throw new Error("Empty response text from AI.");

  const result = safeJsonParse(cleanText) as TranslationResult;
  return result; // The backend now handles saving to public cache
};

// --- LIBRARY & BIO FUNCTIONS (WITH PUBLIC CACHING) ---
export const getBookTableOfContents = async (bookTitle: string): Promise<LibraryBookMetadata> => {
    const bookId = bookTitle.toLowerCase().replace(/ /g, '_').replace(/[^\w-]/g, '');
    
    // 1. Check public cache
    const cached = await supabaseService.getPublicBookMetadata(bookId);
    if (cached) {
        console.log("Public cache hit for book metadata:", bookTitle);
        return cached;
    }

    // 2. Call AI via backend
    const payload = {
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: `Buatkan Metadata lengkap untuk kitab: "${bookTitle}" dalam Bahasa Indonesia... JSON output.` }] },
        config: { responseMimeType: "application/json", responseSchema: libraryBookSchema },
        analysisType: 'book_metadata',
        cacheId: bookId
    };

    const responseData = await generateContentFromBackend(payload);
    const text = extractTextFromResponse(responseData);
    return safeJsonParse(text) as LibraryBookMetadata;
};

export const explainAuthor = async (authorName: string): Promise<AuthorExplanation> => {
    const authorId = authorName.toLowerCase().replace(/ /g, '_').replace(/[^\w-]/g, '');
    
    // 1. Check public cache
    const cached = await supabaseService.getPublicAuthorBio(authorId);
    if (cached) {
        console.log("Public cache hit for author bio:", authorName);
        return cached;
    }

    // 2. Call AI via backend
    const payload = {
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: `Buatkan biografi ulama: "${authorName}"... JSON Output.` }] },
        config: { responseMimeType: "application/json", responseSchema: authorExplanationSchema },
        analysisType: 'author_bio',
        cacheId: authorId
    };
    
    const responseData = await generateContentFromBackend(payload);
    const text = extractTextFromResponse(responseData);
    return safeJsonParse(text) as AuthorExplanation;
};

// --- NON-CACHED FUNCTIONS (QUIZZES, ETC) ---
// These don't need public caching as they should be unique each time.

export const generateReadingPractice = async (): Promise<PracticeMaterial> => {
  const topics = ["Thaharah", "Shalat", "Zakat", "Puasa", "Haji", "Jual Beli", "Nikah", "Jinayat"];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const prompt = `Anda adalah seorang Ustadz... Buatkan satu materi latihan singkat... topik: "${randomTopic}".`;

  const payload = {
    model: "gemini-2.5-flash",
    contents: { parts: [{ text: prompt }] },
    config: { responseMimeType: "application/json", responseSchema: practiceMaterialSchema }
  };

  const responseData = await generateContentFromBackend(payload);
  const text = extractTextFromResponse(responseData);
  return safeJsonParse(text) as PracticeMaterial;
};

export const generateQuizQuestion = async (topic: string, difficulty: string): Promise<QuizQuestion> => {
  const payload = {
    model: "gemini-2.5-flash",
    contents: { parts: [{ text: `Buatkan soal kuis Pilihan Ganda topik "${topic}" tingkat "${difficulty}". JSON: question, options, correctIndex, explanation.` }] },
    config: { responseMimeType: "application/json", responseSchema: quizQuestionSchema }
  };
  const responseData = await generateContentFromBackend(payload);
  const text = extractTextFromResponse(responseData);
  return safeJsonParse(text) as QuizQuestion;
};

export const generateEssayQuestion = async (topic: string, difficulty: string): Promise<EssayQuestion> => {
  const payload = {
    model: "gemini-2.5-flash",
    contents: { parts: [{ text: `Buatkan soal ESAI/Tantangan topik "${topic}" tingkat "${difficulty}". JSON output.` }] },
    config: { responseMimeType: "application/json", responseSchema: essayQuestionSchema }
  };
  const responseData = await generateContentFromBackend(payload);
  const text = extractTextFromResponse(responseData);
  return safeJsonParse(text) as EssayQuestion;
};

export const evaluateReadingAnswer = async ( userAnswer: string, correctArabic: string, correctTranslation: string ): Promise<{ isCorrect: boolean; feedback: string }> => {
  const schema = { type: Type.OBJECT, properties: { isCorrect: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } }, required: ["isCorrect", "feedback"] };
  const payload = {
    model: "gemini-2.5-flash",
    contents: { parts: [{ text: `Anda adalah Ustadz... Kunci Jawaban... Jawaban Santri: "${userAnswer}"... Evaluasi... JSON: { "isCorrect": boolean, "feedback": string }` }] },
    config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.2 }
  };
  const responseData = await generateContentFromBackend(payload);
  const text = extractTextFromResponse(responseData);
  return safeJsonParse(text) as { isCorrect: boolean; feedback: string };
};

// Deprecated functions that are no longer needed with the public cache system
export const getChapterContent = async (bookTitle: string, chapterTitle: string): Promise<ChapterContent> => {
  throw new Error("getChapterContent is deprecated. Use local JSON files or a public database.");
};
export const explainBook = async (title: string, author?: string): Promise<BookExplanation> => {
  throw new Error("explainBook is deprecated. Use public database cache.");
};
export const explainSpecificTopic = async (bookTitle: string, topic: string): Promise<string> => {
   throw new Error("explainSpecificTopic is deprecated.");
};
