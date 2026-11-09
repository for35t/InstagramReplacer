import * as SecureStore from 'expo-secure-store';
import { IS_WEB } from './config';

const REFRESH_KEY = 'refresh_token';
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function getRefreshToken(): Promise<string | null> {
  return IS_WEB ? null : SecureStore.getItemAsync(REFRESH_KEY);
}

export async function setRefreshToken(token: string) {
  if (!IS_WEB) await SecureStore.setItemAsync(REFRESH_KEY, token);
}

export async function clearTokens() {
  accessToken = null;
  if (!IS_WEB) await SecureStore.deleteItemAsync(REFRESH_KEY);
}