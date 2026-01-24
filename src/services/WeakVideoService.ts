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

// 苦手解除に必要な連続null回数
export const WEAK_RESOLUTION_THRESHOLD = 2;

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
   * 苦手解除条件の判定（レガシー: 最後の視聴でfeedback=nullなら解除対象）
   * @deprecated checkWeakResolutionを使用してください
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
   * 苦手解除判定（拡張版）
   * 最新のbad記録以降、連続N回のnon-badフィードバック（null, perfect, unsure）で解除と判定
   *
   * @param videoId - 動画ID
   * @param records - 学習記録
   * @returns 苦手解除されたかどうか
   *
   * @example
   * ```typescript
   * // bad → null → null の順で視聴した場合、2回連続non-badで解除
   * const isResolved = WeakVideoService.checkWeakResolution('video1', records);
   * // => true
   * ```
   */
  static checkWeakResolution(
    videoId: string,
    records: LearningRecord[]
  ): boolean {
    // この動画の記録を時系列順（新しい順）に取得
    const videoRecords = records
      .filter((r) => r.videoId === videoId)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (videoRecords.length === 0) {
      return false;
    }

    // 過去にfeedback='bad'があったか確認
    const hadBadFeedback = videoRecords.some((r) => r.feedback === 'bad');
    if (!hadBadFeedback) {
      return false; // 一度も苦手になっていない
    }

    // 最新のbad以降の非badフィードバック数をカウント
    // null, perfect, unsure 全てカウント（復習ボタンを押さずに視聴完了した回数）
    let consecutiveNonBad = 0;
    for (const record of videoRecords) {
      if (record.feedback === 'bad') {
        break; // 最新のbadに到達
      }
      consecutiveNonBad++;
    }

    return consecutiveNonBad >= WEAK_RESOLUTION_THRESHOLD;
  }

  /**
   * 苦手から解除された動画IDを取得
   *
   * 過去の苦手リストと現在の苦手リストを比較し、
   * 苦手状態から解除された動画を特定する
   *
   * @param previousWeakIds - セッション開始時の苦手動画IDリスト
   * @param records - 現在の全学習記録
   * @returns 解除された動画IDの配列
   *
   * @example
   * ```typescript
   * const previousIds = ['video1', 'video2'];
   * const records = [...]; // video1は連続2回null
   * const resolved = WeakVideoService.getResolvedWeakVideoIds(previousIds, records);
   * // => ['video1']
   * ```
   */
  static getResolvedWeakVideoIds(
    previousWeakIds: string[],
    records: LearningRecord[]
  ): string[] {
    const currentWeakIds = this.getWeakVideoIds(records);
    const currentWeakSet = new Set(currentWeakIds);

    // 過去に苦手だったが、現在は苦手でない動画を抽出
    return previousWeakIds.filter((id) => !currentWeakSet.has(id));
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
