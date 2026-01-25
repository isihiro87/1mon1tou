import { useMemo, useEffect } from 'react';
import { useLearningLogStore } from '../../stores/learningLogStore';
import { StatsService } from '../../services/StatsService';
import { StorageService } from '../../services/StorageService';

interface StreakDisplayProps {
  variant?: 'compact' | 'full';
}

export function StreakDisplay({ variant = 'full' }: StreakDisplayProps) {
  const records = useLearningLogStore((state) => state.records);

  const streakData = useMemo(() => {
    const calculated = StatsService.calculateStreak(records);
    const persisted = StorageService.getStreakData();

    return {
      ...calculated,
      longestStreak: Math.max(calculated.longestStreak, persisted.longestStreak),
    };
  }, [records]);

  // 最高記録を更新（副作用はuseEffectで実行）
  useEffect(() => {
    const persisted = StorageService.getStreakData();
    if (streakData.currentStreak > persisted.longestStreak) {
      StorageService.updateLongestStreak(streakData.currentStreak);
    }
  }, [streakData.currentStreak]);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 text-orange-500">
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z" />
        </svg>
        <span className="font-bold text-lg">{streakData.currentStreak}</span>
        <span className="text-xs text-gray-500">日</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-5 border border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">連続学習</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>最高</span>
          <span className="font-bold text-orange-400">{streakData.longestStreak}</span>
          <span>日</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z" />
          </svg>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-orange-500">
              {streakData.currentStreak}
            </span>
            <span className="text-lg text-gray-500">日連続</span>
          </div>
          {streakData.currentStreak > 0 ? (
            <p className="text-xs text-gray-400 mt-1">
              {streakData.currentStreak >= streakData.longestStreak
                ? '記録更新中!'
                : '継続は力なり!'}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">今日も学習しよう!</p>
          )}
        </div>
      </div>
    </div>
  );
}
