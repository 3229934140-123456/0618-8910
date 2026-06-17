import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFunnelStore } from '@/store/funnelStore';
import { generateChurnedUsers } from '@/services/mockData';
import BehaviorTimeline from '@/components/funnel/BehaviorTimeline';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Users,
  BarChart3,
  FileText,
  XCircle,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ChurnAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getFunnel } = useFunnelStore();

  const funnel = useMemo(() => (id ? getFunnel(id) : undefined), [id, getFunnel]);
  const churnedUsers = useMemo(
    () => (funnel ? generateChurnedUsers(funnel.steps, 60) : []),
    [funnel]
  );

  const stepNames = useMemo(
    () =>
      funnel?.steps.map((s, i) => ({
        id: s.id,
        name: s.name,
        index: i,
      })) || [],
    [funnel]
  );

  if (!funnel) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <XCircle size={56} className="mx-auto text-navy-200 mb-4" />
        <p className="font-display font-semibold text-xl text-navy-700">漏斗不存在</p>
      </div>
    );
  }

  const stepDropOffs = funnel.steps.slice(0, -1).map((s, i) => ({
    stepId: s.id,
    stepName: s.name,
    count: churnedUsers.filter((u) => u.lastStepIndex === i).length,
  }));

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"
      >
        <div>
          <Link
            to={`/funnels/${id}`}
            className="flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-700 transition-colors mb-2"
          >
            <ArrowLeft size={12} />
            返回漏斗分析
          </Link>
          <h2 className="font-display font-bold text-2xl text-navy-900 flex items-center gap-2">
            <Users size={24} className="text-navy-600" />
            流失分析 - {funnel.name}
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            深入分析流失用户，追溯流失前的最后行为路径，找出流失原因
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button variant="outline" leftIcon={<BarChart3 size={15} />}>
            导出分析报告
          </Button>
          <Button variant="primary" leftIcon={<FileText size={15} />}>
            创建优化方案
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card padding="md" className="!bg-gradient-to-br !from-navy-700 !to-navy-600 !text-white !border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/70">总流失用户</p>
              <p className="mt-2 font-display font-bold text-3xl tabular">
                {churnedUsers.length}
              </p>
            </div>
            <Users size={22} className="text-white/60" />
          </div>
        </Card>
        {stepDropOffs.slice(0, 3).map((s, i) => (
          <Card key={s.stepId} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-navy-500 mb-2 truncate max-w-[180px]">
                  流失于「{s.stepName}」
                </p>
                <p className="font-display font-bold text-2xl tabular text-navy-800">
                  {s.count}
                </p>
                <p className="text-[11px] text-navy-400 tabular mt-1">
                  占比 {((s.count / Math.max(churnedUsers.length, 1)) * 100).toFixed(1)}%
                </p>
              </div>
              <Activity
                size={20}
                className={
                  i === 0 ? 'text-danger-500' : i === 1 ? 'text-orange-500' : 'text-warning-500'
                }
              />
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <BehaviorTimeline users={churnedUsers} funnelStepNames={stepNames} />
      </motion.div>
    </div>
  );
};

export default ChurnAnalysisPage;
