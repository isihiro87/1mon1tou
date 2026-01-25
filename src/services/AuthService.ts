import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../config/firebase';
import { AuthError } from '../utils/errors';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Firebase UserをAuthUser型に変換
 */
function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

/**
 * Googleアカウントでサインイン
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new AuthError(
      'Firebase が設定されていません。.env.local を確認してください。',
      'auth/not-configured'
    );
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return toAuthUser(result.user);
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      throw new AuthError(
        getErrorMessage(firebaseError.code),
        firebaseError.code
      );
    }
    throw new AuthError('ログインに失敗しました', 'auth/unknown');
  }
}

/**
 * サインアウト
 */
export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return;
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      throw new AuthError(
        getErrorMessage(firebaseError.code),
        firebaseError.code
      );
    }
    throw new AuthError('ログアウトに失敗しました', 'auth/unknown');
  }
}

/**
 * 認証状態の変更を監視
 */
export function onAuthStateChanged(
  callback: (user: AuthUser | null) => void
): Unsubscribe | null {
  const auth = getFirebaseAuth();
  if (!auth) {
    // Firebaseが未設定の場合、即座にnullを返す
    callback(null);
    return null;
  }

  return firebaseOnAuthStateChanged(auth, user => {
    callback(user ? toAuthUser(user) : null);
  });
}

/**
 * Firebase設定が有効かどうか
 */
export function isAuthConfigured(): boolean {
  return isFirebaseConfigured();
}

/**
 * Firebaseエラーコードをユーザー向けメッセージに変換
 */
function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'ログインがキャンセルされました';
    case 'auth/popup-blocked':
      return 'ポップアップがブロックされました。ブラウザの設定を確認してください。';
    case 'auth/cancelled-popup-request':
      return 'ログインがキャンセルされました';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました。接続を確認してください。';
    case 'auth/too-many-requests':
      return 'リクエストが多すぎます。しばらく待ってから再試行してください。';
    default:
      return 'ログインに失敗しました';
  }
}
