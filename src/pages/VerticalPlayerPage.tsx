import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { VerticalVideoPlayer } from '../components/player/VerticalVideoPlayer';
import { FeedbackSelector } from '../components/player/FeedbackSelector';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { useVerticalSessionStore } from '../stores/verticalSessionStore';
import type { FeedbackType } from '../types';

export function VerticalPlayerPage() {
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    videos,
    currentIndex,
    isLoading,
    error,
    isSecondRound,
    startSession,
    submitFeedback,
    goPrev,
    clearSession,
    getCurrentVideo,
    isComplete,
  } = useVerticalSessionStore();

  // セッション開始
  useEffect(() => {
    if (videos.length === 0 && !isLoading) {
      startSession();
    }
  }, [videos.length, isLoading, startSession]);

  // currentIndexが変わったらフィードバック表示をリセット
  useEffect(() => {
    setShowFeedback(false);
  }, [currentIndex]);

  // 動画完了時の処理
  const handleVideoComplete = useCallback(() => {
    // 動画終了時にフィードバック画面を表示
    setShowFeedback(true);
  }, []);

  // フィードバック選択時の処理
  const handleFeedbackSelect = useCallback((feedback: FeedbackType) => {
    submitFeedback(feedback);
    setShowFeedback(false);
  }, [submitFeedback]);

  // 上下スワイプ操作（フィードバック表示中は無効）
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (!showFeedback) {
        setShowFeedback(true); // スワイプでフィードバック表示
      }
    },
    onSwipedDown: () => {
      if (!showFeedback) {
        goPrev();
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  // ホームに戻る
  const handleGoHome = useCallback(() => {
    clearSession();
    navigate('/');
  }, [clearSession, navigate]);

  // もう一度
  const handleRestart = useCallback(() => {
    clearSession();
    startSession();
  }, [clearSession, startSession]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex flex-col h-dvh bg-black">
        <div className="flex-1 flex items-center justify-center">
          <Loading message="動画を準備中..." />
        </div>
      </div>
    );
  }

  // エラー
  if (error) {
    return (
      <div className="flex flex-col h-dvh bg-white">
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <p className="text-red-600">{error}</p>
          <Button variant="primary" onClick={() => startSession()}>
            再試行
          </Button>
          <Button variant="secondary" onClick={handleGoHome}>
            ホームへ戻る
          </Button>
        </div>
      </div>
    );
  }

  const currentVideo = getCurrentVideo();
  const sessionComplete = isComplete();

  // 完了画面（全動画視聴後）
  if (videos.length > 0 && sessionComplete) {
    return (
      <div className="flex flex-col h-dvh bg-white">
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">お疲れさまでした!</h2>
            <p className="text-gray-600 text-lg">学習を完了しました</p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button variant="primary" size="lg" onClick={handleRestart}>
              もう一度
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/range-select')}>
              範囲を変更
            </Button>
            <Button variant="secondary" size="lg" onClick={handleGoHome}>
              ホームへ戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 動画がない場合
  if (!currentVideo) {
    return null;
  }

  // フィードバック表示中
  if (showFeedback) {
    return (
      <div className="flex flex-col h-dvh bg-black">
        <FeedbackSelector
          onSelect={handleFeedbackSelect}
          videoTitle={currentVideo.displayName}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-black">
      {/* ヘッダー（オーバーレイ） */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={handleGoHome}
          className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/20 cursor-pointer"
          aria-label="戻る"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {isSecondRound && (
            <span className="text-yellow-400 text-xs font-medium px-2 py-0.5 bg-yellow-400/20 rounded-full">
              2週目
            </span>
          )}
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {videos.length}
          </span>
        </div>

        <div className="w-10" /> {/* スペーサー */}
      </div>

      {/* 動画タイトル（オーバーレイ） */}
      <div className="absolute top-14 left-0 right-0 z-10 px-4">
        <p className="text-white text-sm font-medium truncate text-center">
          {currentVideo.displayName}
        </p>
      </div>

      {/* 動画プレイヤー */}
      <div {...swipeHandlers} className="flex-1 min-h-0">
        <VerticalVideoPlayer video={currentVideo} onComplete={handleVideoComplete} />
      </div>

      {/* ナビゲーションヒント（オーバーレイ） */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          上にスワイプで評価
        </div>
        {currentIndex > 0 && (
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            下にスワイプで前へ
          </div>
        )}
      </div>

      {/* 進捗バー */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / videos.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
