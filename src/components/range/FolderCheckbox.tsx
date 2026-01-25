import type { MouseEvent } from 'react';
import { clsx } from 'clsx';
import type { RangeFolder } from '../../types';

interface FolderCheckboxProps {
  folder: RangeFolder;
  isSelected: boolean;
  isCompleted: boolean;  // 視聴済みかどうか
  isWeak: boolean;
  onToggle: (folderId: string) => void;
  onToggleWeak: (folder: RangeFolder) => void;
}

export function FolderCheckbox({ folder, isSelected, isCompleted, isWeak, onToggle, onToggleWeak }: FolderCheckboxProps) {
  const handleWeakClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWeak(folder);
  };

  return (
    <label
      className={clsx(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200',
        'border'
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(folder.id)}
        className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
      />
      <span className={clsx('flex-1 text-sm', isSelected ? 'text-blue-700 font-medium' : 'text-gray-700')}>
        {folder.displayName}
      </span>

      {/* 視聴状態の表示 */}
      {!isCompleted ? (
        // 未視聴: 「未」バッジのみ表示
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-500">
          未
        </span>
      ) : (
        // 視聴済み: 〇/苦手 切り替えボタン
        <button
          type="button"
          onClick={handleWeakClick}
          className={clsx(
            'px-2 py-0.5 text-xs rounded-full transition-all',
            isWeak
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          )}
          aria-label={isWeak ? '苦手マークを解除' : '苦手としてマーク'}
        >
          {isWeak ? '苦手' : '〇'}
        </button>
      )}
    </label>
  );
}
