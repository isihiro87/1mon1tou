import { useRef, useCallback } from 'react';
import type { VerticalVideo } from '../../types';

interface VerticalVideoPlayerProps {
  video: VerticalVideo;
  onComplete: () => void;
}

export function VerticalVideoPlayer({ video, onComplete }: VerticalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
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
    </div>
  );
}
