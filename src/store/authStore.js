import { create } from "zustand";
import api from "../api/client";

export const useAuth = create((set, get) => ({
  user: null,
  loading: true,

  // ✅ LOGIN
  login: async (credentials) => {
    try {
      const res = await api.post("/common-api/login", credentials);
      const { token, payload } = res.data;

      // Save token to localStorage
      if (token) {
        localStorage.setItem("token", token);
      }

      // Update state instantly so UI updates without reload
      set({ user: payload, loading: false });
      
      // ✅ Return the payload so we can use the role immediately
      return payload; 
    } catch (err) {
      console.error("Login failed:", err);
      set({ loading: false });
      return null;
    }
  },

  // ✅ REGISTER
  register: async (userData) => {
    try {
      await api.post("/common-api/users", userData);
      return true;
    } catch (err) {
      console.error("Register failed:", err);
      return false;
    }
  },

  // ✅ LOGOUT
  logout: async () => {
    try {
      await api.get("/common-api/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    set({ user: null });
  },

  // ✅ REFRESH SESSION
  refreshSession: async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      set({ user: null, loading: false });
      return;
    }

    try {
      const res = await api.get("/common-api/me");
      set({ user: res.data.payload, loading: false });
    } catch (err) {
      console.log("Session expired - clearing token");
      localStorage.removeItem("token");
      set({ user: null, loading: false });
    }
  }
}));