interface GoalProgressCardProps {
  dailyGoal: number;
  weeklyGoal: number;
  dailyProgress: number;
  weeklyProgress: number;
}

interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  variant: 'daily' | 'weekly';
}

function ProgressBar({ label, current, goal, variant }: ProgressBarProps) {
  const percentage = Math.min(100, (current / goal) * 100);
  const isAchieved = current >= goal;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-bold ${isAchieved ? 'text-green-600' : 'text-gray-800'}`}>
          {current}/{goal}本
          {isAchieved && <span className="ml-1">達成!</span>}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isAchieved
              ? 'bg-green-500'
              : variant === 'daily'
                ? 'bg-blue-500'
                : 'bg-purple-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function GoalProgressCard({
  dailyGoal,
  weeklyGoal,
  dailyProgress,
  weeklyProgress,
}: GoalProgressCardProps) {
  // 両方とも目標が設定されていない場合は非表示
  if (dailyGoal === 0 && weeklyGoal === 0) {
    return null;
  }

  const dailyAchieved = dailyGoal > 0 && dailyProgress >= dailyGoal;
  const weeklyAchieved = weeklyGoal > 0 && weeklyProgress >= weeklyGoal;
  const bothAchieved = dailyAchieved && weeklyAchieved;

  return (
    <div
      className={`rounded-2xl p-4 shadow-sm border ${
        bothAchieved
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{bothAchieved ? '🎉' : '🎯'}</span>
        <h3 className="text-sm font-medium text-gray-600">目標進捗</h3>
      </div>

      <div className="space-y-3">
        {dailyGoal > 0 && (
          <ProgressBar
            label="今日"
            current={dailyProgress}
            goal={dailyGoal}
            variant="daily"
          />
        )}

        {weeklyGoal > 0 && (
          <ProgressBar
            label="今週"
            current={weeklyProgress}
            goal={weeklyGoal}
            variant="weekly"
          />
        )}
      </div>

      {bothAchieved && (
        <p className="mt-3 text-xs text-green-600 text-center font-medium">
          全ての目標を達成しました!
        </p>
      )}
    </div>
  );
}
