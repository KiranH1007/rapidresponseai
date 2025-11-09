import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { AnalysisResult, Location, ChatMessage, NearbyResource } from '../types';

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
  
  // Get the API key from environment variables when the function is called.
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
      throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const model = "gemini-2.5-flash";
  const systemInstruction = "You are a highly efficient and concise **Emergency Triage and Incident Analyst**. Your primary function is to immediately assess the severity of an incident based on the user's text description, uploaded image (if provided), and location.\n\nYour response MUST STRICTLY adhere to the provided JSON Schema blueprint. Do not generate any conversational text, introductory phrases, or explanations outside of the JSON object itself.\n\nYour analysis must prioritize safety, speed, and actionable advice for first responders or bystanders. When determining the action list, focus on immediate safety, calling for help, and basic stabilization steps.\n\nDetermine the 'severity' based on potential loss of life, severe injury, or imminent danger (e.g., active fire, severe bleeding, entrapment).";

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
        description: "The assessed severity of the incident.",
        enum: ["Critical", "Severe", "Moderate", "Minor"],
      },
      summary: {
        type: Type.STRING,
        description: "A brief, factual summary of the incident and key findings from the image/text.",
      },
      actionList: {
        type: Type.ARRAY,
        description: "A concise, prioritized list of immediate, life-saving steps to take (3-5 steps).",
        items: {
          type: Type.STRING,
        },
      },
      resourceType: {
        type: Type.STRING,
        description: "The primary emergency resource needed for the location query.",
        enum: ["Hospital", "Fire_Rescue", "Police", "Ambulance"],
      },
    },
    required: ["severity", "summary", "actionList", "resourceType"],
  };

  try {
    // Step 1: Get the initial analysis from Gemini
    const analysisResponse = await ai.models.generateContent({
        model,
        contents: { parts: userMessageParts },
        config: {
            responseMimeType: "application/json",
            responseSchema,
            systemInstruction,
        }
    });

    const jsonText = analysisResponse.text.trim();
    const analysisPart = JSON.parse(jsonText);
    
    // Step 2: Use the determined resourceType to find nearby locations with Maps grounding
    let resourceQuery = analysisPart.resourceType;
    if (resourceQuery === 'Fire_Rescue') resourceQuery = 'Fire Stations';
    if (resourceQuery === 'Ambulance') resourceQuery = 'Hospitals';
    
    let nearbyResources: NearbyResource[] = [];
    try {
        const groundingResponse = await ai.models.generateContent({
            model,
            contents: `Find nearby ${resourceQuery} to Latitude ${location.latitude}, Longitude ${location.longitude}.`,
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.latitude,
                            longitude: location.longitude
                        }
                    }
                }
            }
        });

        const groundingChunks = groundingResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        nearbyResources = groundingChunks
            .filter(chunk => chunk.maps?.uri && chunk.maps?.title)
            .map(chunk => ({
                title: chunk.maps.title,
                uri: chunk.maps.uri,
            }));
    } catch (groundingError) {
        console.warn("Maps grounding call failed, proceeding without nearby resources:", groundingError);
    }

    const finalResult: AnalysisResult = {
        severity: analysisPart.severity,
        summary: analysisPart.summary,
        actionList: analysisPart.actionList,
        resourceType: analysisPart.resourceType,
        nearbyResources,
    };

    const chat = ai.chats.create({
      model,
      history: [
        { role: 'user', parts: userMessageParts },
        { role: 'model', parts: [{ text: `Initial analysis complete. I've assessed the situation, determined immediate actions, and located nearby ${resourceQuery}. You can now ask follow-up questions.` }] },
      ],
      config: {
        systemInstruction,
      }
    });

    const initialHistory: ChatMessage[] = [
      { role: 'user', text: 'Submitted an emergency report.' },
      { role: 'model', text: 'Analysis complete. You can now ask follow-up questions.' }
    ];

    return { analysis: finalResult, chat, initialHistory };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid analysis from the AI. The model may be overloaded or the input is invalid.");
  }
};
