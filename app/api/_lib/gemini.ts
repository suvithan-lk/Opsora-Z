import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return aiClient;
}
