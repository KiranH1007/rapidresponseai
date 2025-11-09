import React, { useState } from 'react';
import type { AnalysisResult, ChatMessage } from '../types';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { HospitalIcon } from './icons/HospitalIcon';
import { FollowUpChat } from './FollowUpChat';
import { CopyIcon } from './icons/CopyIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { FireExtinguisherIcon } from './icons/FireExtinguisherIcon';
import { SirenIcon } from './icons/SirenIcon';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatLoading: boolean;
}

const severityStyles = {
    'Minor': 'bg-green-500/20 text-green-300 border-green-500',
    'Moderate': 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
    'Severe': 'bg-orange-500/20 text-orange-300 border-orange-500',
    'Critical': 'bg-red-500/20 text-red-300 border-red-500',
};

const resourceInfoMap = {
    'Hospital': { icon: <HospitalIcon className="h-6 w-6 mr-2" />, title: 'Nearby Hospitals' },
    'Ambulance': { icon: <HospitalIcon className="h-6 w-6 mr-2" />, title: 'Nearby Hospitals / Ambulance Services' },
    'Fire_Rescue': { icon: <FireExtinguisherIcon className="h-6 w-6 mr-2" />, title: 'Nearby Fire Stations' },
    'Police': { icon: <SirenIcon className="h-6 w-6 mr-2" />, title: 'Nearby Police Stations' },
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onReset, chatHistory, onSendMessage, isChatLoading }) => {
  const severityClass = severityStyles[result.severity] || 'bg-gray-500/20 text-gray-300';
  const [isCopied, setIsCopied] = useState(false);
  const resourceInfo = resourceInfoMap[result.resourceType] || resourceInfoMap['Hospital'];

  const handleCopy = () => {
    navigator.clipboard.writeText(result.summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 md:p-8 animate-fade-in flex-grow">
          <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white">Analysis Complete</h2>
              <p className="mt-1 text-slate-400">Here is the AI's assessment of the situation.</p>
          </div>

          <div className="space-y-6">
              <div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2">Severity Assessment</h3>
                  <div className={`inline-flex items-center px-4 py-2 border rounded-full text-lg font-bold ${severityClass}`}>
                      <AlertTriangleIcon className="h-6 w-6 mr-2" />
                      {result.severity}
                  </div>
              </div>

              <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-cyan-300">Summary for First Responders</h3>
                    <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-slate-300">
                        <CopyIcon className="h-4 w-4"/>
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="bg-slate-700/50 p-4 rounded-md text-slate-300 border border-slate-600">{result.summary}</p>
              </div>

              <div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2 flex items-center">
                      <ClipboardCheckIcon className="h-6 w-6 mr-2" />
                      Immediate Actions to Take
                  </h3>
                  <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300 bg-slate-700/50 p-4 rounded-md border border-slate-600">
                      {result.actionList.map((action, index) => (
                          <li key={index}>{action}</li>
                      ))}
                  </ul>
              </div>

              <div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2 flex items-center">
                      {resourceInfo.icon}
                      {resourceInfo.title}
                  </h3>
                  <div className="space-y-3">
                      {result.nearbyResources.length > 0 ? result.nearbyResources.map((resource, index) => (
                          <a 
                            key={index} 
                            href={resource.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-slate-700/50 p-3 rounded-md border border-slate-600 hover:bg-slate-700/80 hover:border-cyan-500/50 transition-all group"
                          >
                              <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-100">{resource.title}</p>
                                </div>
                                <ExternalLinkIcon className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                              </div>
                          </a>
                      )) : (
                        <p className="text-slate-400 text-sm bg-slate-700/50 p-3 rounded-md border border-slate-600">Could not find nearby resources.</p>
                      )}
                  </div>
              </div>
          </div>
      </div>
      
      <div className="border-t-2 border-slate-700/50">
        <FollowUpChat 
          history={chatHistory} 
          onSendMessage={onSendMessage} 
          isLoading={isChatLoading} 
        />
      </div>

      <div className="mt-4 p-6 text-center border-t border-slate-700">
          <button
              onClick={onReset}
              className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-colors"
          >
              Report Another Incident
          </button>
      </div>
    </div>
  );
};
