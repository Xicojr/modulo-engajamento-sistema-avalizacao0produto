'use client';

import type { SessionUser } from '@/lib/session';
import type { SignInInput } from '@/lib/validations/auth';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface AuthContextType {
  user: SessionUser | null;
  isLoading: boolean;
  signIn: (credentials: SignInInput) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const refreshUser = React.useCallback(async () => {
    try {
      const response = await fetch('/api/v1/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthProvider] Failed to fetch session user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = React.useCallback(
    async (credentials: SignInInput): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch('/api/v1/sign-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error || 'Email ou senha inválidos.',
          };
        }

        setUser(data.user || null);
        return { success: true };
      } catch (error) {
        console.error('[AuthProvider] Error during sign-in:', error);
        return {
          success: false,
          error: 'Ocorreu um erro de conexão ao tentar entrar. Tente novamente.',
        };
      }
    },
    [],
  );

  const signOut = React.useCallback(async () => {
    try {
      await fetch('/api/v1/auth/sign-out', { method: 'POST' });
    } catch (error) {
      console.error('[AuthProvider] Error during sign-out:', error);
    } finally {
      setUser(null);
      router.push('/');
      router.refresh();
    }
  }, [router]);

  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signOut,
      refreshUser,
    }),
    [user, isLoading, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
