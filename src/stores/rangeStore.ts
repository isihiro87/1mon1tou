import { create } from 'zustand';
import type { RangeFolder, OrderMode } from '../types';
import { RangeContentService } from '../services/RangeContentService';

interface RangeState {
  // 状態
  availableFolders: RangeFolder[];
  selectedFolderIds: string[];
  orderMode: OrderMode;
  isLoading: boolean;
  error: string | null;

  // アクション
  loadFolders: () => Promise<void>;
  toggleFolder: (folderId: string) => void;
  toggleChapter: (chapter: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setOrderMode: (mode: OrderMode) => void;
  setSelectedFolderIds: (ids: string[]) => void;
  getSelectedFolders: () => RangeFolder[];
}

export const useRangeStore = create<RangeState>((set, get) => ({
  availableFolders: [],
  selectedFolderIds: [],
  orderMode: 'sequential',
  isLoading: false,
  error: null,

  loadFolders: async () => {
    set({ isLoading: true, error: null });

    try {
      const folders = await RangeContentService.fetchRangeFolders();
      set({
        availableFolders: folders,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'フォルダの読み込みに失敗しました',
      });
    }
  },

  toggleFolder: (folderId: string) => {
    set(state => {
      const isSelected = state.selectedFolderIds.includes(folderId);
      if (isSelected) {
        return {
          selectedFolderIds: state.selectedFolderIds.filter(id => id !== folderId),
        };
      } else {
        return {
          selectedFolderIds: [...state.selectedFolderIds, folderId],
        };
      }
    });
  },

  toggleChapter: (chapter: string) => {
    set(state => {
      // この章に属するフォルダを取得
      const chapterFolders = state.availableFolders.filter(f => f.chapter === chapter);
      const chapterFolderIds = chapterFolders.map(f => f.id);

      // 章内の全フォルダが選択されているか確認
      const allSelected = chapterFolderIds.every(id => state.selectedFolderIds.includes(id));

      if (allSelected) {
        // 全選択されていれば、章内のフォルダをすべて解除
        return {
          selectedFolderIds: state.selectedFolderIds.filter(id => !chapterFolderIds.includes(id)),
        };
      } else {
        // そうでなければ、章内のフォルダをすべて選択
        const newIds = new Set([...state.selectedFolderIds, ...chapterFolderIds]);
        return {
          selectedFolderIds: Array.from(newIds),
        };
      }
    });
  },

  selectAll: () => {
    set(state => ({
      selectedFolderIds: state.availableFolders.map(f => f.id),
    }));
  },

  deselectAll: () => {
    set({ selectedFolderIds: [] });
  },

  setOrderMode: (mode: OrderMode) => {
    set({ orderMode: mode });
  },

  setSelectedFolderIds: (ids: string[]) => {
    set({ selectedFolderIds: ids });
  },

  getSelectedFolders: () => {
    const { availableFolders, selectedFolderIds } = get();
    return availableFolders.filter(f => selectedFolderIds.includes(f.id));
  },
}));
