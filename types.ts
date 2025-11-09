export interface NearbyResource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  summary: string;
  actionList: string[];
  resourceType: 'Hospital' | 'Fire_Rescue' | 'Police' | 'Ambulance';
  nearbyResources: NearbyResource[];
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
