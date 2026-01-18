import type { SessionStatsData } from '../types';

// メッセージカテゴリ
type MessageCategory = 'excellent' | 'good' | 'encouraging';

// 各カテゴリのメッセージパターン（中学生向け、親しみやすい表現）
const MESSAGE_PATTERNS: Record<MessageCategory, string[]> = {
  // 優秀（ばっちり率80%以上）
  excellent: [
    'すごい！完璧だね！この調子で続けよう！',
    '天才じゃん！自信持っていいよ！',
    'バッチリ覚えてる！テストもこの調子でいこう！',
    '完璧！君の努力が実を結んでるね！',
    'さすが！しっかり身についてるよ！',
    '最高の出来！この実力、本物だね！',
  ],
  // 良好（ばっちり率50%以上）
  good: [
    'いい感じ！着実に成長してるよ！',
    '頑張ってるね！その調子！',
    'もう少しで完璧！ファイト！',
    '順調に覚えてきてる！あと少し！',
    'いいペース！続けていこう！',
    '確実に力がついてきてる！',
  ],
  // 頑張り中（ばっちり率50%未満）
  encouraging: [
    '大丈夫！繰り返せば必ず覚えられるよ！',
    'チャレンジし続けることが大事！',
    '一歩一歩進んでるよ！諦めないで！',
    '今日も頑張ったね！次はもっとできる！',
    '努力は裏切らない！続けていこう！',
    '苦手なところが分かったね！次に活かそう！',
  ],
};

/**
 * ばっちり率を計算する
 */
export function calculatePerfectRate(stats: SessionStatsData): number {
  const total =
    stats.totalFeedbacks.perfect +
    stats.totalFeedbacks.unsure +
    stats.totalFeedbacks.bad;

  if (total === 0) return 0;

  return (stats.totalFeedbacks.perfect / total) * 100;
}

/**
 * 成績に応じたメッセージカテゴリを決定する
 */
function determineCategory(perfectRate: number): MessageCategory {
  if (perfectRate >= 80) return 'excellent';
  if (perfectRate >= 50) return 'good';
  return 'encouraging';
}

/**
 * 励ましメッセージを選択する
 * @param stats セッション統計データ
 * @returns 選択された励ましメッセージ
 */
export function selectEncouragementMessage(stats: SessionStatsData): string {
  const perfectRate = calculatePerfectRate(stats);
  const category = determineCategory(perfectRate);
  const messages = MESSAGE_PATTERNS[category];

  // ランダムに選択
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * 成績に応じた絵文字を取得する
 */
export function getPerformanceEmoji(stats: SessionStatsData): string {
  const perfectRate = calculatePerfectRate(stats);

  if (perfectRate >= 80) return '🎉';
  if (perfectRate >= 50) return '💪';
  return '📚';
}
