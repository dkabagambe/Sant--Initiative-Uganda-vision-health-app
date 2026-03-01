// Remote configuration service for dynamic API URL changes
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEY = 'app_config';

// Vercel production API
export const VERCEL_API_URL = 'https://backend-tau-sepia-43.vercel.app/api';
// Local backend — localhost for emulator; use machine IP for physical device
export const LOCAL_API_URL = 'http://localhost:5000/api';

export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production';
}

// Env override: EXPO_PUBLIC_API_URL in .env — physical device: http://YOUR_IP:5000/api
const envApiUrl = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;

const defaultConfig: AppConfig = {
  apiBaseUrl: envApiUrl || (__DEV__ ? LOCAL_API_URL : VERCEL_API_URL),
  environment: __DEV__ ? 'development' : 'production'
};

export class ConfigService {
  // Get current configuration
  static async getConfig(): Promise<AppConfig> {
    try {
      const stored = await AsyncStorage.getItem(CONFIG_KEY);
      if (stored) {
        return { ...defaultConfig, ...JSON.parse(stored) };
      }
      return defaultConfig;
    } catch (error) {
      console.warn('Failed to load config, using default:', error);
      return defaultConfig;
    }
  }

  // Update API URL remotely
  static async updateApiUrl(newUrl: string): Promise<boolean> {
    try {
      const config = await this.getConfig();
      config.apiBaseUrl = newUrl;
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Failed to update API URL:', error);
      return false;
    }
  }

  // Reset to default configuration (uses localhost in dev, Vercel in prod)
  static async resetToDefault(): Promise<boolean> {
    try {
      const config: AppConfig = {
        apiBaseUrl: __DEV__ ? LOCAL_API_URL : VERCEL_API_URL,
        environment: __DEV__ ? 'development' : 'production'
      };
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Failed to reset config:', error);
      return false;
    }
  }

  // Get current API URL
  static async getApiUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.apiBaseUrl;
  }
}
