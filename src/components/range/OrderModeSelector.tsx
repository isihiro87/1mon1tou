import { clsx } from 'clsx';
import type { OrderMode } from '../../types';

interface OrderModeSelectorProps {
  orderMode: OrderMode;
  onSelect: (mode: OrderMode) => void;
}

export function OrderModeSelector({ orderMode, onSelect }: OrderModeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">出題順</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSelect('sequential')}
          className={clsx(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            orderMode === 'sequential'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          順番通り
        </button>
        <button
          type="button"
          onClick={() => onSelect('random')}
          className={clsx(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            orderMode === 'random'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          ランダム
        </button>
      </div>
    </div>
  );
}
