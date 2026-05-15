import { useState, useEffect } from "react";
import { Location as GeoLocation, UserState } from "../types";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

const DEFAULT_LOCATION: GeoLocation = { lat: 19.4326, lng: -99.1332 };
const STORAGE_KEY = 'barrioalerta_zones';

function loadSavedZones(): { radiusKm: number; broadcastRadiusKm: number } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { radiusKm: 5, broadcastRadiusKm: 2 };
}

export function useLocation() {
  const saved = loadSavedZones();

  const [userState, setUserStateRaw] = useState<UserState>({
    location: DEFAULT_LOCATION,
    isLocationEnabled: false,
    radiusKm: saved.radiusKm,
    broadcastRadiusKm: saved.broadcastRadiusKm,
    additionalZones: [],
  });

  // Wrapper que persiste radiusKm y broadcastRadiusKm al cambiar
  const setUserState = (next: UserState | ((prev: UserState) => UserState)) => {
    setUserStateRaw(prev => {
      const updated = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          radiusKm: updated.radiusKm,
          broadcastRadiusKm: updated.broadcastRadiusKm,
        }));
      } catch {}
      return updated;
    });
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      let watchId: string | null = null;
      const startTracking = async () => {
        try {
          const permission = await Geolocation.requestPermissions();
          if (permission.location !== 'granted') return;
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
          setUserState(prev => ({
            ...prev,
            location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            isLocationEnabled: true,
          }));
          watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
            if (err || !pos) return;
            setUserState(prev => ({
              ...prev,
              location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
              isLocationEnabled: true,
            }));
          });
        } catch (err) {
          console.warn('[Location] Error:', err);
        }
      };
      startTracking();
      return () => { if (watchId) Geolocation.clearWatch({ id: watchId }); };
    } else {
      if (!('geolocation' in navigator)) return;
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserState(prev => ({
            ...prev,
            location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            isLocationEnabled: true,
          }));
        },
        (err) => console.warn('[Location]', err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return { userState, setUserState };
}
