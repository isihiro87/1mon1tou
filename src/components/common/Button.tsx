import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'font-semibold rounded-xl transition-colors duration-200 active:scale-95 cursor-pointer',
        // Size variants
        {
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-base': size === 'md',
          'px-8 py-4 text-lg': size === 'lg',
        },
        // Color variants
        {
          'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700':
            variant === 'primary' && !disabled,
          'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400':
            variant === 'secondary' && !disabled,
          'bg-green-500 text-white hover:bg-green-600 active:bg-green-700':
            variant === 'success' && !disabled,
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-700':
            variant === 'danger' && !disabled,
        },
        // Disabled state
        {
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
