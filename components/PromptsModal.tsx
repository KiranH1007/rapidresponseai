import React, { useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';

interface PromptsModalProps {
    onClose: () => void;
}

const systemInstruction = `You are a highly efficient and concise **Emergency Triage and Incident Analyst**. Your primary function is to immediately assess the severity of an incident based on the user's text description, uploaded image (if provided), and location.

Your response MUST STRICTLY adhere to the provided JSON Schema blueprint. Do not generate any conversational text, introductory phrases, or explanations outside of the JSON object itself.

Your analysis must prioritize safety, speed, and actionable advice for first responders or bystanders. When determining the action list, focus on immediate safety, calling for help, and basic stabilization steps.

Determine the 'severity' based on potential loss of life, severe injury, or imminent danger (e.g., active fire, severe bleeding, entrapment).`;

const userPromptExample = `Analyze the following emergency situation.
1. **Text Description:** [The user's speech-to-text or typed description of the event.]
2. **Location Context (Implicit):** The incident occurred near the user's location. Use this to determine the appropriate \`resourceType\` for nearby search.
3. **Visual Context (If Image Attached):** [The image file is attached alongside this text prompt.]

Provide the analysis ONLY in the required JSON format.`;


export const PromptsModal: React.FC<PromptsModalProps> = ({ onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompts-modal-title"
        >
            <div ref={modalRef} className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 id="prompts-modal-title" className="text-xl font-bold text-white">
                        AI Studio Prompts
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors"
                        aria-label="Close modal"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-cyan-300 mb-2">System Instruction</h3>
                        <div className="bg-slate-900 p-4 rounded-md border border-slate-700">
                            <pre className="text-slate-300 whitespace-pre-wrap text-sm font-mono">
                                <code>{systemInstruction}</code>
                            </pre>
                        </div>
                    </section>
                    <section>
                        <h3 className="text-lg font-semibold text-cyan-300 mb-2">User Prompt (Example)</h3>
                        <div className="bg-slate-900 p-4 rounded-md border border-slate-700">
                             <pre className="text-slate-300 whitespace-pre-wrap text-sm font-mono">
                                <code>{userPromptExample}</code>
                            </pre>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
