import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mt5guardian.app',
  appName: 'MT5 Risk Guardian',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
