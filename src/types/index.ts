// Type definitions for the Funnel Analytics Platform

export interface Funnel {
  id: string;
  name: string;
  description: string;
  tags: string[];
  steps: FunnelStep[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isFavorite: boolean;
  lastViewedAt?: string;
}

export interface FunnelStep {
  id: string;
  name: string;
  eventName: string;
  order: number;
  filter?: FilterCondition[];
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'gt' | 'lt' | 'contains';
  value: string | number | string[];
}

export interface FunnelResult {
  funnelId: string;
  period: { start: string; end: string };
  steps: FunnelStepResult[];
  totalConversionRate: number;
}

export interface FunnelStepResult {
  stepId: string;
  stepName: string;
  userCount: number;
  conversionRate: number;
  overallConversionRate: number;
  dropOffCount: number;
  dropOffRate: number;
}

export interface DimensionSplit {
  dimension: UserDimensionField;
  dimensionLabel: string;
  groups: {
    value: string;
    result: FunnelResult;
  }[];
}

export interface PeriodCompare {
  periodA: { start: string; end: string; label: string };
  periodB: { start: string; end: string; label: string };
  resultA: FunnelResult;
  resultB: FunnelResult;
  diff: {
    stepId: string;
    valueDiff: number;
    rateDiff: number;
    rateDiffPercent: number;
  }[];
}

export type UserDimensionField = 'channel' | 'city' | 'device' | 'registerDate' | 'userLevel';

export interface UserDimensionOption {
  field: UserDimensionField;
  label: string;
  values: { value: string; label: string }[];
}

export interface ChurnedUser {
  userId: string;
  userProperties: {
    channel: string;
    city: string;
    registerDate: string;
    device: string;
    userLevel: string;
  };
  lastStepId: string;
  lastStepIndex: number;
  churnedAt: string;
  behaviorPath: BehaviorEvent[];
}

export interface BehaviorEvent {
  id: string;
  eventName: string;
  eventLabel: string;
  timestamp: string;
  category: 'page' | 'click' | 'form' | 'transaction' | 'search' | 'other';
  properties?: Record<string, string | number | boolean>;
}

export interface EventCatalogItem {
  eventName: string;
  eventLabel: string;
  category: string;
  description: string;
}

export interface Report {
  id: string;
  title: string;
  summary: string;
  funnelId?: string;
  contentBlocks: ReportBlock[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  shareToken?: string;
  isShared: boolean;
}

export type ReportBlock =
  | { id: string; type: 'heading'; level: 1 | 2 | 3; content: string }
  | { id: string; type: 'paragraph'; content: string }
  | { id: string; type: 'funnel-chart'; funnelId: string; config?: FunnelChartConfig }
  | { id: string; type: 'metric-grid'; metrics: ReportMetric[] };

export interface FunnelChartConfig {
  period?: { start: string; end: string };
  splitDimension?: UserDimensionField;
  title?: string;
}

export interface ReportMetric {
  label: string;
  value: number;
  format: 'number' | 'percent' | 'currency';
  trend?: number;
}

export interface AlertRule {
  id: string;
  funnelId: string;
  funnelName: string;
  stepId: string;
  stepName: string;
  name: string;
  thresholdType: 'absolute' | 'relative';
  threshold: number;
  checkInterval: 'daily' | 'hourly';
  contacts: AlertContact[];
  isEnabled: boolean;
  lastTriggeredAt?: string;
  coolDownMinutes: number;
  createdAt: string;
}

export interface AlertContact {
  name: string;
  email: string;
}

export interface AlertHistoryItem {
  id: string;
  ruleId: string;
  ruleName: string;
  funnelName: string;
  stepName: string;
  triggeredAt: string;
  actualValue: number;
  previousValue: number;
  threshold: number;
  thresholdType: 'absolute' | 'relative';
  message: string;
  isRead: boolean;
  severity: 'warning' | 'critical';
  notifiedEmails?: string[];
}

export interface DashboardOverview {
  activeUsers: number;
  activeUsersTrend: number;
  totalConversions: number;
  totalConversionsTrend: number;
  avgConversionRate: number;
  avgConversionRateTrend: number;
  activeAlerts: number;
}

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth';
