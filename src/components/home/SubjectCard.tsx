import { clsx } from 'clsx';
import type { Subject } from '../../types';

interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onSelect: (subject: Subject) => void;
}

export function SubjectCard({ subject, isSelected, onSelect }: SubjectCardProps) {
  const handleClick = () => {
    if (subject.enabled) {
      onSelect(subject);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!subject.enabled}
      className={clsx(
        'flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-200 cursor-pointer',
        'min-h-[64px]',
        {
          'bg-blue-50 border-2 border-blue-500 shadow-md': isSelected && subject.enabled,
          'bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50': !isSelected && subject.enabled,
          'bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed': !subject.enabled,
        }
      )}
    >
      {/* アイコン */}
      <div
        className={clsx(
          'flex items-center justify-center w-12 h-12 rounded-xl',
          {
            'bg-blue-500 text-white': isSelected && subject.enabled,
            'bg-blue-100 text-blue-600': !isSelected && subject.enabled,
            'bg-gray-200 text-gray-400': !subject.enabled,
          }
        )}
      >
        {subject.icon === 'book' && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        )}
      </div>

      {/* 科目名 */}
      <div className="flex-1 text-left">
        <span
          className={clsx('text-lg font-bold', {
            'text-blue-700': isSelected && subject.enabled,
            'text-gray-800': !isSelected && subject.enabled,
            'text-gray-400': !subject.enabled,
          })}
        >
          {subject.name}
        </span>
        {!subject.enabled && (
          <span className="block text-sm text-gray-400 mt-0.5">準備中</span>
        )}
      </div>

      {/* 選択インジケーター */}
      {isSelected && subject.enabled && (
        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
