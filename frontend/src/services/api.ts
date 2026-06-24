import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConfigService, LOCAL_API_URL, VERCEL_API_URL } from "./configService";

// Env override for physical device (must match configService)
const envApiUrl =
  typeof process !== "undefined" ? (process.env.EXPO_PUBLIC_API_URL ?? "") : "";

// Define types
export interface User {
  id: string;
  phone_number: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  role: string;
  village?: string;
  district?: string;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy properties for backward compatibility
  phoneNumber?: string;
  fullName?: string;
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
  envApiUrl ||
  (typeof __DEV__ !== "undefined" && __DEV__ ? LOCAL_API_URL : VERCEL_API_URL);

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
    const isNotRegistered =
      status === 400 &&
      error.config?.url?.includes("/auth/login") &&
      (error.response?.data as { code?: string })?.code === "NOT_REGISTERED";
    // Don't log 401 for dashboard (fallback), or 400 NOT_REGISTERED (expected "register first" flow)
    const skipLog =
      (status === 401 && error.config?.url?.includes("/dashboard/")) ||
      isNotRegistered;
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

    const data = response?.data;
    if (!data) {
      return { success: false, error: "Invalid response from server" };
    }

    if (data.token && data.user) {
      try {
        await AsyncStorage.setItem("authToken", data.token);
        const u = data.user;
        const normalizedUser = {
          ...u,
          id: u.id,
          phoneNumber: u.phone_number ?? u.phoneNumber,
          fullName: u.full_name ?? u.fullName,
          role: u.role ?? "health_worker",
          district: u.district,
          village: u.village,
          first_name: u.first_name,
          last_name: u.last_name,
          full_name: u.full_name,
          phone_number: u.phone_number ?? u.phoneNumber,
        };
        await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
      } catch (e) {
        console.warn("Storage write after login:", e);
      }
    }

    return data;
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
      // First try to get stored user data to get phone number
      const userStr = await AsyncStorage.getItem("user");
      const storedUser = userStr ? JSON.parse(userStr) : null;

      // First try to get from backend (for fresh data)
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        try {
          // Pass phone number if we have it
          const phoneNumber =
            storedUser?.phone_number || storedUser?.phoneNumber;
          const params = phoneNumber ? { phoneNumber } : {};

          const response = await api.get("/current-user/me", { params });
          if (response.data.success) {
            const userData = response.data.data;
            // Update AsyncStorage with fresh data
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            return userData;
          }
        } catch (backendError) {
          // If backend fails, fall back to AsyncStorage
          console.warn("Backend user fetch failed, using cache:", backendError);
        }
      }

      // Fallback to AsyncStorage
      return storedUser;
    } catch (error) {
      console.error("Failed to get current user:", error);
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
    const response = await api.post("/simple-payments/create", paymentData);
    return response.data;
  },

  async initiateMobileMoneyPayment(paymentData: any) {
    const response = await api.post("/simple-payments/create", paymentData);
    return response.data;
  },

  async getPaymentStatus(paymentId: string) {
    const response = await api.get(`/simple-payments/${paymentId}/status`);
    return response.data;
  },

  async getPayments(): Promise<{
    success: boolean;
    data: Payment[];
    count: number;
  }> {
    const response = await api.get("/simple-payments/list");
    return response.data;
  },

  async getPaymentStats() {
    const response = await api.get("/simple-payments/stats");
    return response.data;
  },

  async updatePaymentStatus(paymentId: string, status: string) {
    const response = await api.patch(`/simple-payments/${paymentId}/status`, {
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
    const response = await api.post("/simple-referrals/create", referralData);
    return response.data;
  },

  async getReferrals(status?: string) {
    const response = await api.get("/simple-referrals/list", {
      params: { status },
    });
    return response.data;
  },

  async getReferralById(id: string) {
    const response = await api.get(`/simple-referrals/${id}`);
    return response.data;
  },

  async updateReferral(referralId: string, data: any) {
    const response = await api.patch(`/simple-referrals/${referralId}`, data);
    return response.data;
  },

  async getReferralStats() {
    const response = await api.get("/simple-referrals/stats");
    return response.data;
  },

  async updateReferralStatus(
    referralId: string,
    status: string,
    notes?: string,
  ) {
    const response = await api.patch(`/simple-referrals/${referralId}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  // ============ COMMUNITY FOLLOW-UP ============
  async getPendingFollowUps() {
    const response = await api.get("/simple-followups/pending");
    return response.data;
  },

  async createFollowUp(followUpData: any) {
    const response = await api.post("/simple-followups/create", followUpData);
    return response.data;
  },

  async getFollowUps() {
    const response = await api.get("/simple-followups/list");
    return response.data;
  },

  // ============ DASHBOARD ============
  async getDashboardStats() {
    const response = await api.get("/simple-dashboard/stats");
    return response.data;
  },

  async getInventorySummary() {
    const response = await api.get("/simple-inventory/summary");
    return response.data;
  },

  async getInventory() {
    const response = await api.get("/products");
    return response.data;
  },

  async updateInventory(productId: string, data: { quantity: number }) {
    const response = await api.patch(`/simple-stock/${productId}/stock`, {
      stock_quantity: data.quantity,
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
    const response = await api.get("/simple-reports/list", {
      params: { reportType, startDate, endDate },
    });
    return response.data;
  },

  async getClients() {
    const response = await api.get("/simple-clients/list");
    return response.data;
  },

  // ============ FILE UPLOAD ============
  async uploadFile(file: { uri: string; name: string; type: string }) {
    try {
      console.log("Starting single file upload...");
      console.log("File to upload:", file);

      const uploadFormData = new FormData();
      uploadFormData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      console.log("FormData created for single file upload...");

      const uploadResponse = await api.post(
        "/simple-upload/single",
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        },
      );

      console.log("Single file upload response:", uploadResponse.data);
      return uploadResponse.data;
    } catch (error: any) {
      console.error("Single file upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);

      // Better error message for user
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          "Upload timed out. Please check your connection and try again.",
        );
      } else {
        throw new Error(error.message || "Failed to upload file");
      }
    }
  },

  async uploadVSLADocuments(
    files: Array<{ uri: string; name: string; type: string }>,
  ) {
    try {
      console.log("Starting VSLA documents upload...");
      console.log("Files to upload:", files);

      const vslFormData = new FormData();

      files.forEach((file: any, index: number) => {
        console.log(`Appending file ${index + 1}:`, {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });

        vslFormData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      console.log("FormData created, sending to backend...");

      const vslResponse = await api.post(
        "/vsla-upload/documents",
        vslFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 second timeout for multiple files
        },
      );

      console.log("VSLA upload response:", vslResponse.data);
      return vslResponse.data;
    } catch (error: any) {
      console.error("VSLA documents upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);

      // Better error message for user
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          "Upload timed out. Please check your connection and try again.",
        );
      } else {
        throw new Error(error.message || "Failed to upload documents");
      }
    }
  },

  async uploadOutletDocuments(
    files: Array<{ uri: string; name: string; type: string }>,
  ) {
    try {
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      const response = await api.post("/outlet-upload/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 120 second timeout for large outlet photos
      });

      return response.data;
    } catch (error) {
      console.error("Outlet documents upload error:", error);
      throw error;
    }
  },

  async uploadOutletFile(file: { uri: string; name: string; type: string }) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await api.post("/outlet-upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 90000, // 90 second timeout for large outlet photos
      });

      return response.data;
    } catch (error) {
      console.error("Outlet file upload error:", error);
      throw error;
    }
  },

  async uploadCHWDocuments(
    files: Array<{ uri: string; name: string; type: string }>,
  ) {
    try {
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      const response = await api.post("/chw-upload/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 120 second timeout for large CHW documents
      });

      return response.data;
    } catch (error) {
      console.error("CHW documents upload error:", error);
      throw error;
    }
  },

  async uploadCHWFile(file: { uri: string; name: string; type: string }) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await api.post("/chw-upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 90000, // 90 second timeout for large CHW documents
      });

      return response.data;
    } catch (error) {
      console.error("CHW file upload error:", error);
      throw error;
    }
  },

  // ============ USER DIRECTORY ============
  async getUserDirectory() {
    const response = await api.get("/user-directory/list");
    return response.data;
  },

  async getVHTs() {
    const response = await api.get("/user-directory/vhts");
    return response.data;
  },

  async getVSLAs() {
    const response = await api.get("/user-directory/vslas");
    return response.data;
  },

  async getRetailSellers() {
    const response = await api.get("/user-directory/retail-sellers");
    return response.data;
  },

  async getUserDetails(userId: string) {
    const response = await api.get(`/user-directory/user/${userId}`);
    return response.data;
  },

  // ============ HEALTH FACILITIES ============
  async getHealthFacilities(district?: string) {
    const response = await api.get("/health-facilities", {
      params: district ? { district } : {},
    });
    return response.data;
  },

  // ============ REMOTE CONFIG ============
  async getRemoteConfig() {
    const response = await api.get("/remote-config");
    return response.data;
  },

  async updateRemoteConfig(config: any) {
    const response = await api.patch("/remote-config", config);
    return response.data;
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
