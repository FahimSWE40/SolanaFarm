import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';

// ============ Auth Store ============
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  setUser: (user: any) => void;
  setAuthenticated: (value: boolean) => void;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  setUser: (user) => set({ user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),

  login: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    set({ isAuthenticated: true });
    await get().fetchProfile();
  },

  logout: async () => {
    await api.logout();
    set({ isAuthenticated: false, user: null });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        set({ isAuthenticated: true });
        await get().fetchProfile();
      }
    } catch {
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const profile = await api.getProfile();
      set({ user: profile });
    } catch {
      // Token might be expired, will be handled by interceptor
    }
  },
}));

// ============ XP Store ============
interface XPState {
  xpTotal: number;
  level: number;
  streakCount: number;
  todayXP: number;
  progressPercent: number;
  xpToNextLevel: number;
  streakBonusPercent: number;
  premiumMultiplier: number;
  setXPSummary: (summary: any) => void;
  fetchXPSummary: () => Promise<void>;
}

export const useXPStore = create<XPState>((set) => ({
  xpTotal: 0,
  level: 1,
  streakCount: 0,
  todayXP: 0,
  progressPercent: 0,
  xpToNextLevel: 100,
  streakBonusPercent: 0,
  premiumMultiplier: 1.0,

  setXPSummary: (summary) => set({
    xpTotal: summary.xpTotal,
    level: summary.level,
    streakCount: summary.streakCount,
    todayXP: summary.todayXP,
    progressPercent: summary.progressPercent,
    xpToNextLevel: summary.xpToNextLevel,
    streakBonusPercent: summary.streakBonusPercent,
    premiumMultiplier: summary.premiumMultiplier,
  }),

  fetchXPSummary: async () => {
    try {
      const summary = await api.getXPSummary();
      set({
        xpTotal: summary.xpTotal,
        level: summary.level,
        streakCount: summary.streakCount,
        todayXP: summary.todayXP,
        progressPercent: summary.progressPercent,
        xpToNextLevel: summary.xpToNextLevel,
        streakBonusPercent: summary.streakBonusPercent,
        premiumMultiplier: summary.premiumMultiplier,
      });
    } catch (e) {
      console.error('Failed to fetch XP summary:', e);
    }
  },
}));

// ============ UI Store ============
interface UIState {
  showXPAnimation: boolean;
  xpAnimationAmount: number;
  showLevelUp: boolean;
  newLevel: number;
  triggerXPAnimation: (amount: number) => void;
  triggerLevelUp: (level: number) => void;
  dismissXPAnimation: () => void;
  dismissLevelUp: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  showXPAnimation: false,
  xpAnimationAmount: 0,
  showLevelUp: false,
  newLevel: 0,

  triggerXPAnimation: (amount) =>
    set({ showXPAnimation: true, xpAnimationAmount: amount }),
  
  triggerLevelUp: (level) =>
    set({ showLevelUp: true, newLevel: level }),

  dismissXPAnimation: () =>
    set({ showXPAnimation: false }),

  dismissLevelUp: () =>
    set({ showLevelUp: false }),
}));
