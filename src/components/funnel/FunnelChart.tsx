import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { FunnelStepResult } from '@/types';
import { cn } from '@/utils/helpers';
import { formatFullNumber, formatPercent } from '@/utils/format';
import { ArrowRight, Users, TrendingDown } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';

export interface FunnelChartProps {
  steps: FunnelStepResult[];
  totalConversionRate: number;
  onStepClick?: (stepIndex: number, step: FunnelStepResult) => void;
  highlightStep?: number;
  compact?: boolean;
  showLabels?: boolean;
  showTooltips?: boolean;
  animate?: boolean;
  className?: string;
}

const STEP_COLORS = [
  { from: '#1e3a5f', to: '#507eac' },
  { from: '#234a74', to: '#507eac' },
  { from: '#2f5e8f', to: '#84a6c9' },
  { from: '#507eac', to: '#b3c7df' },
  { from: '#84a6c9', to: '#d9e3ef' },
  { from: '#c72e08', to: '#ff7a45' },
  { from: '#ff5a1c', to: '#ffa374' },
  { from: '#ff7a45', to: '#ffc8a8' },
];

const FunnelChart: React.FC<FunnelChartProps> = ({
  steps,
  totalConversionRate,
  onStepClick,
  highlightStep,
  compact = false,
  showLabels = true,
  showTooltips = true,
  animate = true,
  className,
}) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const maxCount = useMemo(() => Math.max(...steps.map((s) => s.userCount), 1), [steps]);

  if (steps.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-16 text-navy-400', className)}>
        <div className="text-center">
          <Users size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">暂无漏斗数据</p>
        </div>
      </div>
    );
  }

  const width = 100;
  const stepHeight = compact ? 50 : 68;
  const gap = compact ? 12 : 20;
  const totalHeight = steps.length * stepHeight + (steps.length - 1) * gap;
  const maxWidth = 92;
  const minWidth = 28;

  const getStepWidth = (userCount: number) => {
    const ratio = userCount / maxCount;
    return minWidth + (maxWidth - minWidth) * ratio;
  };

  return (
    <div className={cn('w-full', className)}>
      <svg
        viewBox={`0 0 ${width * 10} ${totalHeight * 10}`}
        className="w-full h-auto"
        style={{ maxHeight: compact ? '320px' : '540px' }}
      >
        <defs>
          {steps.map((_, idx) => {
            const color = STEP_COLORS[idx % STEP_COLORS.length];
            return (
              <linearGradient
                key={`grad-${idx}`}
                id={`funnelGrad${idx}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={color.from} stopOpacity="0.95" />
                <stop offset="100%" stopColor={color.to} stopOpacity="0.9" />
              </linearGradient>
            );
          })}
          {steps.map((_, idx) => {
            const color = STEP_COLORS[idx % STEP_COLORS.length];
            return (
              <linearGradient
                key={`grad-border-${idx}`}
                id={`funnelBorderGrad${idx}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={color.from} />
                <stop offset="100%" stopColor={color.to} />
              </linearGradient>
            );
          })}
          <filter id="funnelShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="4"
              floodColor="#1e3a5f"
              floodOpacity="0.12"
            />
          </filter>
        </defs>

        {steps.map((step, idx) => {
          const currentWidth = getStepWidth(step.userCount);
          const nextWidth =
            idx < steps.length - 1 ? getStepWidth(steps[idx + 1].userCount) : currentWidth * 0.7;

          const y = idx * (stepHeight + gap);
          const cx = 50 * 10;
          const halfCur = (currentWidth / 2) * 10;
          const halfNext = (nextWidth / 2) * 10;
          const stepH = stepHeight * 10;

          const path = `
            M ${cx - halfCur} ${y * 10}
            L ${cx + halfCur} ${y * 10}
            L ${cx + halfNext} ${(y + stepHeight) * 10}
            L ${cx - halfNext} ${(y + stepHeight) * 10}
            Z
          `;

          const isHovered = hoveredStep === idx;
          const isHighlighted = highlightStep !== undefined && highlightStep === idx;
          const isDimmed = hoveredStep !== null && !isHovered;

          const displayConversion =
            idx === 0 ? 100 : step.conversionRate * 100;
          const displayDrop = idx === 0 ? 0 : step.dropOffRate * 100;

          return (
            <g
              key={step.stepId}
              style={{ cursor: onStepClick ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoveredStep(idx)}
              onMouseLeave={() => setHoveredStep(null)}
              onClick={() => onStepClick && onStepClick(idx, step)}
            >
              <motion.path
                d={path}
                fill={`url(#funnelGrad${idx % STEP_COLORS.length})`}
                stroke={isHighlighted ? '#ff7a45' : `url(#funnelBorderGrad${idx % STEP_COLORS.length})`}
                strokeWidth={isHighlighted ? 3 : 1}
                filter="url(#funnelShadow)"
                rx={16}
                initial={animate ? { pathLength: 0, opacity: 0 } : false}
                animate={{
                  pathLength: 1,
                  opacity: isDimmed ? 0.45 : 1,
                  scale: isHovered ? 1.015 : 1,
                }}
                style={{
                  transformOrigin: `${cx}px ${(y + stepHeight / 2) * 10}px`,
                  transformBox: 'fill-box',
                }}
                transition={{
                  duration: 0.5,
                  delay: animate ? idx * 0.12 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              {showLabels && (
                <g>
                  <text
                    x={cx}
                    y={(y + stepHeight * 0.38) * 10}
                    textAnchor="middle"
                    className="select-none"
                    fill="white"
                    fontSize={compact ? 18 : 22}
                    fontWeight={700}
                    fontFamily="Outfit, sans-serif"
                    style={{ opacity: isDimmed ? 0.7 : 1 }}
                  >
                    {formatFullNumber(step.userCount)}
                  </text>
                  <text
                    x={cx}
                    y={(y + stepHeight * 0.75) * 10}
                    textAnchor="middle"
                    className="select-none"
                    fill="rgba(255,255,255,0.9)"
                    fontSize={compact ? 12 : 14}
                    fontWeight={500}
                    style={{ opacity: isDimmed ? 0.6 : 1 }}
                  >
                    {step.stepName}
                  </text>
                </g>
              )}

              {!compact && idx < steps.length - 1 && (
                <g>
                  <line
                    x1={cx}
                    y1={(y + stepHeight + 2) * 10}
                    x2={cx}
                    y2={(y + stepHeight + gap - 4) * 10}
                    stroke={isHovered ? '#ff7a45' : '#cbd5e1'}
                    strokeWidth={1.5}
                    strokeDasharray={isHovered ? 'none' : '3 3'}
                  />
                  <circle
                    cx={cx}
                    cy={(y + stepHeight + gap / 2) * 10}
                    r={18}
                    fill="white"
                    stroke={isHovered ? '#ff7a45' : '#e2e8f0'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={cx}
                    y={(y + stepHeight + gap / 2 + 2) * 10}
                    textAnchor="middle"
                    fill={displayConversion >= 50 ? '#059669' : displayConversion >= 30 ? '#d97706' : '#dc2626'}
                    fontSize={13}
                    fontWeight={700}
                    fontFamily="Outfit, sans-serif"
                  >
                    {displayConversion.toFixed(1)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100/60 border border-navy-100">
          <div className="flex items-center gap-2 text-xs font-medium text-navy-500 mb-1.5">
            <Users size={13} /> 第一步用户数
          </div>
          <p className="font-display font-bold text-2xl text-navy-900 tabular">
            {steps[0] ? formatFullNumber(steps[0].userCount) : '0'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/40 border border-orange-100">
          <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-1.5">
            <TrendingDown size={13} /> 流失用户数
          </div>
          <p className="font-display font-bold text-2xl text-orange-700 tabular">
            {steps[0] && steps[steps.length - 1]
              ? formatFullNumber(steps[0].userCount - steps[steps.length - 1].userCount)
              : '0'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/40 border border-emerald-100">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 mb-1.5">
            <ArrowRight size={13} /> 全链路转化率
          </div>
          <p className="font-display font-bold text-2xl text-emerald-700 tabular">
            {formatPercent(totalConversionRate, 2)}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-navy-500 text-xs uppercase tracking-wider font-semibold">
                <th className="text-left py-3 px-3">步骤</th>
                <th className="text-right py-3 px-3">用户数</th>
                <th className="text-right py-3 px-3">上一步转化</th>
                <th className="text-right py-3 px-3">总体转化</th>
                <th className="text-right py-3 px-3">流失</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, idx) => {
                const conv = step.conversionRate * 100;
                const overall = step.overallConversionRate * 100;
                const drop = step.dropOffRate * 100;
                return (
                  <tr
                    key={step.stepId}
                    className={cn(
                      'border-b border-navy-50 hover:bg-navy-50/40 transition-colors',
                      highlightStep === idx ? 'bg-orange-50/50' : ''
                    )}
                    onClick={() => onStepClick && onStepClick(idx, step)}
                    style={{ cursor: onStepClick ? 'pointer' : 'default' }}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${STEP_COLORS[idx % STEP_COLORS.length].from}, ${STEP_COLORS[idx % STEP_COLORS.length].to})`,
                          }}
                        />
                        <span className="font-medium text-navy-800">
                          {idx + 1}. {step.stepName}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3 font-display font-semibold text-navy-900 tabular">
                      {formatFullNumber(step.userCount)}
                    </td>
                    <td className="text-right py-3 px-3">
                      {idx === 0 ? (
                        <Tag variant="default" size="sm">-</Tag>
                      ) : (
                        <Tag
                          variant={conv >= 50 ? 'success' : conv >= 30 ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {conv.toFixed(1)}%
                        </Tag>
                      )}
                    </td>
                    <td className="text-right py-3 px-3 text-navy-700 font-medium tabular">
                      {overall.toFixed(2)}%
                    </td>
                    <td className="text-right py-3 px-3">
                      {idx === 0 ? (
                        <span className="text-navy-300">-</span>
                      ) : (
                        <span className="text-danger-600 font-medium tabular">
                          -{formatFullNumber(step.dropOffCount)} ({drop.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FunnelChart;
