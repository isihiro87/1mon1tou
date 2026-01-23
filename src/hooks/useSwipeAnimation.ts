import { useState, useCallback, useEffect } from 'react';

type SwipeDirection = 'up' | 'down' | 'left' | 'right' | null;
type AnimationState = 'idle' | 'entering' | 'exiting';

interface UseSwipeAnimationOptions {
  duration?: number;
}

interface UseSwipeAnimationReturn {
  direction: SwipeDirection;
  animationState: AnimationState;
  triggerAnimation: (dir: SwipeDirection) => void;
  getAnimationClass: () => string;
}

/**
 * スワイプアニメーションを管理するフック
 * @param options オプション設定
 */
export function useSwipeAnimation({
  duration = 400,
}: UseSwipeAnimationOptions = {}): UseSwipeAnimationReturn {
  const [direction, setDirection] = useState<SwipeDirection>(null);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');

  const triggerAnimation = useCallback((dir: SwipeDirection) => {
    setDirection(dir);
    setAnimationState('exiting');
  }, []);

  // アニメーション終了後にリセット
  useEffect(() => {
    if (animationState === 'exiting') {
      const timer = setTimeout(() => {
        setAnimationState('entering');
      }, duration / 2);

      const resetTimer = setTimeout(() => {
        setAnimationState('idle');
        setDirection(null);
      }, duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [animationState, duration]);

  const getAnimationClass = useCallback((): string => {
    if (animationState === 'idle') {
      return '';
    }

    const baseTransition = 'transition-all duration-400 ease-out';

    if (animationState === 'exiting') {
      switch (direction) {
        case 'up':
          return `${baseTransition} -translate-y-[20vh] opacity-0 scale-95`;
        case 'down':
          return `${baseTransition} translate-y-[20vh] opacity-0 scale-95`;
        case 'left':
          return `${baseTransition} -translate-x-[20vw] opacity-0 scale-95`;
        case 'right':
          return `${baseTransition} translate-x-[20vw] opacity-0 scale-95`;
        default:
          return baseTransition;
      }
    }

    if (animationState === 'entering') {
      switch (direction) {
        case 'up':
          return `${baseTransition} translate-y-0 opacity-100 scale-100`;
        case 'down':
          return `${baseTransition} translate-y-0 opacity-100 scale-100`;
        case 'left':
          return `${baseTransition} translate-x-0 opacity-100 scale-100`;
        case 'right':
          return `${baseTransition} translate-x-0 opacity-100 scale-100`;
        default:
          return baseTransition;
      }
    }

    return '';
  }, [direction, animationState]);

  return {
    direction,
    animationState,
    triggerAnimation,
    getAnimationClass,
  };
}
