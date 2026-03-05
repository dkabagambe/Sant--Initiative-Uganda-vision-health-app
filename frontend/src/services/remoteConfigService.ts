import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

interface RemoteConfig {
  apiBaseUrl: string;
  maintenanceMode: boolean;
  forceUpdateVersion?: string;
  features: {
    paymentsEnabled: boolean;
    referralsEnabled: boolean;
    stockEnabled: boolean;
    reportsEnabled: boolean;
  };
  messages: {
    welcome?: string;
    maintenance?: string;
    updateRequired?: string;
  };
}

class RemoteConfigService {
  private static instance: RemoteConfigService;
  private config: RemoteConfig;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  static getInstance(): RemoteConfigService {
    if (!RemoteConfigService.instance) {
      RemoteConfigService.instance = new RemoteConfigService();
    }
    return RemoteConfigService.instance;
  }

  private getDefaultConfig(): RemoteConfig {
    return {
      apiBaseUrl: 'https://sante-initiative.vercel.app/api',
      maintenanceMode: false,
      features: {
        paymentsEnabled: true,
        referralsEnabled: true,
        stockEnabled: true,
        reportsEnabled: true,
      },
      messages: {
        welcome: 'Welcome to Santé Initiative Vision Health App',
        maintenance: 'System under maintenance. Please try again later.',
        updateRequired: 'Please update to the latest version for best experience.',
      },
    };
  }

  async initialize(): Promise<void> {
    try {
      // Load cached config
      const cachedConfig = await AsyncStorage.getItem('remoteConfig');
      const lastFetch = await AsyncStorage.getItem('remoteConfigLastFetch');

      if (cachedConfig && lastFetch) {
        this.config = JSON.parse(cachedConfig);
        this.lastFetch = parseInt(lastFetch);
      }

      // Fetch fresh config if needed
      await this.fetchConfig();
    } catch (error) {
      console.error('Remote config initialization failed:', error);
    }
  }

  async fetchConfig(): Promise<void> {
    try {
      const now = Date.now();
      
      // Skip if recently fetched
      if (now - this.lastFetch < this.CACHE_DURATION) {
        return;
      }

      const response = await apiService.getRemoteConfig();
      
      if (response.success && response.data) {
        this.config = { ...this.config, ...response.data };
        this.lastFetch = now;

        // Cache the config
        await AsyncStorage.setItem('remoteConfig', JSON.stringify(this.config));
        await AsyncStorage.setItem('remoteConfigLastFetch', this.lastFetch.toString());

        console.log('Remote config updated:', this.config);
      }
    } catch (error) {
      console.error('Failed to fetch remote config:', error);
      // Continue with cached config if fetch fails
    }
  }

  getConfig(): RemoteConfig {
    return this.config;
  }

  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  isMaintenanceMode(): boolean {
    return this.config.maintenanceMode;
  }

  isFeatureEnabled(feature: keyof RemoteConfig['features']): boolean {
    return this.config.features[feature];
  }

  getMessage(key: keyof RemoteConfig['messages']): string | undefined {
    return this.config.messages[key];
  }

  requiresForceUpdate(): boolean {
    return !!this.config.forceUpdateVersion;
  }

  getForceUpdateVersion(): string | undefined {
    return this.config.forceUpdateVersion;
  }

  async forceRefresh(): Promise<void> {
    this.lastFetch = 0; // Reset cache
    await this.fetchConfig();
  }

  // Method to update config remotely (for admin purposes)
  async updateConfig(updates: Partial<RemoteConfig>): Promise<boolean> {
    try {
      const response = await apiService.updateRemoteConfig(updates);
      
      if (response.success) {
        await this.forceRefresh();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update remote config:', error);
      return false;
    }
  }

  // Emergency override for critical updates
  async emergencyUpdate(apiUrl: string): Promise<void> {
    try {
      this.config.apiBaseUrl = apiUrl;
      await AsyncStorage.setItem('remoteConfig', JSON.stringify(this.config));
      await AsyncStorage.setItem('emergencyApiUrl', apiUrl);
      console.log('Emergency API URL updated:', apiUrl);
    } catch (error) {
      console.error('Failed to set emergency URL:', error);
    }
  }

  // Check for emergency override
  async checkEmergencyOverride(): Promise<void> {
    try {
      const emergencyUrl = await AsyncStorage.getItem('emergencyApiUrl');
      if (emergencyUrl) {
        this.config.apiBaseUrl = emergencyUrl;
        console.log('Using emergency API URL:', emergencyUrl);
      }
    } catch (error) {
      console.error('Failed to check emergency override:', error);
    }
  }
}

export default RemoteConfigService.getInstance();
