import type { FeedbackType } from '../../types';

interface FeedbackSelectorProps {
  onSelect: (feedback: FeedbackType) => void;
  videoTitle: string;
}

export function FeedbackSelector({ onSelect, videoTitle }: FeedbackSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-gray-900 to-black p-6">
      {/* タイトル */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm mb-2">動画を見終わりました</p>
        <p className="text-white font-medium text-lg truncate max-w-xs">{videoTitle}</p>
      </div>

      {/* 質問 */}
      <h2 className="text-white text-xl font-bold mb-8">暗記度はどうでしたか？</h2>

      {/* 3択ボタン */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* ばっちり */}
        <button
          type="button"
          onClick={() => onSelect('perfect')}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold text-lg rounded-2xl transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <span className="text-2xl">😊</span>
          <span>ばっちり！</span>
        </button>

        {/* 少し心配 */}
        <button
          type="button"
          onClick={() => onSelect('unsure')}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-white font-bold text-lg rounded-2xl transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <span className="text-2xl">🤔</span>
          <span>少し心配...</span>
        </button>

        {/* ヤバい */}
        <button
          type="button"
          onClick={() => onSelect('bad')}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-red-500 hover:bg-red-400 active:bg-red-600 text-white font-bold text-lg rounded-2xl transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <span className="text-2xl">😰</span>
          <span>ヤバい...</span>
        </button>
      </div>

      {/* ヒント */}
      <div className="mt-8 text-center">
        <p className="text-white/40 text-xs">
          「少し心配」→ 2週目でもう一度
        </p>
        <p className="text-white/40 text-xs">
          「ヤバい」→ すぐにもう一度
        </p>
      </div>
    </div>
  );
}
