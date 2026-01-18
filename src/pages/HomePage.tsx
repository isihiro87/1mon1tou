import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '../components/common/Button';
import { useSettingsStore } from '../stores/settingsStore';

export function HomePage() {
  const navigate = useNavigate();
  const loadSettings = useSettingsStore(state => state.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleRangeSelect = () => {
    navigate('/range-select');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ロゴエリア */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">OneQ-OneA</h1>
        <p className="text-gray-500 mb-12">歴史一問一答</p>

        {/* メインボタン */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button
            variant="primary"
            size="lg"
            onClick={handleRangeSelect}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              学習をはじめる
            </span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleSettings}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-2">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              設定
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
