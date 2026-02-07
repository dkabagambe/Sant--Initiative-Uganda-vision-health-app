import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle specific errors
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      AsyncStorage.removeItem("authToken");
      AsyncStorage.removeItem("user");
      // You might want to trigger a navigation event here
    }

    return Promise.reject(error);
  },
);

// API Service functions
export const apiService = {
  // Health check
  async checkHealth() {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    return response.data;
  },

  // Auth
  async login(phoneNumber: string) {
    const response = await api.post(API_ENDPOINTS.LOGIN, { phoneNumber });
    return response.data;
  },

  async verifyOTP(phoneNumber: string, otp: string, name?: string) {
    const response = await api.post(API_ENDPOINTS.VERIFY_OTP, {
      phoneNumber,
      otp,
      name,
    });

    // Save token and user data
    if (response.data.token && response.data.user) {
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
  },

  async getCurrentUser() {
    const userStr = await AsyncStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Products
  async getProducts() {
    const response = await api.get(API_ENDPOINTS.PRODUCTS);
    return response.data;
  },

  // Screenings
  async createScreening(screeningData: any) {
    const response = await api.post(API_ENDPOINTS.SCREENINGS, screeningData);

    // Store locally for offline sync if needed
    try {
      const pendingScreenings = await AsyncStorage.getItem("pendingScreenings");
      const screenings = pendingScreenings ? JSON.parse(pendingScreenings) : [];
      screenings.push({
        ...screeningData,
        id: response.data.screeningId,
        synced: true,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem(
        "pendingScreenings",
        JSON.stringify(screenings),
      );
    } catch (error) {
      console.error("Error saving screening locally:", error);
    }

    return response.data;
  },

  // Payments
  async createPayment(paymentData: any) {
    const response = await api.post(API_ENDPOINTS.PAYMENTS, paymentData);

    // Store locally for offline sync if needed
    try {
      const pendingPayments = await AsyncStorage.getItem("pendingPayments");
      const payments = pendingPayments ? JSON.parse(pendingPayments) : [];
      payments.push({
        ...paymentData,
        transactionId: response.data.transactionId,
        synced: true,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem("pendingPayments", JSON.stringify(payments));
    } catch (error) {
      console.error("Error saving payment locally:", error);
    }

    return response.data;
  },

  // Sync
  async syncData(data: any[]) {
    const response = await api.post(API_ENDPOINTS.SYNC, { operations: data });
    return response.data;
  },

  // Check connection
  async checkConnection() {
    try {
      const health = await this.checkHealth();
      return {
        connected: true,
        database: health.database,
        mode: health.mode,
      };
    } catch (error) {
      return {
        connected: false,
        error: "Unknown error",
      };
    }
  },
};

export default api;
