import type { Video, Question, SessionContent, UserSettings } from '../types';

export class SessionService {
  /**
   * 学習セッションを生成する
   * 動画と問題を交互に配置して、連続学習用のコンテンツリストを作成
   *
   * @param settings - ユーザー設定
   * @param videos - 利用可能な動画一覧
   * @param questions - 利用可能な問題一覧
   * @returns 生成されたセッションコンテンツ配列
   */
  static createSession(
    settings: UserSettings,
    videos: Video[],
    questions: Question[]
  ): SessionContent[] {
    const contents: SessionContent[] = [];

    // 動画をランダムにシャッフル
    const shuffledVideos = [...videos].sort(() => Math.random() - 0.5);

    // セッションに含める動画を選択
    const sessionVideos = shuffledVideos.slice(0, settings.videosPerSession);

    // 各動画とその動画に紐づく問題を交互に配置
    for (const video of sessionVideos) {
      // 動画を追加
      contents.push({
        type: 'video',
        contentId: video.id,
        completed: false,
      });

      // この動画に紐づく問題を追加（ランダムに1問選択）
      const videoQuestions = questions.filter(q => q.videoId === video.id);

      if (videoQuestions.length > 0) {
        const randomQuestion =
          videoQuestions[Math.floor(Math.random() * videoQuestions.length)];
        contents.push({
          type: 'question',
          contentId: randomQuestion.id,
          completed: false,
        });
      }
    }

    return contents;
  }

  /**
   * 動画IDから動画を取得
   */
  static getVideoById(videos: Video[], videoId: string): Video | undefined {
    return videos.find(v => v.id === videoId);
  }

  /**
   * 問題IDから問題を取得
   */
  static getQuestionById(
    questions: Question[],
    questionId: string
  ): Question | undefined {
    return questions.find(q => q.id === questionId);
  }
}
