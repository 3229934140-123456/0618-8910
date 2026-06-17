import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { UserDimensionField, DateRangePreset } from '@/types';
import { useFunnelStore } from '@/store/funnelStore';
import { generateChurnedUsers } from '@/services/mockData';
import FunnelChart from '@/components/funnel/FunnelChart';
import DimensionSplitter from '@/components/funnel/DimensionSplitter';
import PeriodCompareView from '@/components/funnel/PeriodCompareView';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Tag } from '@/components/ui/Tag';
import {
  ArrowLeft,
  Star,
  Edit,
  Trash2,
  Download,
  Share2,
  BellPlus,
  Users,
  FileDown,
  RefreshCw,
  BarChart2,
  Layers,
  GitCompare,
  Clock,
} from 'lucide-react';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/helpers';
import { motion } from 'framer-motion';

type TabType = 'overview' | 'dimension' | 'compare' | 'churn';

const FunnelAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getFunnel,
    getFunnelResult,
    getDimensionSplit,
    getPeriodCompare,
    datePreset,
    customDateRange,
    setDatePreset,
    setCustomDateRange,
    selectedDimension,
    setSelectedDimension,
    compareMode,
    setCompareMode,
    customCompareA,
    customCompareB,
    setCustomCompareBoth,
    clearCustomCompare,
    toggleFavorite,
    deleteFunnel,
  } = useFunnelStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [churnedStepIndex, setChurnedStepIndex] = useState<number | null>(null);

  const funnel = useMemo(() => (id ? getFunnel(id) : undefined), [id, getFunnel]);
  const result = useMemo(
    () => (id ? getFunnelResult(id) : { funnelId: id || '', period: { start: '', end: '' }, steps: [], totalConversionRate: 0 }),
    [id, getFunnelResult, datePreset, customDateRange]
  );
  const dimensionSplit = useMemo(
    () => (id ? getDimensionSplit(id) : null),
    [id, getDimensionSplit, selectedDimension, datePreset, customDateRange]
  );
  const periodCompare = useMemo(
    () => (id ? getPeriodCompare(id) : null),
    [id, getPeriodCompare, compareMode, datePreset, customDateRange, customCompareA, customCompareB]
  );

  const churnedUsers = useMemo(() => {
    if (!funnel) return [];
    return generateChurnedUsers(funnel.steps, 40, churnedStepIndex ?? undefined);
  }, [funnel, churnedStepIndex]);

  if (!funnel) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <BarChart2 size={56} className="mx-auto text-navy-200 mb-4" />
        <h3 className="font-display font-semibold text-xl text-navy-700 mb-1">漏斗不存在</h3>
        <p className="text-sm text-navy-500 mb-5">该漏斗可能已被删除或ID无效</p>
        <Button onClick={() => navigate('/funnels')}>返回漏斗列表</Button>
      </div>
    );
  }

  const handleStepClick = (stepIndex: number) => {
    setChurnedStepIndex(stepIndex < funnel.steps.length - 1 ? stepIndex : null);
    setActiveTab('churn');
  };

  const handleDelete = () => {
    if (id) {
      deleteFunnel(id);
      navigate('/funnels');
    }
  };

  const dateRange = useFunnelStore.getState().getDateRange();

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row lg:items-start gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/funnels"
              className="flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-700 transition-colors"
            >
              <ArrowLeft size={12} />
              漏斗列表
            </Link>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display font-bold text-2xl text-navy-900">
                  {funnel.name}
                </h2>
                <button
                  onClick={() => toggleFavorite(funnel.id)}
                  className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <Star
                    size={18}
                    className={cn(
                      'transition-colors',
                      funnel.isFavorite
                        ? 'text-orange-500 fill-orange-500'
                        : 'text-navy-300 hover:text-orange-400'
                    )}
                  />
                </button>
                {funnel.tags.map((t) => (
                  <Tag key={t} variant="primary" size="sm">
                    {t}
                  </Tag>
                ))}
              </div>
              <p className="mt-1.5 text-sm text-navy-500 max-w-2xl">{funnel.description}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-navy-400">
                <span className="flex items-center gap-1 tabular">
                  <Clock size={11} />
                  更新于 {formatDateTime(funnel.updatedAt).substring(0, 16)}
                </span>
                <span>创建人 {funnel.createdBy}</span>
                <span>{funnel.steps.length} 个转化步骤</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <DateRangePicker
            preset={datePreset as DateRangePreset}
            customRange={customDateRange}
            onPresetChange={setDatePreset}
            onCustomChange={setCustomDateRange}
          />
          <Button
            variant="outline"
            size="md"
            leftIcon={<RefreshCw size={15} />}
            title="刷新数据"
          />
          <Button
            variant="outline"
            size="md"
            leftIcon={<Edit size={15} />}
            onClick={() => navigate('/funnels/new')}
          >
            编辑
          </Button>
          <Button
            variant="outline"
            size="md"
            leftIcon={<BellPlus size={15} />}
            onClick={() => navigate('/alerts')}
          >
            预警
          </Button>
          <div className="h-8 w-px bg-navy-100 mx-1 hidden lg:block" />
          <Button
            variant="outline"
            size="md"
            leftIcon={<Share2 size={15} />}
          >
            分享
          </Button>
          <Button
            variant="ghost"
            size="md"
            leftIcon={<FileDown size={15} />}
          >
            导出
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="text-danger-600 hover:text-danger-600 hover:bg-red-50"
            leftIcon={<Trash2 size={15} />}
            onClick={() => setShowDeleteConfirm(true)}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card padding="sm">
          <div className="px-2">
            <Tabs
              tabs={[
                { id: 'overview', label: '漏斗概览', icon: <BarChart2 size={14} /> },
                { id: 'dimension', label: '属性拆分', icon: <Layers size={14} /> },
                { id: 'compare', label: '周期对比', icon: <GitCompare size={14} /> },
                { id: 'churn', label: '流失分析', icon: <Users size={14} /> },
              ]}
              active={activeTab}
              onChange={(v) => setActiveTab(v as TabType)}
              variant="underline"
            />
          </div>
        </Card>
      </motion.div>

      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <Card padding="lg">
            <CardHeader>
              <CardTitle className="text-base">
                转化漏斗分析
                <Tag variant="orange" className="ml-2" size="sm">
                  {dateRange.label}
                </Tag>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <FunnelChart
                steps={result.steps}
                totalConversionRate={result.totalConversionRate}
                onStepClick={handleStepClick}
              />
            </CardBody>
          </Card>
        </motion.div>
      )}

      {activeTab === 'dimension' && (
        <DimensionSplitter
          dimension={selectedDimension}
          onDimensionChange={setSelectedDimension}
          split={dimensionSplit}
        />
      )}

      {activeTab === 'compare' && (
        <PeriodCompareView
          data={periodCompare}
          compareMode={compareMode}
          onModeChange={setCompareMode}
          customCompareA={customCompareA}
          customCompareB={customCompareB}
          onApplyBoth={setCustomCompareBoth}
          onClearCustom={clearCustomCompare}
        />
      )}

      {activeTab === 'churn' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <Card padding="md">
            <CardHeader>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users size={18} className="text-navy-600" />
                  流失用户行为路径分析
                </CardTitle>
                <p className="text-xs text-navy-500 mt-1">
                  {churnedStepIndex !== null
                    ? `当前筛选：流失于第 ${churnedStepIndex + 1} 步（${funnel.steps[churnedStepIndex]?.name}）之后的用户`
                    : '展示全部流失用户，可点击漏斗图中的步骤进行筛选'}
                </p>
              </div>
              {churnedStepIndex !== null && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setChurnedStepIndex(null)}
                >
                  清除筛选
                </Button>
              )}
            </CardHeader>
          </Card>

          <Link to={`/funnels/${id}/churn`} className="block">
            <div className="p-5 rounded-2xl gradient-card-1 text-white hover:shadow-elevation-2 transition-all group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">深入流失分析</p>
                  <p className="font-display font-bold text-2xl mt-1">查看完整流失分析页 →</p>
                  <p className="text-sm text-white/60 mt-1">
                    包含流失用户列表、行为路径时间轴、画像统计等完整功能
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={26} />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-elevation-2 animate-slide-up">
            <h3 className="font-display font-semibold text-lg text-navy-900 mb-2">
              确认删除漏斗？
            </h3>
            <p className="text-sm text-navy-600 mb-5">
              删除后数据无法恢复，相关预警规则也会一并失效。
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                取消
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                确认删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunnelAnalysisPage;
