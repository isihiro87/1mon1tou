import { useMemo } from 'react';
import { useLearningLogStore } from '../../stores/learningLogStore';
import { StatsService, type MasteryData } from '../../services/StatsService';

interface MasteryProgressProps {
  className?: string;
}

export function MasteryProgress({ className = '' }: MasteryProgressProps) {
  const records = useLearningLogStore((state) => state.records);

  const mastery = useMemo(() => {
    return StatsService.calculateMastery(records);
  }, [records]);

  if (mastery.totalVideos === 0) {
    return (
      <div className={`bg-white rounded-2xl p-4 border border-gray-100 ${className}`}>
        <h3 className="text-sm font-medium text-gray-600 mb-3">習熟度</h3>
        <p className="text-gray-400 text-sm text-center py-4">
          まだ学習データがありません
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-4 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">習熟度</h3>
        <div className="text-xs text-gray-400">
          {mastery.totalVideos}本を学習
        </div>
      </div>

      {/* 習熟度バー */}
      <MasteryBar mastery={mastery} />

      {/* 内訳 */}
      <div className="flex justify-between mt-4">
        <MasteryItem
          label="完璧"
          count={mastery.masteredCount}
          total={mastery.totalVideos}
          color="text-green-500"
          bgColor="bg-green-100"
        />
        <MasteryItem
          label="習得"
          count={mastery.unmasteredCount}
          total={mastery.totalVideos}
          color="text-blue-500"
          bgColor="bg-blue-100"
        />
        <MasteryItem
          label="苦手"
          count={mastery.weakCount}
          total={mastery.totalVideos}
          color="text-red-500"
          bgColor="bg-red-100"
          showAlert={mastery.weakCount > 0}
        />
      </div>
    </div>
  );
}

interface MasteryBarProps {
  mastery: MasteryData;
}

function MasteryBar({ mastery }: MasteryBarProps) {
  const total = mastery.totalVideos;
  if (total === 0) return null;

  const masteredPercent = (mastery.masteredCount / total) * 100;
  const unmasteredPercent = (mastery.unmasteredCount / total) * 100;
  const weakPercent = (mastery.weakCount / total) * 100;

  return (
    <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
      {masteredPercent > 0 && (
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
          style={{ width: `${masteredPercent}%` }}
        />
      )}
      {unmasteredPercent > 0 && (
        <div
          className="h-full bg-gradient-to-r from-blue-300 to-blue-400 transition-all duration-500"
          style={{ width: `${unmasteredPercent}%` }}
        />
      )}
      {weakPercent > 0 && (
        <div
          className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
          style={{ width: `${weakPercent}%` }}
        />
      )}
    </div>
  );
}

interface MasteryItemProps {
  label: string;
  count: number;
  total: number;
  color: string;
  bgColor: string;
  showAlert?: boolean;
}

function MasteryItem({ label, count, total, color, bgColor, showAlert }: MasteryItemProps) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full ${bgColor} relative`}
      >
        <span className={`text-lg font-bold ${color}`}>{count}</span>
        {showAlert && count > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
      <span className={`text-xs font-medium ${color}`}>{percent}%</span>
    </div>
  );
}
