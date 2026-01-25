import { useEffect, useRef } from 'react';

interface UsePageLifecycleOptions {
  onBeforeUnload?: () => void;
  onVisibilityHidden?: () => void;
}

/**
 * ページライフサイクルイベントを監視するHook
 * - beforeunload: ページを離れる直前（リロード、タブ閉じる等）
 * - visibilitychange: ページが非表示になる時（モバイルでのタブ切り替え、アプリ切り替え等）
 */
export function usePageLifecycle({
  onBeforeUnload,
  onVisibilityHidden,
}: UsePageLifecycleOptions) {
  // コールバックをrefで保持して、最新の関数を参照できるようにする
  const onBeforeUnloadRef = useRef(onBeforeUnload);
  const onVisibilityHiddenRef = useRef(onVisibilityHidden);

  // refを更新
  useEffect(() => {
    onBeforeUnloadRef.current = onBeforeUnload;
    onVisibilityHiddenRef.current = onVisibilityHidden;
  }, [onBeforeUnload, onVisibilityHidden]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      onBeforeUnloadRef.current?.();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onVisibilityHiddenRef.current?.();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
