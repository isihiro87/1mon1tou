import { Button } from '../common/Button';

interface WeakReviewButtonProps {
  weakCount: number;
  onClick: () => void;
}

export function WeakReviewButton({ weakCount, onClick }: WeakReviewButtonProps) {
  // 苦手がない場合は非表示
  if (weakCount === 0) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onClick}
      className="w-full max-w-xs py-3 text-base font-medium rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
    >
      <span className="flex items-center justify-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        苦手だけ復習
        <span className="px-2 py-0.5 text-xs bg-red-200 text-red-700 rounded-full">
          {weakCount}件
        </span>
      </span>
    </Button>
  );
}
