import type { RangeFolder, RangeFoldersData, VerticalVideo, OrderMode } from '../types';
import { ContentLoadError } from '../utils/errors';
import { WeakVideoService } from './WeakVideoService';
import { useLearningLogStore } from '../stores/learningLogStore';

const RANGE_FOLDERS_PATH = '/content/range-folders.json';

export class RangeContentService {
  private static foldersCache: RangeFolder[] | null = null;

  /**
   * 利用可能なフォルダ一覧を取得
   */
  static async fetchRangeFolders(): Promise<RangeFolder[]> {
    if (this.foldersCache) {
      return this.foldersCache;
    }

    try {
      const response = await fetch(RANGE_FOLDERS_PATH);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: RangeFoldersData = await response.json();
      this.foldersCache = data.folders;
      return data.folders;
    } catch {
      throw new ContentLoadError('フォルダ一覧の取得に失敗しました', 'range-folders');
    }
  }

  /**
   * 選択されたフォルダから動画リストを生成
   */
  static createVideoListFromFolders(
    folders: RangeFolder[],
    selectedFolderIds: string[],
    orderMode: OrderMode
  ): VerticalVideo[] {
    // 選択されたフォルダのみをフィルタリング
    const selectedFolders = folders.filter(f => selectedFolderIds.includes(f.id));

    // VerticalVideo形式に変換
    const videos: VerticalVideo[] = selectedFolders.map(folder => ({
      id: folder.id,
      url: folder.videoUrl,
      displayName: folder.displayName,
      chapter: folder.chapter,
      topic: folder.topic,
    }));

    // 順番モードに応じてソートまたはシャッフル
    if (orderMode === 'random') {
      return this.shuffleVideos(videos);
    }

    if (orderMode === 'smart') {
      // スマート順: 苦手優先 + 間隔反復
      const records = useLearningLogStore.getState().records;
      return WeakVideoService.sortBySmartOrder(videos, records);
    }

    // sequential: フォルダID（章/トピック）でソート
    return videos.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * 動画リストをシャッフル（Fisher-Yatesアルゴリズム）
   */
  static shuffleVideos<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * フォルダを章ごとにグルーピング
   */
  static groupFoldersByChapter(folders: RangeFolder[]): Map<string, RangeFolder[]> {
    const grouped = new Map<string, RangeFolder[]>();

    for (const folder of folders) {
      const existing = grouped.get(folder.chapter) || [];
      existing.push(folder);
      grouped.set(folder.chapter, existing);
    }

    return grouped;
  }

  /**
   * キャッシュをクリア
   */
  static clearCache(): void {
    this.foldersCache = null;
  }
}
