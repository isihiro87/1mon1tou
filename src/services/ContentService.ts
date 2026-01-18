import type { Video, Question, VideosData, QuestionsData } from '../types';
import { CONTENT_PATHS } from '../utils/constants';
import { ContentLoadError } from '../utils/errors';

export class ContentService {
  private static videosCache: Video[] | null = null;
  private static questionsCache: Question[] | null = null;

  static async fetchVideos(): Promise<Video[]> {
    if (this.videosCache) {
      return this.videosCache;
    }

    try {
      const response = await fetch(CONTENT_PATHS.VIDEOS);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: VideosData = await response.json();
      this.videosCache = data.videos;
      return data.videos;
    } catch {
      throw new ContentLoadError('動画データの取得に失敗しました', 'videos');
    }
  }

  static async fetchQuestions(): Promise<Question[]> {
    if (this.questionsCache) {
      return this.questionsCache;
    }

    try {
      const response = await fetch(CONTENT_PATHS.QUESTIONS);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: QuestionsData = await response.json();
      this.questionsCache = data.questions;
      return data.questions;
    } catch {
      throw new ContentLoadError('問題データの取得に失敗しました', 'questions');
    }
  }

  static clearCache(): void {
    this.videosCache = null;
    this.questionsCache = null;
  }
}
