import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function AuthStatusButton() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isConfigured } = useAuthStore();

  const handleClick = useCallback(() => {
    if (isAuthenticated) {
      navigate('/settings');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Firebase未設定の場合は何も表示しない
  if (!isConfigured) {
    return null;
  }

  // ログイン済みの場合
  if (isAuthenticated && user) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'ユーザー'}
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
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
        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {user.displayName || 'ユーザー'}
        </span>
      </button>
    );
  }

  // 未ログインの場合
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow-sm transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
      ログイン
    </button>
  );
}
