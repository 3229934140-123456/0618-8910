import React, { useState } from 'react';
import type { PeriodCompare } from '@/types';
import { cn } from '@/utils/helpers';
import { formatPercent, formatFullNumber, formatTrend } from '@/utils/format';
import { GitCompare, TrendingUp, TrendingDown, Minus, ArrowRightLeft } from 'lucide-react';
import FunnelChart from './FunnelChart';
import { Tag } from '@/components/ui/Tag';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';

interface PeriodCompareViewProps {
  data: PeriodCompare | null;
  compareMode: 'none' | 'overlay' | 'sidebyside';
  onModeChange: (mode: 'none' | 'overlay' | 'sidebyside') => void;
}

const PeriodCompareView: React.FC<PeriodCompareViewProps> = ({
  data,
  compareMode,
  onModeChange,
}) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <Card padding="md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitCompare size={18} className="text-navy-600" />
            时间段对比
          </CardTitle>
          <Tabs
            tabs={[
              { id: 'none', label: '关闭对比' },
              { id: 'overlay', label: '叠加对比', icon: <ArrowRightLeft size={14} /> },
              { id: 'sidebyside', label: '并排对比', icon: <GitCompare size={14} /> },
            ]}
            active={compareMode}
            onChange={(v) => onModeChange(v as any)}
            variant="pills"
          />
        </CardHeader>

        {compareMode !== 'none' && data && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-white border border-navy-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-500">周期 A（基准）</p>
              <p className="font-display font-semibold text-navy-900 mt-0.5 text-sm">
                {data.periodA.label}
              </p>
              <p className="text-[10px] text-navy-400 tabular mt-0.5">
                {new Date(data.periodA.start).toLocaleDateString()} ~ {new Date(data.periodA.end).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-white border border-orange-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">周期 B（当前）</p>
              <p className="font-display font-semibold text-orange-700 mt-0.5 text-sm">
                {data.periodB.label}
              </p>
              <p className="text-[10px] text-orange-500 tabular mt-0.5">
                {new Date(data.periodB.start).toLocaleDateString()} ~ {new Date(data.periodB.end).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </Card>

      {compareMode !== 'none' && data && (
        <>
          <Card padding="md">
            <CardHeader>
              <CardTitle className="text-base">各步骤变化对比</CardTitle>
            </CardHeader>
            <div className="space-y-2.5 mt-1">
              {data.resultA.steps.map((stepA, idx) => {
                const stepB = data.resultB.steps[idx];
                const diff = data.diff[idx];
                if (!stepB || !diff) return null;

                const isImproved = diff.rateDiffPercent > 0;
                const isWorse = diff.rateDiffPercent < 0;
                const isNeutral = Math.abs(diff.rateDiffPercent) < 0.5;
                const significant = Math.abs(diff.rateDiffPercent) >= 3;

                return (
                  <div
                    key={stepA.stepId}
                    onMouseEnter={() => setHoveredStep(idx)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      hoveredStep === idx && 'shadow-elevation-1 -translate-y-0.5',
                      significant && isWorse ? 'border-red-200 bg-red-50/40' : '',
                      significant && isImproved ? 'border-emerald-200 bg-emerald-50/40' : '',
                      !significant ? 'border-navy-100 bg-white' : ''
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-xs font-bold text-navy-800 font-display">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-navy-900 flex-1">{stepA.stepName}</span>
                      {significant && (
                        <Tag
                          variant={isImproved ? 'success' : isWorse ? 'danger' : 'default'}
                          size="sm"
                          rounded="full"
                        >
                          {isImproved ? '提升' : isWorse ? '下降' : '持平'}
                        </Tag>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">周期 A</p>
                        <p className="font-display font-bold text-navy-700 text-xl tabular">
                          {formatFullNumber(stepA.userCount)}
                        </p>
                        {idx > 0 && (
                          <p className="text-xs text-navy-500 mt-0.5 tabular">
                            转化 {formatPercent(stepA.conversionRate, 1)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-orange-500 uppercase tracking-wider mb-1">周期 B</p>
                        <p className="font-display font-bold text-orange-700 text-xl tabular">
                          {formatFullNumber(stepB.userCount)}
                        </p>
                        {idx > 0 && (
                          <p className="text-xs text-orange-600 mt-0.5 tabular">
                            转化 {formatPercent(stepB.conversionRate, 1)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">变化</p>
                        <div
                          className={cn(
                            'flex items-center gap-1 font-display font-bold text-xl tabular',
                            isImproved ? 'text-emerald-600' : isWorse ? 'text-red-600' : 'text-navy-500'
                          )}
                        >
                          {isImproved ? (
                            <TrendingUp size={18} />
                          ) : isWorse ? (
                            <TrendingDown size={18} />
                          ) : (
                            <Minus size={18} />
                          )}
                          {formatTrend(diff.rateDiffPercent).label}
                        </div>
                        <p className="text-xs text-navy-500 mt-0.5 tabular">
                          {diff.valueDiff >= 0 ? '+' : ''}
                          {formatFullNumber(diff.valueDiff)} 人
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {compareMode === 'overlay' && (
            <Card padding="md">
              <CardHeader>
                <CardTitle className="text-base">叠加对比图</CardTitle>
              </CardHeader>
              <div className="relative">
                <div className="space-y-4">
                  {data.resultA.steps.map((stepA, idx) => {
                    const stepB = data.resultB.steps[idx];
                    if (!stepB) return null;
                    const maxCount = Math.max(stepA.userCount, stepB.userCount, 1);
                    const wA = (stepA.userCount / maxCount) * 100;
                    const wB = (stepB.userCount / maxCount) * 100;

                    return (
                      <div key={stepA.stepId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-navy-700">
                            {idx + 1}. {stepA.stepName}
                          </span>
                          <div className="flex items-center gap-4 tabular text-[11px]">
                            <span className="text-navy-600">A: {formatFullNumber(stepA.userCount)}</span>
                            <span className="text-orange-600">B: {formatFullNumber(stepB.userCount)}</span>
                          </div>
                        </div>
                        <div className="relative h-7 rounded-lg overflow-hidden bg-navy-50 border border-navy-100">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-navy-600 to-navy-500 transition-all duration-700 ease-out"
                            style={{ width: `${wA}%`, opacity: 0.9 }}
                          />
                          <div
                            className="absolute left-0 bottom-0 h-3 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700 ease-out"
                            style={{ width: `${wB}%`, opacity: 0.95 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-navy-100">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-3 rounded bg-gradient-to-r from-navy-600 to-navy-500" />
                    <span className="text-xs text-navy-600 font-medium">周期 A: {data.periodA.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-3 rounded bg-gradient-to-r from-orange-500 to-orange-400" />
                    <span className="text-xs text-orange-600 font-medium">周期 B: {data.periodB.label}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {compareMode === 'sidebyside' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card padding="md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-navy-600" />
                    周期 A：{data.periodA.label}
                  </CardTitle>
                </CardHeader>
                <FunnelChart
                  steps={data.resultA.steps}
                  totalConversionRate={data.resultA.totalConversionRate}
                  compact
                  animate={false}
                />
              </Card>
              <Card padding="md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    周期 B：{data.periodB.label}
                  </CardTitle>
                </CardHeader>
                <FunnelChart
                  steps={data.resultB.steps}
                  totalConversionRate={data.resultB.totalConversionRate}
                  compact
                  animate={false}
                />
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PeriodCompareView;
