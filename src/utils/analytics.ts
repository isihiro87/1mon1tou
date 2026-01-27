/**
 * Google Analytics 4 初期化ユーティリティ
 * 本番環境かつ測定IDが設定されている場合のみ有効化
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function initGA4(): void {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // 本番環境かつ測定IDがある場合のみ初期化
  if (!import.meta.env.PROD || !measurementId) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] GA4 disabled in development mode');
    }
    return;
  }

  // gtag.js スクリプトを動的に追加
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // dataLayer と gtag 関数を初期化
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}
