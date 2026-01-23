import { memo } from 'react';
import type { MouseEvent } from 'react';

interface NavigationButtonsProps {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
}

export const NavigationButtons = memo(function NavigationButtons({
  onPrev,
  onNext,
  canGoPrev,
}: NavigationButtonsProps) {
  const handlePrevClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPrev();
  };

  const handleNextClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onNext();
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
      {/* 上ボタン（前へ）- 1つ目の動画では非表示 */}
      {canGoPrev && (
        <button
          onClick={handlePrevClick}
          className="
            flex items-center justify-center w-12 h-12 rounded-full
            transition-all duration-200
            bg-white/20 hover:bg-white/40 active:bg-white/50 cursor-pointer
          "
          aria-label="前の動画へ"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}

      {/* 下ボタン（次へ/フィードバック表示） */}
      <button
        onClick={handleNextClick}
        className="
          flex items-center justify-center w-12 h-12 rounded-full
          transition-all duration-200
          bg-white/20 hover:bg-white/40 active:bg-white/50 cursor-pointer
        "
        aria-label="評価画面へ"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
});
