import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Cannot reach the server.';
    const data = error.response.data;
    if (data && typeof data === 'object') {
      if ('detail' in data) return String(data.detail);
      return Object.values(data as Record<string, unknown>).flat().join('\n');
    }
  }
  return 'Something went wrong.';
}