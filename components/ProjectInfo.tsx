import React from 'react';
import { InfoIcon } from './icons/InfoIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { CameraIcon } from './icons/CameraIcon';
import { MapPinIcon } from './icons/MapPinIcon';

export const ProjectInfo: React.FC = () => {
    return (
        <div className="p-6 md:p-8 space-y-8 text-slate-300 animate-fade-in overflow-y-auto">
            <div className="flex items-center space-x-3">
                <InfoIcon className="h-8 w-8 text-cyan-400" />
                <h2 className="text-3xl font-bold text-white">How to Use</h2>
            </div>

            <section>
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">Quick Start Guide</h3>
                <div className="space-y-4">
                    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-300 font-bold">1</div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Describe the Emergency</h4>
                                <p className="text-sm">Type or use voice input to describe what happened. Be as specific as possible about injuries, hazards, or threats.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-300 font-bold">2</div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Upload a Photo (Optional)</h4>
                                <p className="text-sm">Add visual context to help the AI better assess the situation. Photos are especially helpful for damage assessment.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-300 font-bold">3</div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Allow Location Access</h4>
                                <p className="text-sm">Enable location services so the system can find nearby emergency resources like hospitals, fire stations, or police.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-300 font-bold">4</div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Review Analysis & Take Action</h4>
                                <p className="text-sm">Get instant severity assessment, prioritized action steps, and direct links to nearby emergency facilities.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">Real-World Example</h3>
                <div className="bg-slate-700/50 p-5 rounded-md border border-slate-600 space-y-3">
                    <div className="flex items-center space-x-2 text-cyan-300">
                        <ClipboardCheckIcon className="h-5 w-5" />
                        <h4 className="font-semibold">Scenario: Car Accident on Highway</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p><strong className="text-white">Sarah's Story:</strong> "I was driving home when I witnessed a two-car collision on the highway. One vehicle had significant front-end damage, and I could see someone inside appeared injured. I wasn't sure what to do first."</p>
                        <p className="text-slate-400">Sarah quickly opened Rapid Response AI and:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 text-slate-300">
                            <li>Used voice input to describe: "Two-car accident, front-end damage, person appears injured, on Highway 101"</li>
                            <li>Snapped a photo of the scene from a safe distance</li>
                            <li>Allowed location access</li>
                        </ul>
                        <p className="text-slate-400 mt-3">Within seconds, the AI provided:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 text-slate-300">
                            <li><strong className="text-orange-300">Severity: Severe</strong> - Color-coded assessment</li>
                            <li><strong className="text-white">Prioritized Actions:</strong> 1) Call 911 immediately, 2) Check for hazards (gas leaks, traffic), 3) Assess if safe to approach, 4) Provide basic first aid if trained</li>
                            <li><strong className="text-white">Nearby Resources:</strong> Direct links to nearest hospital (2.3 miles) and ambulance service</li>
                        </ul>
                        <p className="text-cyan-300 mt-3 italic">"The prioritized checklist helped me stay calm and take the right steps in order. The hospital link got me directions immediately."</p>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">What You'll Get</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <h4 className="font-semibold text-white">Severity Assessment</h4>
                        </div>
                        <p className="text-sm">Critical, Severe, Moderate, or Minor - instantly categorized with visual indicators</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                        <div className="flex items-center space-x-2 mb-2">
                            <ClipboardCheckIcon className="h-5 w-5 text-cyan-300" />
                            <h4 className="font-semibold text-white">Action Checklist</h4>
                        </div>
                        <p className="text-sm">Prioritized steps in order of importance - from immediate safety to resource coordination</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                        <div className="flex items-center space-x-2 mb-2">
                            <MapPinIcon className="h-5 w-5 text-cyan-300" />
                            <h4 className="font-semibold text-white">Nearby Resources</h4>
                        </div>
                        <p className="text-sm">Automatic discovery of hospitals, fire stations, police, or ambulance services based on incident type</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                        <div className="flex items-center space-x-2 mb-2">
                            <CameraIcon className="h-5 w-5 text-cyan-300" />
                            <h4 className="font-semibold text-white">Follow-Up Chat</h4>
                        </div>
                        <p className="text-sm">Ask questions about the incident, response procedures, or get clarification on next steps</p>
                    </div>
                </div>
            </section>

            <section className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">💡 Pro Tips</h3>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                        <span className="text-cyan-400">•</span>
                        <span>Use voice input when your hands are busy or in high-stress situations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="text-cyan-400">•</span>
                        <span>Photos help the AI assess damage, injuries, and scene conditions more accurately</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="text-cyan-400">•</span>
                        <span>Always prioritize your own safety - follow the action items in order</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="text-cyan-400">•</span>
                        <span>Use the "Copy Summary" button to quickly share critical information with emergency services</span>
                    </li>
                </ul>
            </section>
        </div>
    );
};
