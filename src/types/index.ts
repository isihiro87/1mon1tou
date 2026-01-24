// ===========================
// エンティティ: Subject（科目）
// ===========================

export interface Subject {
  id: string;           // 科目ID（例: "history"）
  name: string;         // 表示名（例: "歴史"）
  icon: string;         // アイコン名（例: "book"）
  enabled: boolean;     // 有効/無効
  contentPath: string;  // コンテンツパス（例: "/datas/history"）
}

// ===========================
// エンティティ: UserSettings（ユーザー設定）
// ===========================

export interface UserSettings {
  autoPlayNextVideo: boolean;    // 動画終了後に自動で次の動画へ
}

// デフォルト値は src/utils/constants.ts で定義

// ===========================
// 範囲選択機能
// ===========================

export type OrderMode = 'sequential' | 'random' | 'smart';

export interface RangeFolder {
  id: string;           // 一意のID（例: "2-1/1human_origins"）
  chapter: string;      // 章（例: "2-1"）
  topic: string;        // トピック（例: "1human_origins"）
  displayName: string;  // 表示名（例: "人類の起源"）
  videoUrl: string;     // 動画URL（例: "/datas/history/2-1/1human_origins/qas-output.mp4"）
}

export interface RangeFoldersData {
  folders: RangeFolder[];
}

// ===========================
// 上下スクロールセッション
// ===========================

export interface VerticalVideo {
  id: string;
  url: string;
  displayName: string;
  chapter: string;
  topic: string;
}

// ===========================
// 理解度フィードバック
// ===========================

export type FeedbackType = 'perfect' | 'unsure' | 'bad';

// ===========================
// セッション統計
// ===========================

export interface VideoSessionStats {
  videoId: string;
  displayName: string;
  viewCount: number;
  feedbackCounts: {
    perfect: number;
    unsure: number;
    bad: number;
  };
}

export interface SessionStatsData {
  totalViews: number;
  totalFeedbacks: {
    perfect: number;
    unsure: number;
    bad: number;
  };
  videoStats: VideoSessionStats[];
  resolvedWeakVideoIds: string[];  // このセッションで苦手解除された動画ID
}

// ===========================
// セッション履歴
// ===========================

export interface SessionHistoryEntry {
  id: string;
  completedAt: number;
  totalViews: number;
  reviewMarkCount: number;
}
