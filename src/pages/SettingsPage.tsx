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

        {/* 自動再生 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-2">自動再生</h2>
          <div className="divide-y divide-gray-100">
            <AutoNextToggle
              label="動画終了後に自動で次へ"
              checked={settings.autoPlayNextVideo}
              onChange={checked => updateSettings({ autoPlayNextVideo: checked })}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            ONにすると、動画視聴完了時に自動的に次の動画へ進みます。
          </p>
        </div>

        {/* 復習機能の説明 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h2 className="text-sm font-medium text-blue-800 mb-2">復習機能について</h2>
          <p className="text-xs text-blue-700 leading-relaxed">
            動画視聴中に「復習」ボタンを押すと、その動画が苦手としてマークされ、
            1つ後の動画の後にもう一度表示されます。
          </p>
        </div>
      </main>
    </div>
  );
}
