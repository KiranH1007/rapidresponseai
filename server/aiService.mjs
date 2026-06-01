/**
 * AI Service Abstraction Layer (FR-201)
 * 
 * Model-agnostic interface for emergency triage AI.
 * The underlying model can be swapped without changes to the rest of the system.
 * 
 * Currently implements: Google Gemini (gemini-2.5-flash)
 * Future providers: OpenAI, Anthropic, Mistral, local models
 */

import { GoogleGenAI, Type } from '@google/genai';

// ─── Response Schema (shared across all providers) ────────────────────────────

const SEVERITY_LEVELS = ["Critical", "Severe", "Moderate", "Minor"];
const RESOURCE_TYPES = ["Hospital", "Fire_Rescue", "Police", "Ambulance"];

// ─── Gemini Provider Implementation ──────────────────────────────────────────

class GeminiProvider {
    constructor(apiKey, modelName = 'gemini-2.5-flash') {
        this.ai = new GoogleGenAI({ apiKey });
        this.model = modelName;
        this.name = `Gemini (${modelName})`;
    }

    async analyzeEmergency({ description, location, imagePart }) {
        const systemInstruction = `You are a highly efficient and concise **Emergency Triage and Incident Analyst**.
        Your job is to rapidly assess an emergency scenario based on the user's description, any provided images, and location.
        You must classify the severity, provide a brief summary suitable for first responders, list immediate actionable steps (3-5), 
        and recommend the most relevant resource type to dispatch.
        Your response MUST STRICTLY adhere to the JSON Schema.
        Location Context: Latitude ${location.latitude}, Longitude ${location.longitude}.
        Always consider the local context (country, region) when providing emergency guidance.
        Frame all advice as informational guidance, not medical diagnosis.`;

        const userMessageParts = [
            { text: `Analyze the following accident scene and return a JSON object with your assessment. Do not add any other text outside the JSON. Description: ${description}. Location: Latitude ${location.latitude}, Longitude ${location.longitude}.` }
        ];

        if (imagePart && imagePart.inlineData) {
            userMessageParts.push(imagePart);
        }

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                severity: { type: Type.STRING, enum: SEVERITY_LEVELS },
                summary: { type: Type.STRING },
                actionList: { type: Type.ARRAY, items: { type: Type.STRING } },
                resourceType: { type: Type.STRING, enum: RESOURCE_TYPES },
            },
            required: ["severity", "summary", "actionList", "resourceType"],
        };

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: { parts: userMessageParts },
            config: {
                responseMimeType: "application/json",
                responseSchema,
                systemInstruction,
            }
        });

        return JSON.parse(response.text.trim());
    }

    async discoverNearbyResources({ resourceType, location }) {
        let resourceQuery = resourceType;
        if (resourceQuery === 'Fire_Rescue') resourceQuery = 'Fire Stations';
        if (resourceQuery === 'Ambulance') resourceQuery = 'Hospitals';

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: `Find nearby ${resourceQuery} to Latitude ${location.latitude}, Longitude ${location.longitude}.`,
            config: {
                tools: [{ googleMaps: {} }],
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

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return groundingChunks
            .filter(chunk => chunk.maps?.uri && chunk.maps?.title)
            .map(chunk => ({
                title: chunk.maps.title,
                uri: chunk.maps.uri,
            }));
    }

    createChatSession({ history, location }) {
        const chatSystemInstruction = `You are a helpful and knowledgeable **Emergency Response Assistant**.
        The user's location is: Latitude ${location.latitude}, Longitude ${location.longitude}. 
        Answer questions conversationally and provide the correct local emergency number based on coordinates.
        Frame all advice as informational guidance, not medical diagnosis or commands.`;

        return this.ai.chats.create({
            model: this.model,
            history,
            config: {
                systemInstruction: chatSystemInstruction,
            }
        });
    }
}

// ─── AI Service Factory ─────────────────────────────────────────────────────

/**
 * Creates the configured AI service provider.
 * To swap providers, change this factory — nothing else needs to change.
 */
export function createAIService(config = {}) {
    const provider = config.provider || process.env.AI_PROVIDER || 'gemini';
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;

    switch (provider) {
        case 'gemini':
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY is required for Gemini provider');
            }
            return new GeminiProvider(apiKey, config.model || 'gemini-2.5-flash');

        // Future providers:
        // case 'openai':
        //     return new OpenAIProvider(config.apiKey || process.env.OPENAI_API_KEY);
        // case 'anthropic':
        //     return new AnthropicProvider(config.apiKey || process.env.ANTHROPIC_API_KEY);

        default:
            throw new Error(`Unknown AI provider: ${provider}. Supported: gemini`);
    }
}

export { SEVERITY_LEVELS, RESOURCE_TYPES };
