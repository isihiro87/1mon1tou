import type { UserSettings } from '../types';

// ストレージキー
export const STORAGE_KEYS = {
  SETTINGS: 'oneq_settings',
  SESSION: 'oneq_session',
  LOGS: 'oneq_logs',
} as const;

// デフォルト設定値
export const DEFAULT_SETTINGS: UserSettings = {
  videosPerSession: 5,
  autoNextVideo: true,
  autoNextQuiz: true,
};

// 動画本数の選択肢
export const VIDEO_COUNT_OPTIONS = [3, 5, 10] as const;

// コンテンツパス
export const CONTENT_PATHS = {
  VIDEOS: '/content/videos.json',
  QUESTIONS: '/content/questions.json',
} as const;
