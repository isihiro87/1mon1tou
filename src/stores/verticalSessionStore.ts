import { create } from 'zustand';
import type { VerticalVideo, FeedbackType, VideoSessionStats, SessionStatsData } from '../types';
import { RangeContentService } from '../services/RangeContentService';
import { useRangeStore } from './rangeStore';

// 動画IDごとの統計を管理するマップ型
type VideoStatsMap = Map<string, {
  displayName: string;
  viewCount: number;
  feedbackCounts: {
    perfect: number;
    unsure: number;
    bad: number;
  };
}>;

interface VerticalSessionState {
  // 状態
  videos: VerticalVideo[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;

  // 復習システム用状態
  pendingReview: VerticalVideo | null; // 「ヤバい」で1動画後に挿入予定
  secondRoundQueue: VerticalVideo[];   // 「少し心配」で2週目用
  isSecondRound: boolean;              // 2週目かどうか
  videosSinceReview: number;           // pendingReview設定後に見た動画数

  // 統計用状態
  videoStatsMap: VideoStatsMap;

  // アクション
  startSession: () => Promise<void>;
  submitFeedback: (feedback: FeedbackType) => void;
  goNext: () => void;
  goPrev: () => void;
  goToIndex: (index: number) => void;
  clearSession: () => void;

  // ヘルパー
  getCurrentVideo: () => VerticalVideo | null;
  isComplete: () => boolean;
  getTotalCount: () => number;
  getViewedCount: () => number;
  getSessionStats: () => SessionStatsData;
}

export const useVerticalSessionStore = create<VerticalSessionState>((set, get) => ({
  videos: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  pendingReview: null,
  secondRoundQueue: [],
  isSecondRound: false,
  videosSinceReview: 0,
  videoStatsMap: new Map(),

  startSession: async () => {
    set({ isLoading: true, error: null });

    try {
      // rangeStoreから選択情報を取得
      const { availableFolders, selectedFolderIds, orderMode } = useRangeStore.getState();

      // フォルダ一覧がまだ読み込まれていない場合は読み込む
      let folders = availableFolders;
      if (folders.length === 0) {
        folders = await RangeContentService.fetchRangeFolders();
      }

      // 選択されたフォルダから動画リストを生成
      const videos = RangeContentService.createVideoListFromFolders(
        folders,
        selectedFolderIds,
        orderMode
      );

      if (videos.length === 0) {
        throw new Error('選択された範囲に動画がありません');
      }

      set({
        videos,
        currentIndex: 0,
        isLoading: false,
        pendingReview: null,
        secondRoundQueue: [],
        isSecondRound: false,
        videosSinceReview: 0,
        videoStatsMap: new Map(),
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'セッションの開始に失敗しました',
      });
    }
  },

  submitFeedback: (feedback: FeedbackType) => {
    const { videos, currentIndex, pendingReview, secondRoundQueue, isSecondRound, videosSinceReview, videoStatsMap } = get();
    const currentVideo = videos[currentIndex];

    if (!currentVideo) return;

    // 統計を記録
    const newVideoStatsMap = new Map(videoStatsMap);
    const existingStats = newVideoStatsMap.get(currentVideo.id);
    if (existingStats) {
      existingStats.viewCount += 1;
      existingStats.feedbackCounts[feedback] += 1;
    } else {
      newVideoStatsMap.set(currentVideo.id, {
        displayName: currentVideo.displayName,
        viewCount: 1,
        feedbackCounts: {
          perfect: feedback === 'perfect' ? 1 : 0,
          unsure: feedback === 'unsure' ? 1 : 0,
          bad: feedback === 'bad' ? 1 : 0,
        },
      });
    }

    let newVideos = [...videos];
    let newPendingReview = pendingReview;
    let newSecondRoundQueue = [...secondRoundQueue];
    let newVideosSinceReview = videosSinceReview;
    let newCurrentIndex = currentIndex;

    // フィードバックに応じた処理
    if (feedback === 'bad') {
      // 「ヤバい」: 1動画後に再表示
      // もし既にpendingReviewがあれば、それを先に処理
      if (pendingReview) {
        // 次の位置に挿入
        newVideos.splice(currentIndex + 2, 0, pendingReview);
      }
      newPendingReview = currentVideo;
      newVideosSinceReview = 0;
    } else if (feedback === 'unsure') {
      // 「少し心配」: 2週目キューに追加
      newSecondRoundQueue = [...secondRoundQueue, currentVideo];
    }
    // 「ばっちり」: 何もしない

    // pendingReviewがある場合、1動画経過したら挿入
    if (newPendingReview && newVideosSinceReview >= 1 && feedback !== 'bad') {
      // 現在位置の次に挿入
      newVideos.splice(currentIndex + 1, 0, newPendingReview);
      newPendingReview = null;
      newVideosSinceReview = 0;
    } else if (pendingReview && feedback !== 'bad') {
      newVideosSinceReview = videosSinceReview + 1;
    }

    // 次の動画へ
    newCurrentIndex = currentIndex + 1;

    // 1週目が終了し、2週目キューがある場合
    if (newCurrentIndex >= newVideos.length && newSecondRoundQueue.length > 0 && !isSecondRound) {
      // 2週目を開始
      newVideos = newSecondRoundQueue;
      newSecondRoundQueue = [];
      newCurrentIndex = 0;
      set({
        videos: newVideos,
        currentIndex: newCurrentIndex,
        pendingReview: newPendingReview,
        secondRoundQueue: newSecondRoundQueue,
        isSecondRound: true,
        videosSinceReview: newVideosSinceReview,
        videoStatsMap: newVideoStatsMap,
      });
      return;
    }

    set({
      videos: newVideos,
      currentIndex: newCurrentIndex,
      pendingReview: newPendingReview,
      secondRoundQueue: newSecondRoundQueue,
      videosSinceReview: newVideosSinceReview,
      videoStatsMap: newVideoStatsMap,
    });
  },

  goNext: () => {
    const { videos, currentIndex } = get();
    if (currentIndex < videos.length) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  goPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  goToIndex: (index: number) => {
    const { videos } = get();
    if (index >= 0 && index < videos.length) {
      set({ currentIndex: index });
    }
  },

  clearSession: () => {
    set({
      videos: [],
      currentIndex: 0,
      isLoading: false,
      error: null,
      pendingReview: null,
      secondRoundQueue: [],
      isSecondRound: false,
      videosSinceReview: 0,
      videoStatsMap: new Map(),
    });
  },

  getCurrentVideo: () => {
    const { videos, currentIndex } = get();
    return videos[currentIndex] || null;
  },

  isComplete: () => {
    const { videos, currentIndex, secondRoundQueue, isSecondRound } = get();
    // 現在の動画リストを全て見終わり、2週目キューもない場合に完了
    return currentIndex >= videos.length && (isSecondRound || secondRoundQueue.length === 0);
  },

  getTotalCount: () => {
    const { videos } = get();
    return videos.length;
  },

  getViewedCount: () => {
    const { currentIndex } = get();
    return currentIndex;
  },

  getSessionStats: (): SessionStatsData => {
    const { videoStatsMap } = get();

    // 動画別の統計を配列に変換
    const videoStats: VideoSessionStats[] = [];
    let totalViews = 0;
    const totalFeedbacks = {
      perfect: 0,
      unsure: 0,
      bad: 0,
    };

    videoStatsMap.forEach((stats, videoId) => {
      videoStats.push({
        videoId,
        displayName: stats.displayName,
        viewCount: stats.viewCount,
        feedbackCounts: { ...stats.feedbackCounts },
      });

      totalViews += stats.viewCount;
      totalFeedbacks.perfect += stats.feedbackCounts.perfect;
      totalFeedbacks.unsure += stats.feedbackCounts.unsure;
      totalFeedbacks.bad += stats.feedbackCounts.bad;
    });

    return {
      totalViews,
      totalFeedbacks,
      videoStats,
    };
  },
}));
