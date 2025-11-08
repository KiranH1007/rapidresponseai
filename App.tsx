import React, { useState, useCallback } from 'react';
import type { Chat } from "@google/genai";
import { Header } from './components/Header';
import { EmergencyForm } from './components/EmergencyForm';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ProjectInfo } from './components/ProjectInfo';
import { startAnalysisChat } from './services/geminiService';
import type { AnalysisResult, Location, ChatMessage } from './types';

enum View {
  APP,
  INFO,
}

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.APP);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleFormSubmit = useCallback(async (description: string, image: File | null, location: Location | null) => {
    if (!description || !location) {
      setError("Description and location are required to proceed.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setChatSession(null);
    setChatHistory([]);

    try {
      const { analysis: result, chat, initialHistory } = await startAnalysisChat(description, image, location);
      setAnalysis(result);
      setChatSession(chat);
      setChatHistory(initialHistory);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleReset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setChatSession(null);
    setChatHistory([]);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatSession || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: message };
    const modelPlaceholder: ChatMessage = { role: 'model', text: '' };
    setChatHistory(prev => [...prev, userMessage, modelPlaceholder]);
    setIsChatLoading(true);

    try {
      const responseStream = await chatSession.sendMessageStream({ message });

      let fullResponseText = "";
      for await (const chunk of responseStream) {
        fullResponseText += chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          if (newHistory.length > 0) {
              newHistory[newHistory.length - 1].text = fullResponseText;
          }
          return newHistory;
        });
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setChatHistory(prev => {
          const newHistory = [...prev];
          if (newHistory.length > 0) {
              newHistory[newHistory.length - 1].text = errorMessage;
          }
          return newHistory;
      });
    } finally {
        setIsChatLoading(false);
    }
  }, [chatSession, isChatLoading]);

  const renderContent = () => {
    if (view === View.INFO) {
      return <ProjectInfo />;
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mb-4"></div>
            <h2 className="text-2xl font-semibold text-cyan-300">AI Analyzing Scene...</h2>
            <p className="mt-2 text-slate-400">Assessing severity and identifying hazards. Please wait.</p>
        </div>
      );
    }
    if (error) {
       return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-red-400">Analysis Failed</h2>
            <p className="mt-2 text-slate-400">{error}</p>
            <button
                onClick={handleReset}
                className="mt-6 px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-colors"
            >
                Try Again
            </button>
        </div>
       )
    }
    if (analysis) {
      return (
        <AnalysisDisplay 
          result={analysis} 
          onReset={handleReset} 
          chatHistory={chatHistory}
          onSendMessage={handleSendMessage}
          isChatLoading={isChatLoading}
        />
      );
    }
    return <EmergencyForm onSubmit={handleFormSubmit} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex justify-center mb-6 border-b border-slate-700">
            <button 
                onClick={() => setView(View.APP)}
                className={`px-4 py-2 text-lg font-medium transition-colors ${view === View.APP ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-cyan-300'}`}
            >
                Emergency AI
            </button>
            <button 
                onClick={() => setView(View.INFO)}
                className={`px-4 py-2 text-lg font-medium transition-colors ${view === View.INFO ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-cyan-300'}`}
            >
                Project Info
            </button>
        </div>
        <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
