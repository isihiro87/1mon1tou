import { useRef, useCallback } from 'react';
import type { Video } from '../../types';

interface VideoPlayerProps {
  video: Video;
  onComplete: () => void;
}

export function VideoPlayer({ video, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="h-full min-h-0 bg-white flex items-center justify-center">
      {/* 動画コンテナ：ワイド画面では高さに合わせてアスペクト比維持 */}
      <div className="w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src={video.url}
          className="max-w-full max-h-full object-contain"
          style={{
            // ワイド画面で高さに合わせた幅制限（16:9アスペクト比）
            maxWidth: 'min(100%, calc(100vh * 16 / 9))',
          }}
          controls
          autoPlay
          playsInline
          onEnded={handleEnded}
        >
          お使いのブラウザは動画再生に対応していません。
        </video>
      </div>
    </div>
  );
}
