import { useCallback } from 'react';
import { GOAL_LIMITS } from '../../utils/constants';

interface GoalSettingSectionProps {
  dailyGoal: number;
  weeklyGoal: number;
  onDailyGoalChange: (value: number) => void;
  onWeeklyGoalChange: (value: number) => void;
}

const DAILY_MAX = 30;
const DAILY_PRESETS = [0, 3, 5, 10, 15, 20];
const WEEKLY_PRESETS = [0, 10, 20, 30, 50, 70];

export function GoalSettingSection({
  dailyGoal,
  weeklyGoal,
  onDailyGoalChange,
  onWeeklyGoalChange,
}: GoalSettingSectionProps) {
  const handleDailyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.min(DAILY_MAX, Math.max(GOAL_LIMITS.MIN, Number(e.target.value)));
      onDailyGoalChange(value);
    },
    [onDailyGoalChange]
  );

  const handleWeeklyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.min(GOAL_LIMITS.MAX, Math.max(GOAL_LIMITS.MIN, Number(e.target.value)));
      onWeeklyGoalChange(value);
    },
    [onWeeklyGoalChange]
  );

  return (
    <div className="space-y-6">
      {/* 日次目標 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">1日の目標</h3>
          <span className="text-lg font-bold text-blue-600">
            {dailyGoal === 0 ? '目標なし' : `${dailyGoal}本`}
          </span>
        </div>
        <input
          type="range"
          min={GOAL_LIMITS.MIN}
          max={DAILY_MAX}
          value={dailyGoal}
          onChange={handleDailyChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="relative h-8 mt-2">
          {DAILY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onDailyGoalChange(preset)}
              style={{ left: `${(preset / DAILY_MAX) * 100}%` }}
              className={`absolute -translate-x-1/2 px-2 py-1 text-xs rounded-md transition-colors ${
                dailyGoal === preset
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {preset === 0 ? 'なし' : `${preset}`}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
          0に設定すると目標を無効にできます。
        </p>
      </div>

      {/* 週間目標 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">週間の目標</h3>
          <span className="text-lg font-bold text-blue-600">
            {weeklyGoal === 0 ? '目標なし' : `${weeklyGoal}本`}
          </span>
        </div>
        <input
          type="range"
          min={GOAL_LIMITS.MIN}
          max={GOAL_LIMITS.MAX}
          value={weeklyGoal}
          onChange={handleWeeklyChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="relative h-8 mt-2">
          {WEEKLY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onWeeklyGoalChange(preset)}
              style={{ left: `${(preset / GOAL_LIMITS.MAX) * 100}%` }}
              className={`absolute -translate-x-1/2 px-2 py-1 text-xs rounded-md transition-colors ${
                weeklyGoal === preset
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {preset === 0 ? 'なし' : `${preset}`}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
          週間目標は月曜日〜日曜日でカウントされます。
        </p>
      </div>
    </div>
  );
}
