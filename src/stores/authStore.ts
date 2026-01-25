import { create } from 'zustand';
import {
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
  isAuthConfigured,
  type AuthUser,
} from '../services/AuthService';
import { AuthError } from '../utils/errors';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;

  // アクション
  initAuth: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isConfigured: isAuthConfigured(),
  error: null,

  initAuth: () => {
    // Firebase未設定の場合は即座に完了
    if (!isAuthConfigured()) {
      set({ isLoading: false, isConfigured: false });
      return;
    }

    const unsubscribe = onAuthStateChanged(user => {
      set({
        user,
        isAuthenticated: user !== null,
        isLoading: false,
        isConfigured: true,
      });
    });

    // クリーンアップはアプリ終了時（通常は不要）
    if (unsubscribe) {
      window.addEventListener('beforeunload', () => unsubscribe());
    }
  },

  login: async () => {
    const state = get();
    if (!state.isConfigured) {
      set({
        error: 'Firebase が設定されていません。.env.local を確認してください。',
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await signInWithGoogle();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        set({
          error: error.message,
          isLoading: false,
        });
      } else {
        set({
          error: 'ログインに失敗しました',
          isLoading: false,
        });
      }
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await signOut();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        set({
          error: error.message,
          isLoading: false,
        });
      } else {
        set({
          error: 'ログアウトに失敗しました',
          isLoading: false,
        });
      }
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
