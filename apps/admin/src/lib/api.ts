import axios, { AxiosInstance } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class AdminApi {
  private http: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.http = axios.create({ baseURL: BASE, timeout: 15000 });

    this.http.interceptors.request.use((cfg) => {
      const t = this.token || (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null);
      if (t) cfg.headers.Authorization = `Bearer ${t}`;
      return cfg;
    });
  }

  setToken(t: string) {
    this.token = t;
    if (typeof window !== 'undefined') localStorage.setItem('adminToken', t);
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
  }

  async login(email: string, password: string) {
    const { data } = await this.http.post('/admin/login', { email, password });
    return data.data;
  }

  async getAnalytics() {
    const { data } = await this.http.get('/admin/analytics');
    return data.data;
  }

  async getUsers(search?: string, page = 1) {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    const { data } = await this.http.get(`/admin/users?${params}`);
    return data.data;
  }

  async getTasks(page = 1) {
    const { data } = await this.http.get(`/admin/tasks?page=${page}`);
    return data.data;
  }

  async createTask(body: Record<string, unknown>) {
    const { data } = await this.http.post('/admin/tasks', body);
    return data.data;
  }

  async updateTask(id: string, body: Record<string, unknown>) {
    const { data } = await this.http.patch(`/admin/tasks/${id}`, body);
    return data.data;
  }

  async deleteTask(id: string) {
    await this.http.delete(`/admin/tasks/${id}`);
  }

  async getFraud(page = 1) {
    const { data } = await this.http.get(`/admin/fraud?page=${page}`);
    return data.data;
  }

  async getXPLogs(userId?: string, page = 1) {
    const params = new URLSearchParams({ page: String(page) });
    if (userId) params.set('userId', userId);
    const { data } = await this.http.get(`/admin/xp-logs?${params}`);
    return data.data;
  }

  async adjustXP(userId: string, amount: number, reason: string) {
    await this.http.post('/admin/xp-adjust', { userId, amount, reason });
  }
}

export const adminApi = new AdminApi();
export default adminApi;
