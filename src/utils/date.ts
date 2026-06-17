import {
  format,
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  differenceInDays,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
};

export const formatTimeOnly = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm', { locale: zhCN });
};

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth';

export const getDateRange = (preset: DateRangePreset): { start: string; end: string; label: string } => {
  const today = new Date();
  let start: Date, end: Date, label: string;

  switch (preset) {
    case 'today':
      start = startOfToday();
      end = endOfToday();
      label = '今天';
      break;
    case 'yesterday':
      start = startOfToday();
      end = endOfToday();
      start = subDays(start, 1);
      end = subDays(end, 1);
      label = '昨天';
      break;
    case 'last7days':
      end = endOfToday();
      start = subDays(endOfToday(), 6);
      label = '最近7天';
      break;
    case 'last30days':
      end = endOfToday();
      start = subDays(endOfToday(), 29);
      label = '最近30天';
      break;
    case 'thisWeek':
      start = startOfWeek(today, { weekStartsOn: 1 });
      end = endOfWeek(today, { weekStartsOn: 1 });
      label = '本周';
      break;
    case 'lastWeek':
      start = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      end = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      label = '上周';
      break;
    case 'thisMonth':
      start = startOfMonth(today);
      end = endOfMonth(today);
      label = '本月';
      break;
    case 'lastMonth':
      start = startOfMonth(subMonths(today, 1));
      end = endOfMonth(subMonths(today, 1));
      label = '上月';
      break;
    default:
      start = subDays(endOfToday(), 6);
      end = endOfToday();
      label = '最近7天';
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    label,
  };
};

export const getCompareRange = (base: { start: string; end: string }): { start: string; end: string; label: string } => {
  const startDate = new Date(base.start);
  const endDate = new Date(base.end);
  const days = differenceInDays(endDate, startDate) + 1;

  const prevEnd = subDays(startDate, 1);
  const prevStart = subDays(prevEnd, days - 1);

  return {
    start: prevStart.toISOString(),
    end: prevEnd.toISOString(),
    label: `前${days}天`,
  };
};

export const dateRangeLabel = (start: string, end: string): string => {
  return `${formatDate(start)} ~ ${formatDate(end)}`;
};
