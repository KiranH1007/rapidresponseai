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
  
  // Get the API key from Vite environment variables
  // In Vite, client-side env vars must be prefixed with VITE_ and accessed via import.meta.env
  const API_KEY = import.meta.env.VITE_API_KEY;

  if (!API_KEY) {
      throw new Error("VITE_API_KEY environment variable is not set. Please set it during the build process.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const model = "gemini-2.5-flash";
  
  // System instruction for initial analysis (requires JSON output)
  const analysisSystemInstruction = `You are a highly efficient and concise **Emergency Triage and Incident Analyst**. Your primary function is to immediately assess the severity of an incident based on the user's text description, uploaded image (if provided), and location.

Your response MUST STRICTLY adhere to the provided JSON Schema blueprint. Do not generate any conversational text, introductory phrases, or explanations outside of the JSON object itself.

**Location Context:** The incident is at Latitude ${location.latitude}, Longitude ${location.longitude}. 

**IMPORTANT - Location-Based Emergency Numbers in Action List:**
When including "call emergency services" in the action list, use the appropriate emergency number for this location:
- United States/Canada: Use "911"
- India: Use "108" (ambulance), "100" (police), or "101" (fire) as appropriate
- United Kingdom: Use "999" or "112"
- Australia: Use "000"
- European Union: Use "112"
- Japan: Use "110" (police) or "119" (fire/ambulance)
- China: Use "110" (police), "119" (fire), or "120" (ambulance)
- Brazil: Use "190" (police), "192" (ambulance), or "193" (fire)
- For other countries, determine the correct number based on coordinates or use a generic "emergency services" if uncertain.

Your analysis must prioritize safety, speed, and actionable advice for first responders or bystanders. When determining the action list, focus on immediate safety, calling for help with the location-appropriate emergency number, and basic stabilization steps.

Determine the 'severity' based on potential loss of life, severe injury, or imminent danger (e.g., active fire, severe bleeding, entrapment).`;
  
  // System instruction for follow-up chat (conversational, natural language)
  // Include location context for location-aware emergency number suggestions
  const chatSystemInstruction = `You are a helpful and knowledgeable **Emergency Response Assistant**. You provide clear, conversational answers to follow-up questions about emergency situations, first aid procedures, safety protocols, and resource information.

**IMPORTANT - Location-Based Emergency Numbers:**
The user's location is: Latitude ${location.latitude}, Longitude ${location.longitude}. 

When suggesting emergency numbers, you MUST provide the correct emergency number for the user's location:
- **United States/Canada**: 911 (all emergencies)
- **India**: 108 (ambulance), 100 (police), 101 (fire)
- **United Kingdom**: 999 or 112 (all emergencies)
- **Australia**: 000 (all emergencies)
- **European Union**: 112 (all emergencies)
- **Japan**: 110 (police), 119 (fire/ambulance)
- **China**: 110 (police), 119 (fire), 120 (ambulance)
- **Brazil**: 190 (police), 192 (ambulance), 193 (fire)
- For other countries, provide the appropriate local emergency number based on the coordinates.

Use the latitude and longitude to determine the country/region and suggest the correct emergency number. If unsure, provide multiple options or the most common number for that region.

Respond in natural, friendly language. Be concise but thorough. Focus on practical, actionable information that helps the user understand the situation and take appropriate action.

Do NOT return JSON format. Answer questions conversationally as if you're a knowledgeable emergency responder helping someone in need.`;

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
            systemInstruction: analysisSystemInstruction,
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
        { role: 'model', parts: [{ text: `Initial analysis complete. I've assessed the situation, determined immediate actions, and located nearby ${resourceQuery}. The incident location is at Latitude ${location.latitude}, Longitude ${location.longitude}. You can now ask follow-up questions, and I'll provide location-appropriate emergency numbers and guidance.` }] },
      ],
      config: {
        systemInstruction: chatSystemInstruction,
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
