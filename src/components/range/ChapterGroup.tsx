import type { RangeFolder } from '../../types';
import { FolderCheckbox } from './FolderCheckbox';

interface ChapterGroupProps {
  chapter: string;
  folders: RangeFolder[];
  selectedFolderIds: string[];
  completedFolderIds: Set<string>; // 学習済みフォルダID
  masteredFolderIds: Set<string>;  // 習得済みフォルダID
  weakFolderIds: Set<string>; // 苦手フォルダID
  onToggle: (folderId: string) => void;
  onToggleChapter: (chapter: string) => void;
  onToggleWeak: (folder: RangeFolder) => void;
}

// 章名を日本語に変換
function getChapterDisplayName(chapter: string): string {
  const chapterNames: Record<string, string> = {
    '2-1': '第2章 古代文明の始まり',
    '4-2': '第4章 江戸時代',
    '6-1': '第6章 近代世界',
  };
  return chapterNames[chapter] || `第${chapter}章`;
}

export function ChapterGroup({
  chapter,
  folders,
  selectedFolderIds,
  completedFolderIds,
  masteredFolderIds,
  weakFolderIds,
  onToggle,
  onToggleChapter,
  onToggleWeak,
}: ChapterGroupProps) {
  const selectedCount = folders.filter(f => selectedFolderIds.includes(f.id)).length;
  const isAllSelected = selectedCount === folders.length;
  const isPartiallySelected = selectedCount > 0 && selectedCount < folders.length;

  // 完了率を計算
  const completedCount = folders.filter(f => completedFolderIds.has(f.id)).length;
  const completionRate = Math.round((completedCount / folders.length) * 100);

  // 苦手件数を計算
  const weakCount = folders.filter(f => weakFolderIds.has(f.id)).length;

  const handleChapterClick = () => {
    onToggleChapter(chapter);
  };

  return (
    <div className="mb-4">
      {/* 章ヘッダー（クリック可能） */}
      <button
        type="button"
        onClick={handleChapterClick}
        className="w-full flex items-center gap-2 mb-2 p-2 -ml-2 rounded-lg cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        {/* チェックボックスアイコン */}
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isAllSelected
              ? 'bg-blue-500 border-blue-500'
              : isPartiallySelected
                ? 'bg-blue-200 border-blue-500'
                : 'border-gray-300'
          }`}
        >
          {isAllSelected && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isPartiallySelected && <div className="w-2 h-0.5 bg-blue-500 rounded" />}
        </div>

        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold text-gray-700">
            {getChapterDisplayName(chapter)}
          </h3>
          {/* 完了率バー */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 min-w-[3rem] text-right">
              {completionRate}%
            </span>
          </div>
        </div>
        {weakCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
            苦手{weakCount}件
          </span>
        )}
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            isAllSelected
              ? 'bg-green-100 text-green-700'
              : isPartiallySelected
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500'
          }`}
        >
          {selectedCount}/{folders.length}
        </span>
      </button>

      {/* フォルダ一覧 */}
      <div className="flex flex-col gap-2 ml-2">
        {folders.map(folder => (
          <FolderCheckbox
            key={folder.id}
            folder={folder}
            isSelected={selectedFolderIds.includes(folder.id)}
            isCompleted={completedFolderIds.has(folder.id)}
            isMastered={masteredFolderIds.has(folder.id)}
            isWeak={weakFolderIds.has(folder.id)}
            onToggle={onToggle}
            onToggleWeak={onToggleWeak}
          />
        ))}
      </div>
    </div>
  );
}
