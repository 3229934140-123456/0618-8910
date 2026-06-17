import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReportStore, useFunnelStore } from '@/store';
import FunnelChart from '@/components/funnel/FunnelChart';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import {
  ArrowLeft,
  Share2,
  Download,
  Edit,
  FileText,
  Printer,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  Eye,
} from 'lucide-react';
import { formatPercent, formatFullNumber, formatTrend } from '@/utils/format';
import { formatDateTime } from '@/utils/date';
import { cn, generateId } from '@/utils/helpers';
import { motion } from 'framer-motion';
import type { ReportBlock } from '@/types';

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getReport, updateReport } = useReportStore();
  const { getFunnel, getFunnelResult } = useFunnelStore();
  const [editMode, setEditMode] = useState(false);

  const report = useMemo(() => (id ? getReport(id) : undefined), [id, getReport]);

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <FileText size={56} className="mx-auto text-navy-200 mb-4" />
        <p className="font-display font-semibold text-xl text-navy-700 mb-1">报告不存在</p>
        <Link to="/reports" className="text-sm text-navy-500 hover:text-navy-700">
          返回报告列表
        </Link>
      </div>
    );
  }

  const addBlock = (type: ReportBlock['type']) => {
    let block: ReportBlock;
    switch (type) {
      case 'heading':
        block = { id: generateId(), type: 'heading', level: 2, content: '新章节标题' };
        break;
      case 'paragraph':
        block = { id: generateId(), type: 'paragraph', content: '在此输入分析内容...' };
        break;
      case 'funnel-chart':
        block = { id: generateId(), type: 'funnel-chart', funnelId: report.funnelId || useFunnelStore.getState().funnels[0]?.id || '' };
        break;
      case 'metric-grid':
        block = {
          id: generateId(),
          type: 'metric-grid',
          metrics: [
            { label: '指标1', value: 0, format: 'number' },
            { label: '指标2', value: 0, format: 'number' },
            { label: '指标3', value: 0, format: 'percent' },
            { label: '指标4', value: 0, format: 'percent' },
          ],
        };
        break;
      default:
        return;
    }
    updateReport(report.id, { contentBlocks: [...report.contentBlocks, block] });
  };

  const updateBlock = (blockId: string, patch: Partial<ReportBlock>) => {
    updateReport(report.id, {
      contentBlocks: report.contentBlocks.map((b) =>
        b.id === blockId ? ({ ...b, ...patch } as ReportBlock) : b
      ),
    });
  };

  const renderBlock = (block: ReportBlock, idx: number) => {
    switch (block.type) {
      case 'heading':
        const headingSizes: Record<number, string> = {
          1: 'font-display font-bold text-3xl text-navy-900 mb-4',
          2: 'font-display font-semibold text-2xl text-navy-900 mt-6 mb-3 pb-2 border-b border-navy-100',
          3: 'font-display font-semibold text-xl text-navy-800 mt-5 mb-2.5',
        };
        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
          >
            {editMode ? (
              <input
                type="text"
                value={'content' in block ? block.content : ''}
                onChange={(e) => updateBlock(block.id, { content: e.target.value } as any)}
                className={cn('w-full bg-white border border-navy-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-200', headingSizes[block.level])}
              />
            ) : (
              <h2 className={headingSizes[block.level]}>{'content' in block ? block.content : ''}</h2>
            )}
          </motion.div>
        );

      case 'paragraph':
        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
            className="mb-4"
          >
            {editMode ? (
              <textarea
                value={'content' in block ? block.content : ''}
                onChange={(e) => updateBlock(block.id, { content: e.target.value } as any)}
                rows={3}
                className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-sm text-navy-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-navy-200 resize-none"
              />
            ) : (
              <p className="text-sm text-navy-700 leading-relaxed">
                {'content' in block ? block.content : ''}
              </p>
            )}
          </motion.div>
        );

      case 'metric-grid':
        const metrics = 'metrics' in block ? block.metrics : [];
        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.03 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          >
            {metrics.map((m, mi) => {
              const trend = m.trend !== undefined ? formatTrend(m.trend) : null;
              return (
                <div
                  key={mi}
                  className="p-4 rounded-2xl bg-gradient-to-br from-navy-50/60 to-white border border-navy-100"
                >
                  <p className="text-xs text-navy-500 font-medium">{m.label}</p>
                  <p className="mt-1.5 font-display font-bold text-2xl text-navy-900 tabular">
                    {m.format === 'percent'
                      ? formatPercent(m.value, 1)
                      : m.format === 'currency'
                      ? '¥' + formatFullNumber(m.value)
                      : formatFullNumber(m.value)}
                  </p>
                  {trend && (
                    <div
                      className={cn(
                        'mt-1.5 inline-flex items-center gap-1 text-xs font-bold tabular px-2 py-0.5 rounded-md',
                        trend.neutral
                          ? 'bg-navy-100 text-navy-600'
                          : trend.positive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      )}
                    >
                      {trend.neutral ? (
                        '—'
                      ) : trend.positive ? (
                        <TrendingUp size={11} />
                      ) : (
                        <TrendingDown size={11} />
                      )}
                      {trend.label}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        );

      case 'funnel-chart':
        const fid = 'funnelId' in block ? block.funnelId : '';
        const funnel = fid ? getFunnel(fid) : null;
        const result = fid ? getFunnelResult(fid) : null;
        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.03 }}
            className="mb-6"
          >
            <Card padding="md" className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye size={16} className="text-navy-500" />
                  {funnel?.name || '漏斗分析图'}
                </CardTitle>
                {result && (
                  <Tag variant="success" size="sm">
                    转化 {formatPercent(result.totalConversionRate, 2)}
                  </Tag>
                )}
              </CardHeader>
              <CardBody>
                {result ? (
                  <FunnelChart
                    steps={result.steps}
                    totalConversionRate={result.totalConversionRate}
                    compact
                    animate={false}
                  />
                ) : (
                  <div className="py-10 text-center text-navy-400 text-sm">漏斗不存在</div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"
      >
        <div>
          <Link
            to="/reports"
            className="flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-700 transition-colors mb-2"
          >
            <ArrowLeft size={12} />
            返回报告列表
          </Link>
          {editMode ? (
            <input
              type="text"
              value={report.title}
              onChange={(e) => updateReport(report.id, { title: e.target.value })}
              className="w-full h-12 px-4 text-2xl font-display font-bold text-navy-900 bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200"
            />
          ) : (
            <h2 className="font-display font-bold text-3xl text-navy-900 tracking-tight">
              {report.title}
            </h2>
          )}
          {editMode ? (
            <textarea
              value={report.summary}
              onChange={(e) => updateReport(report.id, { summary: e.target.value })}
              rows={2}
              className="w-full mt-2 px-4 py-2 text-sm text-navy-500 bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 resize-none"
            />
          ) : (
            <p className="mt-1.5 text-navy-500 max-w-3xl">{report.summary}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-navy-400">
            <span className="flex items-center gap-1">
              <User size={11} /> {report.createdBy}
            </span>
            <span className="flex items-center gap-1 tabular">
              <Clock size={11} /> {formatDateTime(report.updatedAt)}
            </span>
            {report.isShared && <Tag variant="success" size="sm">已分享</Tag>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {editMode ? (
            <Button variant="success" onClick={() => setEditMode(false)}>
              完成编辑
            </Button>
          ) : (
            <Button variant="outline" leftIcon={<Edit size={15} />} onClick={() => setEditMode(true)}>
              编辑内容
            </Button>
          )}
          <Button variant="outline" leftIcon={<Share2 size={15} />}>
            分享
          </Button>
          <Button variant="outline" leftIcon={<Printer size={15} />}>
            打印
          </Button>
          <Button leftIcon={<Download size={15} />}>
            导出 PDF
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Card padding="lg" className="overflow-hidden">
          <div className="max-w-3xl mx-auto py-2">
            {report.contentBlocks.map((block, i) => renderBlock(block, i))}

            {editMode && (
              <div className="mt-8 p-4 rounded-2xl border-2 border-dashed border-navy-200 bg-navy-50/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-3 text-center">
                  添加内容块
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('heading')}
                  >
                    章节标题
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('paragraph')}
                  >
                    文字段落
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('funnel-chart')}
                  >
                    漏斗图表
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('metric-grid')}
                  >
                    指标卡片
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReportDetailPage;
