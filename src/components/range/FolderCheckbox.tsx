import { clsx } from 'clsx';
import type { RangeFolder } from '../../types';

interface FolderCheckboxProps {
  folder: RangeFolder;
  isSelected: boolean;
  onToggle: (folderId: string) => void;
}

export function FolderCheckbox({ folder, isSelected, onToggle }: FolderCheckboxProps) {
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
      <span className={clsx('text-sm', isSelected ? 'text-blue-700 font-medium' : 'text-gray-700')}>
        {folder.displayName}
      </span>
    </label>
  );
}
