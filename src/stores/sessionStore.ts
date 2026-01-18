import { create } from 'zustand';
import type {
  Session,
  SessionContent,
  Video,
  Question,
  AnswerResult,
  LearningLog,
} from '../types';
import { StorageService } from '../services/StorageService';
import { ContentService } from '../services/ContentService';
import { SessionService } from '../services/SessionService';
import { useSettingsStore } from './settingsStore';

interface SessionState {
  session: Session | null;
  videos: Video[];
  questions: Question[];
  isLoading: boolean;
  error: string | null;

  // アクション
  startSession: () => Promise<void>;
  resumeSession: () => void;
  goNext: () => void;
  goPrev: () => void;
  markCompleted: (result?: AnswerResult) => void;
  clearSession: () => void;
  restartSession: () => void;
  restartIncorrectOnly: () => void;

  // ヘルパー
  getCurrentContent: () => SessionContent | null;
  getCurrentVideo: () => Video | null;
  getCurrentQuestion: () => Question | null;
  isSessionComplete: () => boolean;
  getIncorrectQuestionIds: () => string[];
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  videos: [],
  questions: [],
  isLoading: false,
  error: null,

  startSession: async () => {
    set({ isLoading: true, error: null });

    try {
      // コンテンツを取得
      const [videos, questions] = await Promise.all([
        ContentService.fetchVideos(),
        ContentService.fetchQuestions(),
      ]);

      // 設定を取得
      const settings = useSettingsStore.getState().settings;

      // セッションを生成
      const contents = SessionService.createSession(settings, videos, questions);

      const newSession: Session = {
        contents,
        currentIndex: 0,
        startedAt: Date.now(),
      };

      // ストレージに保存
      StorageService.saveSession(newSession);

      set({
        session: newSession,
        videos,
        questions,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'セッションの開始に失敗しました',
      });
    }
  },

  resumeSession: () => {
    const savedSession = StorageService.getSession();
    if (savedSession) {
      // コンテンツも再取得
      ContentService.fetchVideos()
        .then((videos) => {
          ContentService.fetchQuestions().then((questions) => {
            set({
              session: savedSession,
              videos,
              questions,
            });
          });
        })
        .catch(() => {
          // エラー時は新規セッションを開始
          get().startSession();
        });
    }
  },

  goNext: () => {
    const { session } = get();
    if (!session) return;

    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.contents.length) return;

    const updatedSession = {
      ...session,
      currentIndex: nextIndex,
    };

    StorageService.saveSession(updatedSession);
    set({ session: updatedSession });
  },

  goPrev: () => {
    const { session } = get();
    if (!session) return;

    const prevIndex = session.currentIndex - 1;
    if (prevIndex < 0) return;

    const updatedSession = {
      ...session,
      currentIndex: prevIndex,
    };

    StorageService.saveSession(updatedSession);
    set({ session: updatedSession });
  },

  markCompleted: (result?: AnswerResult) => {
    const { session, questions } = get();
    if (!session) return;

    const currentContent = session.contents[session.currentIndex];
    if (!currentContent) return;

    // コンテンツを完了としてマーク
    const updatedContents = [...session.contents];
    updatedContents[session.currentIndex] = {
      ...currentContent,
      completed: true,
      ...(result && { answeredCorrectly: result === 'correct' }),
    };

    const updatedSession = {
      ...session,
      contents: updatedContents,
    };

    // 問題の場合は学習ログを保存
    if (currentContent.type === 'question' && result) {
      const question = questions.find(q => q.id === currentContent.contentId);
      if (question) {
        const log: LearningLog = {
          id: `${currentContent.contentId}-${Date.now()}`,
          questionId: currentContent.contentId,
          result,
          timestamp: Date.now(),
        };
        StorageService.saveLearningLog(log);
      }
    }

    StorageService.saveSession(updatedSession);
    set({ session: updatedSession });
  },

  clearSession: () => {
    StorageService.clearSession();
    set({ session: null });
  },

  getCurrentContent: () => {
    const { session } = get();
    if (!session) return null;
    return session.contents[session.currentIndex] || null;
  },

  getCurrentVideo: () => {
    const { videos } = get();
    const content = get().getCurrentContent();
    if (!content || content.type !== 'video') return null;
    return SessionService.getVideoById(videos, content.contentId) || null;
  },

  getCurrentQuestion: () => {
    const { questions } = get();
    const content = get().getCurrentContent();
    if (!content || content.type !== 'question') return null;
    return SessionService.getQuestionById(questions, content.contentId) || null;
  },

  isSessionComplete: () => {
    const { session } = get();
    if (!session) return false;
    return session.currentIndex >= session.contents.length;
  },

  getIncorrectQuestionIds: () => {
    const { session } = get();
    if (!session) return [];
    return session.contents
      .filter(c => c.type === 'question' && c.answeredCorrectly === false)
      .map(c => c.contentId);
  },

  restartSession: () => {
    const { session } = get();
    if (!session) return;

    // 現在のセッションの問題IDを取得
    const questionIds = session.contents
      .filter(c => c.type === 'question')
      .map(c => c.contentId);

    // 現在のセッションの動画IDを取得
    const videoIds = session.contents
      .filter(c => c.type === 'video')
      .map(c => c.contentId);

    // 同じ動画・問題で新しいセッションコンテンツを作成
    const newContents: SessionContent[] = [];
    videoIds.forEach((videoId, index) => {
      newContents.push({
        type: 'video',
        contentId: videoId,
        completed: false,
      });
      if (questionIds[index]) {
        newContents.push({
          type: 'question',
          contentId: questionIds[index],
          completed: false,
        });
      }
    });

    const newSession: Session = {
      contents: newContents,
      currentIndex: 0,
      startedAt: Date.now(),
    };

    StorageService.saveSession(newSession);
    set({ session: newSession });
  },

  restartIncorrectOnly: () => {
    const { session, videos, questions } = get();
    if (!session) return;

    // 不正解の問題IDを取得
    const incorrectQuestionIds = get().getIncorrectQuestionIds();
    if (incorrectQuestionIds.length === 0) return;

    // 不正解の問題に対応する動画を取得
    const incorrectQuestions = questions.filter(q =>
      incorrectQuestionIds.includes(q.id)
    );

    // 動画IDと問題をペアでセッションコンテンツを作成
    const newContents: SessionContent[] = [];
    incorrectQuestions.forEach(question => {
      // 対応する動画を追加
      const video = videos.find(v => v.id === question.videoId);
      if (video) {
        newContents.push({
          type: 'video',
          contentId: video.id,
          completed: false,
        });
      }
      // 問題を追加
      newContents.push({
        type: 'question',
        contentId: question.id,
        completed: false,
      });
    });

    const newSession: Session = {
      contents: newContents,
      currentIndex: 0,
      startedAt: Date.now(),
    };

    StorageService.saveSession(newSession);
    set({ session: newSession });
  },
}));
