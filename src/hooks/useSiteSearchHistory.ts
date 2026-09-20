import { useState, useEffect } from 'react';

export interface SiteSearchHistoryItem {
  id: string;
  title: string;
  url: string;
  type: string;
}

const STORAGE_KEY = 'nazexa_site_search_history';
const MAX_HISTORY = 5;

export function useSiteSearchHistory() {
  const [history, setHistory] = useState<SiteSearchHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load search history', e);
    }
  }, []);

  const addHistory = (item: SiteSearchHistoryItem) => {
    setHistory((prev) => {
      // Remove if it already exists
      const filtered = prev.filter((h) => h.id !== item.id);
      // Add to top
      const newHistory = [item, ...filtered].slice(0, MAX_HISTORY);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.warn('Failed to save search history', e);
      }
      
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
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
