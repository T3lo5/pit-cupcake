import { create } from 'zustand';
import { api } from '../lib/api';

type Role = 'CUSTOMER' | 'ADMIN';
type User = { id: string; name: string; email: string; role: Role; createdAt: string };

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (data: { user: User; accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isLogged: () => boolean;
  refreshAccessToken: () => Promise<string | null>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  setAuth: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    set({ user, accessToken, refreshToken: refreshToken ?? get().refreshToken ?? null });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, accessToken: null, refreshToken: null });
  },
  isAdmin: () => get().user?.role === 'ADMIN',
  isLogged: () => !!get().accessToken,
  refreshAccessToken: async () => {
    const rt = get().refreshToken;
    if (!rt) return null;
    try {
      const r = await api.post('/auth/refresh', { refreshToken: rt }, { headers: { Authorization: '' } });
      localStorage.setItem('access_token', r.data.accessToken);
      set({ accessToken: r.data.accessToken });
      return r.data.accessToken as string;
    } catch {
      get().logout();
      return null;
    }
  },
}));
