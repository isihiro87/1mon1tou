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
}

export function VerticalVideoPlayer({
  video,
  onComplete,
  onReviewPress,
  isReviewPressed,
  onWatchProgressChange,
}: VerticalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleEnded = useCallback(() => {
    onComplete();
  }, [onComplete]);

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
