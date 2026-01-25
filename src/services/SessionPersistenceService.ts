import type { VerticalVideo, OrderMode } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

// 永続化するセッション情報の型
export interface PersistedSession {
  videos: VerticalVideo[];
  currentIndex: number;
  selectedFolderIds: string[];
  orderMode: OrderMode;
  savedAt: number;
  playbackPosition?: number; // 現在の動画の再生位置（秒）
}

// セッション永続化サービス
export class SessionPersistenceService {
  /**
   * セッション状態を保存
   */
  static saveSession(session: PersistedSession): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PERSISTED_SESSION,
        JSON.stringify(session)
      );
    } catch {
      // localStorage書き込みエラーは無視（セッション継続に影響しない）
      console.warn('Failed to save session to localStorage');
    }
  }

  /**
   * セッション状態を復元
   */
  static loadSession(): PersistedSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSISTED_SESSION);
      if (!data) {
        return null;
      }

      const session = JSON.parse(data) as PersistedSession;

      // 基本的なバリデーション
      if (
        !session.videos ||
        !Array.isArray(session.videos) ||
        typeof session.currentIndex !== 'number' ||
        !session.selectedFolderIds ||
        !Array.isArray(session.selectedFolderIds)
      ) {
        return null;
      }

      // セッションがすでに完了している場合はnullを返す
      if (session.currentIndex >= session.videos.length) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * セッション状態をクリア
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PERSISTED_SESSION);
    } catch {
      // クリアエラーは無視
    }
  }

  /**
   * 前回セッションの有無を確認
   */
  static hasPersistedSession(): boolean {
    return this.loadSession() !== null;
  }
}
