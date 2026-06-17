import React from 'react';
import { cn } from '@/utils/helpers';

interface TabsProps<T extends string = string> {
  tabs: { id: T; label: string; icon?: React.ReactNode }[];
  active: T;
  onChange: (id: T) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs = <T extends string>({
  tabs,
  active,
  onChange,
  variant = 'default',
  className,
}: TabsProps<T>) => {
  if (variant === 'pills') {
    return (
      <div className={cn('inline-flex items-center gap-1 p-1 bg-navy-50 rounded-xl', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              active === tab.id
                ? 'bg-white text-navy-800 shadow-card'
                : 'text-navy-500 hover:text-navy-800 hover:bg-white/60'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div className={cn('inline-flex items-center gap-1 border-b border-navy-100 w-full', className)}>
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive ? 'text-navy-800' : 'text-navy-500 hover:text-navy-800'
              )}
            >
              {tab.icon}
              {tab.label}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gradient-to-r from-navy-700 to-orange-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200',
            active === tab.id
              ? 'border-navy-700 bg-navy-700 text-white shadow-sm'
              : 'border-transparent text-navy-600 hover:bg-navy-50 hover:text-navy-800'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};
