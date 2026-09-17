'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, useContext, type ReactNode } from 'react';

type AdminAuthContextValue = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    permissions: string[];
  } | null;
  loading: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null,
  loading: true,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-auth-session'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/auth/session', { credentials: 'include' });
        if (!res.ok) return null;
        const json = await res.json();
        return json;
      } catch (err) {
        console.error('Admin session check error:', err);
        return null;
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  return (
    <AdminAuthContext.Provider value={{ user: data?.user ?? null, loading: isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function useAdminSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {
      /* ignore */
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    router.replace('/auth');
  };
}
