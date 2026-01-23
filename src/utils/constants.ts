import type { UserSettings, Subject } from '../types';

// ストレージキー
export const STORAGE_KEYS = {
  SETTINGS: 'oneq_settings',
  SESSION: 'oneq_session',
  LOGS: 'oneq_logs',
  PERSISTED_SESSION: 'oneq_persisted_session',
} as const;

// デフォルト設定値
export const DEFAULT_SETTINGS: UserSettings = {
  videosPerSession: 5,
  autoNextVideo: true,
  autoNextQuiz: true,
  autoPlayNextVideo: true,
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

// 動画本数の選択肢
export const VIDEO_COUNT_OPTIONS = [3, 5, 10] as const;

// 復習機能: 何本後に復習動画を挿入するか
export const REVIEW_DELAY_VIDEOS = 1;

// コンテンツパス
export const CONTENT_PATHS = {
  VIDEOS: '/content/videos.json',
  QUESTIONS: '/content/questions.json',
} as const;
