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

  // ヘルパー
  getTodayStats: () => DailyStats;
  getVideoCompletionMap: () => Map<string, boolean>; // videoId -> viewed
  getChapterCompletionRate: (chapter: string) => number; // 0-100
  getWeakVideoIds: () => string[]; // 苦手動画IDリスト
  getWeakVideoCount: () => number; // 苦手動画件数
}

// 日付をYYYY-MM-DD形式で取得
const getDateString = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
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

      getTodayStats: (): DailyStats => {
        const today = getTodayString();
        const { records } = get();

        const todayRecords = records.filter(
          (r) => getDateString(r.timestamp) === today
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

        records.forEach((r) => {
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
    }),
    {
      name: 'oneq-learning-log',
    }
  )
);
