// For development - use your computer's IP address
const API_BASE_URL = "http://20.20.42.133:5000/api";

// Alternative options:
// const API_BASE_URL = "http://localhost:5000/api"; // iOS simulator only
// const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
// const API_BASE_URL = 'http://192.168.1.X:5000/api'; // Physical device on same WiFi

export const API_ENDPOINTS = {
  // Health check
  HEALTH: `${API_BASE_URL}/health`,

  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,

  // Products
  PRODUCTS: `${API_BASE_URL}/products`,

  // Screenings
  SCREENINGS: `${API_BASE_URL}/screenings`,

  // Payments
  PAYMENTS: `${API_BASE_URL}/payments`,

  // Sync
  SYNC: `${API_BASE_URL}/sync`,
};

export default API_BASE_URL;
