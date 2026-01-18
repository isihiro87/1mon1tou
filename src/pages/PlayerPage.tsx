import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { clsx } from 'clsx';
import { Header } from '../components/common/Header';
import { Loading } from '../components/common/Loading';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { QuestionCard } from '../components/player/QuestionCard';
import { Button } from '../components/common/Button';
import { useSessionStore } from '../stores/sessionStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { AnswerResult } from '../types';

// コンパクトヘッダー（戻る・タイトル・進捗を1行に）
function CompactHeader({
  title,
  current,
  total,
  onBack,
}: {
  title: string;
  current: number;
  total: number;
  onBack: () => void;
}) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-2 py-1.5 bg-white border-b border-gray-100">
      {/* 戻るボタン */}
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:bg-gray-200"
        aria-label="戻る"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* タイトル */}
      <span className="flex-1 text-sm font-medium text-gray-700 truncate">
        {title}
      </span>

      {/* 進捗 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 tabular-nums">
          {current}/{total}
        </span>
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// シンプルな丸型ナビボタン
function NavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center w-12 h-12 rounded-full
        transition-colors duration-150
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200 active:bg-gray-300'}
        bg-gray-100 text-gray-500
      `}
      aria-label={direction === 'prev' ? '前へ' : '次へ'}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={direction === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  );
}

export function PlayerPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore(state => state.settings);
  const {
    session,
    isLoading,
    error,
    startSession,
    goNext,
    goPrev,
    markCompleted,
    clearSession,
    restartSession,
    restartIncorrectOnly,
    getCurrentContent,
    getCurrentVideo,
    getCurrentQuestion,
  } = useSessionStore();

  // セッション開始
  useEffect(() => {
    if (!session && !isLoading) {
      startSession();
    }
  }, [session, isLoading, startSession]);

  // 動画完了時の処理
  const handleVideoComplete = useCallback(() => {
    markCompleted();
    if (settings.autoNextVideo) {
      goNext();
    }
  }, [markCompleted, goNext, settings.autoNextVideo]);

  // 問題回答時の処理
  const handleAnswer = useCallback(
    (result: AnswerResult) => {
      markCompleted(result);
      if (settings.autoNextQuiz) {
        goNext();
      }
    },
    [markCompleted, goNext, settings.autoNextQuiz]
  );

  // スワイプ操作
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goNext(),
    onSwipedRight: () => goPrev(),
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  // セッション完了時のハンドラー
  const handleSessionComplete = useCallback(() => {
    clearSession();
    navigate('/');
  }, [clearSession, navigate]);

  const handleAnotherSession = useCallback(() => {
    clearSession();
    startSession();
  }, [clearSession, startSession]);

  // 全問もう一度
  const handleRestartAll = useCallback(() => {
    restartSession();
  }, [restartSession]);

  // 間違えた問題だけ
  const handleRestartIncorrect = useCallback(() => {
    restartIncorrectOnly();
  }, [restartIncorrectOnly]);

  // レスポンシブコンテナのクラス（ワイド画面でコンパクト表示）
  const responsiveContainerClass = clsx(
    'flex flex-col h-dvh overflow-hidden bg-gray-100',
    'sm:items-center sm:justify-center sm:py-4'
  );
  const responsiveInnerClass = clsx(
    'flex flex-col h-full w-full bg-white',
    'sm:max-w-md sm:h-auto sm:min-h-[600px] sm:max-h-[800px]',
    'sm:rounded-2xl sm:shadow-lg sm:border sm:border-gray-200'
  );

  // ローディング中
  if (isLoading) {
    return (
      <div className={responsiveContainerClass}>
        <div className={responsiveInnerClass}>
          <Header title="学習中" showBack />
          <div className="flex-1 flex items-center justify-center">
            <Loading message="学習を準備中..." />
          </div>
        </div>
      </div>
    );
  }

  // エラー
  if (error) {
    return (
      <div className={responsiveContainerClass}>
        <div className={responsiveInnerClass}>
          <Header title="エラー" showBack />
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <p className="text-red-600">{error}</p>
            <Button variant="primary" onClick={() => startSession()}>
              再試行
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // セッションがない場合
  if (!session) {
    return null;
  }

  const currentContent = getCurrentContent();
  const isComplete = session.currentIndex >= session.contents.length;

  // セッション完了画面
  if (isComplete) {
    const correctCount = session.contents.filter(
      c => c.type === 'question' && c.answeredCorrectly
    ).length;
    const questionCount = session.contents.filter(c => c.type === 'question').length;
    const incorrectCount = questionCount - correctCount;
    const hasIncorrect = incorrectCount > 0;
    const isPerfect = correctCount === questionCount;

    return (
      <div className={responsiveContainerClass}>
        <div className={responsiveInnerClass}>
          <Header title="学習完了" />
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{isPerfect ? '🎉' : '📚'}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isPerfect ? 'パーフェクト!' : 'お疲れさまでした!'}
              </h2>
              <p className="text-gray-600 text-lg">
                {questionCount}問中{correctCount}問正解
              </p>
              {hasIncorrect && (
                <p className="text-red-500 text-sm mt-1">
                  {incorrectCount}問不正解
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              {/* 解きなおしボタン */}
              <Button variant="primary" size="lg" onClick={handleRestartAll}>
                全問もう一度
              </Button>
              <Button
                variant={hasIncorrect ? 'danger' : 'secondary'}
                size="lg"
                onClick={handleRestartIncorrect}
                disabled={!hasIncorrect}
              >
                間違えた問題だけ ({incorrectCount}問)
              </Button>

              {/* 区切り線 */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* その他のオプション */}
              <Button variant="secondary" size="lg" onClick={handleAnotherSession}>
                新しいセット
              </Button>
              <Button variant="secondary" size="lg" onClick={handleSessionComplete}>
                ホームへ戻る
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentVideo = getCurrentVideo();
  const currentQuestion = getCurrentQuestion();

  // 現在のコンテンツタイトル
  const currentTitle =
    currentContent?.type === 'video'
      ? currentVideo?.title || '動画'
      : currentQuestion?.questionText?.slice(0, 30) || '問題';

  return (
    <div className={responsiveContainerClass}>
      <div className={responsiveInnerClass}>
        {/* コンパクトヘッダー（戻る・タイトル・進捗を1行に） */}
        <CompactHeader
          title={currentTitle}
          current={session.currentIndex + 1}
          total={session.contents.length}
          onBack={() => navigate(-1)}
        />

        {/* コンテンツエリア */}
        <div
          {...swipeHandlers}
          className="relative flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          {currentContent?.type === 'video' && currentVideo && (
            <VideoPlayer video={currentVideo} onComplete={handleVideoComplete} />
          )}

          {currentContent?.type === 'question' && currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              autoNext={settings.autoNextQuiz}
            />
          )}

          {/* ナビゲーションボタン（動画内オーバーレイ） */}
          <div className="absolute inset-x-0 bottom-16 flex items-center justify-between px-4 pointer-events-none safe-area-inset-bottom">
            <div className="pointer-events-auto">
              <NavButton
                direction="prev"
                onClick={goPrev}
                disabled={session.currentIndex === 0}
              />
            </div>
            <div className="pointer-events-auto">
              <NavButton direction="next" onClick={goNext} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
