import { Location } from "../types";
export const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371;
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};
export const formatTimeAgo = (timestamp: any): string => {
  let ms: number;
  if (typeof timestamp === "number") {
    ms = timestamp;
  } else if (typeof timestamp === "string") {
    ms = new Date(timestamp).getTime();
  } else if (timestamp?.toMillis) {
    ms = timestamp.toMillis();
  } else {
    ms = Date.now();
  }
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${days} d`;
};
