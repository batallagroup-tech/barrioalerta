import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const BANNER_ID = 'ca-app-pub-3849768825456219/4740449107';
const TEST_BANNER_ID = 'ca-app-pub-3940256099954/6300978111';
const isDev = false;

// Estado interno para evitar llamadas duplicadas que crashean AdView
let bannerShown = false;
let initialized = false;

export const admobService = {
  async initialize() {
    if (!Capacitor.isNativePlatform() || initialized) return;
    try {
      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: isDev,
      });
      initialized = true;
      console.log('[AdMob] Inicializado');
    } catch (err) {
      console.error('[AdMob] Error al inicializar:', err);
    }
  },

  async showBanner() {
    if (!Capacitor.isNativePlatform() || bannerShown) return;
    try {
      const options: BannerAdOptions = {
        adId: isDev ? TEST_BANNER_ID : BANNER_ID,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 60,
        isTesting: isDev,
      };
      await AdMob.showBanner(options);
      bannerShown = true;
      console.log('[AdMob] Banner mostrado');
    } catch (err) {
      console.error('[AdMob] Error al mostrar banner:', err);
    }
  },

  async hideBanner() {
    if (!Capacitor.isNativePlatform() || !bannerShown) return;
    try {
      await AdMob.hideBanner();
      console.log('[AdMob] Banner ocultado');
    } catch (err) {
      console.error('[AdMob] Error al ocultar banner:', err);
    }
  },

  async removeBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.removeBanner();
      bannerShown = false;
      console.log('[AdMob] Banner removido');
    } catch (err) {
      console.error('[AdMob] Error al remover banner:', err);
    }
  }
};



