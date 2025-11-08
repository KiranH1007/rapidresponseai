import React from 'react';
import { InfoIcon } from './icons/InfoIcon';
import { GithubIcon } from './icons/GithubIcon';

export const ProjectInfo: React.FC = () => {
    return (
        <div className="p-6 md:p-8 space-y-8 text-slate-300 animate-fade-in">
            <div className="flex items-center space-x-3">
                <InfoIcon className="h-8 w-8 text-cyan-400" />
                <h2 className="text-3xl font-bold text-white">Project Information</h2>
            </div>

            <section>
                <h3 className="text-xl font-semibold text-cyan-300 mb-2">Project Summary</h3>
                <p><strong>Rapid Response AI</strong> is an innovative serverless application designed for the Google Cloud Run Hackathon. It fits into the <strong>AI Studio Category</strong> by leveraging Google's Gemini model to provide critical assistance during emergencies. Users can describe an accident, upload an image, and provide their location. The AI then performs a rapid analysis to assess severity, generate a concise summary for first responders, suggest immediate safety actions, and identify nearby hospitals. This project demonstrates how AI can be a powerful tool in emergency response, providing life-saving information when every second counts.</p>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-cyan-300 mb-2">Technology Stack</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Frontend:</strong> React with TypeScript, styled using Tailwind CSS.</li>
                    <li><strong>AI Model:</strong> Google Gemini 2.5 Flash via the Gemini API.</li>
                    <li><strong>Deployment:</strong> Designed for Google Cloud Run.</li>
                    <li><strong>Core AI Features:</strong> Multimodal analysis (text and image), structured JSON output via response schema, and location-based reasoning.</li>
                </ul>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-cyan-300 mb-2">Architecture Diagram</h3>
                <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600 text-center">
                    <p className="text-sm text-slate-400 mb-4">A visual representation of the project's components and data flow.</p>
                    <div className="flow-diagram text-xs text-left p-4 bg-slate-900 rounded-lg inline-block">
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="box">User (Browser)</div>
                            <div className="arrow">&rarr;</div>
                            <div className="box">React Frontend (on Cloud Run)</div>
                            <div className="arrow">&rarr;</div>
                            <div className="box">Gemini API</div>
                            <div className="arrow">&rarr;</div>
                            <div className="box">React Frontend (Displays Results)</div>
                        </div>
                        <style>{`
                            .box { background-color: #0F172A; border: 1px solid #334155; padding: 0.75rem; border-radius: 0.375rem; }
                            .arrow { color: #22D3EE; font-size: 1.5rem; line-height: 1; margin: 0 0.5rem; }
                        `}</style>
                    </div>
                </div>
            </section>
            
            <section>
                 <h3 className="text-xl font-semibold text-cyan-300 mb-2">Submission Links</h3>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <a href="#" className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                        <GithubIcon className="h-5 w-5" />
                        Code Repository
                    </a>
                     <a href="#" className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                         <span>🔗</span>
                         AI Studio Prompts
                     </a>
                     <a href="#" className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                        <span>▶️</span>
                        Demo Video
                     </a>
                 </div>
            </section>
        </div>
    );
};
