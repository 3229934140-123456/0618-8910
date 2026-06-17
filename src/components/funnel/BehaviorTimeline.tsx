import React, { useState } from 'react';
import type { ChurnedUser, BehaviorEvent } from '@/types';
import { CHANNELS, CITIES, DEVICES, USER_LEVELS } from '@/services/mockData';
import { cn } from '@/utils/helpers';
import { formatDateTime, formatTimeOnly } from '@/utils/date';
import { formatShortId } from '@/utils/format';
import {
  Clock,
  MousePointer2,
  FileText,
  CreditCard,
  Search,
  LayoutGrid,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  User,
  MapPin,
  Monitor,
  Tag,
  CalendarDays,
  Activity,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Tag as Badge } from '@/components/ui/Tag';

interface BehaviorTimelineProps {
  users: ChurnedUser[];
  funnelStepNames: { id: string; name: string; index: number }[];
}

const EVENT_ICONS: Record<BehaviorEvent['category'], any> = {
  page: FileText,
  click: MousePointer2,
  transaction: CreditCard,
  search: Search,
  form: SettingsIcon,
  other: Activity,
};

const EVENT_COLORS: Record<BehaviorEvent['category'], string> = {
  page: 'bg-sky-100 text-sky-600 border-sky-200',
  click: 'bg-violet-100 text-violet-600 border-violet-200',
  transaction: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  search: 'bg-amber-100 text-amber-600 border-amber-200',
  form: 'bg-navy-100 text-navy-600 border-navy-200',
  other: 'bg-slate-100 text-slate-600 border-slate-200',
};

const BehaviorTimeline: React.FC<BehaviorTimelineProps> = ({ users, funnelStepNames }) => {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleUser = (uid: string) => {
    const next = new Set(expandedUsers);
    if (next.has(uid)) next.delete(uid);
    else next.add(uid);
    setExpandedUsers(next);
  };

  const getStepLabel = (stepId: string, stepIndex: number) => {
    const found = funnelStepNames.find((f) => f.id === stepId);
    if (found) return found;
    return { id: stepId, name: `步骤 ${stepIndex + 1}`, index: stepIndex };
  };

  const lastStepEvents = users.flatMap((u) => {
    const path = u.behaviorPath;
    return path.length > 0 ? [path[path.length - 1]] : [];
  });

  const eventCounts = lastStepEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.eventLabel] = (acc[e.eventLabel] || 0) + 1;
    return acc;
  }, {});

  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const getPropLabel = (type: string, value: string) => {
    const map: Record<string, { value: string; label: string }[]> = {
      channel: CHANNELS,
      city: CITIES,
      device: DEVICES,
      userLevel: USER_LEVELS,
    };
    return map[type]?.find((x) => x.value === value)?.label || value;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4">
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User size={18} className="text-navy-600" />
              流失用户列表
              <Badge variant="orange" size="sm">
                {users.length} 人
              </Badge>
            </CardTitle>
            <p className="text-xs text-navy-500">点击用户卡片展开查看流失前的行为路径</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {users.map((u, idx) => {
                const stepInfo = getStepLabel(u.lastStepId, u.lastStepIndex);
                const isExpanded = expandedUsers.has(u.userId);
                const path = u.behaviorPath;

                return (
                  <div
                    key={u.userId}
                    className={cn(
                      'rounded-2xl border overflow-hidden transition-all duration-300',
                      isExpanded ? 'border-navy-200 shadow-elevation-1' : 'border-navy-100 hover:border-navy-200'
                    )}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <button
                      onClick={() => toggleUser(u.userId)}
                      className="w-full p-4 bg-white hover:bg-navy-50/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.userId.slice(-2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-navy-900 tabular">
                              {u.userId}
                            </span>
                            <Badge variant="danger" size="sm">
                              流失于：{stepInfo.name}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            <span className="text-[11px] text-navy-500 flex items-center gap-1 tabular">
                              <CalendarDays size={11} />
                              {formatDateTime(u.churnedAt)}
                            </span>
                            <span className="text-[11px] text-navy-500 flex items-center gap-1">
                              <MapPin size={11} />
                              {getPropLabel('city', u.userProperties.city)}
                            </span>
                            <span className="text-[11px] text-navy-500 flex items-center gap-1">
                              <Monitor size={11} />
                              {getPropLabel('device', u.userProperties.device)}
                            </span>
                            <span className="text-[11px] text-navy-500 flex items-center gap-1">
                              <Tag size={11} />
                              {getPropLabel('channel', u.userProperties.channel)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="violet" size="sm">
                            {path.length} 步行为
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-navy-400" />
                          ) : (
                            <ChevronRight size={16} className="text-navy-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-navy-100 bg-gradient-to-br from-navy-50/40 to-white p-5">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                            <Activity size={15} />
                            流失前行为路径（共 {path.length} 步）
                          </p>
                          <Badge variant="danger" size="sm">
                            最后操作时间：{formatTimeOnly(path[path.length - 1]?.timestamp || u.churnedAt)}
                          </Badge>
                        </div>

                        <div className="relative pl-4">
                          <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-navy-200 via-navy-200 to-red-200" />
                          {path.map((event, ei) => {
                            const Icon = EVENT_ICONS[event.category] || Activity;
                            const colorCls = EVENT_COLORS[event.category] || EVENT_COLORS.other;
                            const isLast = ei === path.length - 1;

                            return (
                              <div key={event.id} className="relative mb-3 last:mb-0">
                                <div
                                  className={cn(
                                    'absolute -left-4 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                    isLast
                                      ? 'bg-red-50 border-red-400 animate-pulse-slow'
                                      : 'bg-white border-navy-200'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-3 h-3 rounded-full flex items-center justify-center',
                                      isLast ? 'bg-red-500' : colorCls.split(' ')[0],
                                      isLast ? '' : '!bg-transparent'
                                    )}
                                  >
                                    <Icon
                                      size={8}
                                      className={cn(
                                        '!w-2.5 !h-2.5 flex-shrink-0',
                                        isLast ? 'text-white' : colorCls.split(' ')[1]
                                      )}
                                    />
                                  </div>
                                </div>
                                <div
                                  className={cn(
                                    'ml-4 p-3 rounded-xl border transition-all hover:shadow-sm',
                                    isLast
                                      ? 'bg-red-50/60 border-red-200'
                                      : 'bg-white border-navy-100'
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p
                                          className={cn(
                                            'text-sm font-medium',
                                            isLast ? 'text-red-700' : 'text-navy-800'
                                          )}
                                        >
                                          {event.eventLabel}
                                        </p>
                                        {isLast && (
                                          <Badge variant="danger" size="sm" rounded="full">
                                            流失点
                                          </Badge>
                                        )}
                                        <Badge
                                          variant={
                                            event.category === 'transaction'
                                              ? 'success'
                                              : event.category === 'search'
                                              ? 'warning'
                                              : 'default'
                                          }
                                          size="sm"
                                          rounded="full"
                                        >
                                          {
                                            {
                                              page: '页面',
                                              click: '点击',
                                              transaction: '交易',
                                              search: '搜索',
                                              form: '表单',
                                              other: '其他',
                                            }[event.category]
                                          }
                                        </Badge>
                                      </div>
                                      {event.properties && Object.keys(event.properties).length > 0 && (
                                        <p className="mt-1.5 text-xs text-navy-500 break-all">
                                          {Object.entries(event.properties)
                                            .map(([k, v]) => `${k}: ${v}`)
                                            .join(' · ')}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-navy-400 tabular whitespace-nowrap pt-0.5">
                                      {formatTimeOnly(event.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={18} className="text-navy-600" />
              流失前高频操作 TOP 10
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2.5">
              {topEvents.map(([label, count], i) => {
                const maxCount = Math.max(...topEvents.map(([, c]) => c), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tabular text-navy-400 w-5">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-navy-800">{label}</span>
                      </div>
                      <span className="text-xs font-semibold tabular text-navy-600">{count} 次</span>
                    </div>
                    <div className="h-2 rounded-full bg-navy-50 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700 ease-out',
                          i === 0
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : i < 3
                            ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                            : 'bg-gradient-to-r from-navy-400 to-navy-300'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {topEvents.length === 0 && (
                <div className="py-8 text-center text-navy-400 text-sm">
                  暂无统计数据
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle size={18} className="text-navy-600" />
              流失用户画像
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                渠道分布
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CHANNELS.map((c) => {
                  const cnt = users.filter((u) => u.userProperties.channel === c.value).length;
                  const pct = (cnt / Math.max(users.length, 1)) * 100;
                  if (cnt === 0) return null;
                  return (
                    <Badge key={c.value} variant="primary" size="sm">
                      {c.label}: {pct.toFixed(0)}%
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                设备分布
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DEVICES.map((c) => {
                  const cnt = users.filter((u) => u.userProperties.device === c.value).length;
                  const pct = (cnt / Math.max(users.length, 1)) * 100;
                  if (cnt === 0) return null;
                  return (
                    <Badge key={c.value} variant="violet" size="sm">
                      {c.label}: {pct.toFixed(0)}%
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                城市 Top 5
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CITIES.slice(0, 5).map((c) => {
                  const cnt = users.filter((u) => u.userProperties.city === c.value).length;
                  const pct = (cnt / Math.max(users.length, 1)) * 100;
                  if (cnt === 0) return null;
                  return (
                    <Badge key={c.value} variant="warning" size="sm">
                      {c.label}: {pct.toFixed(0)}%
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default BehaviorTimeline;
