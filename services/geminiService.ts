import { GoogleGenAI, Type } from "@google/genai";
import { MenuData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts menu information from an image using Gemini 2.5 Flash.
 */
export const extractMenuFromImage = async (base64Image: string): Promise<MenuData> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Analyze the attached restaurant menu image. 
    Extract the restaurant name, the meal title (e.g. "Almoço de Hoje"), the list of food items, the price, and the phone number.
    
    If the currency is in R$ (BRL), format the price as a number.
    Clean the phone number to be digits only.
    Return the data in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG/PNG, the API is flexible with common image types
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restaurantName: { type: Type.STRING },
            title: { type: Type.STRING },
            items: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            price: { type: Type.NUMBER },
            phone: { type: Type.STRING },
          },
          required: ["restaurantName", "items", "price"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No text returned from Gemini.");
    }

    const data = JSON.parse(jsonText) as MenuData;
    return data;

  } catch (error) {
    console.error("Error extracting menu data:", error);
    throw error;
  }
};
