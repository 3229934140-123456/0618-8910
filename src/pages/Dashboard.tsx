import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFunnelStore } from '@/store/funnelStore';
import { DASHBOARD_DATA, INITIAL_FUNNELS } from '@/services/mockData';
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Star,
  Clock,
  Plus,
  ChevronRight,
  GitBranch,
  FileBarChart,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { formatFullNumber, formatPercent, formatTrend } from '@/utils/format';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/helpers';
import { motion } from 'framer-motion';
import FunnelChart from '@/components/funnel/FunnelChart';
import { useAlertStore } from '@/store/alertStore';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { funnels, toggleFavorite, getFunnelResult } = useFunnelStore();
  const { history, markHistoryRead, getUnreadCount, getCriticalCount } = useAlertStore();

  const favorites = funnels.filter((f) => f.isFavorite);
  const recent = [...funnels].sort(
    (a, b) => new Date(b.lastViewedAt || b.updatedAt).getTime() - new Date(a.lastViewedAt || a.updatedAt).getTime()
  );
  const sampleFunnel = INITIAL_FUNNELS[0];
  const sampleResult = getFunnelResult(sampleFunnel.id);

  const overviewCards = [
    {
      title: '活跃用户数',
      value: DASHBOARD_DATA.activeUsers,
      trend: DASHBOARD_DATA.activeUsersTrend,
      prefix: '',
      icon: Users,
      gradient: 'gradient-card-1',
      format: 'number',
    },
    {
      title: '总转化数',
      value: DASHBOARD_DATA.totalConversions,
      trend: DASHBOARD_DATA.totalConversionsTrend,
      icon: Target,
      gradient: 'gradient-card-2',
      format: 'number',
    },
    {
      title: '平均转化率',
      value: DASHBOARD_DATA.avgConversionRate,
      trend: DASHBOARD_DATA.avgConversionRateTrend,
      icon: TrendingUp,
      gradient: 'gradient-card-3',
      format: 'percent',
    },
    {
      title: '活动预警',
      value: DASHBOARD_DATA.activeAlerts,
      trend: 0,
      icon: AlertTriangle,
      gradient: 'gradient-card-4',
      format: 'count',
      noTrend: true,
    },
  ];

  const unreadAlerts = history.filter((h) => !h.isRead).slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {overviewCards.map((card, i) => {
          const Icon = card.icon;
          const trend = formatTrend(card.trend);
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.08 }}
              className={cn('relative p-5 rounded-2xl text-white overflow-hidden shadow-elevation-2', card.gradient)}
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/8 opacity-80" />
              <div className="absolute -right-16 bottom-0 w-40 h-40 rounded-full bg-white/5 opacity-70" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  {!card.noTrend && (
                    <div
                      className={cn(
                        'flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-sm',
                        trend.neutral
                          ? 'bg-white/15 text-white'
                          : trend.positive
                          ? 'bg-emerald-400/20 text-emerald-50'
                          : 'bg-red-400/20 text-red-50'
                      )}
                    >
                      {trend.neutral ? (
                        <span>—</span>
                      ) : trend.positive ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                      {trend.label}
                    </div>
                  )}
                </div>
                <p className="text-white/75 text-sm font-medium">{card.title}</p>
                <p className="mt-1 font-display font-bold text-3xl tabular tracking-tight">
                  {card.format === 'percent'
                    ? formatPercent(card.value, 1)
                    : card.format === 'count'
                    ? card.value + ' 条'
                    : formatFullNumber(card.value)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card padding="lg">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch size={18} className="text-navy-600" />
                  {sampleFunnel.name}
                  <Tag variant="primary" size="sm">
                    核心漏斗
                  </Tag>
                </CardTitle>
                <p className="text-xs text-navy-500 mt-1">{sampleFunnel.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                rightIcon={<ChevronRight size={14} />}
                onClick={() => navigate(`/funnels/${sampleFunnel.id}`)}
              >
                深入分析
              </Button>
            </CardHeader>
            <CardBody>
              <FunnelChart
                steps={sampleResult.steps}
                totalConversionRate={sampleResult.totalConversionRate}
                compact
              />
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle size={18} className="text-navy-600" />
                最新预警
                {getCriticalCount() > 0 && (
                  <Tag variant="danger" size="sm" rounded="full">
                    {getCriticalCount()} 紧急
                  </Tag>
                )}
              </CardTitle>
            </CardHeader>
            <CardBody>
              {unreadAlerts.length === 0 ? (
                <div className="py-10 text-center">
                  <AlertTriangle size={36} className="mx-auto text-navy-200 mb-2" />
                  <p className="text-sm text-navy-400">暂无未读预警</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {unreadAlerts.map((alert, i) => (
                    <motion.button
                      key={alert.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.45 + i * 0.05 }}
                      onClick={() => markHistoryRead(alert.id)}
                      className={cn(
                        'w-full text-left p-3.5 rounded-xl border transition-all hover:shadow-elevation-1',
                        alert.severity === 'critical'
                          ? 'bg-red-50/60 border-red-200'
                          : 'bg-amber-50/60 border-amber-200'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-semibold',
                              alert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'
                            )}
                          >
                            {alert.ruleName}
                          </p>
                          <p className="mt-1 text-xs text-navy-600 line-clamp-2">{alert.message}</p>
                        </div>
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 mt-1.5 animate-pulse-slow" />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Tag
                          size="sm"
                          variant={alert.severity === 'critical' ? 'danger' : 'warning'}
                        >
                          {alert.funnelName}
                        </Tag>
                        <span className="text-[11px] text-navy-400 tabular">
                          {formatDateTime(alert.triggeredAt).substring(5, 16)}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate('/alerts')}
                className="mt-4 w-full h-9 text-sm font-medium text-navy-700 hover:text-navy-900 hover:bg-navy-50 rounded-xl transition-colors"
              >
                查看全部预警 →
              </button>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star size={18} className="text-navy-600" />
                我收藏的漏斗
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Plus size={14} />}
                onClick={() => navigate('/funnels/new')}
              >
                新建
              </Button>
            </CardHeader>
            <CardBody>
              {favorites.length === 0 ? (
                <div className="py-10 text-center">
                  <Star size={36} className="mx-auto text-navy-200 mb-2" />
                  <p className="text-sm text-navy-400">暂无收藏的漏斗</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate('/funnels')}
                  >
                    去漏斗列表
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => navigate(`/funnels/${f.id}`)}
                      className="group p-3.5 rounded-xl border border-navy-100 hover:border-navy-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-navy-900 group-hover:text-navy-700">
                              {f.name}
                            </span>
                            <Star
                              size={13}
                              className="text-orange-500 fill-orange-500 flex-shrink-0"
                            />
                          </div>
                          <p className="mt-1 text-xs text-navy-500 line-clamp-1">
                            {f.description}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-navy-300 group-hover:text-navy-600 transition-colors mt-1" />
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {f.tags.slice(0, 2).map((t) => (
                            <Tag key={t} size="sm" variant="default">
                              {t}
                            </Tag>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-navy-400 tabular">
                          <Clock size={11} />
                          {f.steps.length} 步
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <Card padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileBarChart size={18} className="text-navy-600" />
                最近分析报告
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/reports')}
                rightIcon={<ChevronRight size={14} />}
              >
                更多
              </Button>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {[
                  {
                    title: '6月第2周转化周报',
                    summary: '本周整体转化率环比提升8.2%',
                    date: '2026-06-17',
                    shared: true,
                  },
                  {
                    title: '购物车流失专项分析',
                    summary: '运费过高和支付方式不便是主因',
                    date: '2026-06-13',
                    shared: false,
                  },
                  {
                    title: '5月用户激活月报',
                    summary: '新用户7日留存率提升至38.2%',
                    date: '2026-06-04',
                    shared: true,
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    onClick={() => navigate('/reports')}
                    className="group p-3.5 rounded-xl border border-navy-100 hover:border-navy-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-navy-900 group-hover:text-navy-700">
                            {r.title}
                          </span>
                          {r.shared && (
                            <Tag size="sm" variant="success">
                              已分享
                            </Tag>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-navy-500 line-clamp-1">{r.summary}</p>
                      </div>
                      <ChevronRight size={16} className="text-navy-300 group-hover:text-navy-600 transition-colors mt-1" />
                    </div>
                    <div className="mt-2 text-[11px] text-navy-400 tabular">
                      更新于 {r.date}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
