import { create } from 'zustand';
import type { AlertRule, AlertHistoryItem, AlertContact } from '@/types';
import { INITIAL_ALERT_RULES, INITIAL_ALERT_HISTORY } from '@/services/mockData';
import { generateId } from '@/utils/helpers';

interface AlertStore {
  rules: AlertRule[];
  history: AlertHistoryItem[];

  addRule: (
    data: Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggeredAt'>
  ) => AlertRule;
  updateRule: (id: string, data: Partial<AlertRule>) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;

  markHistoryRead: (id: string) => void;
  markAllRead: () => void;
  getUnreadCount: () => number;
  getCriticalCount: () => number;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  rules: INITIAL_ALERT_RULES,
  history: INITIAL_ALERT_HISTORY,

  addRule: (data) => {
    const now = new Date().toISOString();
    const newRule: AlertRule = {
      ...data,
      id: generateId(),
      createdAt: now,
    };
    set({ rules: [newRule, ...get().rules] });
    return newRule;
  },

  updateRule: (id, data) =>
    set({
      rules: get().rules.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }),

  toggleRule: (id) =>
    set({
      rules: get().rules.map((r) =>
        r.id === id ? { ...r, isEnabled: !r.isEnabled } : r
      ),
    }),

  deleteRule: (id) => set({ rules: get().rules.filter((r) => r.id !== id) }),

  markHistoryRead: (id) =>
    set({
      history: get().history.map((h) => (h.id === id ? { ...h, isRead: true } : h)),
    }),

  markAllRead: () =>
    set({
      history: get().history.map((h) => ({ ...h, isRead: true })),
    }),

  getUnreadCount: () => get().history.filter((h) => !h.isRead).length,
  getCriticalCount: () =>
    get().history.filter((h) => !h.isRead && h.severity === 'critical').length,
}));
