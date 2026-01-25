import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from './Button';

export function UserMenu() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, isConfigured, logout } =
    useAuthStore();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  // Firebase未設定の場合は何も表示しない
  if (!isConfigured) {
    return null;
  }

  // ログイン済みの場合
  if (isAuthenticated && user) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {/* アバター */}
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'ユーザー'}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          {/* ユーザー情報 */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">
              {user.displayName || 'ユーザー'}
            </p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>

          {/* ログアウトボタン */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="shrink-0"
          >
            {isLoading ? '処理中...' : 'ログアウト'}
          </Button>
        </div>
      </div>
    );
  }

  // 未ログインの場合
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-800">ログインしていません</p>
          <p className="text-sm text-gray-500">
            ログインすると学習データを保存できます
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleLogin}>
          ログイン
        </Button>
      </div>
    </div>
  );
}
