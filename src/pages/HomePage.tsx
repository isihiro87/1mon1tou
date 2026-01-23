import { useMemo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { WeakReviewButton } from '../components/home/WeakReviewButton';
import { ContinueButton } from '../components/home/ContinueButton';
import { useLearningLogStore } from '../stores/learningLogStore';
import { useRangeStore } from '../stores/rangeStore';
import { useVerticalSessionStore } from '../stores/verticalSessionStore';
import { SessionPersistenceService, type PersistedSession } from '../services/SessionPersistenceService';

// 日付をYYYY-MM-DD形式で取得
const getDateString = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

export function HomePage() {
  const navigate = useNavigate();
  const records = useLearningLogStore((state) => state.records);
  const getWeakVideoIds = useLearningLogStore((state) => state.getWeakVideoIds);
  const setSelectedFolderIds = useRangeStore((state) => state.setSelectedFolderIds);
  const setOrderMode = useRangeStore((state) => state.setOrderMode);
  const resumeSession = useVerticalSessionStore((state) => state.resumeSession);

  // 前回セッションの有無をチェック
  const [persistedSession, setPersistedSession] = useState<PersistedSession | null>(null);

  useEffect(() => {
    const session = SessionPersistenceService.loadSession();
    setPersistedSession(session);
  }, []);

  // 今日の統計を計算（recordsが変更された時のみ再計算）
  const todayStats = useMemo(() => {
    const today = getDateString(Date.now());
    const todayRecords = records.filter(
      (r) => getDateString(r.timestamp) === today
    );

    const feedbackCounts = {
      perfect: 0,
      unsure: 0,
      bad: 0,
      none: 0,
    };

    todayRecords.forEach((r) => {
      if (r.feedback === null) {
        feedbackCounts.none++;
      } else {
        feedbackCounts[r.feedback]++;
      }
    });

    return {
      date: today,
      videoCount: todayRecords.length,
      feedbackCounts,
    };
  }, [records]);

  // 苦手動画の件数を計算
  const weakVideoIds = useMemo(() => getWeakVideoIds(), [getWeakVideoIds, records]);
  const weakCount = weakVideoIds.length;

  const handleStartLearning = useCallback(() => {
    navigate('/range-select');
  }, [navigate]);

  // 苦手だけ復習
  const handleWeakReview = useCallback(() => {
    // 苦手動画のIDをrangeStoreにセット
    setSelectedFolderIds(weakVideoIds);
    setOrderMode('sequential');
    navigate('/vertical-player');
  }, [weakVideoIds, setSelectedFolderIds, setOrderMode, navigate]);

  // 前回の続きから
  const handleContinue = useCallback(() => {
    const success = resumeSession();
    if (success) {
      navigate('/vertical-player');
    }
  }, [resumeSession, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダーエリア */}
      <div className="pt-8 pb-4 px-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-1">OneQ-OneA</h1>
        <p className="text-base text-gray-500">一問一答で学ぼう！</p>
      </div>

      {/* 今日の学習カード */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">今日の学習</h3>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
            </span>
          </div>

          {todayStats.videoCount > 0 ? (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-blue-600">
                  {todayStats.videoCount}
                  <span className="text-base font-normal text-gray-500 ml-1">本</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">視聴完了</p>
              </div>

              {/* フィードバック内訳 */}
              {(todayStats.feedbackCounts.perfect > 0 ||
                todayStats.feedbackCounts.unsure > 0 ||
                todayStats.feedbackCounts.bad > 0) && (
                <div className="flex gap-3 text-xs">
                  {todayStats.feedbackCounts.perfect > 0 && (
                    <div className="text-center">
                      <div className="text-green-500 font-bold">{todayStats.feedbackCounts.perfect}</div>
                      <div className="text-gray-400">余裕</div>
                    </div>
                  )}
                  {todayStats.feedbackCounts.unsure > 0 && (
                    <div className="text-center">
                      <div className="text-yellow-500 font-bold">{todayStats.feedbackCounts.unsure}</div>
                      <div className="text-gray-400">まあまあ</div>
                    </div>
                  )}
                  {todayStats.feedbackCounts.bad > 0 && (
                    <div className="text-center">
                      <div className="text-red-500 font-bold">{todayStats.feedbackCounts.bad}</div>
                      <div className="text-gray-400">苦手</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-gray-400 text-sm">まだ学習していません</p>
              <p className="text-gray-300 text-xs mt-1">今日も頑張ろう！</p>
            </div>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* 科目表示（歴史のみ） */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">歴史</h2>
        </div>

        {/* 前回の続きからボタン */}
        {persistedSession && (
          <div className="w-full max-w-xs mb-3">
            <ContinueButton
              currentIndex={persistedSession.currentIndex}
              totalCount={persistedSession.videos.length}
              onClick={handleContinue}
            />
          </div>
        )}

        {/* メインアクションボタン */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleStartLearning}
          className="w-full max-w-xs py-5 text-xl font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          <span className="flex items-center justify-center gap-3">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            学習をはじめる
          </span>
        </Button>

        {/* ヒントテキスト */}
        <p className="mt-4 text-sm text-gray-400">
          範囲を選んで学習スタート
        </p>

        {/* 苦手だけ復習ボタン */}
        <div className="mt-6 w-full max-w-xs">
          <WeakReviewButton weakCount={weakCount} onClick={handleWeakReview} />
        </div>
      </div>
    </div>
  );
}
