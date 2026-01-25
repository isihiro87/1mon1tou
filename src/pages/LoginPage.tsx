import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/common/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isConfigured, error, login, clearError } =
    useAuthStore();

  // ログイン済みならホームへリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = useCallback(async () => {
    clearError();
    await login();
  }, [login, clearError]);

  const handleSkip = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダーエリア */}
      <div className="pt-12 pb-8 px-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">OneQ-OneA</h1>
        <p className="text-base text-gray-500">一問一答で学ぼう！</p>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-sm">
          {/* ログインカード */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
              ログイン
            </h2>

            {/* Firebase未設定の警告 */}
            {!isConfigured && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Firebase が設定されていません。
                  <br />
                  ログインせずにご利用いただけます。
                </p>
              </div>
            )}

            {/* エラー表示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Googleログインボタン */}
            {isConfigured && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full mb-4 py-4 flex items-center justify-center gap-3"
              >
                {/* Googleアイコン */}
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isLoading ? 'ログイン中...' : 'Googleでログイン'}
              </Button>
            )}

            {/* 区切り線 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">または</span>
              </div>
            </div>

            {/* ログインせずに使うリンク */}
            <button
              onClick={handleSkip}
              className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
            >
              ログインせずに使う
            </button>
          </div>

          {/* 説明テキスト */}
          <p className="mt-6 text-center text-xs text-gray-400 px-4">
            ログインすると、学習データを別の端末でも利用できるようになります（将来対応予定）
          </p>
        </div>
      </div>
    </div>
  );
}
