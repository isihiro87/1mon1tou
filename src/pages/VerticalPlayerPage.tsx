import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { VerticalVideoPlayer } from '../components/player/VerticalVideoPlayer';
import { ReviewToast } from '../components/player/ReviewToast';
import { SessionCompleteScreen } from '../components/player/SessionCompleteScreen';
import { NavigationButtons } from '../components/player/NavigationButtons';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { useVerticalSessionStore } from '../stores/verticalSessionStore';
import { usePlayerKeyboard } from '../hooks/usePlayerKeyboard';
import { usePlayerWheel } from '../hooks/usePlayerWheel';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { useSwipeAnimation } from '../hooks/useSwipeAnimation';

export function VerticalPlayerPage() {
  const navigate = useNavigate();
  const [reviewPressed, setReviewPressed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    videos,
    currentIndex,
    isLoading,
    error,
    pendingReview,
    startSession,
    markCurrentAsWeak,
    unmarkCurrentAsWeak,
    goNext,
    goPrev,
    clearSession,
    getCurrentVideo,
    isComplete,
    getSessionStats,
  } = useVerticalSessionStore();

  // セッション開始
  useEffect(() => {
    if (videos.length === 0 && !isLoading) {
      startSession();
    }
  }, [videos.length, isLoading, startSession]);

  // 次の動画をプリロード
  useVideoPreload(videos, currentIndex);

  // スワイプアニメーション
  const { triggerAnimation, getAnimationClass } = useSwipeAnimation();

  // currentIndexが変わったら復習ボタン状態をリセット
  useEffect(() => {
    setReviewPressed(false);
  }, [currentIndex]);

  // 動画完了時の処理（直接次の動画へ）
  const handleVideoComplete = useCallback(() => {
    goNext();
  }, [goNext]);

  // 復習ボタン押下時の処理（トグル）
  const handleReviewPress = useCallback(() => {
    if (reviewPressed) {
      // 解除
      unmarkCurrentAsWeak();
      setReviewPressed(false);
    } else {
      // 追加
      markCurrentAsWeak();
      setReviewPressed(true);
      setShowToast(true);
    }
  }, [reviewPressed, markCurrentAsWeak, unmarkCurrentAsWeak]);

  // トースト非表示時の処理
  const handleToastHide = useCallback(() => {
    setShowToast(false);
  }, []);

  // 次へ進むハンドラー（キーボード・ホイール・ボタン共通）
  const handleNext = useCallback(() => {
    goNext();
  }, [goNext]);

  // 前へ戻るハンドラー（キーボード・ホイール・ボタン共通）
  const handleGoPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  // ホームに戻る
  const handleGoHome = useCallback(() => {
    clearSession();
    navigate('/');
  }, [clearSession, navigate]);

  // キーボード操作
  usePlayerKeyboard({
    onPrev: handleGoPrev,
    onNext: handleNext,
    onEscape: handleGoHome,
    disabled: false,
  });

  // マウスホイール操作
  usePlayerWheel({
    onPrev: handleGoPrev,
    onNext: handleNext,
    disabled: false,
  });

  // スワイプ操作
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      triggerAnimation('up');
      handleNext();
    },
    onSwipedDown: () => {
      triggerAnimation('down');
      goPrev();
    },
    onSwipedLeft: () => {
      triggerAnimation('left');
      // 左スワイプでホームへ戻る
      handleGoHome();
    },
    trackMouse: true,
    trackTouch: true,
    delta: 50,
  });

  // もう一度
  const handleRestart = useCallback(() => {
    clearSession();
    startSession();
  }, [clearSession, startSession]);

  // 範囲を変更
  const handleChangeRange = useCallback(() => {
    clearSession();
    navigate('/range-select');
  }, [clearSession, navigate]);

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
    const stats = getSessionStats();
    return (
      <SessionCompleteScreen
        stats={stats}
        onRestart={handleRestart}
        onChangeRange={handleChangeRange}
        onGoHome={handleGoHome}
      />
    );
  }

  // 動画がない場合
  if (!currentVideo) {
    return null;
  }

  return (
    <div className="flex flex-col h-dvh bg-black">
      {/* 復習トースト */}
      <ReviewToast show={showToast} onHide={handleToastHide} />

      {/* ヘッダー（オーバーレイ） */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleGoHome();
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/20 cursor-pointer"
          aria-label="戻る"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {pendingReview && (
            <span className="text-yellow-400 text-xs font-medium px-2 py-0.5 bg-yellow-400/20 rounded-full">
              復習待ち
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
      <div {...swipeHandlers} className={`flex-1 min-h-0 ${getAnimationClass()}`}>
        <VerticalVideoPlayer
          video={currentVideo}
          onComplete={handleVideoComplete}
          onReviewPress={handleReviewPress}
          isReviewPressed={reviewPressed}
        />
      </div>

      {/* PC向けナビゲーションボタン */}
      <NavigationButtons
        onPrev={handleGoPrev}
        onNext={handleNext}
        canGoPrev={currentIndex > 0}
      />

      {/* ナビゲーションヒント（オーバーレイ） */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          上にスワイプで次へ
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
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / videos.length) * 100}%` }}
        >
          {/* パルスアニメーション */}
          <div className="absolute right-0 top-0 h-full w-2 bg-blue-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
