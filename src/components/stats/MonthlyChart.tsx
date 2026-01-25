import { useMemo } from 'react';
import { useLearningLogStore } from '../../stores/learningLogStore';
import { StatsService } from '../../services/StatsService';

interface MonthlyChartProps {
  className?: string;
}

export function MonthlyChart({ className = '' }: MonthlyChartProps) {
  const records = useLearningLogStore((state) => state.records);

  const weeklyStats = useMemo(() => {
    return StatsService.getWeeklyStats(records);
  }, [records]);

  const maxCount = useMemo(() => {
    return Math.max(...weeklyStats.map((w) => w.videoCount), 1);
  }, [weeklyStats]);

  const totalCount = useMemo(() => {
    return weeklyStats.reduce((sum, w) => sum + w.videoCount, 0);
  }, [weeklyStats]);

  return (
    <div className={`bg-white rounded-2xl p-4 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">過去4週間</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>合計</span>
          <span className="font-bold text-green-500">{totalCount}</span>
          <span>本</span>
        </div>
      </div>

      {/* 横棒グラフ */}
      <div className="flex flex-col gap-3">
        {weeklyStats.map((week, index) => (
          <WeekBar
            key={week.weekLabel}
            weekLabel={week.weekLabel}
            videoCount={week.videoCount}
            maxCount={maxCount}
            index={index}
            isCurrentWeek={index === weeklyStats.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

interface WeekBarProps {
  weekLabel: string;
  videoCount: number;
  maxCount: number;
  index: number;
  isCurrentWeek: boolean;
}

function WeekBar({ weekLabel, videoCount, maxCount, index, isCurrentWeek }: WeekBarProps) {
  // バーの幅を計算（最小5%、最大100%）
  const widthPercent = videoCount > 0
    ? Math.max(5, (videoCount / maxCount) * 100)
    : 0;

  return (
    <div className="flex items-center gap-3">
      {/* 週ラベル */}
      <span
        className={`text-xs w-16 ${
          isCurrentWeek ? 'font-bold text-green-500' : 'text-gray-400'
        }`}
      >
        {weekLabel}
      </span>

      {/* バー */}
      <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
        <div
          className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 ${
            isCurrentWeek
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : videoCount > 0
                ? 'bg-gradient-to-r from-green-200 to-green-300'
                : 'bg-gray-200'
          }`}
          style={{
            width: `${widthPercent}%`,
            transitionDelay: `${index * 100}ms`,
          }}
        >
          {videoCount > 0 && (
            <span
              className={`text-xs font-medium ${
                isCurrentWeek ? 'text-white' : 'text-green-700'
              }`}
            >
              {videoCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
