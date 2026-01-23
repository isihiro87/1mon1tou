import type { FeedbackType } from '../types';

// LearningRecordの型（learningLogStoreと同じ形式）
interface LearningRecord {
  videoId: string;
  displayName: string;
  chapter: string;
  topic: string;
  feedback: FeedbackType | null;
  timestamp: number;
}

// 苦手動画管理・スマート出題順サービス
export class WeakVideoService {
  /**
   * 苦手動画のvideoIdリストを取得
   * 苦手判定: 最後の視聴でfeedback='bad'の動画
   */
  static getWeakVideoIds(records: LearningRecord[]): string[] {
    // 動画ごとに最新の記録を取得
    const latestByVideoId = this.getLatestRecordsByVideoId(records);

    // 最新記録がfeedback='bad'のものを抽出
    const weakIds: string[] = [];
    latestByVideoId.forEach((record, videoId) => {
      if (record.feedback === 'bad') {
        weakIds.push(videoId);
      }
    });

    return weakIds;
  }

  /**
   * 指定動画が苦手かどうか判定
   */
  static isWeakVideo(videoId: string, records: LearningRecord[]): boolean {
    const latestByVideoId = this.getLatestRecordsByVideoId(records);
    const latestRecord = latestByVideoId.get(videoId);
    return latestRecord?.feedback === 'bad';
  }

  /**
   * 苦手解除条件の判定
   * 最後の視聴でfeedback=nullなら解除対象
   */
  static shouldClearWeak(videoId: string, records: LearningRecord[]): boolean {
    const latestByVideoId = this.getLatestRecordsByVideoId(records);
    const latestRecord = latestByVideoId.get(videoId);

    // 最新記録がfeedback=null（復習ボタン未押下）なら解除
    if (latestRecord && latestRecord.feedback === null) {
      // 過去にfeedback='bad'があったか確認
      const hadBadFeedback = records.some(
        (r) => r.videoId === videoId && r.feedback === 'bad'
      );
      return hadBadFeedback;
    }

    return false;
  }

  /**
   * スマート順の優先度計算
   * 高い値ほど優先度が高い
   * 計算式: (苦手スコア × 2) + 未視聴期間スコア
   */
  static calculatePriority(videoId: string, records: LearningRecord[]): number {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // 苦手スコア: 苦手なら100, そうでなければ0
    const isWeak = this.isWeakVideo(videoId, records);
    const weakScore = isWeak ? 100 : 0;

    // 未視聴期間スコア: 最終視聴からの経過日数（最大30日）
    const latestByVideoId = this.getLatestRecordsByVideoId(records);
    const latestRecord = latestByVideoId.get(videoId);

    let daysSinceViewed = 30; // 一度も視聴していない場合は最大値
    if (latestRecord) {
      const elapsed = now - latestRecord.timestamp;
      daysSinceViewed = Math.min(30, Math.floor(elapsed / oneDay));
    }

    // 優先度計算
    return weakScore * 2 + daysSinceViewed;
  }

  /**
   * 動画リストをスマート順でソート
   * 優先度が高い順（降順）
   */
  static sortBySmartOrder<T extends { id: string }>(
    videos: T[],
    records: LearningRecord[]
  ): T[] {
    return [...videos].sort((a, b) => {
      const priorityA = this.calculatePriority(a.id, records);
      const priorityB = this.calculatePriority(b.id, records);
      return priorityB - priorityA;
    });
  }

  /**
   * 動画ごとに最新の記録を取得
   */
  private static getLatestRecordsByVideoId(
    records: LearningRecord[]
  ): Map<string, LearningRecord> {
    const latestByVideoId = new Map<string, LearningRecord>();

    for (const record of records) {
      const existing = latestByVideoId.get(record.videoId);
      if (!existing || record.timestamp > existing.timestamp) {
        latestByVideoId.set(record.videoId, record);
      }
    }

    return latestByVideoId;
  }
}
