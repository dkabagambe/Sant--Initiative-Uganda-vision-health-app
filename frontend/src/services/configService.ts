// Remote configuration service for dynamic API URL changes
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEY = 'app_config';

export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production';
}

const defaultConfig: AppConfig = {
  apiBaseUrl: 'https://sante-initiative-uganda-app.onrender.com/api',
  environment: 'production'
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

  // Reset to default configuration
  static async resetToDefault(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
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
