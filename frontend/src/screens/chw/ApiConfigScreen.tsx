import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { ConfigService } from '../../services/configService';

const ApiConfigScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const url = await ConfigService.getApiUrl();
      setCurrentUrl(url);
      setNewUrl(url);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const updateApiUrl = async () => {
    if (!newUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid API URL');
      return;
    }

    if (!adminKey.trim()) {
      Alert.alert('Error', 'Please enter admin key');
      return;
    }

    setLoading(true);
    try {
      // Call backend to validate and prepare update
      const response = await api.post('/remote-config/update-api-url', {
        newUrl: newUrl.trim(),
        adminKey: adminKey.trim(),
      });

      if (response.data.success) {
        // Store locally in the app
        const success = await ConfigService.updateApiUrl(newUrl.trim());
        
        if (success) {
          setCurrentUrl(newUrl.trim());
          Alert.alert(
            'Success',
            'API URL updated successfully! The app will restart to apply changes.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // In a real app, you might want to restart the app
                  // For now, just navigate back
                  navigation.goBack();
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', 'Failed to save configuration locally');
        }
      } else {
        Alert.alert('Error', response.data.error || 'Failed to update API URL');
      }
    } catch (error: any) {
      console.error('API URL update error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = async () => {
    Alert.alert(
      'Reset Configuration',
      'Are you sure you want to reset to the default API URL?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const success = await ConfigService.resetToDefault();
            if (success) {
              await loadCurrentConfig();
              Alert.alert('Success', 'Configuration reset to default');
            } else {
              Alert.alert('Error', 'Failed to reset configuration');
            }
          },
        },
      ]
    );
  };

  const testConnection = async () => {
    if (!newUrl.trim()) {
      Alert.alert('Error', 'Please enter an API URL to test');
      return;
    }

    setLoading(true);
    try {
      // Test the new URL by calling health endpoint
      const testApi = api.create({
        baseURL: newUrl.trim(),
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await testApi.get('/health');
      
      if (response.data.success) {
        Alert.alert(
          'Connection Test',
          '✅ Successfully connected to the API!\n\nDatabase: ' + response.data.database
        );
      } else {
        Alert.alert('Connection Test', '❌ API responded but with an error');
      }
    } catch (error: any) {
      Alert.alert(
        'Connection Test Failed',
        '❌ Could not connect to the API. Please check the URL and network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A4D8F" />
        </TouchableOpacity>
        <Text style={styles.title}>API Configuration</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current API URL</Text>
          <Text style={styles.currentUrl}>{currentUrl}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>New API URL</Text>
          <TextInput
            style={styles.input}
            value={newUrl}
            onChangeText={setNewUrl}
            placeholder="https://your-api-url.com/api"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Ionicons name="wifi" size={20} color="#1A4D8F" />
            <Text style={styles.testButtonText}>Test Connection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Key</Text>
          <TextInput
            style={styles.input}
            value={adminKey}
            onChangeText={setAdminKey}
            placeholder="Enter admin key"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.helperText}>
            Required for security. Contact administrator if you don't have this.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.updateButton, loading && styles.disabledButton]} 
          onPress={updateApiUrl}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update API URL</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
          <Text style={styles.resetButtonText}>Reset to Default</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#1A4D8F" />
          <Text style={styles.infoText}>
            Changes are stored locally on your device. If you reinstall the app, it will revert to the default configuration.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A4D8F',
  },
  placeholder: {
    width: 24,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A4D8F',
    marginBottom: 10,
  },
  currentUrl: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  testButtonText: {
    color: '#1A4D8F',
    fontWeight: '500',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 16,
  },
  updateButton: {
    backgroundColor: '#1A4D8F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1A4D8F',
    marginLeft: 10,
    lineHeight: 20,
  },
});

export default ApiConfigScreen;
