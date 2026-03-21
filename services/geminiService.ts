import type { AnalysisResult, Location, ChatMessage } from '../types';

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
): Promise<{ analysis: AnalysisResult; chat: any; initialHistory: ChatMessage[] }> => {
  
  // Format the image for JSON transmission to our backend
  let imagePayload = null;
  if (image) {
    imagePayload = await fileToGenerativePart(image);
  }

  // 1. Call our secure local backend instead of Google directly
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        description,
        location,
        image: imagePayload
    })
  });

  if (!response.ok) {
    throw new Error("Failed to connect to the backend server. Please verify the server is running.");
  }

  const data = await response.json();
  
  // 2. We keep track of the AI's internal history state here
  let currentAiHistory = data.aiHistory;

  // 3. Create a "fake" chat object that mimics the Gemini SDK so `App.tsx` doesn't need to change
  const chat = {
    sendMessageStream: async function* ({ message }: { message: string }) {
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            aiHistory: currentAiHistory,
            location
        })
      });

      if (!chatRes.ok) throw new Error("Chat request failed");

      const chatData = await chatRes.json();
      currentAiHistory = chatData.aiHistory; // Update history for next message
      
      // Yield the full response in one fake "stream" chunk
      yield { text: chatData.text };
    }
  };

  return { analysis: data.analysis, chat, initialHistory: data.initialHistory };
};
