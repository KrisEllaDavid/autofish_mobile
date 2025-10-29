import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.autofish.mobile',
  appName: 'AutoFish Mobile',
  webDir: 'dist',
  server: {
    // Allow external server access for API calls
    allowNavigation: ['https://api.autofish.store', 'https://autofish.store'],
    // Allow all origins for development
    hostname: '0.0.0.0',
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      // Enable native HTTP for better CORS handling
      enabled: true
    },
    App: {
      appUrlOpen: {
        // Handle custom URL schemes and universal links
        enabled: true
      }
    }
  }
};

export default config;
