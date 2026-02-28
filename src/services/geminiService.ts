import { GoogleGenAI, Type } from "@google/genai";

export interface ExtractedTeaInfo {
  brand?: string;
  name?: string;
  sugar?: string;
  ice?: string;
  price?: number;
}

export const analyzeTeaImage = async (base64Image: string): Promise<ExtractedTeaInfo> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Extract mime type dynamically or default to jpeg
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
    // Remove the data URL prefix to get just the base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    // Use gemini-3-flash-preview for multimodal analysis with JSON support
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64
              }
            },
            {
              text: "Identify the bubble tea information from this image (receipt, label, or cup). Return a JSON object with: brand, name, sugar_level, ice_level, price. Translate all extracted text to Simplified Chinese. If a field is missing, omit it or use null. Keep strings short and concise."
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand: { type: Type.STRING },
            name: { type: Type.STRING },
            sugar_level: { type: Type.STRING },
            ice_level: { type: Type.STRING },
            price: { type: Type.NUMBER },
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const data = JSON.parse(jsonText);
    
    return {
      brand: data.brand,
      name: data.name,
      sugar: data.sugar_level,
      ice: data.ice_level,
      price: data.price
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};