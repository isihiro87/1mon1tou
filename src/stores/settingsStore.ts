import { create } from 'zustand';
import type { UserSettings } from '../types';
import { StorageService } from '../services/StorageService';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface SettingsState {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  loadSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (partial) => {
    set((state) => {
      const newSettings = { ...state.settings, ...partial };
      StorageService.saveSettings(newSettings);
      return { settings: newSettings };
    });
  },

  loadSettings: () => {
    const settings = StorageService.getSettings();
    set({ settings });
  },
}));
