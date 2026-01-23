import type { MouseEvent } from 'react';

interface ReviewButtonProps {
  onPress: () => void;
  isPressed: boolean;
}

export function ReviewButton({ onPress, isPressed }: ReviewButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPress();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-full
        transition-all duration-200 ease-out cursor-pointer
        ${isPressed
          ? 'bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95'
          : 'bg-white/90 text-gray-800 hover:bg-white hover:scale-105 active:scale-95 shadow-lg'
        }
      `}
      aria-label={isPressed ? '復習リストから削除' : '復習リストに追加'}
    >
      {/* 復習アイコン */}
      <svg
        className={`w-5 h-5 ${isPressed ? 'text-white' : 'text-yellow-500'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
          clipRule="evenodd"
        />
      </svg>

      <span className="text-sm font-medium">
        {isPressed ? '復習する' : '復習'}
      </span>

      {/* 押下済みチェックマーク（タップで解除可能を示す） */}
      {isPressed && (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
