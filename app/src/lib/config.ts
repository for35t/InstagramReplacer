import { Platform } from 'react-native';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';
export const IS_WEB = Platform.OS === 'web';
export const CLIENT_HEADERS: Record<string, string> = IS_WEB ? { 'X-Client-Type': 'web' } : {};