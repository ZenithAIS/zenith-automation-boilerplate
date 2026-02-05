
import { GoogleGenAI, Type } from "@google/genai";
import { ScaffoldingContext } from "../types";

export const customizeScaffold = async (context: ScaffoldingContext) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    I am building a Python automation microservice with the following context:
    Name: ${context.projectName}
    Description: ${context.description}
    Type: ${context.automationType}
    Features: ${context.useRedis ? 'Redis' : ''} ${context.usePostgres ? 'PostgreSQL' : ''}
    
    Please provide specialized content for:
    1. src/main.py (The main entry point with boilerplate for the specific type of automation)
    2. requirements.txt (Adding relevant libraries for the chosen type)
    3. .env.example (Relevant config keys)
    4. README.md (Brief setup guide)

    Return the result strictly as a JSON object where keys are the file paths and values are the file content strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            "src/main.py": { type: Type.STRING },
            "requirements.txt": { type: Type.STRING },
            ".env.example": { type: Type.STRING },
            "README.md": { type: Type.STRING },
          },
          required: ["src/main.py", "requirements.txt", ".env.example", "README.md"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini customization failed", error);
    return null;
  }
};
