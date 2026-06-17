import { create } from 'zustand';
import type { Report } from '@/types';
import { INITIAL_REPORTS } from '@/services/mockData';
import { generateId } from '@/utils/helpers';
import { loadState, saveState } from '@/services/localStorage';

interface ReportStore {
  reports: Report[];
  addReport: (data: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'shareToken'>) => Report;
  updateReport: (id: string, data: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  toggleShare: (id: string) => void;
  getReport: (id: string) => Report | undefined;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: loadState<Report[]>('reports', INITIAL_REPORTS),

  addReport: (data) => {
    const now = new Date().toISOString();
    const newReport: Report = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      createdBy: '当前用户',
      isShared: data.isShared ?? false,
      shareToken: data.isShared ? generateId() : undefined,
    };
    set({ reports: [newReport, ...get().reports] });
    return newReport;
  },

  updateReport: (id, data) =>
    set({
      reports: get().reports.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      ),
    }),

  deleteReport: (id) => set({ reports: get().reports.filter((r) => r.id !== id) }),

  toggleShare: (id) =>
    set({
      reports: get().reports.map((r) => {
        if (r.id !== id) return r;
        const willShare = !r.isShared;
        return {
          ...r,
          isShared: willShare,
          shareToken: willShare ? r.shareToken || generateId() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }),
    }),

  getReport: (id) => get().reports.find((r) => r.id === id),
}));

useReportStore.subscribe((state) => {
  saveState('reports', state.reports);
});
