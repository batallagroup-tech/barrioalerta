// Notifications utility - Web Push nativo (OneSignal se integrará después)

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('[SW] Registrado:', reg.scope);
    return reg;
  } catch (err) {
    console.error('[SW] Error al registrar:', err);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

// Token placeholder - se reemplazará con OneSignal
export const getFCMToken = async (): Promise<string | null> => {
  return null;
};

// Placeholder - se reemplazará con OneSignal
export const onForegroundMessage = (_callback: (payload: any) => void) => {
  return () => {};
};

export const showLocalNotification = async (
  title: string,
  options?: NotificationOptions
) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });
  }
};