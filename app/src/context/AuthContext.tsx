import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { setSessionExpiredHandler } from '@/lib/api';
import { login, logout, register, restoreSession } from '@/lib/auth';

type Status = 'loading' | 'signedIn' | 'signedOut';

type AuthContextValue = {
  status: Status;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const queryClient = useQueryClient();

  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.clear();
      setStatus('signedOut');
    });
    restoreSession().then((ok) => setStatus(ok ? 'signedIn' : 'signedOut'));
  }, [queryClient]);

  const value: AuthContextValue = {
    status,
    signIn: async (email, password) => {
      await login(email, password);
      setStatus('signedIn');
    },
    signUp: async (email, password) => {
      await register(email, password);
      setStatus('signedIn');
    },
    signOut: async () => {
      await logout();
      queryClient.clear();
      setStatus('signedOut');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}