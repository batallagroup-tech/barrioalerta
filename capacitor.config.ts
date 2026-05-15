import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barrioalerta.app',
  appName: 'BarrioAlerta',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#3b82f6"
    },
    AdMob: {
      appId: 'ca-app-pub-3849768825456219~2498034388',
      initializeForTesting: false,
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;