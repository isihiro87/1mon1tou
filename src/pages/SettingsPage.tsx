import { useEffect } from 'react';
import { Header } from '../components/common/Header';
import { VideoCountSelector } from '../components/settings/VideoCountSelector';
import { AutoNextToggle } from '../components/settings/AutoNextToggle';
import { useSettingsStore } from '../stores/settingsStore';

export function SettingsPage() {
  const { settings, updateSettings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="設定" showBack />

      <main className="flex-1 p-4 space-y-6">
        {/* 動画本数 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <VideoCountSelector
            value={settings.videosPerSession}
            onChange={value => updateSettings({ videosPerSession: value })}
          />
        </div>

        {/* 自動遷移 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-2">自動遷移</h2>
          <div className="divide-y divide-gray-100">
            <AutoNextToggle
              label="動画終了後に問題へ"
              checked={settings.autoNextVideo}
              onChange={checked => updateSettings({ autoNextVideo: checked })}
            />
            <AutoNextToggle
              label="問題回答後に動画へ"
              checked={settings.autoNextQuiz}
              onChange={checked => updateSettings({ autoNextQuiz: checked })}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
