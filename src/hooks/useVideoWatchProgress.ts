import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVideoWatchProgressOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  threshold?: number; // デフォルト0.5（50%）
  videoId?: string; // 動画が変わったことを検知するためのID
}

interface UseVideoWatchProgressReturn {
  progress: number; // 0-1の視聴率
  hasWatchedEnough: boolean; // 閾値を超えたか
  reset: () => void;
}

/**
 * 動画の視聴進捗を追跡するフック
 * 視聴率が閾値を超えたかどうかを判定する
 */
export function useVideoWatchProgress({
  videoRef,
  threshold = 0.5,
  videoId,
}: UseVideoWatchProgressOptions): UseVideoWatchProgressReturn {
  const [progress, setProgress] = useState(0);
  const [hasWatchedEnough, setHasWatchedEnough] = useState(false);
  const previousVideoIdRef = useRef<string | undefined>(videoId);

  // 動画IDが変わったらリセット
  useEffect(() => {
    if (videoId !== previousVideoIdRef.current) {
      setProgress(0);
      setHasWatchedEnough(false);
      previousVideoIdRef.current = videoId;
    }
  }, [videoId]);

  // thresholdをrefで保持（イベントハンドラ内で最新値を参照するため）
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;

  // イベントリスナーの設定
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) {
        return;
      }

      const currentProgress = video.currentTime / video.duration;
      setProgress(currentProgress);

      // 閾値を超えたらフラグを立てる（一度trueになったら戻らない）
      if (currentProgress >= thresholdRef.current) {
        setHasWatchedEnough(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, videoId]); // videoIdが変わったら再登録

  // 手動リセット関数
  const reset = useCallback(() => {
    setProgress(0);
    setHasWatchedEnough(false);
  }, []);

  return {
    progress,
    hasWatchedEnough,
    reset,
  };
}
