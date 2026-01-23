import { useEffect } from 'react';
import { VideoPreloader } from '../services/VideoPreloader';
import type { VerticalVideo } from '../types';

/**
 * 次の動画をプリロードするフック
 * @param videos 動画リスト
 * @param currentIndex 現在のインデックス
 */
export function useVideoPreload(videos: VerticalVideo[], currentIndex: number): void {
  useEffect(() => {
    // 次の動画が存在する場合、プリロードする
    const nextVideo = videos[currentIndex + 1];
    if (nextVideo) {
      VideoPreloader.preload(nextVideo.url);
    }

    // クリーンアップ時にプリロードをクリア
    return () => {
      VideoPreloader.cleanup();
    };
  }, [videos, currentIndex]);
}
