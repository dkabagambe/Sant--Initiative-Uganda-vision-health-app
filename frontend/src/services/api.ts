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
const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
    try {
      const response = await api.post("/auth/login", { phoneNumber });
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error("Login error:", err);
      // Mock response for development
      return {
        success: true,
        message: "OTP sent (mock mode)",
        phoneNumber,
        otp: "123456",
      };
    }
  },

  async verifyOTP(phoneNumber: string, otp: string, name?: string) {
    try {
      const response = await api.post("/auth/verify-otp", {
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
    } catch (error) {
      const err = error as Error;
      console.error("OTP verification error:", err);
      // Mock response for development
      const mockUser: User = {
        id: "user_" + Date.now(),
        phoneNumber,
        fullName:
          name || `User ${phoneNumber.substring(phoneNumber.length - 4)}`,
        role: "health_worker",
      };

      const mockToken = `mock_jwt_${Date.now()}`;

      await AsyncStorage.setItem("authToken", mockToken);
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));

      return {
        success: true,
        message: "Login successful (mock mode)",
        token: mockToken,
        user: mockUser,
      };
    }
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

  // ============ PRODUCTS ============
  async getProducts(): Promise<{
    success: boolean;
    data: Product[];
    count: number;
    source: string;
  }> {
    try {
      const response = await api.get("/products");
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error("Get products error:", err);
      // Mock response
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Reading Glasses +1.00",
          power: "+1.00",
          price: 15000,
          stock_quantity: 42,
          category: "reading_glasses",
          description: "For early presbyopia",
        },
        {
          id: "2",
          name: "Reading Glasses +1.50",
          power: "+1.50",
          price: 15000,
          stock_quantity: 56,
          category: "reading_glasses",
          description: "For mild near vision difficulty",
        },
        {
          id: "3",
          name: "Reading Glasses +2.00",
          power: "+2.00",
          price: 15000,
          stock_quantity: 78,
          category: "reading_glasses",
          description: "Standard reading glasses",
        },
        {
          id: "4",
          name: "Reading Glasses +2.50",
          power: "+2.50",
          price: 15000,
          stock_quantity: 35,
          category: "reading_glasses",
          description: "For moderate presbyopia",
        },
        {
          id: "5",
          name: "Reading Glasses +3.00",
          power: "+3.00",
          price: 15000,
          stock_quantity: 29,
          category: "reading_glasses",
          description: "For advanced presbyopia",
        },
        {
          id: "6",
          name: "Reading Glasses +3.50",
          power: "+3.50",
          price: 18000,
          stock_quantity: 17,
          category: "reading_glasses",
          description: "For severe presbyopia",
        },
      ];

      return {
        success: true,
        data: mockProducts,
        count: 6,
        source: "mock-data",
      };
    }
  },

  async updateProductStock(productId: string, quantityChange: number) {
    try {
      const response = await api.patch(`/products/${productId}/stock`, {
        quantityChange,
      });
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error("Update stock error:", err);
      return {
        success: false,
        error: "Failed to update stock",
      };
    }
  },

  // ============ SCREENINGS ============
  async createScreening(screeningData: any) {
    try {
      const response = await api.post("/screenings", screeningData);

      // Store locally for offline sync
      try {
        const pendingScreenings =
          (await AsyncStorage.getItem("pendingScreenings")) || "[]";
        const screenings = JSON.parse(pendingScreenings);
        screenings.push({
          ...screeningData,
          id: response.data?.screeningId || `screen_${Date.now()}`,
          synced: true,
          timestamp: new Date().toISOString(),
        });
        await AsyncStorage.setItem(
          "pendingScreenings",
          JSON.stringify(screenings),
        );
      } catch (storageError) {
        console.error("Error saving screening locally:", storageError);
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error("Create screening error:", err);

      // Save locally for offline sync
      try {
        const pendingScreenings =
          (await AsyncStorage.getItem("pendingScreenings")) || "[]";
        const screenings = JSON.parse(pendingScreenings);
        screenings.push({
          ...screeningData,
          id: `screen_${Date.now()}`,
          synced: false,
          timestamp: new Date().toISOString(),
        });
        await AsyncStorage.setItem(
          "pendingScreenings",
          JSON.stringify(screenings),
        );
      } catch (storageError) {
        console.error(
          "Error saving screening locally (offline):",
          storageError,
        );
      }

      return {
        success: true,
        message: "Screening saved locally (offline)",
        screeningId: `screen_${Date.now()}`,
        offline: true,
      };
    }
  },

  // ============ PAYMENTS ============
  async createPayment(paymentData: any) {
    try {
      const response = await api.post("/payments", paymentData);

      // Store locally for offline sync
      try {
        const pendingPayments =
          (await AsyncStorage.getItem("pendingPayments")) || "[]";
        const payments = JSON.parse(pendingPayments);
        payments.push({
          ...paymentData,
          id: response.data?.transactionId || `txn_${Date.now()}`,
          synced: true,
          timestamp: new Date().toISOString(),
        });
        await AsyncStorage.setItem("pendingPayments", JSON.stringify(payments));
      } catch (storageError) {
        console.error("Error saving payment locally:", storageError);
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error("Create payment error:", err);

      // Save locally for offline sync
      try {
        const pendingPayments =
          (await AsyncStorage.getItem("pendingPayments")) || "[]";
        const payments = JSON.parse(pendingPayments);
        payments.push({
          ...paymentData,
          id: `txn_${Date.now()}`,
          synced: false,
          timestamp: new Date().toISOString(),
        });
        await AsyncStorage.setItem("pendingPayments", JSON.stringify(payments));
      } catch (storageError) {
        console.error("Error saving payment locally (offline):", storageError);
      }

      return {
        success: true,
        message: "Payment saved locally (offline)",
        transactionId: `TXN_${Date.now()}`,
        offline: true,
      };
    }
  },

  async getPayments(): Promise<{
    success: boolean;
    data: Payment[];
    count: number;
    source: string;
  }> {
    try {
      const response = await api.get("/payments");
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error("Get payments error:", err);
      return {
        success: true,
        data: [],
        count: 0,
        source: "mock-data",
      };
    }
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
