import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const fetchQuestions = async (count: number = 5): Promise<Question[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Generate ${count} unique and challenging multiple-choice quiz questions about Chinese Emperors and their Posthumous Titles (谥号).
    
    Requirements:
    1. "emperorName": The name of the emperor (e.g., 拓跋宏, 刘彻, 李世民).
    2. "dynasty": The dynasty they belonged to (e.g., 北魏, 汉朝, 唐朝).
    3. "correctTitle": The correct posthumous title (e.g., 孝文皇帝, 孝武皇帝). Just the main title characters (e.g., 孝文) is also fine if commonly known as such.
    4. "options": An array of 4 strings. One must be the correct title, and 3 must be plausible but incorrect fake titles.
    5. "hint": A subtle hint about their achievements or personality.
    6. "description": A very brief 1-sentence bio.
    
    Ensure the distractors (wrong options) are tricky (e.g., similar characters or titles of other famous emperors).
    Focus on famous emperors but mix in one or two slightly harder ones.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              emperorName: { type: Type.STRING },
              dynasty: { type: Type.STRING },
              correctTitle: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              hint: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["emperorName", "dynasty", "correctTitle", "options", "hint", "description"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    // Shuffle options and add IDs
    return data.map((q: any) => ({
      ...q,
      id: generateId(),
      // Ensure options are shuffled for display (though Gemini usually randomizes, it's safer to do it here too)
      options: q.options.sort(() => Math.random() - 0.5)
    }));

  } catch (error) {
    console.error("Failed to fetch questions:", error);
    // Fallback data in case of API failure to prevent app crash
    return [
      {
        id: "fallback-1",
        emperorName: "拓跋宏",
        dynasty: "北魏",
        correctTitle: "孝文",
        options: ["孝文", "孝武", "文成", "献文"].sort(() => Math.random() - 0.5),
        hint: "他推行了汉化改革，迁都洛阳。",
        description: "北魏著名改革家，鲜卑族汉化的关键推动者。"
      },
      {
        id: "fallback-2",
        emperorName: "刘彻",
        dynasty: "西汉",
        correctTitle: "孝武",
        options: ["孝武", "孝文", "孝景", "高祖"].sort(() => Math.random() - 0.5),
        hint: "他击败匈奴，开通丝绸之路，罢黜百家独尊儒术。",
        description: "汉朝国力极盛时期的皇帝。"
      }
    ];
  }
};