import { useEffect, useRef, useCallback } from 'react';

interface UsePlayerWheelOptions {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  throttleMs?: number;
}

export function usePlayerWheel({
  onPrev,
  onNext,
  disabled = false,
  throttleMs = 300,
}: UsePlayerWheelOptions): void {
  const lastWheelTime = useRef<number>(0);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (disabled) return;

      const now = Date.now();
      if (now - lastWheelTime.current < throttleMs) {
        return;
      }

      // 小さなスクロール量は無視（誤動作防止）
      if (Math.abs(event.deltaY) < 30) {
        return;
      }

      lastWheelTime.current = now;

      if (event.deltaY < 0) {
        // 上方向スクロール → 前へ
        onPrev();
      } else {
        // 下方向スクロール → 次へ
        onNext();
      }
    },
    [disabled, onPrev, onNext, throttleMs]
  );

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);
}
