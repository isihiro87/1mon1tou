// ===========================
// 基本型
// ===========================

export type Grade = 1 | 2 | 3;

export type SessionType = 'all' | 'test_range' | 'weak_only' | 'random';

export type OrderMode = 'sequential' | 'random' | 'weak_first';

// ===========================
// エンティティ: Subject（教科）
// ===========================

export interface Subject {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  colorCode: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// エンティティ: Unit（単元）
// ===========================

export interface Unit {
  id: string;
  subjectId: string;
  grade: Grade;
  era: string;
  title: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// エンティティ: Video（動画）
// ===========================

export interface Video {
  id: string;
  subjectId: string;
  unitId: string;
  title: string;
  description?: string;
  filename: string;
  videoPath: string;
  thumbnailPath?: string;
  durationSeconds: number;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// エンティティ: Question（問題）
// ===========================

export interface Question {
  id: string;
  videoId: string;
  questionText: string;
  correctAnswer: string;
  wrongAnswers: string[];
  explanation?: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// エンティティ: QuestionStats（問題別統計）
// ===========================

export interface QuestionStats {
  id: string;
  userId: string;
  questionId: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercent: number;
  consecutiveCorrect: number;
  isWeakManual: boolean;
  lastAnsweredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// エンティティ: LearningSession（学習セッション）
// ===========================

export interface SessionContent {
  type: 'video' | 'question';
  contentId: string;
  completed: boolean;
  answeredCorrectly?: boolean;
}

export interface LearningSession {
  id: string;
  userId: string;
  subjectId: string;
  sessionType: SessionType;
  rangePresetId?: string;
  contents: SessionContent[];
  currentIndex: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// エンティティ: RangePreset（範囲プリセット）
// ===========================

export interface RangePreset {
  id: string;
  userId: string;
  subjectId: string;
  name: string;
  unitIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// エンティティ: User（ユーザー）
// ===========================

export interface User {
  id: string;
  firebaseUid?: string;
  displayName?: string;
  grade: Grade;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// エンティティ: UserSettings（ユーザー設定）
// ===========================

export interface UserSettings {
  videosPerSession: number;
  questionsPerSession: number;
  videosPerQuestionSet: number;
  questionsPerVideoSet: number;
  orderMode: OrderMode;
  autoNextVideo: boolean;
  autoNextQuiz: boolean;
  weakThresholdPercent: number;
  weakMixRatio: number;
}

// ===========================
// デフォルト値
// ===========================

export const DEFAULT_SETTINGS: UserSettings = {
  videosPerSession: 5,
  questionsPerSession: 10,
  videosPerQuestionSet: 1,
  questionsPerVideoSet: 2,
  orderMode: 'weak_first',
  autoNextVideo: true,
  autoNextQuiz: true,
  weakThresholdPercent: 70,
  weakMixRatio: 70,
};

export const DEFAULT_USER_ID = 'local-user';
