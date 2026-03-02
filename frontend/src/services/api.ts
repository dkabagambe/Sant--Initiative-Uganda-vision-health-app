import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConfigService, LOCAL_API_URL, VERCEL_API_URL } from "./configService";

// Env override for physical device (must match configService)
const envApiUrl = typeof process !== "undefined"
  ? (process.env.EXPO_PUBLIC_API_URL ?? "")
  : "";

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

// API base URL: env override > ConfigService (localhost in dev, Vercel in prod)
const getDefaultBaseUrl = () =>
  envApiUrl || (typeof __DEV__ !== "undefined" && __DEV__
    ? LOCAL_API_URL
    : VERCEL_API_URL);

let API_BASE_URL = getDefaultBaseUrl();

// Initialize API URL from remote config (AsyncStorage override)
const initializeApiUrl = async () => {
  try {
    API_BASE_URL = await ConfigService.getApiUrl();
    api.defaults.baseURL = API_BASE_URL;
  } catch (error) {
    console.warn("Failed to load remote API config, using default:", error);
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s for Vercel cold starts; localhost is usually faster
  headers: {
    "Content-Type": "application/json",
  },
});

// Load saved API URL (or use default: localhost in dev, Vercel in prod)
initializeApiUrl();

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
    const status = error.response?.status;
    const isNotRegistered = status === 400
      && error.config?.url?.includes("/auth/login")
      && (error.response?.data as { code?: string })?.code === "NOT_REGISTERED";
    // Don't log 401 for dashboard (fallback), or 400 NOT_REGISTERED (expected "register first" flow)
    const skipLog = (status === 401 && error.config?.url?.includes("/dashboard/")) || isNotRegistered;
    if (!skipLog) {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status,
        message: error.message,
      });
    }

    // Handle specific errors
    if (status === 401) {
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
      // Normalize user: backend returns snake_case, frontend expects camelCase for consistency
      const u = response.data.user;
      const normalizedUser = {
        ...u,
        id: u.id,
        phoneNumber: u.phone_number ?? u.phoneNumber,
        fullName: u.full_name ?? u.fullName,
        role: u.role,
        district: u.district,
        village: u.village,
        first_name: u.first_name,
        last_name: u.last_name,
        full_name: u.full_name,
        phone_number: u.phone_number,
      };
      await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
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

  async updateUserProfile(data: any) {
    const response = await api.patch("/auth/profile", data);
    return response.data;
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

  async initiateMobileMoneyPayment(paymentData: any) {
    const response = await api.post("/payments/initiate", paymentData);
    return response.data;
  },

  async getPaymentStatus(paymentId: string) {
    const response = await api.get(`/payments/${paymentId}/status`);
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

  async getReferralById(id: string) {
    const response = await api.get(`/referrals/${id}`);
    return response.data;
  },

  async updateReferral(referralId: string, data: any) {
    const response = await api.patch(`/referrals/${referralId}`, data);
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
    const response = await api.get("/products");
    return response.data;
  },

  async updateInventory(productId: string, data: { quantity: number }) {
    const response = await api.patch(`/products/${productId}/stock`, {
      quantityChange: data.quantity,
    });
    return response.data;
  },

  async addStock(
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
