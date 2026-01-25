import type { MouseEvent } from 'react';

interface WeakButtonProps {
  onPress: () => void;
  isPressed: boolean;
}

export function WeakButton({ onPress, isPressed }: WeakButtonProps) {
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
          ? 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-lg'
          : 'bg-white/90 text-gray-800 hover:bg-white hover:scale-105 active:scale-95 shadow-lg'
        }
      `}
      aria-label={isPressed ? '苦手マークを解除' : '苦手としてマーク'}
    >
      {/* 苦手アイコン（×マーク） */}
      <svg
        className={`w-5 h-5 ${isPressed ? 'text-white' : 'text-red-500'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>

      <span className="text-sm font-medium">
        {isPressed ? '苦手マーク中' : '苦手'}
      </span>
    </button>
  );
}
