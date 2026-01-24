import { useState } from 'react';
import { useSessionHistoryStore } from '../../stores/sessionHistoryStore';

/**
 * 日付をフォーマット（例: 1月24日 14:30）
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function LearningHistorySection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const history = useSessionHistoryStore((state) => state.history);

  if (history.length === 0) {
    return null;
  }

  // 表示件数（折りたたみ時は3件、展開時は全件）
  const displayHistory = isExpanded ? history : history.slice(0, 3);

  return (
    <div className="px-6 mb-6">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">学習履歴</h3>
          {history.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-500 hover:text-blue-600"
            >
              {isExpanded ? '閉じる' : `すべて表示 (${history.length}件)`}
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {displayHistory.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24">
                  {formatDate(entry.completedAt)}
                </span>
                <span className="text-sm text-gray-700">
                  {entry.totalViews}本視聴
                </span>
              </div>
              {entry.reviewMarkCount > 0 ? (
                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                  復習{entry.reviewMarkCount}
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
                  完璧
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
