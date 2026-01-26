/**
 * 学習統計の計算ロジックを提供するサービス
 */

import { WeakVideoService } from './WeakVideoService';
import type { UserSettings } from '../types';
import { StorageService, type GoalAchievementLog } from './StorageService';

// 学習記録の型（learningLogStoreと同じ構造）
interface LearningRecord {
  videoId: string;
  displayName: string;
  chapter: string;
  topic: string;
  feedback: 'perfect' | 'unsure' | 'bad' | null;
  timestamp: number;
  viewCompleted?: boolean; // 視聴完了フラグ（50%以上視聴した場合のみtrue）
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
  masteredCount: number;    // 習得済み（3回以上視聴＋3回連続non-bad）
  unmasteredCount: number;  // 未習得（視聴済みだが習得条件未達）
  weakCount: number;        // 苦手（最新視聴がbad）
}

// 章別習熟度
export interface ChapterMastery {
  chapter: string;
  displayName: string;
  viewedCount: number;
  totalCount: number;
  mastery: MasteryData;
}

// 目標達成結果
export interface GoalAchievementResult {
  dailyAchieved: boolean;         // 日次目標を今回達成したか
  weeklyAchieved: boolean;        // 週間目標を今回達成したか
  dailyProgress: number;          // 今日の視聴本数
  weeklyProgress: number;         // 今週の視聴本数
  dailyGoal: number;              // 日次目標
  weeklyGoal: number;             // 週間目標
}

export class StatsService {
  /**
   * 日付をYYYY-MM-DD形式で取得（ローカル時間）
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 今日の日付文字列を取得
   */
  static getTodayString(): string {
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
   * viewCompleted !== false のレコードのみをカウント
   */
  static getDailyStats(records: LearningRecord[], days: number = 7): DailyLearningStats[] {
    const dateRange = this.generateDateRange(days);
    const countByDate = new Map<string, number>();

    // viewCompleted !== false のレコードのみをフィルタ
    // 後方互換性: viewCompletedがundefinedの場合（旧データ）もカウント対象
    const completedRecords = records.filter((r) => r.viewCompleted !== false);

    // 日付ごとの学習回数をカウント
    completedRecords.forEach((record) => {
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
   * viewCompleted !== false のレコードのみをカウント
   */
  static getWeeklyStats(records: LearningRecord[]): { weekLabel: string; videoCount: number }[] {
    const weeks: { weekLabel: string; videoCount: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // viewCompleted !== false のレコードのみをフィルタ
    // 後方互換性: viewCompletedがundefinedの場合（旧データ）もカウント対象
    const completedRecords = records.filter((r) => r.viewCompleted !== false);

    for (let w = 0; w < 4; w++) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - w * 7);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const weekStartTime = weekStart.getTime();
      const weekEndTime = weekEnd.getTime() + 24 * 60 * 60 * 1000 - 1; // その日の終わりまで

      const count = completedRecords.filter((r) => {
        return r.timestamp >= weekStartTime && r.timestamp <= weekEndTime;
      }).length;

      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}〜`;
      weeks.unshift({ weekLabel: label, videoCount: count });
    }

    return weeks;
  }

  /**
   * 連続学習日数（ストリーク）を計算
   * viewCompleted !== false のレコードのみを対象
   */
  static calculateStreak(records: LearningRecord[]): StreakData {
    // viewCompleted !== false のレコードのみをフィルタ
    // 後方互換性: viewCompletedがundefinedの場合（旧データ）もカウント対象
    const completedRecords = records.filter((r) => r.viewCompleted !== false);

    if (completedRecords.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastLearningDate: null,
      };
    }

    // 学習した日付のセットを作成
    const learningDates = new Set<string>();
    completedRecords.forEach((record) => {
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
   * 「習得」「未習得」「苦手」の3分類
   *
   * - 習得: 3回以上視聴 かつ 3回連続でbadフィードバックがない
   * - 苦手: 最新の視聴でbadフィードバック
   * - 未習得: それ以外（視聴済みだが習得条件未達）
   */
  static calculateMastery(records: LearningRecord[]): MasteryData {
    const mastery: MasteryData = {
      totalVideos: 0,
      masteredCount: 0,
      unmasteredCount: 0,
      weakCount: 0,
    };

    // viewCompleted !== false のレコードのみを対象
    const completedRecords = records.filter((r) => r.viewCompleted !== false);

    // ユニーク動画IDを取得
    const uniqueVideoIds = new Set(completedRecords.map((r) => r.videoId));

    uniqueVideoIds.forEach((videoId) => {
      mastery.totalVideos++;

      // 習得済みかチェック
      if (WeakVideoService.isMasteredVideo(videoId, records)) {
        mastery.masteredCount++;
      }
      // 苦手かチェック
      else if (WeakVideoService.isWeakVideo(videoId, records)) {
        mastery.weakCount++;
      }
      // それ以外は未習得
      else {
        mastery.unmasteredCount++;
      }
    });

    return mastery;
  }

  /**
   * 今日の視聴本数を取得
   */
  static getTodayViewCount(records: LearningRecord[]): number {
    const today = this.getTodayString();
    const completedRecords = records.filter((r) => r.viewCompleted !== false);
    return completedRecords.filter((r) => this.formatDate(new Date(r.timestamp)) === today).length;
  }

  /**
   * ISO週番号を取得（YYYY-WW形式）
   */
  static getWeekNumber(date: Date): string {
    const target = new Date(date.valueOf());
    // 木曜日を基準にISO週番号を計算
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    const year = date.getFullYear();
    return `${year}-${String(weekNumber).padStart(2, '0')}`;
  }

  /**
   * 今週の視聴本数を取得
   */
  static getThisWeekViewCount(records: LearningRecord[]): number {
    const today = new Date();
    const currentWeek = this.getWeekNumber(today);
    const completedRecords = records.filter((r) => r.viewCompleted !== false);
    return completedRecords.filter((r) => {
      const recordDate = new Date(r.timestamp);
      return this.getWeekNumber(recordDate) === currentWeek;
    }).length;
  }

  /**
   * 章別の習熟度を計算
   */
  static calculateChapterMastery(
    records: LearningRecord[],
    chapters: { chapter: string; displayName: string; totalVideos: number }[]
  ): ChapterMastery[] {
    // viewCompleted !== false のレコードのみを対象
    const completedRecords = records.filter((r) => r.viewCompleted !== false);

    // 章ごとにレコードをグループ化
    const recordsByChapter = new Map<string, LearningRecord[]>();

    completedRecords.forEach((record) => {
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
        // calculateMasteryには章内の全recordsを渡す（習得判定には全履歴が必要）
        // ※calculateMastery内部でviewCompletedフィルタリングが実施される
        mastery: this.calculateMastery(records.filter((r) => r.chapter === ch.chapter)),
      };
    });
  }

  /**
   * 目標達成を判定し、新規達成かどうかを返す
   * @param records 学習記録
   * @param settings ユーザー設定（目標値を含む）
   * @returns 目標達成結果
   */
  static checkGoalAchievement(
    records: LearningRecord[],
    settings: UserSettings
  ): GoalAchievementResult {
    const { dailyGoal, weeklyGoal } = settings;
    const dailyProgress = this.getTodayViewCount(records);
    const weeklyProgress = this.getThisWeekViewCount(records);

    // 達成ログを取得
    const achievementLog = StorageService.getGoalAchievementLog();
    const today = this.getTodayString();
    const currentWeek = this.getWeekNumber(new Date());

    // 日次目標達成判定（目標が設定されている且つ達成且つ未報告）
    const dailyAchieved =
      dailyGoal > 0 &&
      dailyProgress >= dailyGoal &&
      achievementLog.lastDailyAchievement !== today;

    // 週間目標達成判定（目標が設定されている且つ達成且つ未報告）
    const weeklyAchieved =
      weeklyGoal > 0 &&
      weeklyProgress >= weeklyGoal &&
      achievementLog.lastWeeklyAchievement !== currentWeek;

    // 達成時はログを更新
    if (dailyAchieved || weeklyAchieved) {
      const newLog: GoalAchievementLog = {
        lastDailyAchievement: dailyAchieved ? today : achievementLog.lastDailyAchievement,
        lastWeeklyAchievement: weeklyAchieved ? currentWeek : achievementLog.lastWeeklyAchievement,
      };
      StorageService.saveGoalAchievementLog(newLog);
    }

    return {
      dailyAchieved,
      weeklyAchieved,
      dailyProgress,
      weeklyProgress,
      dailyGoal,
      weeklyGoal,
    };
  }
}
