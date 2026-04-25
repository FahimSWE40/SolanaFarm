import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://api.solanaseeker.app/api';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor: add access token
    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: handle 401 → refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Prevent concurrent refresh requests
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshToken();
          }

          try {
            await this.refreshPromise;
            this.refreshPromise = null;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.refreshPromise = null;
            // Clear tokens and redirect to login
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            throw refreshError;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', newRefreshToken);
  }

  // ============ Auth ============
  async getNonce(walletAddress: string) {
    const { data } = await this.client.post('/auth/nonce', { walletAddress });
    return data.data;
  }

  async verifyWallet(walletAddress: string, signature: string, referralCode?: string) {
    const { data } = await this.client.post('/auth/verify-wallet', {
      walletAddress, signature, referralCode,
    });
    return data.data;
  }

  async logout() {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (refreshToken) {
      await this.client.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  // ============ User ============
  async getProfile() {
    const { data } = await this.client.get('/user/me');
    return data.data;
  }

  async updateProfile(body: { username?: string; avatarUrl?: string; email?: string }) {
    const { data } = await this.client.patch('/user/me', body);
    return data.data;
  }

  async checkUsername(username: string) {
    const { data } = await this.client.get(`/user/check-username?username=${username}`);
    return data.data;
  }

  // ============ Tasks ============
  async getTasks(frequency?: string) {
    const params = frequency ? `?frequency=${frequency}` : '';
    const { data } = await this.client.get(`/tasks${params}`);
    return data.data;
  }

  async getDailyTasks() {
    const { data } = await this.client.get('/tasks/daily');
    return data.data;
  }

  async getWeeklyTasks() {
    const { data } = await this.client.get('/tasks/weekly');
    return data.data;
  }

  async completeTask(taskId: string, proofUrl?: string) {
    const { data } = await this.client.post(`/tasks/${taskId}/complete`, { proofUrl });
    return data.data;
  }

  async claimTask(taskId: string) {
    const { data } = await this.client.post(`/tasks/${taskId}/claim`);
    return data.data;
  }

  // ============ XP ============
  async getXPSummary() {
    const { data } = await this.client.get('/xp/summary');
    return data.data;
  }

  async getXPLogs(page: number = 1) {
    const { data } = await this.client.get(`/xp/logs?page=${page}`);
    return data.data;
  }

  // ============ Leaderboard ============
  async getLeaderboard(period: string, page: number = 1) {
    const { data } = await this.client.get(`/leaderboard/${period}?page=${page}`);
    return data.data;
  }

  async getMyRank() {
    const { data } = await this.client.get('/leaderboard/me');
    return data.data;
  }

  // ============ Rewards ============
  async getEligibility() {
    const { data } = await this.client.get('/rewards/eligibility');
    return data.data;
  }

  async getTiers() {
    const { data } = await this.client.get('/rewards/tiers');
    return data.data;
  }

  // ============ Referrals ============
  async getReferralCode() {
    const { data } = await this.client.get('/referral/code');
    return data.data;
  }

  async getReferralStats() {
    const { data } = await this.client.get('/referral/stats');
    return data.data;
  }

  async applyReferralCode(referralCode: string) {
    const { data } = await this.client.post('/referral/apply', { referralCode });
    return data.data;
  }

  // ============ Wallet ============
  async getWalletScore() {
    const { data } = await this.client.get('/wallet/score');
    return data.data;
  }

  async syncWallet() {
    const { data } = await this.client.post('/wallet/sync');
    return data.data;
  }

  // ============ Badges ============
  async getBadges() {
    const { data } = await this.client.get('/badges');
    return data.data;
  }

  // ============ Premium ============
  async getPlans() {
    const { data } = await this.client.get('/premium/plans');
    return data.data;
  }

  async subscribe(plan: string) {
    const { data } = await this.client.post('/premium/subscribe', { plan });
    return data.data;
  }

  // ============ Notifications ============
  async getNotifications(page: number = 1) {
    const { data } = await this.client.get(`/notifications?page=${page}`);
    return data.data;
  }

  async registerDevice(fcmToken: string) {
    await this.client.post('/notifications/register-device', { fcmToken });
  }

  // ============ Quiz ============
  async getQuizzes() {
    const { data } = await this.client.get('/quiz');
    return data.data;
  }

  async getQuiz(quizId: string) {
    const { data } = await this.client.get(`/quiz/${quizId}`);
    return data.data;
  }

  async submitQuiz(quizId: string, answers: number[]) {
    const { data } = await this.client.post(`/quiz/${quizId}/submit`, { answers });
    return data.data;
  }
}

export const api = new ApiClient();
export default api;
