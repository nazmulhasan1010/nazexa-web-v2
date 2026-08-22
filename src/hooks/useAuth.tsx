import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { createContext, useContext, type ReactNode } from 'react';

import { getSession, logout } from '@/lib/auth.server';

type AuthContextValue = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null | string;
    hasPassword?: boolean;
  } | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: () => getSession(),
  });

  return (
    <AuthContext.Provider value={{ user: data?.user ?? null, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRoles() {
  return { data: ['admin'], isLoading: false };
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return async () => {
    await logout();
    await queryClient.cancelQueries();
    queryClient.clear();
    router.replace('/login');
  };
}
