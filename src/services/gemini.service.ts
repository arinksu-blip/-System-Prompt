
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // This is a placeholder for the API key.
    // In a real production environment, this should be handled securely.
    const apiKey = (process.env as any).API_KEY;
    if (!apiKey) {
      console.error('API_KEY environment variable not set.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string): Promise<string> {
    if (!(process.env as any).API_KEY) {
      return Promise.reject(new Error('Klucz API nie jest skonfigurowany.'));
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Wystąpił błąd podczas komunikacji z AI. Spróbuj ponownie.');
    }
  }
}
