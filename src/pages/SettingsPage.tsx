import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoNextToggle } from '../components/settings/AutoNextToggle';
import { GoalSettingSection } from '../components/settings/GoalSettingSection';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/common/Button';

export function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings, loadSettings } = useSettingsStore();
  const { user, isAuthenticated, isConfigured, isLoading, logout } =
    useAuthStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* カスタムヘッダー */}
      <div className="pt-4 pb-2 px-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium">戻る</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">設定</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <main className="flex-1 p-4 space-y-4">
        {/* アカウントセクション */}
        {isConfigured && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              アカウント
            </h2>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'ユーザー'}
                    className="w-14 h-14 rounded-full"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-blue-600"
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
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">
                    {user.displayName || 'ユーザー'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? '処理中...' : 'ログアウト'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">
                    ログインしていません
                  </p>
                  <p className="text-sm text-gray-500">
                    ログインすると学習データを保存できます
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleLogin}>
                  ログイン
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 学習設定セクション */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 mb-3">学習設定</h2>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">自動再生</h3>
            <AutoNextToggle
              label="動画終了後に自動で次へ"
              checked={settings.autoPlayNextVideo}
              onChange={checked =>
                updateSettings({ autoPlayNextVideo: checked })
              }
            />
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              ONにすると、動画視聴完了時に自動的に次の動画へ進みます。
            </p>
          </div>
        </div>

        {/* 目標設定セクション */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 mb-3">目標設定</h2>
          <GoalSettingSection
            dailyGoal={settings.dailyGoal ?? 0}
            weeklyGoal={settings.weeklyGoal ?? 0}
            onDailyGoalChange={(value) => updateSettings({ dailyGoal: value })}
            onWeeklyGoalChange={(value) => updateSettings({ weeklyGoal: value })}
          />
        </div>

        {/* ヘルプセクション */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-blue-800 mb-1">
                復習機能について
              </h2>
              <p className="text-xs text-blue-700 leading-relaxed">
                動画視聴中に「復習」ボタンを押すと、その動画が苦手としてマークされ、1つ後の動画の後にもう一度表示されます。
              </p>
            </div>
          </div>
        </div>

        {/* バージョン情報 */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">OneQ-OneA v0.1.0</p>
        </div>
      </main>
    </div>
  );
}
