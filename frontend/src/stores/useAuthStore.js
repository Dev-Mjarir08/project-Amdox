import { create } from 'zustand';
import api from '../lib/api.js';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token, isAuthenticated: !!token });
  },
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data && response.data.token) {
        const token = response.data.token;
        const user = response.data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
        return response;
      }
      return response;
    } catch (e) {
      if (e.response?.data?.isDeactivated) {
        const errObj = new Error(e.response.data.message || 'Account is deactivated');
        errObj.isDeactivated = true;
        errObj.deactivatedUntil = e.response.data.deactivatedUntil;
        throw errObj;
      }
      const errMsg = e.response?.data?.message || e.message || 'Invalid credentials';
      throw new Error(errMsg);
    }
  },
  sendOTP: async (email) => {
    try {
      const res = await api.post('/auth/send-otp', { email });
      return res.data;
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || 'Failed to send OTP';
      throw new Error(errMsg);
    }
  },
  verifyOTP: async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      return res.data;
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || 'Failed to verify OTP';
      throw new Error(errMsg);
    }
  },
  deactivateAccount: async (days = 15) => {
    try {
      const res = await api.post('/auth/deactivate', { days });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
      return res.data;
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || 'Failed to deactivate account';
      throw new Error(errMsg);
    }
  },
  reactivateAccount: async (credentials) => {
    try {
      const res = await api.post('/auth/reactivate', credentials);
      if (res.data && res.data.token) {
        const token = res.data.token;
        const user = res.data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      }
      return res.data;
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || 'Failed to reactivate account';
      throw new Error(errMsg);
    }
  },
  deleteAccount: async (password) => {
    try {
      const res = await api.delete('/auth/delete-account', { data: { password } });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
      return res.data;
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || 'Failed to delete account';
      throw new Error(errMsg);
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
