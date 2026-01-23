import { useEffect, useState } from 'react';

interface ReviewToastProps {
  show: boolean;
  onHide: () => void;
  duration?: number;
}

export function ReviewToast({ show, onHide, duration = 2000 }: ReviewToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      // 表示開始
      setIsVisible(true);
      setIsAnimating(true);

      // 指定時間後にフェードアウト開始
      const fadeTimer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);

      // アニメーション完了後に非表示
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        onHide();
      }, duration + 300); // 300msはフェードアウトアニメーション時間

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, duration, onHide]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2 px-4 py-3 rounded-full
        bg-yellow-500 text-white shadow-lg
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {/* 復習アイコン */}
      <svg
        className="w-5 h-5"
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
        復習リストに追加しました
      </span>
    </div>
  );
}
