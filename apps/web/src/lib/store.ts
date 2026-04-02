import { create } from "zustand";

// ─── Auth Store ───
interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: any) => void;
  logout: () => void;
  updateUser: (user: any) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  login: (token, refreshToken, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ isAuthenticated: true, user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
    set({ isAuthenticated: false, user: null, token: null });
  },
  updateUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user });
  },
  checkAuth: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        set({ isAuthenticated: true, token, user: JSON.parse(userStr) });
      }
    }
  },
}));

// ─── Scan Store ───
interface ScanState {
  scanType: "leaf" | "field";
  selectedImage: File | null;
  previewUrl: string | null;
  isScanning: boolean;
  scanResult: any | null;
  setScanType: (type: "leaf" | "field") => void;
  setSelectedImage: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setIsScanning: (scanning: boolean) => void;
  setScanResult: (result: any) => void;
  resetScan: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  scanType: "leaf",
  selectedImage: null,
  previewUrl: null,
  isScanning: false,
  scanResult: null,
  setScanType: (type) => set({ scanType: type }),
  setSelectedImage: (file) => set({ selectedImage: file }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  setScanResult: (result) => set({ scanResult: result }),
  resetScan: () => set({ selectedImage: null, previewUrl: null, isScanning: false, scanResult: null }),
}));

// ─── Chat Store ───
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  isLoading: boolean;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setIsLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  sessionId: "default",
  isLoading: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
}));
