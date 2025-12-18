
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJsonString = (str: string): string => {
  return str.replace(/^```json\s*/, '').replace(/\s*```$/, '');
};

export const generateMarketIntelligence = async (
  url: string, 
  selectedScenarioIds: string[]
): Promise<AnalysisResult> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Use the recommended Gemini 3 Flash model for basic text analysis tasks
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are an expert Senior Market Intelligence Analyst. 
    Analyze the following company URL: ${url}.
    
    The user is interested in the following specific intelligence scenarios: 
    ${selectedScenarioIds.join(', ')}.

    Based on the URL (which you should use your internal knowledge base to identify if it's a known company, or infer from the domain name), provide a structured analysis.
    
    Return the response strictly as valid JSON matching the following structure:
    {
      "summary": "A high-level executive summary of the company.",
      "competitors": ["Competitor A", "Competitor B", "Competitor C"],
      "swot": {
        "strengths": ["..."],
        "weaknesses": ["..."],
        "opportunities": ["..."],
        "threats": ["..."]
      },
      "battleCard": {
        "killPoints": ["..."],
        "objectionHandling": ["..."]
      }
    }

    Ensure the tone is professional, insightful, and actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        // Configure responseSchema for more reliable and structured JSON output as per world-class standards
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
              }
            },
            battleCard: {
              type: Type.OBJECT,
              properties: {
                killPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                objectionHandling: { type: Type.ARRAY, items: { type: Type.STRING } },
              }
            }
          }
        }
      }
    });

    // Access text property directly from GenerateContentResponse
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsedData = JSON.parse(cleanJsonString(text)) as AnalysisResult;
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate intelligence report. Please try again.");
  }
};
