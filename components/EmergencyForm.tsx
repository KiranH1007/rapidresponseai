import React, { useState, useCallback, ChangeEvent } from 'react';
import type { Location } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { MapPinIcon } from './icons/MapPinIcon';

interface EmergencyFormProps {
  onSubmit: (description: string, image: File | null, location: Location | null) => void;
}

export const EmergencyForm: React.FC<EmergencyFormProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
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
      },
      (error) => {
        setLocationError(error.message);
        setIsLocating(false);
      }
    );
  }, []);

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

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
          1. Describe the incident
        </label>
        <textarea
          id="description"
          rows={5}
          className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          placeholder="e.g., 'Car accident on the highway, one person seems injured and is not moving. The car is smoking.'"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          2. Upload a photo (optional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                {imagePreview ? (
                    <img src={imagePreview} alt="Scene preview" className="mx-auto h-32 w-auto rounded-md object-cover" />
                ) : (
                    <CameraIcon className="mx-auto h-12 w-12 text-slate-500" />
                )}
                <div className="flex text-sm text-slate-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-cyan-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
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
