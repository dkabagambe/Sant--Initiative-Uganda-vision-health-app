import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define types
export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: string;
  village?: string;
  district?: string;
  profile_image?: string;
}

export interface Product {
  id: string;
  name: string;
  power: string;
  price: number;
  stock_quantity: number;
  category: string;
  description: string;
}

export interface Payment {
  id: string;
  clientName: string;
  clientPhone: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  date: string;
  transactionId: string;
  productName?: string;
}

export interface Screening {
  id: string;
  clientName: string;
  healthWorkerId: string;
  visualAcuityLeft: string;
  visualAcuityRight: string;
  recommendedProductId?: string;
  date: string;
}

// Base URL configuration
// Production API (Heroku)
// const API_BASE_URL = "https://sante-production-app-42dca70009b0.herokuapp.com/api";

// Development API (local testing - uncomment for local development)
const API_BASE_URL = "http://20.20.42.133:5000/api"; // Physical device/emulator
// const API_BASE_URL = "http://10.0.2.2:5000/api"; // Android emulator
// const API_BASE_URL = "http://localhost:5000/api"; // iOS simulator

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for Heroku cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token && config.headers) {
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    // Handle specific errors
    if (error.response?.status === 401) {
      // Token expired
      AsyncStorage.removeItem("authToken");
      AsyncStorage.removeItem("user");
    }

    return Promise.reject(error);
  },
);

// API Service functions
export const apiService = {
  // ============ HEALTH CHECK ============
  async checkHealth() {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error("Health check failed:", err);
      return {
        status: "error",
        message: "Backend connection failed",
        error: err.message,
      };
    }
  },

  // ============ AUTHENTICATION ============
  async login(phoneNumber: string) {
    const response = await api.post("/auth/login", { phoneNumber });
    return response.data;
  },

  async verifyOTP(phoneNumber: string, otp: string, registrationData?: any) {
    const response = await api.post("/auth/verify-otp", {
      phoneNumber,
      otp,
      registrationData,
    });

    if (response.data.token && response.data.user) {
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  async logout() {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");
      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error("Logout error:", err);
      return { success: false, error: err.message };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      const err = error as Error;
      console.error("Get current user error:", err);
      return null;
    }
  },

  async storeUserData(user: User, token: string) {
    try {
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error("Store user data error:", err);
      return { success: false, error: err.message };
    }
  },

  // ============ PRODUCTS ============
  async getProducts(): Promise<{
    success: boolean;
    data: Product[];
    count: number;
  }> {
    const response = await api.get("/products");
    return response.data;
  },

  async updateProductStock(
    productId: string,
    quantityChange: number,
    frameType?: string,
  ) {
    const response = await api.patch(`/products/${productId}/stock`, {
      quantityChange,
      frameType,
    });
    return response.data;
  },

  // ============ SCREENINGS ============
  async createScreening(screeningData: any) {
    const response = await api.post("/screenings", screeningData);
    return response.data;
  },

  async getScreenings() {
    const response = await api.get("/screenings");
    return response.data;
  },

  async getScreeningStats() {
    const response = await api.get("/screenings/stats");
    return response.data;
  },

  // ============ PAYMENTS ============
  async createPayment(paymentData: any) {
    const response = await api.post("/payments", paymentData);
    return response.data;
  },

  async getPayments(): Promise<{
    success: boolean;
    data: Payment[];
    count: number;
  }> {
    const response = await api.get("/payments");
    return response.data;
  },

  async getPaymentStats() {
    const response = await api.get("/payments/stats");
    return response.data;
  },

  async updatePaymentStatus(paymentId: string, status: string) {
    const response = await api.patch(`/payments/${paymentId}/status`, {
      status,
    });
    return response.data;
  },

  // ============ SYNC ============
  async syncData(operations: any[]) {
    try {
      const response = await api.post("/sync", { operations });
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error("Sync error:", err);
      return {
        success: false,
        error: "Sync failed. Please try again later.",
      };
    }
  },

  // ============ REFERRALS ============
  async createReferral(referralData: any) {
    const response = await api.post("/referrals", referralData);
    return response.data;
  },

  async getReferrals(status?: string) {
    const response = await api.get("/referrals", { params: { status } });
    return response.data;
  },

  async getReferralStats() {
    const response = await api.get("/referrals/stats");
    return response.data;
  },

  async getHealthFacilities(district?: string) {
    const response = await api.get("/health-facilities", {
      params: { district },
    });
    return response.data;
  },

  async updateReferralStatus(
    referralId: string,
    status: string,
    notes?: string,
  ) {
    const response = await api.patch(`/referrals/${referralId}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  // ============ DASHBOARD ============
  async getDashboardStats() {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  async getInventorySummary() {
    const response = await api.get("/dashboard/inventory");
    return response.data;
  },

  async getInventory() {
    const response = await api.get("/inventory");
    return response.data;
  },

  async updateInventory(productId: string, data: { quantity: number }) {
    const response = await api.put(`/inventory/${productId}`, data);
    return response.data;
  },

  async getReports(reportType?: string, startDate?: string, endDate?: string) {
    const response = await api.get("/dashboard/reports", {
      params: { reportType, startDate, endDate },
    });
    return response.data;
  },

  async getClients() {
    const response = await api.get("/dashboard/clients");
    return response.data;
  },

  // ============ FILE UPLOAD ============
  async uploadFile(file: { uri: string; name: string; type: string }) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await api.post("/upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  },

  async uploadMultipleFiles(
    files: Array<{ uri: string; name: string; type: string }>,
  ) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      const response = await api.post("/upload/multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Multiple files upload error:", error);
      throw error;
    }
  },

  // ============ UTILITIES ============
  async checkConnection() {
    try {
      const health = await this.checkHealth();
      return {
        connected: health.status === "OK",
        database: health.database,
        mode: health.mode || "unknown",
        details: health,
      };
    } catch (error) {
      const err = error as Error;
      return {
        connected: false,
        error: err.message,
      };
    }
  },
};

export default api;
