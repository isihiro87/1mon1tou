import { useState, useCallback, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { SwipeableHandlers } from 'react-swipeable';

interface UseVerticalSwipeOptions {
  onSwipeUp: () => void; // 次へ進む
  onSwipeDown: () => void; // 前へ戻る
  canSwipeUp: boolean; // 次があるか
  canSwipeDown: boolean; // 前があるか（1つ目はfalse）
  threshold?: number; // 遷移閾値（デフォルト0.3 = 30%）
  onSwipeLeft?: () => void; // 左スワイプ（オプション）
}

interface UseVerticalSwipeReturn {
  swipeHandlers: SwipeableHandlers;
  translateY: number; // 現在のY移動量（px）
  isAnimating: boolean; // アニメーション中か
  direction: 'up' | 'down' | null;
}

/**
 * TikTok/Reels風の縦スワイプを実現するフック
 * - スワイプ中のリアルタイム追従
 * - 閾値に基づく遷移/キャンセル判定
 * - スナップバック/遷移アニメーション
 */
export function useVerticalSwipe({
  onSwipeUp,
  onSwipeDown,
  canSwipeUp,
  canSwipeDown,
  threshold = 0.3,
  onSwipeLeft,
}: UseVerticalSwipeOptions): UseVerticalSwipeReturn {
  const [translateY, setTranslateY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  // アニメーション後のリセット用タイマー
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // スワイプ中の処理
  const handleSwiping = useCallback(
    (deltaY: number) => {
      // アニメーション中は無視
      if (isAnimating) return;

      // 上スワイプ（次へ）: deltaY < 0
      // 下スワイプ（前へ）: deltaY > 0

      if (deltaY < 0 && !canSwipeUp) {
        // 次がない場合は抵抗感を出す（移動量を減衰）
        setTranslateY(deltaY * 0.2);
        return;
      }

      if (deltaY > 0 && !canSwipeDown) {
        // 前がない（1つ目）場合は抵抗感を出す
        setTranslateY(deltaY * 0.2);
        return;
      }

      setTranslateY(deltaY);
      setDirection(deltaY < 0 ? 'up' : 'down');
    },
    [canSwipeUp, canSwipeDown, isAnimating]
  );

  // スワイプ完了時の処理
  const handleSwipeEnd = useCallback(
    (deltaY: number, velocity: number) => {
      if (isAnimating) return;

      // 画面高さの取得（viewportの高さ）
      const screenHeight = window.innerHeight;
      const swipeRatio = Math.abs(deltaY) / screenHeight;

      // 速度が速い場合は閾値を下げる
      const effectiveThreshold = velocity > 0.5 ? threshold * 0.5 : threshold;

      // 上スワイプ（次へ）
      if (deltaY < 0 && canSwipeUp && swipeRatio >= effectiveThreshold) {
        setIsAnimating(true);
        setTranslateY(-screenHeight);

        animationTimeoutRef.current = setTimeout(() => {
          onSwipeUp();
          setTranslateY(0);
          setIsAnimating(false);
          setDirection(null);
        }, 300);
        return;
      }

      // 下スワイプ（前へ）
      if (deltaY > 0 && canSwipeDown && swipeRatio >= effectiveThreshold) {
        setIsAnimating(true);
        setTranslateY(screenHeight);

        animationTimeoutRef.current = setTimeout(() => {
          onSwipeDown();
          setTranslateY(0);
          setIsAnimating(false);
          setDirection(null);
        }, 300);
        return;
      }

      // 閾値未満はスナップバック
      setIsAnimating(true);
      setTranslateY(0);

      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        setDirection(null);
      }, 300);
    },
    [canSwipeUp, canSwipeDown, threshold, onSwipeUp, onSwipeDown, isAnimating]
  );

  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      // 縦スワイプのみ処理
      if (Math.abs(eventData.deltaY) > Math.abs(eventData.deltaX)) {
        handleSwiping(eventData.deltaY);
      }
    },
    onSwipedUp: (eventData) => {
      handleSwipeEnd(eventData.deltaY, eventData.velocity);
    },
    onSwipedDown: (eventData) => {
      handleSwipeEnd(eventData.deltaY, eventData.velocity);
    },
    onSwipedLeft: () => {
      if (onSwipeLeft) {
        onSwipeLeft();
      }
    },
    onTouchEndOrOnMouseUp: () => {
      // スワイプが検出されなかった場合（微小な移動）のリセット
      if (!isAnimating && translateY !== 0) {
        setIsAnimating(true);
        setTranslateY(0);
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          setDirection(null);
        }, 300);
      }
    },
    trackMouse: true,
    trackTouch: true,
    delta: 10, // スワイプ検出の最小移動量
    preventScrollOnSwipe: true,
  });

  return {
    swipeHandlers,
    translateY,
    isAnimating,
    direction,
  };
}
