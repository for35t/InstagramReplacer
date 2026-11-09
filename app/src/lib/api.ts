import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, CLIENT_HEADERS, IS_WEB } from './config';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from './tokens';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: IS_WEB,
  headers: CLIENT_HEADERS,
});

let refreshPromise: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refresh = await getRefreshToken();
        if (!IS_WEB && !refresh) return null;
        const { data } = await axios.post(
          `${API_URL}/auth/refresh/`,
          IS_WEB ? {} : { refresh },
          { withCredentials: IS_WEB, headers: CLIENT_HEADERS },
        );
        setAccessToken(data.access);
        if (data.refresh) await setRefreshToken(data.refresh);
        return data.access as string;
      } catch {
        await clearTokens();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      onSessionExpired?.();
    }
    return Promise.reject(error);
  },
);