import React from 'react';
import { cn } from '@/utils/helpers';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'orange' | 'violet';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: 'sm' | 'md';
  rounded?: 'sm' | 'md' | 'full';
}

const variantMap: Record<TagVariant, string> = {
  default: 'bg-navy-50 text-navy-700 border-navy-100',
  primary: 'bg-navy-100 text-navy-800 border-navy-200',
  success: 'bg-success-50 text-success-600 border-emerald-100',
  warning: 'bg-warning-50 text-warning-600 border-amber-100',
  danger: 'bg-danger-50 text-danger-600 border-red-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
};

export const Tag: React.FC<TagProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  rounded = 'md',
  children,
  ...rest
}) => {
  const sizeCls = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const roundCls = {
    sm: 'rounded',
    md: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  return (
    <span
      className={cn(
        'inline-flex items-center border font-medium tabular',
        variantMap[variant],
        sizeCls,
        roundCls,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
};
