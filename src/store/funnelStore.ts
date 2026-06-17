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
  customComparePeriod: { start: string; end: string; label: string } | null;

  setSelectedFunnel: (id: string) => void;
  setDatePreset: (preset: DateRangePreset) => void;
  setCustomDateRange: (range: { start: string; end: string } | null) => void;
  setSelectedDimension: (dim: UserDimensionField | null) => void;
  setCompareMode: (mode: 'none' | 'overlay' | 'sidebyside') => void;
  setCustomComparePeriod: (period: { start: string; end: string; label: string } | null) => void;
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
  datePreset: 'last7days',
  customDateRange: null,
  selectedDimension: null,
  compareMode: 'none',
  compareDateRange: null,
  customComparePeriod: null,

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

  setCustomComparePeriod: (period) => set({ customComparePeriod: period }),

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
    const { compareMode, compareDateRange, customComparePeriod } = get();
    if (compareMode === 'none') return null;
    const comparePeriod = customComparePeriod || compareDateRange;
    if (!comparePeriod) return null;
    const funnel = get().getFunnel(funnelId);
    const range = get().getDateRange();
    if (!funnel) return null;
    return calculatePeriodCompare(
      funnel,
      { start: comparePeriod.start, end: comparePeriod.end, label: comparePeriod.label },
      { start: range.start, end: range.end, label: range.label }
    );
  },
}));

useFunnelStore.subscribe((state) => {
  saveState('funnels', state.funnels);
});
