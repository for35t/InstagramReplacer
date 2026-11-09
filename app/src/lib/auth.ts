import { api, refreshAccessToken } from './api';
import { IS_WEB } from './config';
import { clearTokens, getRefreshToken, setAccessToken, setRefreshToken } from './tokens';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login/', { email, password });
  setAccessToken(data.access);
  if (data.refresh) await setRefreshToken(data.refresh);
}

export async function register(email: string, password: string) {
  await api.post('/auth/register/', { email, password });
  await login(email, password);
}

export async function logout() {
  try {
    await api.post('/auth/logout/', IS_WEB ? {} : { refresh: await getRefreshToken() });
  } catch {
    // Server-side logout failing shouldn't keep the user logged in locally.
  } finally {
    await clearTokens();
  }
}

export async function restoreSession(): Promise<boolean> {
  return (await refreshAccessToken()) !== null;
}