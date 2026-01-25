import { useRef, useCallback, useEffect } from 'react';
import type { VerticalVideo } from '../../types';
import { ReviewButton } from './ReviewButton';
import { useVideoWatchProgress } from '../../hooks/useVideoWatchProgress';

interface VerticalVideoPlayerProps {
  video: VerticalVideo;
  onComplete: () => void;
  onReviewPress: () => void;
  isReviewPressed: boolean;
  onWatchProgressChange?: (hasWatchedEnough: boolean) => void;
  initialPlaybackPosition?: number;
  onPlaybackPositionChange?: (position: number) => void;
}

// デバウンス間隔（ミリ秒）
const PLAYBACK_POSITION_DEBOUNCE_MS = 5000;

export function VerticalVideoPlayer({
  video,
  onComplete,
  onReviewPress,
  isReviewPressed,
  onWatchProgressChange,
  initialPlaybackPosition = 0,
  onPlaybackPositionChange,
}: VerticalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastReportedPositionRef = useRef(0);
  const debounceTimerRef = useRef<number | null>(null);
  const hasRestoredPositionRef = useRef(false);

  // 視聴進捗追跡
  const { hasWatchedEnough } = useVideoWatchProgress({
    videoRef,
    threshold: 0.5,
    videoId: video.id,
  });

  // 視聴進捗が変わったら親に通知
  useEffect(() => {
    onWatchProgressChange?.(hasWatchedEnough);
  }, [hasWatchedEnough, onWatchProgressChange]);

  // 動画が変わったら再生位置復元フラグをリセット
  useEffect(() => {
    hasRestoredPositionRef.current = false;
    lastReportedPositionRef.current = 0;
  }, [video.id]);

  // 再生位置の復元（loadedmetadataイベント時）
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;

    // 初期再生位置が指定されていて、まだ復元していない場合
    if (initialPlaybackPosition > 0 && !hasRestoredPositionRef.current) {
      // 動画の長さを超えないようにする
      const safePosition = Math.min(initialPlaybackPosition, videoRef.current.duration - 1);
      if (safePosition > 0) {
        videoRef.current.currentTime = safePosition;
        hasRestoredPositionRef.current = true;
      }
    }
  }, [initialPlaybackPosition]);

  // 再生位置の変更を親に通知（デバウンス付き）
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !onPlaybackPositionChange) return;

    const currentTime = videoRef.current.currentTime;

    // 前回報告した位置から一定以上進んだ場合のみ報告
    if (Math.abs(currentTime - lastReportedPositionRef.current) >= 1) {
      // 既存のタイマーをクリア
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }

      // デバウンスタイマーを設定
      debounceTimerRef.current = window.setTimeout(() => {
        onPlaybackPositionChange(currentTime);
        lastReportedPositionRef.current = currentTime;
        debounceTimerRef.current = null;
      }, PLAYBACK_POSITION_DEBOUNCE_MS);
    }
  }, [onPlaybackPositionChange]);

  // 動画完了時の処理
  const handleEnded = useCallback(() => {
    // 再生位置をクリア
    onPlaybackPositionChange?.(0);
    lastReportedPositionRef.current = 0;

    // 完了コールバックを呼び出し
    onComplete();
  }, [onComplete, onPlaybackPositionChange]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleTogglePlayback = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch((error) => {
        console.warn('Video play failed:', error);
      });
    } else {
      videoRef.current.pause();
    }
  }, []);

  return (
    <div
      className="h-full w-full bg-black flex items-center justify-center relative cursor-pointer"
      onClick={handleTogglePlayback}
    >
      <video
        key={video.id}
        ref={videoRef}
        src={video.url}
        className="h-full w-full object-contain"
        controls
        autoPlay
        playsInline
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onClick={(e) => e.stopPropagation()}
      >
        お使いのブラウザは動画再生に対応していません。
      </video>

      {/* 復習ボタン（左下に配置） */}
      <div className="absolute bottom-20 left-4 z-20">
        <ReviewButton onPress={onReviewPress} isPressed={isReviewPressed} />
      </div>
    </div>
  );
}
