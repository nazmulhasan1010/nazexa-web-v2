import { useState, useEffect } from 'react';

export interface SearchHistoryItem {
  id: string;
  title: string;
  url: string;
  type: string;
}

const STORAGE_KEY = 'nazexa_admin_search_history';
const MAX_HISTORY = 5;

export function useAdminSearchHistory(adminId?: string) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // The key must be specific to the admin user to prevent cross-admin leaks on shared terminals (if applicable)
  const userKey = adminId ? `${STORAGE_KEY}_${adminId}` : STORAGE_KEY;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(userKey);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load search history', e);
    }
  }, [userKey]);

  const addHistory = (item: SearchHistoryItem) => {
    setHistory((prev) => {
      // Remove if it already exists
      const filtered = prev.filter((h) => h.id !== item.id);
      // Add to top
      const newHistory = [item, ...filtered].slice(0, MAX_HISTORY);
      
      try {
        localStorage.setItem(userKey, JSON.stringify(newHistory));
      } catch (e) {
        console.warn('Failed to save search history', e);
      }
      
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(userKey);
    } catch (e) {
      console.warn('Failed to clear search history', e);
    }
  };

  return {
    history,
    addHistory,
    clearHistory,
  };
}
