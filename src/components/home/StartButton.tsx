import { Button } from '../common/Button';

interface StartButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function StartButton({ onClick, disabled }: StartButtonProps) {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className="w-full max-w-xs"
    >
      <span className="flex items-center justify-center gap-2">
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        連続学習をはじめる
      </span>
    </Button>
  );
}
