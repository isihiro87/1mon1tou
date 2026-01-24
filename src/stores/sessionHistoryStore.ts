import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionHistoryEntry } from '../types';

const MAX_HISTORY_COUNT = 10;

interface SessionHistoryState {
  history: SessionHistoryEntry[];

  // アクション
  addHistory: (entry: Omit<SessionHistoryEntry, 'id'>) => void;
  clearHistory: () => void;

  // セレクター
  getRecentHistory: (count?: number) => SessionHistoryEntry[];
}

export const useSessionHistoryStore = create<SessionHistoryState>()(
  persist(
    (set, get) => ({
      history: [],

      addHistory: (entry) => {
        const newEntry: SessionHistoryEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        };

        set((state) => {
          const newHistory = [newEntry, ...state.history].slice(0, MAX_HISTORY_COUNT);
          return { history: newHistory };
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getRecentHistory: (count = MAX_HISTORY_COUNT) => {
        const { history } = get();
        return history.slice(0, count);
      },
    }),
    {
      name: 'oneq-session-history',
    }
  )
);
