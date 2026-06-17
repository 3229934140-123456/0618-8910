import { create } from 'zustand';
import type {
  Funnel,
  FunnelResult,
  DimensionSplit,
  PeriodCompare,
  UserDimensionField,
  DateRangePreset,
} from '@/types';
import {
  INITIAL_FUNNELS,
  calculateFunnelResult,
  calculateDimensionSplit,
  calculatePeriodCompare,
  DIMENSION_OPTIONS,
} from '@/services/mockData';
import { getDateRange, getCompareRange } from '@/utils/date';
import { generateId } from '@/utils/helpers';
import { loadState, saveState } from '@/services/localStorage';

interface FunnelStore {
  funnels: Funnel[];
  selectedFunnelId: string | null;
  datePreset: DateRangePreset;
  customDateRange: { start: string; end: string } | null;
  selectedDimension: UserDimensionField | null;
  compareMode: 'none' | 'overlay' | 'sidebyside';
  compareDateRange: { start: string; end: string; label: string } | null;
  customCompareA: { start: string; end: string; label: string } | null;
  customCompareB: { start: string; end: string; label: string } | null;

  setSelectedFunnel: (id: string) => void;
  setDatePreset: (preset: DateRangePreset) => void;
  setCustomDateRange: (range: { start: string; end: string } | null) => void;
  setSelectedDimension: (dim: UserDimensionField | null) => void;
  setCompareMode: (mode: 'none' | 'overlay' | 'sidebyside') => void;
  setCustomCompareA: (period: { start: string; end: string; label: string } | null) => void;
  setCustomCompareB: (period: { start: string; end: string; label: string } | null) => void;
  setCustomCompareBoth: (
    periodA: { start: string; end: string; label: string },
    periodB: { start: string; end: string; label: string }
  ) => void;
  clearCustomCompare: () => void;
  toggleFavorite: (id: string) => void;
  addFunnel: (data: Omit<Funnel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isFavorite'>) => Funnel;
  updateFunnel: (id: string, data: Partial<Funnel>) => void;
  deleteFunnel: (id: string) => void;

  getDateRange: () => { start: string; end: string; label: string };
  getFunnel: (id: string) => Funnel | undefined;
  getFunnelResult: (funnelId: string) => FunnelResult;
  getDimensionSplit: (funnelId: string) => DimensionSplit | null;
  getPeriodCompare: (funnelId: string) => PeriodCompare | null;
}

export const useFunnelStore = create<FunnelStore>((set, get) => ({
  funnels: loadState<Funnel[]>('funnels', INITIAL_FUNNELS),
  selectedFunnelId: null,
  datePreset: loadState<DateRangePreset>('datePreset', 'last7days'),
  customDateRange: loadState<{ start: string; end: string } | null>('customDateRange', null),
  selectedDimension: null,
  compareMode: loadState<'none' | 'overlay' | 'sidebyside'>('compareMode', 'none'),
  compareDateRange: null,
  customCompareA: loadState<{ start: string; end: string; label: string } | null>('customCompareA', null),
  customCompareB: loadState<{ start: string; end: string; label: string } | null>('customCompareB', null),

  setSelectedFunnel: (id) => set({ selectedFunnelId: id }),

  setDatePreset: (preset) => {
    const range = getDateRange(preset);
    set({
      datePreset: preset,
      customDateRange: null,
      compareDateRange: getCompareRange({ start: range.start, end: range.end }),
    });
  },

  setCustomDateRange: (range) => {
    set({
      datePreset: range ? 'last7days' : get().datePreset,
      customDateRange: range,
      compareDateRange: range ? getCompareRange(range) : null,
    });
  },

  setSelectedDimension: (dim) => set({ selectedDimension: dim }),

  setCompareMode: (mode) => {
    set({
      compareMode: mode,
      compareDateRange: mode !== 'none' ? get().compareDateRange || (() => {
        const range = get().getDateRange();
        return getCompareRange({ start: range.start, end: range.end });
      })() : null,
    });
  },

  setCustomCompareA: (period) => set({ customCompareA: period }),
  setCustomCompareB: (period) => set({ customCompareB: period }),

  setCustomCompareBoth: (periodA, periodB) => {
    set({
      customCompareA: periodA,
      customCompareB: periodB,
    });
  },

  clearCustomCompare: () => {
    set({
      customCompareA: null,
      customCompareB: null,
    });
  },

  toggleFavorite: (id) =>
    set({
      funnels: get().funnels.map((f) =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite, updatedAt: new Date().toISOString() } : f
      ),
    }),

  addFunnel: (data) => {
    const now = new Date().toISOString();
    const newFunnel: Funnel = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      createdBy: '当前用户',
      isFavorite: false,
    };
    set({ funnels: [newFunnel, ...get().funnels] });
    return newFunnel;
  },

  updateFunnel: (id, data) =>
    set({
      funnels: get().funnels.map((f) =>
        f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f
      ),
    }),

  deleteFunnel: (id) => set({ funnels: get().funnels.filter((f) => f.id !== id) }),

  getDateRange: () => {
    const { customDateRange, datePreset } = get();
    if (customDateRange) {
      return { ...customDateRange, label: '自定义' };
    }
    return getDateRange(datePreset);
  },

  getFunnel: (id) => get().funnels.find((f) => f.id === id),

  getFunnelResult: (funnelId) => {
    const funnel = get().getFunnel(funnelId);
    const range = get().getDateRange();
    if (!funnel) {
      return { funnelId, period: range, steps: [], totalConversionRate: 0 };
    }
    return calculateFunnelResult(funnel, { start: range.start, end: range.end });
  },

  getDimensionSplit: (funnelId) => {
    const { selectedDimension } = get();
    if (!selectedDimension) return null;
    const funnel = get().getFunnel(funnelId);
    const range = get().getDateRange();
    if (!funnel) return null;
    const dimOpt = DIMENSION_OPTIONS.find((d) => d.field === selectedDimension);
    if (!dimOpt) return null;
    return calculateDimensionSplit(funnel, { start: range.start, end: range.end }, dimOpt);
  },

  getPeriodCompare: (funnelId) => {
    const { compareMode, compareDateRange, customCompareA, customCompareB } = get();
    if (compareMode === 'none') return null;

    const funnel = get().getFunnel(funnelId);
    if (!funnel) return null;

    let periodA: { start: string; end: string; label: string };
    let periodB: { start: string; end: string; label: string };

    if (customCompareA && customCompareB) {
      periodA = customCompareA;
      periodB = customCompareB;
    } else if (customCompareA) {
      periodA = customCompareA;
      periodB = get().getDateRange();
    } else {
      const baseRange = get().getDateRange();
      periodA = compareDateRange || getCompareRange({ start: baseRange.start, end: baseRange.end });
      periodB = baseRange;
    }

    return calculatePeriodCompare(
      funnel,
      { start: periodA.start, end: periodA.end, label: periodA.label },
      { start: periodB.start, end: periodB.end, label: periodB.label }
    );
  },
}));

useFunnelStore.subscribe((state) => {
  saveState('funnels', state.funnels);
});

useFunnelStore.subscribe((state) => {
  saveState('datePreset', state.datePreset);
});

useFunnelStore.subscribe((state) => {
  saveState('customDateRange', state.customDateRange);
});

useFunnelStore.subscribe((state) => {
  saveState('compareMode', state.compareMode);
});

useFunnelStore.subscribe((state) => {
  saveState('customCompareA', state.customCompareA);
});

useFunnelStore.subscribe((state) => {
  saveState('customCompareB', state.customCompareB);
});
