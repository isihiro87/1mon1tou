import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

export type ChoiceButtonState = 'default' | 'correct' | 'incorrect' | 'unselected';

interface ChoiceButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  state: ChoiceButtonState;
}

export function ChoiceButton({
  label,
  state,
  disabled,
  className,
  ...props
}: ChoiceButtonProps) {
  return (
    <button
      className={clsx(
        'w-full min-h-12 px-4 py-3 rounded-xl text-left',
        'font-medium text-base leading-snug',
        'transition-all duration-200',
        'border-2',
        // State styles
        {
          // Default: 通常の選択可能状態
          'bg-white border-gray-200 text-gray-900 hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98]':
            state === 'default' && !disabled,
          // Correct: 正解（緑）
          'bg-green-50 border-green-500 text-green-900':
            state === 'correct',
          // Incorrect: 不正解（赤）
          'bg-red-50 border-red-500 text-red-900':
            state === 'incorrect',
          // Unselected: 回答後の未選択選択肢
          'bg-gray-50 border-gray-200 text-gray-500':
            state === 'unselected',
          // Disabled
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      disabled={disabled || state !== 'default'}
      {...props}
    >
      <span className="flex items-center gap-3">
        {/* 正解/不正解アイコン */}
        {state === 'correct' && (
          <svg
            className="w-5 h-5 text-green-600 flex-shrink-0"
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
        {state === 'incorrect' && (
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span>{label}</span>
      </span>
    </button>
  );
}
