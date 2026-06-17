import React from 'react';
import { cn } from '@/utils/helpers';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-navy-700 to-navy-600 text-white hover:from-navy-800 hover:to-navy-700 focus:ring-navy-300 shadow-sm',
  secondary:
    'bg-navy-50 text-navy-800 hover:bg-navy-100 focus:ring-navy-200',
  outline:
    'border border-navy-200 text-navy-800 hover:bg-navy-50 focus:ring-navy-200 bg-white',
  ghost:
    'text-navy-700 hover:bg-navy-50 focus:ring-navy-200',
  danger:
    'bg-gradient-to-r from-danger-600 to-danger-500 text-white hover:from-danger-700 hover:to-danger-600 focus:ring-red-300 shadow-sm',
  success:
    'bg-gradient-to-r from-success-600 to-success-500 text-white hover:from-success-700 hover:to-success-600 focus:ring-green-300 shadow-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  children,
  disabled,
  ...rest
}) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        'active:translate-y-px',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};
