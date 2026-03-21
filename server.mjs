import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Initialize Gemini SDK with the secure environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

app.post('/api/analyze', async (req, res) => {
    try {
        const { description, location, image } = req.body;

        if (!description || !location) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const analysisSystemInstruction = `You are a highly efficient and concise **Emergency Triage and Incident Analyst**... (System instruction omitted for brevity, but you get the idea).
        Your response MUST STRICTLY adhere to the JSON Schema.
        Location Context: Latitude ${location.latitude}, Longitude ${location.longitude}.`;

        const userMessageParts = [
            { text: `Analyze the following accident scene and return a JSON object with your assessment. Do not add any other text outside the JSON. Description: ${description}. Location: Latitude ${location.latitude}, Longitude ${location.longitude}.` }
        ];

        if (image && image.inlineData) {
            userMessageParts.push(image);
        }

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                severity: { type: Type.STRING, enum: ["Critical", "Severe", "Moderate", "Minor"] },
                summary: { type: Type.STRING },
                actionList: { type: Type.ARRAY, items: { type: Type.STRING } },
                resourceType: { type: Type.STRING, enum: ["Hospital", "Fire_Rescue", "Police", "Ambulance"] },
            },
            required: ["severity", "summary", "actionList", "resourceType"],
        };

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

        // Grounding (Google Maps) to find nearby resources
        let resourceQuery = analysisPart.resourceType;
        if (resourceQuery === 'Fire_Rescue') resourceQuery = 'Fire Stations';
        if (resourceQuery === 'Ambulance') resourceQuery = 'Hospitals';

        let nearbyResources = [];
        try {
            const groundingResponse = await ai.models.generateContent({
                model,
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

            const groundingChunks = groundingResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            nearbyResources = groundingChunks
                .filter(chunk => chunk.maps?.uri && chunk.maps?.title)
                .map(chunk => ({
                    title: chunk.maps.title,
                    uri: chunk.maps.uri,
                }));
        } catch (groundingError) {
            console.warn("Maps grounding call failed:", groundingError);
        }

        const finalResult = {
            severity: analysisPart.severity,
            summary: analysisPart.summary,
            actionList: analysisPart.actionList,
            resourceType: analysisPart.resourceType,
            nearbyResources,
        };

        // We return the initial history so the frontend can track conversation state
        const initialHistory = [
            { role: 'user', text: 'Submitted an emergency report.' },
            { role: 'model', text: 'Analysis complete. You can now ask follow-up questions.' }
        ];

        // Also seed the Gemini message history for the chat API later
        const aiHistory = [
            { role: 'user', parts: [ { text: "Analyzed accident scene." } ] },
            { role: 'model', parts: [ { text: `Initial analysis complete. The incident location is at Latitude ${location.latitude}, Longitude ${location.longitude}.` } ] }
        ];

        res.json({ analysis: finalResult, initialHistory, aiHistory });

    } catch (error) {
        console.error("Analysis API failed:", error);
        res.status(500).json({ error: "Failed to process analysis." });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, aiHistory, location } = req.body;

        const chatSystemInstruction = `You are a helpful and knowledgeable **Emergency Response Assistant**.
        The user's location is: Latitude ${location.latitude}, Longitude ${location.longitude}. 
        Answer questions conversationally and provide the correct local emergency number based on coordinates.`;

        const chat = ai.chats.create({
            model,
            history: aiHistory,
            config: {
                systemInstruction: chatSystemInstruction,
            }
        });

        const chatResponse = await chat.sendMessage({ message });
        
        // Return the new text and the updated history
        const updatedHistory = await chat.getHistory();
        res.json({ text: chatResponse.text, aiHistory: updatedHistory });

    } catch (error) {
        console.error("Chat API failed:", error);
        res.status(500).json({ error: "Chat processing failed." });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
