import { create } from 'zustand';
import type { VerticalVideo, VideoSessionStats, SessionStatsData } from '../types';
import { RangeContentService } from '../services/RangeContentService';
import { SessionPersistenceService } from '../services/SessionPersistenceService';
import { useRangeStore } from './rangeStore';
import { useLearningLogStore } from './learningLogStore';
import { REVIEW_DELAY_VIDEOS, MILESTONES } from '../utils/constants';

// 動画IDごとの統計を管理するマップ型
type VideoStatsMap = Map<string, {
  displayName: string;
  viewCount: number;
  reviewCount: number;  // 復習ボタンが押された回数
}>;

interface VerticalSessionState {
  // 状態
  videos: VerticalVideo[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;

  // 復習システム用状態
  pendingReview: VerticalVideo | null; // 復習ボタン押下で1動画後に挿入予定
  videosSinceReview: number;           // pendingReview設定後に見た動画数

  // 苦手解除追跡用状態
  weakVideoIdsAtStart: string[];       // セッション開始時の苦手動画IDリスト

  // マイルストーン追跡用状態
  totalViewCountAtStart: number;       // セッション開始時の累計視聴本数

  // 統計用状態
  videoStatsMap: VideoStatsMap;

  // 再生位置の状態
  playbackPosition: number;            // 現在の動画の再生位置（秒）

  // アクション
  startSession: () => Promise<void>;
  startReviewSession: (videoIds: string[]) => void; // 復習マーク動画でセッション開始
  resumeSession: () => boolean;        // 前回セッションから再開
  markCurrentAsWeak: () => void;       // 復習ボタン押下時に呼ばれる
  unmarkCurrentAsWeak: () => void;     // 復習ボタン解除時に呼ばれる
  goNext: (hasWatchedEnough?: boolean) => void; // 50%以上視聴したかどうか
  goPrev: () => void;
  goToIndex: (index: number) => void;
  clearSession: () => void;
  savePlaybackPosition: (position: number) => void; // 再生位置を保存
  saveSessionNow: () => void;          // 即座にセッション状態を保存

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
  videosSinceReview: 0,
  weakVideoIdsAtStart: [],
  totalViewCountAtStart: 0,
  videoStatsMap: new Map(),
  playbackPosition: 0,

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

      // セッション開始時の状態を記録
      const logStore = useLearningLogStore.getState();
      const weakVideoIdsAtStart = logStore.getWeakVideoIds();
      const totalViewCountAtStart = logStore.getTotalViewCount();

      set({
        videos,
        currentIndex: 0,
        isLoading: false,
        pendingReview: null,
        videosSinceReview: 0,
        weakVideoIdsAtStart,
        totalViewCountAtStart,
        videoStatsMap: new Map(),
      });

      // セッション永続化
      SessionPersistenceService.saveSession({
        videos,
        currentIndex: 0,
        selectedFolderIds,
        orderMode,
        savedAt: Date.now(),
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'セッションの開始に失敗しました',
      });
    }
  },

  resumeSession: () => {
    // 前回セッションから再開
    const persisted = SessionPersistenceService.loadSession();
    if (!persisted) {
      return false;
    }

    // rangeStoreを更新（selectedFolderIdsとorderModeの両方を復元）
    const rangeStore = useRangeStore.getState();
    rangeStore.setOrderMode(persisted.orderMode);
    rangeStore.setSelectedFolderIds(persisted.selectedFolderIds);

    // セッション再開時の状態を記録
    const logStore = useLearningLogStore.getState();
    const weakVideoIdsAtStart = logStore.getWeakVideoIds();
    const totalViewCountAtStart = logStore.getTotalViewCount();

    set({
      videos: persisted.videos,
      currentIndex: persisted.currentIndex,
      isLoading: false,
      error: null,
      pendingReview: null,
      videosSinceReview: 0,
      weakVideoIdsAtStart,
      totalViewCountAtStart,
      videoStatsMap: new Map(),
      playbackPosition: persisted.playbackPosition ?? 0,
    });

    return true;
  },

  startReviewSession: (videoIds: string[]) => {
    // 復習マーク動画でセッションを開始
    // learningLogStoreから動画情報を取得（videoStatsMapはセッション終了時にクリアされるため）
    const logStore = useLearningLogStore.getState();

    // videoIdsに対応する動画をlearningLogStoreから取得して、VerticalVideo形式に変換
    const videos: VerticalVideo[] = videoIds.map((id) => {
      // 最新の記録からdisplayNameを取得
      const latestRecord = logStore.records
        .filter((r) => r.videoId === id)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      // 動画IDから章とトピックを抽出（フォーマット: "chapter/topic"）
      const parts = id.split('/');
      const chapter = latestRecord?.chapter || parts[0] || '';
      const topic = latestRecord?.topic || parts[1] || '';

      return {
        id,
        url: `/datas/history/${id}/qas-output.mp4`,
        displayName: latestRecord?.displayName || id,
        chapter,
        topic,
      };
    });

    if (videos.length === 0) {
      return;
    }

    // 復習セッション開始時の状態を記録
    const weakVideoIdsAtStart = logStore.getWeakVideoIds();
    const totalViewCountAtStart = logStore.getTotalViewCount();

    set({
      videos,
      currentIndex: 0,
      isLoading: false,
      error: null,
      pendingReview: null,
      videosSinceReview: 0,
      weakVideoIdsAtStart,
      totalViewCountAtStart,
      videoStatsMap: new Map(),
    });

    // セッション永続化
    SessionPersistenceService.saveSession({
      videos,
      currentIndex: 0,
      selectedFolderIds: videoIds,
      orderMode: 'sequential',
      savedAt: Date.now(),
    });
  },

  markCurrentAsWeak: () => {
    // 復習ボタンが押されたときに呼ばれる
    // 現在の動画を「苦手」としてマークし、1動画後に再挿入予定にする
    const { videos, currentIndex, pendingReview, videoStatsMap } = get();
    const currentVideo = videos[currentIndex];

    if (!currentVideo) return;

    const newVideos = [...videos];

    // 既にpendingReviewがある場合は先にキューに追加
    // +2の理由: 現在の動画(currentIndex)→次の動画(+1)→既存pending(+2)の順で配置
    // これにより、新しいpending（現在の動画）が既存pendingより先に再生される
    if (pendingReview) {
      newVideos.splice(currentIndex + 2, 0, pendingReview);
    }

    // 現在の動画をpendingReviewに設定
    const newPendingReview = currentVideo;

    // 統計を更新（reviewCountを増加）
    const newVideoStatsMap = new Map(videoStatsMap);
    const existingStats = newVideoStatsMap.get(currentVideo.id);
    if (existingStats) {
      existingStats.reviewCount += 1;
    } else {
      newVideoStatsMap.set(currentVideo.id, {
        displayName: currentVideo.displayName,
        viewCount: 0,  // まだ視聴完了していない
        reviewCount: 1,
      });
    }

    // 学習ログに復習マークを記録
    useLearningLogStore.getState().addRecord({
      videoId: currentVideo.id,
      displayName: currentVideo.displayName,
      chapter: currentVideo.chapter,
      topic: currentVideo.topic,
      feedback: 'bad',  // 復習ボタン = 苦手判定
      viewCompleted: false,  // 苦手ボタン操作は視聴完了としてカウントしない
    });

    set({
      videos: newVideos,
      pendingReview: newPendingReview,
      videosSinceReview: 0,
      videoStatsMap: newVideoStatsMap,
    });
  },

  unmarkCurrentAsWeak: () => {
    // 苦手マークが解除されたときに呼ばれる
    // pendingReviewをクリアし、学習ログに解除を記録する
    const { videos, currentIndex, pendingReview, videoStatsMap } = get();
    const currentVideo = videos[currentIndex];

    if (!currentVideo || !pendingReview) return;

    // 現在の動画がpendingReviewと一致する場合のみ解除
    if (pendingReview.id !== currentVideo.id) return;

    // 統計を更新（reviewCountを減少）
    const newVideoStatsMap = new Map(videoStatsMap);
    const existingStats = newVideoStatsMap.get(currentVideo.id);
    if (existingStats && existingStats.reviewCount > 0) {
      existingStats.reviewCount -= 1;
    }

    // 学習ログに苦手解除を記録（feedback: nullで上書き）
    useLearningLogStore.getState().addRecord({
      videoId: currentVideo.id,
      displayName: currentVideo.displayName,
      chapter: currentVideo.chapter,
      topic: currentVideo.topic,
      feedback: null,  // 苦手マーク解除
      viewCompleted: false,  // 苦手ボタン解除は視聴完了としてカウントしない
    });

    set({
      pendingReview: null,
      videosSinceReview: 0,
      videoStatsMap: newVideoStatsMap,
    });
  },

  goNext: (hasWatchedEnough = true) => {
    // 次の動画へ進む（動画終了時またはスワイプ時に呼ばれる）
    // hasWatchedEnough: 50%以上視聴したかどうか（デフォルトはtrue: 動画終了時は常に完了扱い）
    const { videos, currentIndex, pendingReview, videosSinceReview, videoStatsMap } = get();
    const currentVideo = videos[currentIndex];

    if (!currentVideo) return;

    const newVideoStatsMap = new Map(videoStatsMap);

    // 50%以上視聴した場合のみ記録
    if (hasWatchedEnough) {
      // 学習ログに記録（視聴完了）
      useLearningLogStore.getState().addRecord({
        videoId: currentVideo.id,
        displayName: currentVideo.displayName,
        chapter: currentVideo.chapter,
        topic: currentVideo.topic,
        feedback: null,  // 復習ボタンを押していない場合はnull
        viewCompleted: true,  // 視聴完了フラグ
      });

      // 統計を記録（viewCountを増加）
      const existingStats = newVideoStatsMap.get(currentVideo.id);
      if (existingStats) {
        existingStats.viewCount += 1;
      } else {
        newVideoStatsMap.set(currentVideo.id, {
          displayName: currentVideo.displayName,
          viewCount: 1,
          reviewCount: 0,
        });
      }
    }

    const newVideos = [...videos];
    let newPendingReview = pendingReview;
    let newVideosSinceReview = videosSinceReview;

    // pendingReviewがある場合、指定本数経過したら挿入
    if (pendingReview && videosSinceReview >= REVIEW_DELAY_VIDEOS) {
      // 現在位置の次に挿入
      newVideos.splice(currentIndex + 1, 0, pendingReview);
      newPendingReview = null;
      newVideosSinceReview = 0;
    } else if (pendingReview) {
      newVideosSinceReview = videosSinceReview + 1;
    }

    const newIndex = currentIndex + 1;

    // 次の動画へ
    set({
      videos: newVideos,
      currentIndex: newIndex,
      pendingReview: newPendingReview,
      videosSinceReview: newVideosSinceReview,
      videoStatsMap: newVideoStatsMap,
    });

    // セッション永続化（完了時はクリア）
    if (newIndex >= newVideos.length) {
      SessionPersistenceService.clearSession();
    } else {
      const { selectedFolderIds, orderMode } = useRangeStore.getState();
      SessionPersistenceService.saveSession({
        videos: newVideos,
        currentIndex: newIndex,
        selectedFolderIds,
        orderMode,
        savedAt: Date.now(),
      });
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
      videosSinceReview: 0,
      weakVideoIdsAtStart: [],
      totalViewCountAtStart: 0,
      videoStatsMap: new Map(),
      playbackPosition: 0,
    });
    SessionPersistenceService.clearSession();
  },

  savePlaybackPosition: (position: number) => {
    set({ playbackPosition: position });
  },

  saveSessionNow: () => {
    // 即座にセッション状態を保存（ページ離脱時など）
    const { videos, currentIndex, playbackPosition } = get();
    if (videos.length === 0) return;

    const { selectedFolderIds, orderMode } = useRangeStore.getState();
    SessionPersistenceService.saveSession({
      videos,
      currentIndex,
      selectedFolderIds,
      orderMode,
      savedAt: Date.now(),
      playbackPosition,
    });
  },

  getCurrentVideo: () => {
    const { videos, currentIndex } = get();
    return videos[currentIndex] || null;
  },

  isComplete: () => {
    const { videos, currentIndex } = get();
    return currentIndex >= videos.length;
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
    const { videos, videoStatsMap, weakVideoIdsAtStart, totalViewCountAtStart } = get();

    // 動画別の統計を配列に変換
    const videoStats: VideoSessionStats[] = [];
    let totalViews = 0;
    const totalFeedbacks = {
      perfect: 0,
      unsure: 0,
      bad: 0,
    };

    // 章ごとの視聴状況を追跡
    const chapterVideoCount = new Map<string, number>(); // 章ごとの動画数
    const chapterViewedCount = new Map<string, number>(); // 章ごとの視聴数

    // セッション内の動画の章ごとの総数をカウント
    videos.forEach((video) => {
      chapterVideoCount.set(
        video.chapter,
        (chapterVideoCount.get(video.chapter) || 0) + 1
      );
    });

    videoStatsMap.forEach((stats, videoId) => {
      videoStats.push({
        videoId,
        displayName: stats.displayName,
        viewCount: stats.viewCount,
        feedbackCounts: {
          perfect: 0,
          unsure: 0,
          bad: stats.reviewCount,  // 復習ボタン押下回数をbadとしてカウント
        },
      });

      totalViews += stats.viewCount;
      totalFeedbacks.bad += stats.reviewCount;

      // 視聴した動画の章をカウント
      if (stats.viewCount > 0) {
        const video = videos.find((v) => v.id === videoId);
        if (video) {
          chapterViewedCount.set(
            video.chapter,
            (chapterViewedCount.get(video.chapter) || 0) + 1
          );
        }
      }
    });

    // 苦手解除された動画IDを計算
    const logStore = useLearningLogStore.getState();
    const resolvedWeakVideoIds = logStore.getResolvedWeakVideoIds(weakVideoIdsAtStart);

    // 完了した章を算出（セッション内の全動画を視聴した章）
    const completedChapters: string[] = [];
    chapterVideoCount.forEach((count, chapter) => {
      const viewedCount = chapterViewedCount.get(chapter) || 0;
      if (viewedCount >= count) {
        completedChapters.push(chapter);
      }
    });

    // 達成したマイルストーンを算出
    const currentTotalViewCount = logStore.getTotalViewCount();
    const achievedMilestones = MILESTONES.filter(
      (milestone) =>
        totalViewCountAtStart < milestone.count &&
        currentTotalViewCount >= milestone.count
    );

    return {
      totalViews,
      totalFeedbacks,
      videoStats,
      resolvedWeakVideoIds,
      completedChapters,
      achievedMilestones,
    };
  },
}));
