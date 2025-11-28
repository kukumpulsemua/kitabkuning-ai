import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

let keyIndex = 0;

// Helper to create a consistent hash for caching
const generateHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { model, contents, config, analysisType, cacheId } = req.body;
  
  if (!contents) {
    return res.status(400).json({ error: 'Request body must contain "contents".' });
  }

  // --- Initialize Supabase Admin Client (for writing) ---
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase Admin credentials are not configured on the server.");
      // Don't block the request, just proceed without caching
  }
  
  const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');


  // --- Gemini API Call ---
  const apiKeys = process.env.GEMINI_API_KEYS?.split(',').map(k => k.trim()).filter(Boolean);
  if (!apiKeys || apiKeys.length === 0) {
    return res.status(500).json({ error: 'AI service is not configured on the server.' });
  }

  const apiKey = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const responseData = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: contents,
      config: config
    });

    // --- After successful AI call, save result to public cache ---
    if (supabaseAdmin && responseData) {
        try {
            const resultText = responseData.text;
            if (resultText) {
                const fullResult = JSON.parse(resultText);

                switch(analysisType) {
                    case 'text_analysis':
                        await supabaseAdmin.from('public_analyses').insert({
                            source_text_hash: generateHash(JSON.stringify(contents)),
                            source_text: contents.parts[0].text,
                            full_result: fullResult,
                        });
                        break;
                    case 'book_metadata':
                        if (cacheId) {
                            await supabaseAdmin.from('public_book_metadata').insert({
                                id: cacheId,
                                full_metadata: fullResult,
                            });
                        }
                        break;
                    case 'author_bio':
                         if (cacheId) {
                            await supabaseAdmin.from('public_author_bios').insert({
                                id: cacheId,
                                full_bio: fullResult,
                            });
                        }
                        break;
                }
            }
        } catch (dbError: any) {
            // Log DB error but don't fail the request, user should still get the AI response
            console.error("Supabase write error:", dbError.message);
        }
    }
    
    return res.status(200).json(responseData);

  } catch (error: any) {
    console.error(`Gemini API Error with key ...${apiKey.slice(-4)}:`, error.message);
    const statusCode = error.status || 500;
    
    if (error.message && error.message.includes("API key not valid")) {
       return res.status(401).json({ error: "Kunci API yang digunakan di server tidak valid." });
    }
    if (error.message && error.message.includes("referer")) {
       return res.status(403).json({ error: "Kunci API Anda diblokir oleh Google karena pembatasan 'HTTP Referer'. Buka Google AI Studio, edit Kunci API Anda, dan setel pembatasan ke 'None' (Tidak ada) untuk mengizinkan akses dari server." });
    }

    return res.status(statusCode).json({ error: error.message || 'An unexpected error occurred with the AI service.' });
  }
}
