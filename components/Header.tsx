import React from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <div className="flex items-center space-x-3">
            <AlertTriangleIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">
              Rapid Response AI
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};
