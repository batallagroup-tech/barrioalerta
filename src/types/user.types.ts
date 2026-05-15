import { Location } from './incident.types';

export interface MonitoredZone {
  id: string;
  name: string;
  location: Location;
  radius?: number;
  type?: 'monitoreo' | 'help_group';
}

export interface UserState {
  location: Location;
  isLocationEnabled: boolean;
  radiusKm: number;
  broadcastRadiusKm?: number;
  additionalZones?: MonitoredZone[];
}

export interface UserReputation {
  points: number;
  level: number;
  levelName: string;
  badges: string[];
  stats: {
    incidentsReported: number;
    incidentsVerified: number;
    sosActivations: number;
    daysActive: number;
  };
}

export interface UserVerification {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdVerified: boolean;
  isFacialVerified: boolean;
  verificationLevel: 'none' | 'basic' | 'full';
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  fcmToken?: string;
  lastSeen?: number;
  showPublicName: boolean;
  preciseLocation: boolean;
  reputation?: UserReputation;
  verification?: UserVerification;
}
