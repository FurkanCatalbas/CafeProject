import axios from 'axios';
import { unwrapApiData } from './apiResponse';

const configuredApiUrl = (process.env.REACT_APP_API_URL || '').trim();

// Mobil erişim için localhost yerine mevcut IP adresini dinamik olarak kullan
const getBaseUrl = () => {
  if (configuredApiUrl) return configuredApiUrl;
  const hostname = window.location.hostname;
  // Eğer localhost ise 10101 portuna git, değilse (IP ise) yine o IP'nin 10101 portuna git
  return `http://${hostname}:10101`;
};

const API_BASE_URL = getBaseUrl();
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const notifyTokenRefresh = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const clearAuthState = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response.status === 401;
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth-service/api/auth/token') ||
      originalRequest.url?.includes('/auth-service/api/auth/register') ||
      originalRequest.url?.includes('/auth-service/api/auth/refresh-token');

    if (isUnauthorized && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) {
              reject(error);
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshed = await authService.refreshToken();
        localStorage.setItem(TOKEN_KEY, refreshed.token);
        if (refreshed.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshed.refreshToken);
        }

        notifyTokenRefresh(refreshed.token);
        originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        notifyTokenRefresh(null);
        clearAuthState();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (isUnauthorized) {
      clearAuthState();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

const mapTokenResponse = (payload: any) => {
  const token = payload?.access_token || payload?.accessToken;
  const refreshToken = payload?.refresh_token || payload?.refreshToken;
  return { token, refreshToken };
};

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth-service/api/auth/token', credentials);
    return mapTokenResponse(unwrapApiData(response.data));
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth-service/api/auth/register', userData);
    return mapTokenResponse(unwrapApiData(response.data));
  },
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('Yenileme tokeni bulunamadı');
    }

    const response = await refreshClient.post('/auth-service/api/auth/refresh-token', null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    return mapTokenResponse(unwrapApiData(response.data));
  },
  
  logout: async () => {
    clearAuthState();
  },
};

export default api;
