import React, { useState, useCallback, ChangeEvent, useRef, useEffect } from 'react';
import type { Location } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface EmergencyFormProps {
  onSubmit: (description: string, image: File | null, location: Location | null) => void;
}

// Check for SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
}

export const EmergencyForm: React.FC<EmergencyFormProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showManualLocation, setShowManualLocation] = useState<boolean>(false);
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLng, setManualLng] = useState<string>('');
  const recognitionRef = useRef(recognition);

  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;

    rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        // To prevent updating state on every single result, we could debounce or use a different strategy
        // But for live feedback, this is okay. We'll append the final transcript.
        // For simplicity, we'll just update with the final part. A better implementation might handle the cursor position.
        setDescription(prev => prev + finalTranscript);
    };

    rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
    };
    
    rec.onend = () => {
        setIsListening(false);
    }

  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    // FR-101: Only accept JPEG, PNG, WebP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    // FR edge case: Max 10MB display / 50MB accepted
    if (file.size > 50 * 1024 * 1024) {
      alert('Image must be under 50 MB.');
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // FR-106: Actual drag-and-drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const getLocation = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
        setShowManualLocation(false);
      },
      (error) => {
        setLocationError(error.message);
        setIsLocating(false);
        // FR-105: Show manual fallback when geolocation is denied
        setShowManualLocation(true);
      }
    );
  }, []);

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setLocationError('Please enter valid coordinates (Lat: -90 to 90, Lng: -180 to 180)');
      return;
    }
    setLocation({ latitude: lat, longitude: lng });
    setLocationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(description, image, location);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Emergency Report</h2>
        <p className="mt-2 text-slate-400">Describe the situation. The AI will assess and guide you.</p>
      </div>

      <div className="relative">
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
          1. Describe the incident
        </label>
        <textarea
          id="description"
          rows={5}
          className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors pr-10"
          placeholder="e.g., 'Car accident on the highway, one person seems injured and is not moving. The car is smoking.'"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        {recognition && (
            <button 
                type="button" 
                onClick={toggleListen}
                className={`absolute top-10 right-2 p-1 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-cyan-300'}`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
                <MicrophoneIcon className="h-6 w-6" />
            </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          2. Upload a photo (optional)
        </label>
        <div 
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
            isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
            <div className="space-y-1 text-center">
                {imagePreview ? (
                    <img src={imagePreview} alt="Scene preview" className="mx-auto h-32 w-auto rounded-md object-cover" />
                ) : (
                    <CameraIcon className="mx-auto h-12 w-12 text-slate-500" />
                )}
                <div className="flex text-sm text-slate-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-cyan-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">JPEG, PNG, WebP up to 50MB</p>
            </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          3. Get your location
        </label>
        <button type="button" onClick={getLocation} disabled={isLocating} className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-wait transition-colors">
            <MapPinIcon className="h-5 w-5 mr-2"/>
            {isLocating ? 'Fetching Location...' : 'Get Current Location'}
        </button>
        {location && (
            <p className="mt-2 text-sm text-green-400">Location Acquired: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
        )}
        {locationError && (
            <p className="mt-2 text-sm text-red-400">Location Error: {locationError}</p>
        )}
        {/* FR-105: Manual coordinate entry fallback */}
        {showManualLocation && !location && (
            <div className="mt-3 p-3 bg-slate-700/50 rounded-md border border-slate-600 space-y-3">
                <p className="text-xs text-yellow-400">📍 Geolocation unavailable. Enter coordinates manually:</p>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label htmlFor="manual-lat" className="block text-xs text-slate-400 mb-1">Latitude</label>
                        <input
                            id="manual-lat"
                            type="number"
                            step="any"
                            placeholder="e.g., 12.9716"
                            value={manualLat}
                            onChange={(e) => setManualLat(e.target.value)}
                            className="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="manual-lng" className="block text-xs text-slate-400 mb-1">Longitude</label>
                        <input
                            id="manual-lng"
                            type="number"
                            step="any"
                            placeholder="e.g., 77.5946"
                            value={manualLng}
                            onChange={(e) => setManualLng(e.target.value)}
                            className="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleManualLocationSubmit}
                    className="w-full px-4 py-2 text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
                >
                    Set Location Manually
                </button>
            </div>
        )}
      </div>

      <div className="pt-4">
        <button type="submit" disabled={!description || !location} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 disabled:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          Analyze Situation
        </button>
        {!location && <p className="text-center text-xs text-yellow-400 mt-2">Location is required to proceed.</p>}
      </div>
    </form>
  );
};