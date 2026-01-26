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

// 目標達成ログの型
export interface GoalAchievementLog {
  lastDailyAchievement: string | null;  // YYYY-MM-DD形式
  lastWeeklyAchievement: string | null; // YYYY-WW形式（ISO週番号）
}

const DEFAULT_GOAL_ACHIEVEMENT_LOG: GoalAchievementLog = {
  lastDailyAchievement: null,
  lastWeeklyAchievement: null,
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

  // ===========================
  // Goal Achievement Log
  // ===========================

  static saveGoalAchievementLog(log: GoalAchievementLog): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOAL_ACHIEVEMENT_LOG, JSON.stringify(log));
    } catch {
      throw new StorageError('目標達成ログの保存に失敗しました', STORAGE_KEYS.GOAL_ACHIEVEMENT_LOG);
    }
  }

  static getGoalAchievementLog(): GoalAchievementLog {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOAL_ACHIEVEMENT_LOG);
      if (!data) {
        return DEFAULT_GOAL_ACHIEVEMENT_LOG;
      }
      return JSON.parse(data) as GoalAchievementLog;
    } catch {
      return DEFAULT_GOAL_ACHIEVEMENT_LOG;
    }
  }
}
