import React, { useState } from 'react';
import { cn } from '@/utils/helpers';
import { ChevronDown, Search, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SelectProps {
  value?: string;
  placeholder?: string;
  options: Option[];
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  searchable?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  placeholder = '请选择',
  options,
  onChange,
  size = 'md',
  fullWidth,
  searchable = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOpt = options.find((o) => o.value === value);
  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const sizeCls = size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-3.5 text-sm';

  return (
    <div className={cn('relative', fullWidth ? 'w-full' : '', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between gap-2 w-full border border-navy-200 bg-white rounded-xl',
          'transition-all duration-200 hover:border-navy-300',
          'focus:outline-none focus:ring-2 focus:ring-navy-200',
          open ? 'ring-2 ring-navy-200 border-navy-400' : '',
          sizeCls
        )}
      >
        <span className={cn('truncate', selectedOpt ? 'text-navy-900' : 'text-navy-400')}>
          {selectedOpt?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'text-navy-400 transition-transform duration-200 flex-shrink-0',
            open ? 'rotate-180' : ''
          )}
        />
      </button>

      {open && (
        <div className="absolute z-40 top-full left-0 right-0 mt-1.5 bg-white border border-navy-100 rounded-xl shadow-elevation-2 overflow-hidden animate-fade-in">
          {searchable && (
            <div className="p-2 border-b border-navy-100">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索..."
                  className="w-full h-8 pl-8 pr-2 text-sm bg-navy-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-200"
                />
              </div>
            </div>
          )}
          <div className={cn('py-1 max-h-64 overflow-y-auto')}>
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-navy-400">无匹配结果</div>
            ) : (
              filtered.map((opt) => {
                const selected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3.5 py-2 text-sm text-left transition-colors',
                      selected
                        ? 'bg-navy-50 text-navy-900 font-medium'
                        : 'text-navy-700 hover:bg-navy-50/60'
                    )}
                  >
                    {opt.icon}
                    <span className="flex-1 truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="text-xs text-navy-400 tabular">{opt.description}</span>
                    )}
                    {selected && <Check size={14} className="text-navy-700" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
