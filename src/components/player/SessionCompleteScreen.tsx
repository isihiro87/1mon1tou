import type { SessionStatsData } from '../../types';
import { Button } from '../common/Button';
import {
  selectEncouragementMessage,
  getPerformanceEmoji,
  calculatePerfectRate,
} from '../../utils/encouragementMessages';

interface SessionCompleteScreenProps {
  stats: SessionStatsData;
  onRestart: () => void;
  onChangeRange: () => void;
  onGoHome: () => void;
}

export function SessionCompleteScreen({
  stats,
  onRestart,
  onChangeRange,
  onGoHome,
}: SessionCompleteScreenProps) {
  const emoji = getPerformanceEmoji(stats);
  const message = selectEncouragementMessage(stats);
  const perfectRate = calculatePerfectRate(stats);

  return (
    <div className="flex flex-col h-dvh bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* ヘッダー部分 - 励ましメッセージ */}
      <div className="flex-shrink-0 pt-8 pb-4 px-6 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          お疲れさまでした!
        </h1>
        <p className="text-lg text-blue-600 font-medium">{message}</p>
      </div>

      {/* 統計サマリー */}
      <div className="flex-shrink-0 px-6 py-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">今回の学習結果</h2>

          {/* 合計視聴回数 */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <span className="text-gray-700">合計視聴回数</span>
            <span className="text-2xl font-bold text-gray-900">{stats.totalViews}回</span>
          </div>

          {/* フィードバック別集計 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-2xl mb-1">😊</div>
              <div className="text-xs text-gray-500 mb-1">ばっちり</div>
              <div className="text-xl font-bold text-green-600">
                {stats.totalFeedbacks.perfect}
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <div className="text-2xl mb-1">🤔</div>
              <div className="text-xs text-gray-500 mb-1">少し心配</div>
              <div className="text-xl font-bold text-yellow-600">
                {stats.totalFeedbacks.unsure}
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <div className="text-2xl mb-1">😰</div>
              <div className="text-xs text-gray-500 mb-1">ヤバい</div>
              <div className="text-xl font-bold text-red-600">
                {stats.totalFeedbacks.bad}
              </div>
            </div>
          </div>

          {/* ばっちり率 */}
          {stats.totalViews > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">ばっちり率</span>
                <span className="text-xl font-bold text-blue-600">
                  {Math.round(perfectRate)}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${perfectRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 動画別統計リスト */}
      <div className="flex-1 min-h-0 px-6 pb-4 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
          <h2 className="flex-shrink-0 text-sm font-medium text-gray-500 p-4 pb-2">
            動画別の結果 ({stats.videoStats.length}本)
          </h2>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {stats.videoStats.length === 0 ? (
              <p className="text-gray-400 text-center py-4">データがありません</p>
            ) : (
              <ul className="space-y-2">
                {stats.videoStats.map((video) => (
                  <li
                    key={video.videoId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {video.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        視聴 {video.viewCount}回
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {video.feedbackCounts.perfect > 0 && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                          😊{video.feedbackCounts.perfect}
                        </span>
                      )}
                      {video.feedbackCounts.unsure > 0 && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                          🤔{video.feedbackCounts.unsure}
                        </span>
                      )}
                      {video.feedbackCounts.bad > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                          😰{video.feedbackCounts.bad}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex-shrink-0 px-6 pb-6 space-y-3">
        <Button variant="primary" size="lg" className="w-full" onClick={onRestart}>
          もう一度
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="md" onClick={onChangeRange}>
            範囲を変更
          </Button>
          <Button variant="secondary" size="md" onClick={onGoHome}>
            ホームへ
          </Button>
        </div>
      </div>
    </div>
  );
}
