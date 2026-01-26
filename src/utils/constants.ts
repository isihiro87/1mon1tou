import type { UserSettings, Subject, Milestone } from '../types';

// ストレージキー
export const STORAGE_KEYS = {
  SETTINGS: 'oneq_settings',
  PERSISTED_SESSION: 'oneq_persisted_session',
  SESSION_HISTORY: 'oneq_session_history',
  STREAK_DATA: 'oneq_streak_data',
  GOAL_ACHIEVEMENT_LOG: 'oneq_goal_achievement_log',
} as const;

// デフォルト設定値
export const DEFAULT_SETTINGS: UserSettings = {
  autoPlayNextVideo: true,
  dailyGoal: 0,    // 0 = 目標無効
  weeklyGoal: 0,   // 0 = 目標無効
};

// 科目リスト
export const SUBJECTS: Subject[] = [
  {
    id: 'history',
    name: '歴史',
    icon: 'book',
    enabled: true,
    contentPath: '/datas/history',
  },
];

// 復習機能: 何本後に復習動画を挿入するか
export const REVIEW_DELAY_VIDEOS = 1;

// コンテンツパス
export const CONTENT_PATHS = {
  VIDEOS: '/content/videos.json',
  QUESTIONS: '/content/questions.json',
} as const;

// 目標設定の制限値
export const GOAL_LIMITS = {
  MIN: 0,
  MAX: 100,
} as const;

// マイルストーン定義（累計視聴本数）
export const MILESTONES: Milestone[] = [
  { count: 10, label: '10本達成', emoji: '🌟' },
  { count: 25, label: '25本達成', emoji: '⭐' },
  { count: 50, label: '50本達成', emoji: '🏅' },
  { count: 100, label: '100本達成', emoji: '🏆' },
  { count: 200, label: '200本達成', emoji: '👑' },
];
