import { clsx } from 'clsx';
import { VIDEO_COUNT_OPTIONS } from '../../utils/constants';

interface VideoCountSelectorProps {
  value: 3 | 5 | 10;
  onChange: (value: 3 | 5 | 10) => void;
}

export function VideoCountSelector({ value, onChange }: VideoCountSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        1セットの動画本数
      </label>
      <div className="flex gap-2">
        {VIDEO_COUNT_OPTIONS.map(option => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={clsx(
              'flex-1 py-3 rounded-lg font-medium transition-colors',
              value === option
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {option}本
          </button>
        ))}
      </div>
    </div>
  );
}
