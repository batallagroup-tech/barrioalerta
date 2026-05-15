import { useState, useEffect } from 'react';
import { noticeService, Notice } from '../services/supabase/noticeService';
import { UserProfile } from '../types';
import { calculateDistance } from '../utils/geo';

export function useNotices(currentUser: UserProfile | null, userLocation?: { lat: number; lng: number } | null, radiusKm: number = 20) {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const unsub = noticeService.subscribeToNotices((incoming) => {
      if (userLocation) {
        const filtered = incoming.filter(n => {
          if (!n.lat || !n.lng) return true; // sin ubicacion se muestra siempre
          const dist = calculateDistance(userLocation, { lat: n.lat, lng: n.lng });
          return dist <= radiusKm;
        });
        setNotices(filtered);
      } else {
        setNotices(incoming);
      }
    });
    return unsub;
  }, [userLocation?.lat, userLocation?.lng, radiusKm]);

  const sendNotice = async (data: {
    title: string;
    body: string;
    category: any;
  }) => {
    if (!currentUser) return;
    await noticeService.createNotice({
      ...data,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
    }, currentUser);
  };

  return { notices, sendNotice };
}
