import { Button } from '../common/Button';

interface ContinueButtonProps {
  currentIndex: number;
  totalCount: number;
  onClick: () => void;
}

export function ContinueButton({ currentIndex, totalCount, onClick }: ContinueButtonProps) {
  const progress = Math.round((currentIndex / totalCount) * 100);

  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onClick}
      className="w-full py-3 text-base font-medium rounded-xl border-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
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
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        前回の続きから
        <span className="px-2 py-0.5 text-xs bg-green-200 text-green-700 rounded-full">
          {currentIndex}/{totalCount} ({progress}%)
        </span>
      </span>
    </Button>
  );
}
