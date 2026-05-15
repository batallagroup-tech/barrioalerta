export type Category = 'Crime' | 'Accident' | 'Missing' | 'Notice' | 'Sanitary' | 'Environment' | 'Fire' | 'Infrastructure' | 'Utility' | 'Health' | 'Other' | 'SOS';

export interface Location {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  userId?: string;
  userName?: string;
  userPhoto?: string | null;
  category: Category;
  title: string;
  description: string;
  location: Location;
  timestamp: any; // Allow for serverTimestamp
  verifiedCount: number;
  reportCount?: number;
  imageUrl?: string;
  imageUrls?: string[];
  isSensitive?: boolean;
  isSOS?: boolean;
  broadcastRadiusKm?: number;
  userVerified?: boolean;
  verifiedBy?: string[];
}
