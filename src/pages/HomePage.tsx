import { useMemo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { AuthStatusButton } from '../components/common/AuthStatusButton';
import { WeakReviewButton } from '../components/home/WeakReviewButton';
import { ContinueButton } from '../components/home/ContinueButton';
import { LearningHistorySection } from '../components/home/LearningHistorySection';
import { GoalProgressCard } from '../components/home/GoalProgressCard';
import { StreakDisplay } from '../components/stats/StreakDisplay';
import { useLearningLogStore } from '../stores/learningLogStore';
import { useRangeStore } from '../stores/rangeStore';
import { useVerticalSessionStore } from '../stores/verticalSessionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { SessionPersistenceService, type PersistedSession } from '../services/SessionPersistenceService';
import { StatsService } from '../services/StatsService';

// 日付をYYYY-MM-DD形式で取得（ローカル時間）
const getDateString = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function HomePage() {
  const navigate = useNavigate();
  const records = useLearningLogStore((state) => state.records);
  const getWeakVideoIds = useLearningLogStore((state) => state.getWeakVideoIds);
  const setSelectedFolderIds = useRangeStore((state) => state.setSelectedFolderIds);
  const setOrderMode = useRangeStore((state) => state.setOrderMode);
  const resumeSession = useVerticalSessionStore((state) => state.resumeSession);
  const { settings, loadSettings } = useSettingsStore();

  // 設定を読み込み
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 前回セッションの有無をチェック
  const [persistedSession, setPersistedSession] = useState<PersistedSession | null>(null);

  useEffect(() => {
    const session = SessionPersistenceService.loadSession();
    setPersistedSession(session);
  }, []);

  // 今日の統計を計算（recordsが変更された時のみ再計算）
  const todayStats = useMemo(() => {
    const today = getDateString(Date.now());
    // viewCompleted !== false のレコードのみを視聴完了としてカウント
    // （後方互換性: viewCompletedがundefinedの旧データも対象）
    const todayRecords = records.filter(
      (r) => getDateString(r.timestamp) === today && r.viewCompleted !== false
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

  // 目標進捗を計算
  const goalProgress = useMemo(() => ({
    dailyProgress: StatsService.getTodayViewCount(records),
    weeklyProgress: StatsService.getThisWeekViewCount(records),
  }), [records]);

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

  // 統計画面へ
  const handleOpenStats = useCallback(() => {
    navigate('/stats');
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダーエリア */}
      <div className="pt-4 pb-4 px-4">
        {/* 上部バー: ログイン状態 */}
        <div className="flex justify-end mb-4">
          <AuthStatusButton />
        </div>
        {/* タイトル */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-1">OneQ-OneA</h1>
          <p className="text-base text-gray-500">一問一答で学ぼう！</p>
        </div>
      </div>

      {/* お知らせバナー */}
      <div className="px-6 mb-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">準備中</p>
              <p className="text-xs text-amber-700 mt-1">教材を順次追加しています。しばらくお待ちください。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 無料バナー */}
      <div className="px-6 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-800">現在、すべての機能を無料でご利用いただけます</p>
          </div>
        </div>
      </div>

      {/* 今日の学習カード */}
      <div className="px-6 mb-6">
        <button
          type="button"
          onClick={handleOpenStats}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">今日の学習</h3>
            <div className="flex items-center gap-2">
              <StreakDisplay variant="compact" />
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
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
        </button>
      </div>

      {/* 目標進捗カード */}
      <div className="px-6 mb-4">
        <GoalProgressCard
          dailyGoal={settings.dailyGoal ?? 0}
          weeklyGoal={settings.weeklyGoal ?? 0}
          dailyProgress={goalProgress.dailyProgress}
          weeklyProgress={goalProgress.weeklyProgress}
        />
      </div>

      {/* 学習履歴セクション */}
      <LearningHistorySection />

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
