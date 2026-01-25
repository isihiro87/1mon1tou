import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { StreakDisplay } from '../components/stats/StreakDisplay';
import { WeeklyChart } from '../components/stats/WeeklyChart';
import { MonthlyChart } from '../components/stats/MonthlyChart';
import { MasteryProgress } from '../components/stats/MasteryProgress';

type ChartTab = 'weekly' | 'monthly';

export function StatsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ChartTab>('weekly');

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header title="学習統計" onBack={handleBack} />

      <main className="flex-1 px-4 py-4 pb-8 space-y-4">
        {/* ストリーク表示 */}
        <StreakDisplay variant="full" />

        {/* タブ切り替え */}
        <div className="flex gap-2">
          <TabButton
            label="今週"
            isActive={activeTab === 'weekly'}
            onClick={() => setActiveTab('weekly')}
          />
          <TabButton
            label="4週間"
            isActive={activeTab === 'monthly'}
            onClick={() => setActiveTab('monthly')}
          />
        </div>

        {/* グラフ表示 */}
        {activeTab === 'weekly' ? (
          <WeeklyChart />
        ) : (
          <MonthlyChart />
        )}

        {/* 習熟度 */}
        <MasteryProgress />
      </main>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
