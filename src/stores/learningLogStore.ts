import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FeedbackType } from '../types';
import { WeakVideoService } from '../services/WeakVideoService';

// 学習記録の型
interface LearningRecord {
  videoId: string;
  displayName: string;
  chapter: string;
  topic: string;
  feedback: FeedbackType | null; // フィードバック無効時はnull
  timestamp: number;
  viewCompleted?: boolean; // 視聴完了フラグ（50%以上視聴した場合のみtrue）
}

// 日別の学習サマリー
interface DailyStats {
  date: string; // YYYY-MM-DD形式
  videoCount: number;
  feedbackCounts: {
    perfect: number;
    unsure: number;
    bad: number;
    none: number; // フィードバックなし
  };
}

interface LearningLogState {
  // 学習記録（直近30日分を保持）
  records: LearningRecord[];

  // アクション
  addRecord: (record: Omit<LearningRecord, 'timestamp'>) => void;
  clearOldRecords: () => void;
  clearAllRecords: () => void; // 全記録をリセット

  // ヘルパー
  getTodayStats: () => DailyStats;
  getVideoCompletionMap: () => Map<string, boolean>; // videoId -> viewed
  getChapterCompletionRate: (chapter: string) => number; // 0-100
  getWeakVideoIds: () => string[]; // 苦手動画IDリスト
  getWeakVideoCount: () => number; // 苦手動画件数
  getResolvedWeakVideoIds: (previousWeakIds: string[]) => string[]; // 苦手解除された動画ID
  getTotalViewCount: () => number; // 累計視聴本数（ユニーク動画数）
  getMasteredVideoIds: () => string[]; // 習得済み動画IDリスト
  getMasteredVideoCount: () => number; // 習得済み動画件数
}

// 日付をYYYY-MM-DD形式で取得（ローカル時間）
const getDateString = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 今日の日付文字列を取得
const getTodayString = (): string => {
  return getDateString(Date.now());
};

export const useLearningLogStore = create<LearningLogState>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (record) => {
        const newRecord: LearningRecord = {
          ...record,
          timestamp: Date.now(),
        };

        set((state) => ({
          records: [...state.records, newRecord],
        }));

        // 古い記録を削除
        get().clearOldRecords();
      },

      clearOldRecords: () => {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        set((state) => ({
          records: state.records.filter((r) => r.timestamp >= thirtyDaysAgo),
        }));
      },

      clearAllRecords: () => {
        set({ records: [] });
      },

      getTodayStats: (): DailyStats => {
        const today = getTodayString();
        const { records } = get();

        // viewCompleted !== false のレコードのみを視聴完了としてカウント
        // （後方互換性: viewCompletedがundefinedの旧データも対象）
        const todayRecords = records.filter(
          (r) => getDateString(r.timestamp) === today && r.viewCompleted !== false
        );

        const feedbackCounts = {
          perfect: 0,
          unsure: 0,
          bad: 0,
          none: 0,
        };

        todayRecords.forEach((r) => {
          if (r.feedback === null) {
            feedbackCounts.none++;
          } else {
            feedbackCounts[r.feedback]++;
          }
        });

        return {
          date: today,
          videoCount: todayRecords.length,
          feedbackCounts,
        };
      },

      getVideoCompletionMap: (): Map<string, boolean> => {
        const { records } = get();
        const map = new Map<string, boolean>();

        // viewCompleted=trueのレコードのみを対象
        // 後方互換性: viewCompletedがundefinedの場合（旧データ）も対象とする
        records
          .filter((r) => r.viewCompleted !== false)
          .forEach((r) => {
            map.set(r.videoId, true);
          });

        return map;
      },

      getChapterCompletionRate: (chapter: string): number => {
        const { records } = get();

        // この章の動画を視聴した記録を取得
        const chapterRecords = records.filter((r) => r.chapter === chapter);

        // ユニークな動画IDの数
        const uniqueVideos = new Set(chapterRecords.map((r) => r.videoId));

        // 章内の動画総数は外部から渡す必要があるため、
        // ここでは視聴したユニーク動画数を返す
        // 完了率の計算は呼び出し側で行う
        return uniqueVideos.size;
      },

      getWeakVideoIds: (): string[] => {
        const { records } = get();
        return WeakVideoService.getWeakVideoIds(records);
      },

      getWeakVideoCount: (): number => {
        return get().getWeakVideoIds().length;
      },

      getResolvedWeakVideoIds: (previousWeakIds: string[]): string[] => {
        const { records } = get();
        return WeakVideoService.getResolvedWeakVideoIds(previousWeakIds, records);
      },

      getTotalViewCount: (): number => {
        const { records } = get();
        // viewCompleted=trueのレコードのみを対象に、ユニークな動画IDの数をカウント
        // 後方互換性: viewCompletedがundefinedの場合（旧データ）もカウント対象とする
        const viewCompletedRecords = records.filter((r) => r.viewCompleted !== false);
        const uniqueVideoIds = new Set(viewCompletedRecords.map((r) => r.videoId));
        return uniqueVideoIds.size;
      },

      getMasteredVideoIds: (): string[] => {
        const { records } = get();
        return WeakVideoService.getMasteredVideoIds(records);
      },

      getMasteredVideoCount: (): number => {
        return get().getMasteredVideoIds().length;
      },
    }),
    {
      name: 'oneq-learning-log',
    }
  )
);
