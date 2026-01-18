import { clsx } from 'clsx';

interface AutoNextToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AutoNextToggle({ label, checked, onChange }: AutoNextToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-700">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
          checked ? 'bg-blue-500' : 'bg-gray-300'
        )}
      >
        <span
          className={clsx(
            'inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
