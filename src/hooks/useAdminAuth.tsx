'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, useContext, type ReactNode } from 'react';
import { getAdminSession, adminLogout } from '@/lib/admin-auth.server';

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
        const res = await getAdminSession();
        console.log('getAdminSession success:', res);
        return res;
      } catch (err) {
        console.error('getAdminSession error:', err);
        throw err;
      }
    },
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
    await adminLogout();
    await queryClient.cancelQueries();
    queryClient.clear();
    router.replace('/auth');
  };
}
