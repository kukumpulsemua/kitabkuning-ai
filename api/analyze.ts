// This is a Vercel serverless function that acts as a secure proxy to the Google Gemini API.
// It reads one or more API keys from an environment variable, rotates through them,
// and forwards requests from the client. This keeps API keys off the client-side.

import { GoogleGenAI } from "@google/genai";

// A simple, stateful in-memory index for API key rotation.
let keyIndex = 0;

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Read API keys from the server's environment variable.
  // The variable should contain one or more keys, separated by commas.
  const apiKeys = process.env.GEMINI_API_KEYS?.split(',').map(k => k.trim()).filter(Boolean);

  if (!apiKeys || apiKeys.length === 0) {
    console.error("GEMINI_API_KEYS environment variable is not set or empty.");
    return res.status(500).json({ error: 'AI service is not configured on the server.' });
  }

  // 2. Rotate to the next available API key for basic load balancing.
  const apiKey = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length;

  try {
    // 3. Initialize the Gemini client with the selected key.
    const ai = new GoogleGenAI({ apiKey });

    // 4. Get the request payload (model, contents, config) from the client.
    const { model, contents, config } = req.body;
    
    if (!contents) {
        return res.status(400).json({ error: 'Request body must contain "contents".' });
    }

    // 5. Forward the request to the Google Gemini API.
    const responseData = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: contents,
      config: config
    });

    // 6. Send the successful response from Gemini back to the client.
    // The `res.json()` method automatically sets the Content-Type to application/json.
    return res.status(200).json(responseData);

  } catch (error: any) {
    // 7. Handle errors from the Gemini API.
    console.error(`Error using Gemini API with key ending in ...${apiKey.slice(-4)}:`, error.message);
    
    // Forward a generic but informative error to the client.
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'An unexpected error occurred with the AI service.';
    
    return res.status(statusCode).json({ error: errorMessage });
  }
}
