export interface Hospital {
  name: string;
  address: string;
}

export interface AnalysisResult {
  severity: 'Minor' | 'Moderate' | 'Critical';
  summary: string;
  immediateActions: string[];
  nearbyHospitals: Hospital[];
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}