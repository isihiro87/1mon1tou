/**
 * 学習統計の計算ロジックを提供するサービス
 */

// 学習記録の型（learningLogStoreと同じ構造）
interface LearningRecord {
  videoId: string;
  displayName: string;
  chapter: string;
  topic: string;
  feedback: 'perfect' | 'unsure' | 'bad' | null;
  timestamp: number;
}

// 日別統計
export interface DailyLearningStats {
  date: string; // YYYY-MM-DD
  videoCount: number;
}

// ストリーク情報
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLearningDate: string | null;
}

// 習熟度データ
export interface MasteryData {
  totalVideos: number;
  perfectCount: number;
  unsureCount: number;
  badCount: number;
  noFeedbackCount: number;
}

// 章別習熟度
export interface ChapterMastery {
  chapter: string;
  displayName: string;
  viewedCount: number;
  totalCount: number;
  mastery: MasteryData;
}

export class StatsService {
  /**
   * 日付をYYYY-MM-DD形式で取得
   */
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * 今日の日付文字列を取得
   */
  private static getTodayString(): string {
    return this.formatDate(new Date());
  }

  /**
   * 指定日数分の日付リストを生成（今日から過去へ）
   */
  private static generateDateRange(days: number): string[] {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(this.formatDate(date));
    }

    return dates;
  }

  /**
   * 過去N日間の日別学習統計を計算
   */
  static getDailyStats(records: LearningRecord[], days: number = 7): DailyLearningStats[] {
    const dateRange = this.generateDateRange(days);
    const countByDate = new Map<string, number>();

    // 日付ごとの学習回数をカウント
    records.forEach((record) => {
      const date = this.formatDate(new Date(record.timestamp));
      countByDate.set(date, (countByDate.get(date) || 0) + 1);
    });

    // 日付範囲に対応する統計を生成
    return dateRange.map((date) => ({
      date,
      videoCount: countByDate.get(date) || 0,
    })).reverse(); // 古い順に並べ替え
  }

  /**
   * 週別学習統計を計算（過去4週間）
   */
  static getWeeklyStats(records: LearningRecord[]): { weekLabel: string; videoCount: number }[] {
    const weeks: { weekLabel: string; videoCount: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let w = 0; w < 4; w++) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - w * 7);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const weekStartTime = weekStart.getTime();
      const weekEndTime = weekEnd.getTime() + 24 * 60 * 60 * 1000 - 1; // その日の終わりまで

      const count = records.filter((r) => {
        return r.timestamp >= weekStartTime && r.timestamp <= weekEndTime;
      }).length;

      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}〜`;
      weeks.unshift({ weekLabel: label, videoCount: count });
    }

    return weeks;
  }

  /**
   * 連続学習日数（ストリーク）を計算
   */
  static calculateStreak(records: LearningRecord[]): StreakData {
    if (records.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastLearningDate: null,
      };
    }

    // 学習した日付のセットを作成
    const learningDates = new Set<string>();
    records.forEach((record) => {
      learningDates.add(this.formatDate(new Date(record.timestamp)));
    });

    const sortedDates = Array.from(learningDates).sort();
    const lastLearningDate = sortedDates[sortedDates.length - 1];

    // 今日の日付
    const today = this.getTodayString();

    // 現在のストリークを計算
    let currentStreak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // 今日から遡って連続した日を数える
    while (true) {
      const dateStr = this.formatDate(checkDate);
      if (learningDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        // 今日まだ学習していない場合は、昨日から確認
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 最長ストリークを計算
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastLearningDate,
    };
  }

  /**
   * 習熟度を計算
   */
  static calculateMastery(records: LearningRecord[]): MasteryData {
    const mastery: MasteryData = {
      totalVideos: 0,
      perfectCount: 0,
      unsureCount: 0,
      badCount: 0,
      noFeedbackCount: 0,
    };

    // ユニーク動画ごとの最新フィードバックを取得
    const latestFeedbackByVideo = new Map<string, 'perfect' | 'unsure' | 'bad' | null>();

    records.forEach((record) => {
      // 同じ動画の場合は最新のフィードバックで上書き
      latestFeedbackByVideo.set(record.videoId, record.feedback);
    });

    latestFeedbackByVideo.forEach((feedback) => {
      mastery.totalVideos++;
      if (feedback === null) {
        mastery.noFeedbackCount++;
      } else if (feedback === 'perfect') {
        mastery.perfectCount++;
      } else if (feedback === 'unsure') {
        mastery.unsureCount++;
      } else if (feedback === 'bad') {
        mastery.badCount++;
      }
    });

    return mastery;
  }

  /**
   * 章別の習熟度を計算
   */
  static calculateChapterMastery(
    records: LearningRecord[],
    chapters: { chapter: string; displayName: string; totalVideos: number }[]
  ): ChapterMastery[] {
    // 章ごとにレコードをグループ化
    const recordsByChapter = new Map<string, LearningRecord[]>();

    records.forEach((record) => {
      const chapterRecords = recordsByChapter.get(record.chapter) || [];
      chapterRecords.push(record);
      recordsByChapter.set(record.chapter, chapterRecords);
    });

    return chapters.map((ch) => {
      const chapterRecords = recordsByChapter.get(ch.chapter) || [];
      const uniqueVideoIds = new Set(chapterRecords.map((r) => r.videoId));

      return {
        chapter: ch.chapter,
        displayName: ch.displayName,
        viewedCount: uniqueVideoIds.size,
        totalCount: ch.totalVideos,
        mastery: this.calculateMastery(chapterRecords),
      };
    });
  }
}
