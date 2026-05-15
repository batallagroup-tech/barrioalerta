import OneSignal from 'react-onesignal';

let initialized = false;

export const oneSignalService = {
async init() {
    if (initialized) return;
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    if (!appId) return;

    // Solo inicializar en producción o si está permitido
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';

    try {
      await OneSignal.init({
        appId,
        serviceWorkerPath: '/OneSignalSDK.sw.js',
        allowLocalhostAsSecureOrigin: true,
      });
      initialized = true;
      console.log('[OneSignal] Inicializado');
    } catch (err) {
      // En localhost es normal que falle, no es un error crítico
      if (!isLocalhost) {
        console.error('[OneSignal] Error al inicializar:', err);
      }
    }
  },

  async requestPermission() {
    try {
      await OneSignal.Notifications.requestPermission();
    } catch (err) {
      console.error('[OneSignal] Error al pedir permiso:', err);
    }
  },

  async setUserId(userId: string) {
    try {
      await OneSignal.login(userId);
    } catch (err) {
      console.error('[OneSignal] Error al setear usuario:', err);
    }
  },

  async logout() {
    try {
      await OneSignal.logout();
    } catch (err) {
      console.error('[OneSignal] Error al hacer logout:', err);
    }
  }
};