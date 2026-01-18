import type { UserSettings, Session, LearningLog } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';
import { StorageError } from '../utils/errors';

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
  // Session
  // ===========================

  static saveSession(session: Session): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch {
      throw new StorageError(
        'セッションの保存に失敗しました',
        STORAGE_KEYS.SESSION
      );
    }
  }

  static getSession(): Session | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as Session;
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch {
      // Ignore errors when clearing
    }
  }

  // ===========================
  // Learning Logs
  // ===========================

  static saveLearningLog(log: LearningLog): void {
    try {
      const logs = this.getLearningLogs();
      logs.push(log);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch {
      throw new StorageError(
        '学習ログの保存に失敗しました',
        STORAGE_KEYS.LOGS
      );
    }
  }

  static getLearningLogs(): LearningLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as LearningLog[];
    } catch {
      return [];
    }
  }

  static clearLearningLogs(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGS);
    } catch {
      // Ignore errors when clearing
    }
  }
}
