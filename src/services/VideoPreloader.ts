/**
 * 動画プリロードサービス
 * 次の動画を事前にプリロードし、再生開始時の待機時間を短縮する
 */
class VideoPreloaderService {
  private preloadedUrls: Set<string> = new Set();
  private preloadElement: HTMLLinkElement | null = null;

  /**
   * 指定されたURLの動画をプリロードする
   * @param url プリロードする動画のURL
   */
  preload(url: string): void {
    // 既にプリロード済みの場合はスキップ
    if (this.preloadedUrls.has(url)) {
      return;
    }

    // 既存のプリロードリンクを削除
    this.cleanup();

    try {
      // <link rel="preload">を使用してプリロード
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = url;
      document.head.appendChild(link);

      this.preloadElement = link;
      this.preloadedUrls.add(url);
    } catch {
      // プリロード失敗時は静かに無視（ユーザー体験に影響なし）
      console.debug('Video preload failed:', url);
    }
  }

  /**
   * 現在のプリロードをクリーンアップする
   */
  cleanup(): void {
    if (this.preloadElement && this.preloadElement.parentNode) {
      this.preloadElement.parentNode.removeChild(this.preloadElement);
      this.preloadElement = null;
    }
  }

  /**
   * プリロード済みURLのキャッシュをクリアする
   */
  clearCache(): void {
    this.preloadedUrls.clear();
    this.cleanup();
  }

  /**
   * 指定されたURLがプリロード済みかどうかを確認する
   * @param url 確認するURL
   */
  isPreloaded(url: string): boolean {
    return this.preloadedUrls.has(url);
  }
}

// シングルトンインスタンスをエクスポート
export const VideoPreloader = new VideoPreloaderService();
