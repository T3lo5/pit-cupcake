import axios from 'axios';
import { useAuth } from '../store/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;
      const auth = useAuth.getState();

      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
      } else {
        isRefreshing = true;
        const newToken = await auth.refreshAccessToken();
        isRefreshing = false;
        queue.forEach((fn) => fn());
        queue = [];
        if (!newToken) {
          auth.logout();
          if (typeof window !== 'undefined') window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
      return api(original);
    }

    return Promise.reject(error);
  }
);
