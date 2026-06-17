import React, { useState } from 'react';
import type { DateRangePreset } from '@/utils/date';
import { cn } from '@/utils/helpers';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { getDateRange, dateRangeLabel } from '@/utils/date';

interface DateRangePickerProps {
  preset: DateRangePreset;
  customRange: { start: string; end: string } | null;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomChange: (range: { start: string; end: string } | null) => void;
  className?: string;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'today', label: '今天' },
  { id: 'yesterday', label: '昨天' },
  { id: 'last7days', label: '最近7天' },
  { id: 'last30days', label: '最近30天' },
  { id: 'thisWeek', label: '本周' },
  { id: 'lastWeek', label: '上周' },
  { id: 'thisMonth', label: '本月' },
  { id: 'lastMonth', label: '上月' },
];

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  preset,
  customRange,
  onPresetChange,
  onCustomChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const currentLabel = customRange
    ? dateRangeLabel(customRange.start, customRange.end)
    : getDateRange(preset).label;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 h-10 px-3.5 border border-navy-200 bg-white rounded-xl',
          'transition-all hover:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-200',
          open ? 'ring-2 ring-navy-200 border-navy-400' : ''
        )}
      >
        <CalendarDays size={16} className="text-navy-500 flex-shrink-0" />
        <span className="text-sm text-navy-800 font-medium whitespace-nowrap">{currentLabel}</span>
        <ChevronDown
          size={16}
          className={cn('text-navy-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-navy-100 rounded-2xl shadow-elevation-2 overflow-hidden z-40 animate-slide-up">
          <div className="p-2 grid grid-cols-2 gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onPresetChange(p.id);
                  onCustomChange(null);
                  setOpen(false);
                }}
                className={cn(
                  'px-3 py-2 text-sm rounded-xl text-left font-medium transition-all',
                  !customRange && preset === p.id
                    ? 'bg-navy-700 text-white'
                    : 'text-navy-700 hover:bg-navy-50'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-navy-100 bg-navy-50/40 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-500">
              自定义时间范围
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-9 px-2.5 text-sm border border-navy-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-9 px-2.5 text-sm border border-navy-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>
            <button
              onClick={() => {
                if (customStart && customEnd && customStart <= customEnd) {
                  onCustomChange({
                    start: new Date(customStart).toISOString(),
                    end: new Date(customEnd + 'T23:59:59').toISOString(),
                  });
                  setOpen(false);
                }
              }}
              disabled={!customStart || !customEnd}
              className={cn(
                'w-full h-9 text-sm font-medium rounded-xl transition-all',
                customStart && customEnd
                  ? 'bg-navy-700 text-white hover:bg-navy-800'
                  : 'bg-navy-100 text-navy-400 cursor-not-allowed'
              )}
            >
              应用自定义范围
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
