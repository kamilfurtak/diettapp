
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Meal } from '../models/meal.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = import.meta.env.NG_APP_GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn('NG_APP_GEMINI_API_KEY is not set. AI features will be disabled.');
    }
  }

  async analyzeMealPhoto(base64Image: string): Promise<Meal[]> {
    if (!this.ai) {
      throw new Error('NG_APP_GEMINI_API_KEY is not configured. Please set it in your environment to use AI features.');
    }

    const prompt = `Analyze the food items in this image. For each item, estimate its nutritional content. Provide the response as a JSON array where each object represents a food item and has the following properties: 'name' (string), 'calories' (number), 'protein' (number, in grams), 'carbs' (number, in grams), and 'fat' (number, in grams). If you cannot identify any food, return an empty array.`;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = { text: prompt };

    const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
          },
          required: ['name', 'calories', 'protein', 'carbs', 'fat']
        }
      };

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
      });

      // @ts-ignore
      const jsonString = response.text.trim();
      const result = JSON.parse(jsonString);
      return result as Meal[];

    } catch (error) {
      console.error('Error analyzing image with Gemini API:', error);
      throw new Error('Failed to analyze meal. Please try again.');
    }
  }
}
