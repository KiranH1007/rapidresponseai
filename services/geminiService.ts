import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { AnalysisResult, Location, ChatMessage } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const startAnalysisChat = async (
  description: string,
  image: File | null,
  location: Location
): Promise<{ analysis: AnalysisResult; chat: Chat; initialHistory: ChatMessage[] }> => {
  const model = "gemini-2.5-flash";
  const systemInstruction = "You are an AI assistant for emergency situations. First, analyze the accident report to assess severity, provide a summary for emergency services, suggest immediate actions, and identify nearby hospitals, returning this as a JSON object. After that, answer follow-up questions helpfully and concisely. Prioritize safety and clarity.";

  const userMessageParts = [
    { text: `Analyze the following accident scene and return a JSON object with your assessment. Do not add any other text outside the JSON. Description: ${description}. Location: Latitude ${location.latitude}, Longitude ${location.longitude}.` },
  ];

  if (image) {
    const imagePart = await fileToGenerativePart(image);
    userMessageParts.push(imagePart as any);
  }
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      severity: {
        type: Type.STRING,
        description: "Assess the severity as 'Minor', 'Moderate', or 'Critical'.",
      },
      summary: {
        type: Type.STRING,
        description: "A concise paragraph summary for first responders.",
      },
      immediateActions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "A list of crucial first aid or safety steps.",
      },
      nearbyHospitals: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            address: { type: Type.STRING },
          },
          required: ["name", "address"],
        },
        description: "A list of 3 nearby major hospitals based on the location.",
      },
    },
    required: ["severity", "summary", "immediateActions", "nearbyHospitals"],
  };

  try {
    // FIX: Use models.generateContent for the initial request to enforce a JSON response schema.
    // The chat session is then initialized with the history from this first exchange.
    const response = await ai.models.generateContent({
        model,
        contents: { parts: userMessageParts },
        config: {
            responseMimeType: "application/json",
            responseSchema,
            systemInstruction,
        }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as AnalysisResult;

    const chat = ai.chats.create({
      model,
      history: [
        { role: 'user', parts: userMessageParts },
        { role: 'model', parts: [{ text: jsonText }] },
      ],
      config: {
        systemInstruction,
      }
    });

    // We don't show the initial complex prompt to the user,
    // so we create a simplified history for display purposes.
    const initialHistory: ChatMessage[] = [
      { role: 'user', text: 'Submitted an emergency report.' },
      { role: 'model', text: 'Analysis complete. You can now ask follow-up questions.' }
    ];

    return { analysis: result, chat, initialHistory };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid analysis from the AI. The model may be overloaded or the input is invalid.");
  }
};
