'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { siteSettingsQuery } from '@/lib/queries';

/** Applies CMS theme tokens onto the document as CSS variables. */
export function ThemeSync() {
  const { data } = useQuery(siteSettingsQuery);

  useEffect(() => {
    const theme = data?.theme;
    if (!theme) return;
    const root = document.documentElement;
    if (theme.brand1) root.style.setProperty('--brand-1', theme.brand1);
    if (theme.brand2) root.style.setProperty('--brand-2', theme.brand2);
    if (theme.brand3) root.style.setProperty('--brand-3', theme.brand3);
    if (theme.radius) root.style.setProperty('--radius', theme.radius);
  }, [data]);

  return null;
}
