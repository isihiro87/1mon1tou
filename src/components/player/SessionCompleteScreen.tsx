import type { SessionStatsData, Milestone } from '../../types';
import { Button } from '../common/Button';

// 苦手解除動画の情報
interface ResolvedWeakVideo {
  id: string;
  displayName: string;
}

interface SessionCompleteScreenProps {
  stats: SessionStatsData;
  resolvedWeakVideos: ResolvedWeakVideo[];  // 苦手解除された動画リスト
  completedChapters: string[];              // 完了した章
  achievedMilestones: Milestone[];          // 達成したマイルストーン
  onRestart: () => void;
  onChangeRange: () => void;
  onGoHome: () => void;
  onReviewMarked?: () => void;
}

/**
 * 復習マーク率に基づいてメッセージカテゴリを決定
 */
function getMessageAndEmoji(stats: SessionStatsData): { message: string; emoji: string } {
  const reviewCount = stats.totalFeedbacks.bad; // 復習マーク数
  const totalViews = stats.totalViews;

  if (totalViews === 0) {
    return { message: 'お疲れさまでした!', emoji: '📚' };
  }

  const reviewRate = reviewCount / totalViews;

  // 復習マークが少ないほど良い
  if (reviewRate === 0) {
    const messages = [
      'すごい！全部バッチリだね！',
      '完璧！自信持っていいよ！',
      'パーフェクト！この調子！',
    ];
    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      emoji: '🎉',
    };
  }

  if (reviewRate <= 0.3) {
    const messages = [
      'いい感じ！着実に成長してるよ！',
      '頑張ってるね！その調子！',
      'しっかり覚えてきてる！',
    ];
    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      emoji: '💪',
    };
  }

  // 復習マークが多い
  const messages = [
    '復習すれば必ず覚えられるよ！',
    '苦手なところが分かったね！次に活かそう！',
    '繰り返せば力がつく！ファイト！',
  ];
  return {
    message: messages[Math.floor(Math.random() * messages.length)],
    emoji: '📚',
  };
}

export function SessionCompleteScreen({
  stats,
  resolvedWeakVideos,
  completedChapters,
  achievedMilestones,
  onRestart,
  onChangeRange,
  onGoHome,
  onReviewMarked,
}: SessionCompleteScreenProps) {
  const { message, emoji } = getMessageAndEmoji(stats);
  const reviewCount = stats.totalFeedbacks.bad;
  const reviewedVideos = stats.videoStats.filter(v => v.feedbackCounts.bad > 0);
  const hasReviewMarked = reviewedVideos.length > 0;
  const hasResolvedWeak = resolvedWeakVideos.length > 0;
  const hasCompletedChapters = completedChapters.length > 0;
  const hasAchievedMilestones = achievedMilestones.length > 0;

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

          {/* 視聴本数 */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <span className="text-gray-700">視聴した動画</span>
            <span className="text-2xl font-bold text-gray-900">{stats.totalViews}本</span>
          </div>

          {/* 復習マーク数 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔖</span>
              <span className="text-gray-700">復習マーク</span>
            </div>
            <span className={`text-2xl font-bold ${reviewCount > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {reviewCount}本
            </span>
          </div>

          {/* 復習マークが0の場合のメッセージ */}
          {reviewCount === 0 && stats.totalViews > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-center">
              <p className="text-sm text-green-600">
                復習マークなし！全部バッチリ！
              </p>
            </div>
          )}

          {/* 苦手解除された動画がある場合 */}
          {hasResolvedWeak && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎓</span>
                <span className="text-sm font-medium text-green-700">
                  苦手から卒業！ ({resolvedWeakVideos.length}本)
                </span>
              </div>
              <p className="text-xs text-green-600">
                繰り返し学習の成果だね！すごい！
              </p>
            </div>
          )}
        </div>
      </div>

      {/* マイルストーン達成（達成があった場合のみ表示） */}
      {hasAchievedMilestones && (
        <div className="flex-shrink-0 px-6 pb-4">
          <div className="bg-yellow-50 rounded-2xl shadow-sm border border-yellow-200 p-4">
            <h2 className="text-sm font-medium text-yellow-700 mb-3 flex items-center gap-2">
              <span>🏆</span>
              マイルストーン達成！
            </h2>
            <ul className="space-y-2">
              {achievedMilestones.map((milestone) => (
                <li
                  key={milestone.count}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg"
                >
                  <span className="text-lg">{milestone.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      累計{milestone.label}！
                    </p>
                    <p className="text-xs text-yellow-600">
                      すごい継続力だね！
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 章完了（完了があった場合のみ表示） */}
      {hasCompletedChapters && (
        <div className="flex-shrink-0 px-6 pb-4">
          <div className="bg-purple-50 rounded-2xl shadow-sm border border-purple-200 p-4">
            <h2 className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
              <span>📖</span>
              章を完了しました！
            </h2>
            <ul className="space-y-2">
              {completedChapters.map((chapter) => (
                <li
                  key={chapter}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg"
                >
                  <span className="text-lg">✅</span>
                  <p className="text-sm font-medium text-gray-900">
                    {chapter}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 苦手解除動画リスト（解除があった場合のみ表示） */}
      {hasResolvedWeak && (
        <div className="flex-shrink-0 px-6 pb-4">
          <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200 p-4">
            <h2 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
              <span>🌟</span>
              苦手から卒業した動画
            </h2>
            <ul className="space-y-2">
              {resolvedWeakVideos.map((video) => (
                <li
                  key={video.id}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg"
                >
                  <span className="text-lg">✨</span>
                  <p className="text-sm font-medium text-gray-900 truncate flex-1">
                    {video.displayName}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 復習マークした動画リスト */}
      <div className="flex-1 min-h-0 px-6 pb-4 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
          <h2 className="flex-shrink-0 text-sm font-medium text-gray-500 p-4 pb-2">
            {reviewedVideos.length > 0
              ? `復習マークした動画 (${reviewedVideos.length}本)`
              : '動画一覧'}
          </h2>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {stats.videoStats.length === 0 ? (
              <p className="text-gray-400 text-center py-4">データがありません</p>
            ) : reviewedVideos.length > 0 ? (
              <ul className="space-y-2">
                {reviewedVideos.map((video) => (
                  <li
                    key={video.videoId}
                    className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl"
                  >
                    <span className="text-xl">🔖</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {video.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {video.feedbackCounts.bad}回マーク
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🎯</p>
                <p className="text-gray-500 text-sm">
                  全ての動画をしっかり理解できました！
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex-shrink-0 px-6 pb-6 space-y-3">
        {/* 復習マークがある場合のみ表示 */}
        {hasReviewMarked && onReviewMarked && (
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={onReviewMarked}
          >
            <span className="flex items-center justify-center gap-2">
              <span>🔖</span>
              復習マーク動画を復習 ({reviewedVideos.length}本)
            </span>
          </Button>
        )}
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
