import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ML_URL = process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8001";
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8002";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  // ── Email / Password ──────────────────────────────────────
  register: (name: string, email: string, password: string) =>
    api.post("/api/v1/auth/register", { name, email, password }),
  loginEmail: (email: string, password: string) =>
    api.post("/api/v1/auth/login", { email, password }),
  setRole: (role: string) =>
    api.put("/api/v1/auth/role", { role }),

  // ── Profile ───────────────────────────────────────────────
  getProfile: () => api.get("/api/v1/auth/me"),
  updateProfile: (data: any) => api.put("/api/v1/auth/me", data),

  // ── OTP (legacy) ──────────────────────────────────────────
  sendOTP: (phone: string) => api.post("/api/v1/auth/send-otp", { phone }),
  verifyOTP: (phone: string, otp: string) =>
    api.post("/api/v1/auth/verify-otp", { phone, otp }),
};

// Scan API — calls ML service directly for classification, backend for saving
export const scanApi = {
  // Direct ML service call for real-time analysis
  classifyLeaf: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${ML_URL}/api/v1/classify`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  segmentField: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${ML_URL}/api/v1/segment`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  // Backend calls for persistence
  scanLeaf: (file: File, cropType?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (cropType) formData.append("crop_type", cropType);
    return api.post("/api/v1/scan/leaf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  scanField: (file: File, cropType?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (cropType) formData.append("crop_type", cropType);
    return api.post("/api/v1/scan/field", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getScan: (scanId: string) => api.get(`/api/v1/scan/${scanId}`),
};

// History API
export const historyApi = {
  getHistory: (page = 1, limit = 20) =>
    api.get(`/api/v1/history/?page=${page}&limit=${limit}`),
  deleteScan: (scanId: string) => api.delete(`/api/v1/history/${scanId}`),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get("/api/v1/analytics/dashboard"),
  getTrends: (days = 30) => api.get(`/api/v1/analytics/trends?days=${days}`),
  getScanAnalytics: () => api.get("/api/v1/analytics/scans"),
};

// Chat API
export const chatApi = {
  sendMessage: (message: string, sessionId?: string, history?: any[]) =>
    axios.post(`${AI_URL}/api/v1/chat`, { message, session_id: sessionId, history }),
  getHistory: (sessionId: string) =>
    axios.get(`${AI_URL}/api/v1/chat/history/${sessionId}`),
  clearHistory: (sessionId: string) =>
    axios.delete(`${AI_URL}/api/v1/chat/history/${sessionId}`),
  getSuggestions: () => axios.get(`${AI_URL}/api/v1/chat/suggestions`),
};

// Learn API
export const learnApi = {
  getSessions: (filters?: any) => api.get("/api/v1/sessions", { params: filters }),
  getSession: (id: string) => api.get(`/api/v1/sessions/${id}`),
  getCrops: () => api.get("/api/v1/crops"),
  createSession: (data: any) => api.post("/api/v1/sessions", data),
  bookSession: (data: any) => api.post("/api/v1/bookings", data),
  getMyBookings: () => api.get("/api/v1/bookings/my"),
  createOrder: (data: any) => api.post("/api/v1/payments/create-order", data),
  verifyPayment: (data: any) => api.post("/api/v1/payments/verify", data),
  submitFeedback: (data: any) => api.post("/api/v1/interactions/feedback", data),
  getFeedback: (sessionId: string) =>
    api.get(`/api/v1/interactions/feedback/${sessionId}`),
  saveNotes: (data: any) => api.post("/api/v1/interactions/notes", data),
  getNotes: (sessionId: string) =>
    api.get(`/api/v1/interactions/notes/${sessionId}`),
};

export default api;
