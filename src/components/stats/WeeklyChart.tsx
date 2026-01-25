import { useMemo } from 'react';
import { useLearningLogStore } from '../../stores/learningLogStore';
import { StatsService, type DailyLearningStats } from '../../services/StatsService';

interface WeeklyChartProps {
  className?: string;
}

// 曜日ラベル（日〜土）
const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export function WeeklyChart({ className = '' }: WeeklyChartProps) {
  const records = useLearningLogStore((state) => state.records);

  const dailyStats = useMemo(() => {
    return StatsService.getDailyStats(records, 7);
  }, [records]);

  const maxCount = useMemo(() => {
    return Math.max(...dailyStats.map((d) => d.videoCount), 1);
  }, [dailyStats]);

  const totalCount = useMemo(() => {
    return dailyStats.reduce((sum, d) => sum + d.videoCount, 0);
  }, [dailyStats]);

  return (
    <div className={`bg-white rounded-2xl p-4 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">今週の学習</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>合計</span>
          <span className="font-bold text-blue-500">{totalCount}</span>
          <span>本</span>
        </div>
      </div>

      {/* バーチャート */}
      <div className="flex items-end justify-between gap-2 h-32">
        {dailyStats.map((stat, index) => (
          <ChartBar
            key={stat.date}
            stat={stat}
            maxCount={maxCount}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

interface ChartBarProps {
  stat: DailyLearningStats;
  maxCount: number;
  index: number;
}

// 日付をYYYY-MM-DD形式で取得（ローカル時間）
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ChartBar({ stat, maxCount, index }: ChartBarProps) {
  const date = new Date(stat.date);
  const dayOfWeek = date.getDay();
  const dayLabel = DAY_LABELS[dayOfWeek];
  const isToday = stat.date === formatLocalDate(new Date());

  // バーの高さを計算（最小10%、最大100%）
  const heightPercent = stat.videoCount > 0
    ? Math.max(10, (stat.videoCount / maxCount) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center flex-1 gap-1">
      {/* カウント表示 */}
      <span className={`text-xs font-medium ${stat.videoCount > 0 ? 'text-blue-500' : 'text-gray-300'}`}>
        {stat.videoCount > 0 ? stat.videoCount : ''}
      </span>

      {/* バー */}
      <div className="relative w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500 ${
            isToday
              ? 'bg-gradient-to-t from-blue-500 to-blue-400'
              : stat.videoCount > 0
                ? 'bg-gradient-to-t from-blue-300 to-blue-200'
                : 'bg-gray-200'
          }`}
          style={{
            height: `${heightPercent}%`,
            transitionDelay: `${index * 50}ms`,
          }}
        />
      </div>

      {/* 曜日ラベル */}
      <span
        className={`text-xs ${
          isToday ? 'font-bold text-blue-500' : 'text-gray-400'
        }`}
      >
        {dayLabel}
      </span>
    </div>
  );
}
