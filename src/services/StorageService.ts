import type { UserSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';
import { StorageError } from '../utils/errors';

// ストリークデータの型
export interface PersistedStreakData {
  longestStreak: number;
  lastUpdated: string; // YYYY-MM-DD
}

const DEFAULT_STREAK_DATA: PersistedStreakData = {
  longestStreak: 0,
  lastUpdated: '',
};

export class StorageService {
  // ===========================
  // Settings
  // ===========================

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      throw new StorageError('設定の保存に失敗しました', STORAGE_KEYS.SETTINGS);
    }
  }

  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(data) as UserSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  // ===========================
  // Streak Data
  // ===========================

  static saveStreakData(data: PersistedStreakData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(data));
    } catch {
      throw new StorageError('ストリークデータの保存に失敗しました', STORAGE_KEYS.STREAK_DATA);
    }
  }

  static getStreakData(): PersistedStreakData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK_DATA);
      if (!data) {
        return DEFAULT_STREAK_DATA;
      }
      return JSON.parse(data) as PersistedStreakData;
    } catch {
      return DEFAULT_STREAK_DATA;
    }
  }

  static updateLongestStreak(currentStreak: number): void {
    const stored = this.getStreakData();
    if (currentStreak > stored.longestStreak) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      this.saveStreakData({
        longestStreak: currentStreak,
        lastUpdated: `${year}-${month}-${day}`,
      });
    }
  }
}
