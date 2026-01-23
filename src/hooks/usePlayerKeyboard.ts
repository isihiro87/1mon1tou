import { useEffect, useCallback } from 'react';

interface UsePlayerKeyboardOptions {
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay?: () => void;
  onEscape?: () => void;
  disabled?: boolean;
}

export function usePlayerKeyboard({
  onPrev,
  onNext,
  onTogglePlay,
  onEscape,
  disabled = false,
}: UsePlayerKeyboardOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // 入力フィールドにフォーカス時はスキップ
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onPrev();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onNext();
          break;
        case ' ':
          if (onTogglePlay) {
            event.preventDefault();
            onTogglePlay();
          }
          break;
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
      }
    },
    [disabled, onPrev, onNext, onTogglePlay, onEscape]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
