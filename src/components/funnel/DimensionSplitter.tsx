import React from 'react';
import type { DimensionSplit, UserDimensionField } from '@/types';
import { DIMENSION_OPTIONS, CHANNELS, CITIES, DEVICES, USER_LEVELS, REGISTER_DATE_GROUPS } from '@/services/mockData';
import { cn } from '@/utils/helpers';
import { formatPercent, formatFullNumber } from '@/utils/format';
import { Layers, Users } from 'lucide-react';
import FunnelChart from './FunnelChart';
import { Tag } from '@/components/ui/Tag';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface DimensionSplitterProps {
  dimension: UserDimensionField | null;
  onDimensionChange: (dim: UserDimensionField | null) => void;
  split: DimensionSplit | null;
}

const DimensionSplitter: React.FC<DimensionSplitterProps> = ({
  dimension,
  onDimensionChange,
  split,
}) => {
  const dimensionValueMap: Record<UserDimensionField, { value: string; label: string }[]> = {
    channel: CHANNELS,
    city: CITIES,
    device: DEVICES,
    userLevel: USER_LEVELS,
    registerDate: REGISTER_DATE_GROUPS,
  };

  return (
    <div className="space-y-4">
      <Card padding="md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers size={18} className="text-navy-600" />
            按用户属性拆分
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onDimensionChange(null)}
            className={cn(
              'px-4 h-9 rounded-xl text-sm font-medium transition-all',
              dimension === null
                ? 'bg-navy-700 text-white shadow-elevation-1'
                : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
            )}
          >
            不拆分
          </button>
          {DIMENSION_OPTIONS.map((opt) => (
            <button
              key={opt.field}
              onClick={() => onDimensionChange(opt.field)}
              className={cn(
                'px-4 h-9 rounded-xl text-sm font-medium transition-all',
                dimension === opt.field
                  ? 'bg-navy-700 text-white shadow-elevation-1'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {split && (
        <div>
          <Card padding="md">
            <CardHeader>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {split.dimensionLabel} 分组对比
                  <Tag variant="orange" size="sm">
                    {split.groups.length} 组
                  </Tag>
                </CardTitle>
                <p className="text-xs text-navy-500 mt-1">
                  按照{split.dimensionLabel}维度拆分，对比不同分组的转化差异
                </p>
              </div>
            </CardHeader>

            <div className="mt-2 space-y-3">
              {split.groups
                .sort((a, b) => b.result.totalConversionRate - a.result.totalConversionRate)
                .map((group, idx) => {
                  const label =
                    dimensionValueMap[split.dimension]?.find((d) => d.value === group.value)?.label ||
                    group.value;
                  const best = split.groups.reduce(
                    (max, g) => Math.max(max, g.result.totalConversionRate),
                    0
                  );
                  const isBest = group.result.totalConversionRate === best;
                  const firstCount = group.result.steps[0]?.userCount || 0;

                  return (
                    <div
                      key={group.value}
                      className={cn(
                        'p-4 rounded-2xl border transition-all',
                        isBest
                          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white'
                          : 'border-navy-100 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              'w-3 h-3 rounded-full',
                              idx === 0 && 'bg-emerald-500',
                              idx === 1 && 'bg-navy-500',
                              idx === 2 && 'bg-orange-500',
                              idx === 3 && 'bg-violet-500',
                              idx === 4 && 'bg-sky-500',
                              idx >= 5 && 'bg-amber-500'
                            )}
                          />
                          <span className="font-semibold text-navy-900">{label}</span>
                          {isBest && <Tag variant="success">表现最优</Tag>}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-navy-500 tabular">
                            <Users size={13} />
                            {formatFullNumber(firstCount)}
                          </span>
                          <span className="font-display font-bold text-navy-900 tabular">
                            全转化 {formatPercent(group.result.totalConversionRate, 1)}
                          </span>
                        </div>
                      </div>

                      <div className="relative h-14 flex items-end gap-1 px-1">
                        {group.result.steps.map((step, si) => {
                          const maxCount = Math.max(...group.result.steps.map((s) => s.userCount), 1);
                          const h = 20 + (step.userCount / maxCount) * 64;
                          return (
                            <div
                              key={step.stepId}
                              className="flex-1 rounded-t-lg transition-all duration-500 relative group/bar"
                              style={{
                                height: `${h}%`,
                                background: `linear-gradient(180deg, ${['#10b981', '#0284c7', '#6366f1', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#eab308'][si % 8]} 0%, ${['#34d399', '#38bdf8', '#818cf8', '#fb923c', '#f87171', '#a78bfa', '#22d3ee', '#facc15'][si % 8]} 100%)`,
                              }}
                              title={`${step.stepName}: ${formatFullNumber(step.userCount)}`}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-navy-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                                {step.stepName}: {formatPercent(step.conversionRate, 0)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-1 px-1 mt-1.5">
                        {group.result.steps.map((step, si) => (
                          <div
                            key={step.stepId}
                            className="flex-1 text-[10px] text-navy-500 text-center truncate tabular font-medium"
                          >
                            {si === 0 ? '100%' : formatPercent(step.conversionRate, 0)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {split.groups.length > 0 && (
            <Card padding="md" className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">迷你漏斗详情</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {split.groups.slice(0, 4).map((group) => {
                  const label =
                    dimensionValueMap[split.dimension]?.find((d) => d.value === group.value)?.label ||
                    group.value;
                  return (
                    <div
                      key={group.value}
                      className="p-4 rounded-xl bg-gradient-to-br from-navy-50/60 to-white border border-navy-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-navy-800 text-sm">{label}</span>
                        <Tag variant="primary" size="sm">
                          {formatPercent(group.result.totalConversionRate, 1)}
                        </Tag>
                      </div>
                      <FunnelChart
                        steps={group.result.steps}
                        totalConversionRate={group.result.totalConversionRate}
                        compact
                        animate={false}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DimensionSplitter;
