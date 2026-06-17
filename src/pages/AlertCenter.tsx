import React, { useMemo, useState } from 'react';
import { useAlertStore, useFunnelStore } from '@/store';
import type { AlertContact } from '@/types';
import {
  simulateAlertCheck,
  calculateFunnelResult,
  calculatePeriodCompare,
} from '@/services/mockData';
import { getDateRange, getCompareRange } from '@/utils/date';
import {
  BellRing,
  Plus,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Clock,
  Mail,
  Power,
  PowerOff,
  Trash2,
  Edit,
  X,
  Check,
  ChevronRight,
  Activity,
  Users,
  CalendarDays,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { formatDateTime, formatTimeOnly } from '@/utils/date';
import { cn, generateId } from '@/utils/helpers';
import { formatPercent } from '@/utils/format';
import { motion } from 'framer-motion';

type TabType = 'rules' | 'history';

const AlertCenterPage: React.FC = () => {
  const { rules, history, addRule, updateRule, toggleRule, deleteRule, markAllRead, markHistoryRead } = useAlertStore();
  const { funnels } = useFunnelStore();
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [editModal, setEditModal] = useState<{ id: string | null; open: boolean }>({ id: null, open: false });
  const [search, setSearch] = useState('');

  const filteredHistory = useMemo(() => {
    let res = [...history];
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      res = res.filter(
        (h) =>
          h.ruleName.toLowerCase().includes(kw) ||
          h.funnelName.toLowerCase().includes(kw) ||
          h.message.toLowerCase().includes(kw)
      );
    }
    return res.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
  }, [history, search]);

  const editingRule = editModal.id ? rules.find((r) => r.id === editModal.id) : null;
  const [formData, setFormData] = useState<{
    funnelId: string;
    stepIndex: number;
    name: string;
    thresholdType: 'absolute' | 'relative';
    threshold: number;
    checkInterval: 'daily' | 'hourly';
    coolDownMinutes: number;
    contacts: AlertContact[];
    isEnabled: boolean;
  }>({
    funnelId: '',
    stepIndex: 0,
    name: '',
    thresholdType: 'relative',
    threshold: -10,
    checkInterval: 'daily',
    coolDownMinutes: 360,
    contacts: [{ name: '当前用户', email: 'admin@example.com' }],
    isEnabled: true,
  });

  const openCreateModal = () => {
    const defaultFunnel = funnels[0];
    setFormData({
      funnelId: defaultFunnel?.id || '',
      stepIndex: defaultFunnel ? Math.max(0, defaultFunnel.steps.length - 1) : 0,
      name: defaultFunnel ? `${defaultFunnel.name} - 转化率监控` : '新建监控规则',
      thresholdType: 'relative',
      threshold: -10,
      checkInterval: 'daily',
      coolDownMinutes: 360,
      contacts: [{ name: '当前用户', email: 'admin@example.com' }],
      isEnabled: true,
    });
    setEditModal({ id: null, open: true });
  };

  const openEditModal = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const funnel = funnels.find((f) => f.id === rule.funnelId);
    const stepIdx = funnel?.steps.findIndex((s) => s.id === rule.stepId) ?? 0;
    setFormData({
      funnelId: rule.funnelId,
      stepIndex: stepIdx,
      name: rule.name,
      thresholdType: rule.thresholdType,
      threshold: rule.threshold,
      checkInterval: rule.checkInterval,
      coolDownMinutes: rule.coolDownMinutes,
      contacts: rule.contacts,
      isEnabled: rule.isEnabled,
    });
    setEditModal({ id: ruleId, open: true });
  };

  const saveRule = () => {
    const funnel = funnels.find((f) => f.id === formData.funnelId);
    const step = funnel?.steps[formData.stepIndex];
    if (!funnel || !step) return;

    let savedRuleId: string;

    if (editingRule) {
      updateRule(editingRule.id, {
        ...formData,
        funnelName: funnel.name,
        stepId: step.id,
        stepName: step.name,
      });
      savedRuleId = editingRule.id;
    } else {
      const newRule = addRule({
        ...formData,
        funnelName: funnel.name,
        stepId: step.id,
        stepName: step.name,
      });
      savedRuleId = newRule.id;
    }

    const savedRule = useAlertStore.getState().rules.find((r) => r.id === savedRuleId);
    if (savedRule && savedRule.isEnabled && funnel) {
      const currentRange = getDateRange('last7days');
      const prevRange = getCompareRange({ start: currentRange.start, end: currentRange.end });
      const currentResult = calculateFunnelResult(funnel, { start: currentRange.start, end: currentRange.end });
      const prevResult = calculateFunnelResult(funnel, { start: prevRange.start, end: prevRange.end });

      const stepIdx = funnel.steps.findIndex((s) => s.id === savedRule.stepId);
      const currentRate = stepIdx >= 0 && stepIdx < currentResult.steps.length ? currentResult.steps[stepIdx].conversionRate : 0;
      const previousRate = stepIdx >= 0 && stepIdx < prevResult.steps.length ? prevResult.steps[stepIdx].conversionRate : 0;

      const alertItem = simulateAlertCheck(savedRule, currentRate, previousRate);
      if (alertItem) {
        const enrichedAlert = {
          ...alertItem,
          notifiedEmails: savedRule.contacts.map((c) => c.email).filter(Boolean),
        };
        useAlertStore.setState((state) => ({
          history: [enrichedAlert, ...state.history],
          rules: state.rules.map((r) =>
            r.id === savedRule.id ? { ...r, lastTriggeredAt: alertItem.triggeredAt } : r
          ),
        }));
      }
    }

    setEditModal({ id: null, open: false });
  };

  const currentFunnel = funnels.find((f) => f.id === formData.funnelId);
  const stepOptions =
    currentFunnel?.steps.map((s, i) => ({
      value: String(i),
      label: `${i + 1}. ${s.name}`,
    })) || [];

  const unreadCount = history.filter((h) => !h.isRead).length;
  const criticalCount = history.filter((h) => !h.isRead && h.severity === 'critical').length;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card padding="md" className="!bg-gradient-to-br !from-navy-700 !to-navy-600 !text-white !border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/70">监控规则总数</p>
              <p className="mt-2 font-display font-bold text-3xl tabular">{rules.length}</p>
            </div>
            <BellRing size={22} className="text-white/70" />
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-emerald-600 font-semibold">运行中</p>
              <p className="mt-2 font-display font-bold text-3xl tabular text-navy-800">
                {rules.filter((r) => r.isEnabled).length}
              </p>
            </div>
            <Power size={22} className="text-emerald-500" />
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-orange-600 font-semibold">未读预警</p>
              <p className="mt-2 font-display font-bold text-3xl tabular text-navy-800">
                {unreadCount}
              </p>
            </div>
            <AlertTriangle size={22} className="text-orange-500" />
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-red-600 font-semibold">紧急告警</p>
              <p className="mt-2 font-display font-bold text-3xl tabular text-navy-800">
                {criticalCount}
              </p>
            </div>
            <AlertCircle size={22} className="text-red-500" />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card padding="sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4 px-3">
            <Tabs
              tabs={[
                { id: 'rules', label: '预警规则', icon: <BellRing size={14} /> },
                {
                  id: 'history',
                  label: '预警历史',
                  icon: <CalendarDays size={14} />,
                },
              ]}
              active={activeTab}
              onChange={(v) => setActiveTab(v as TabType)}
              variant="underline"
              className="md:mr-auto"
            />
            <div className="flex items-center gap-2 ml-auto">
              {activeTab === 'history' && (
                <>
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="搜索预警..."
                      className="w-52 h-9 pl-8 pr-3 text-sm bg-navy-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:bg-white transition-all"
                    />
                  </div>
                  {unreadCount > 0 && (
                    <Button size="sm" variant="outline" onClick={markAllRead}>
                      <Check size={13} className="mr-1.5" />
                      全部已读
                    </Button>
                  )}
                </>
              )}
              {activeTab === 'rules' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Activity size={14} />}
                    onClick={() => {
                      const allRules = useAlertStore.getState().rules.filter((r) => r.isEnabled);
                      let newCount = 0;
                      for (const rule of allRules) {
                        const funnel = useFunnelStore.getState().getFunnel(rule.funnelId);
                        if (!funnel) continue;
                        const currentRange = getDateRange('last7days');
                        const prevRange = getCompareRange({ start: currentRange.start, end: currentRange.end });
                        const currentResult = calculateFunnelResult(funnel, { start: currentRange.start, end: currentRange.end });
                        const prevResult = calculateFunnelResult(funnel, { start: prevRange.start, end: prevRange.end });
                        const stepIdx = funnel.steps.findIndex((s) => s.id === rule.stepId);
                        const currentRate = stepIdx >= 0 && stepIdx < currentResult.steps.length ? currentResult.steps[stepIdx].conversionRate : 0;
                        const previousRate = stepIdx >= 0 && stepIdx < prevResult.steps.length ? prevResult.steps[stepIdx].conversionRate : 0;
                        const alertItem = simulateAlertCheck(rule, currentRate, previousRate);
                        if (alertItem) {
                          const enrichedAlert = {
                            ...alertItem,
                            notifiedEmails: rule.contacts.map((c) => c.email).filter(Boolean),
                          };
                          useAlertStore.setState((state) => ({
                            history: [enrichedAlert, ...state.history],
                            rules: state.rules.map((r) =>
                              r.id === rule.id ? { ...r, lastTriggeredAt: alertItem.triggeredAt } : r
                            ),
                          }));
                          newCount++;
                        }
                      }
                      if (newCount > 0) {
                        setActiveTab('history');
                      }
                    }}
                  >
                    立即检查
                  </Button>
                  <Button leftIcon={<Plus size={15} />} onClick={openCreateModal}>
                    新建预警规则
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {activeTab === 'rules' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          {rules.length === 0 ? (
            <Card padding="lg">
              <div className="py-16 text-center">
                <BellRing size={52} className="mx-auto text-navy-200 mb-4" />
                <p className="font-display font-semibold text-lg text-navy-700 mb-1">
                  暂无预警规则
                </p>
                <p className="text-sm text-navy-500 mb-5">
                  创建监控规则，当转化率下降时自动通知您
                </p>
                <Button leftIcon={<Plus size={15} />} onClick={openCreateModal}>
                  创建第一个规则
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {rules.map((rule, i) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.03 }}
                >
                  <Card padding="md">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
                          rule.isEnabled
                            ? 'bg-gradient-to-br from-navy-700 to-navy-600'
                            : 'bg-navy-100'
                        )}
                      >
                        <BellRing
                          size={24}
                          className={rule.isEnabled ? 'text-white' : 'text-navy-400'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="font-display font-semibold text-lg text-navy-900">
                                {rule.name}
                              </h3>
                              {rule.isEnabled ? (
                                <Tag variant="success" size="sm" rounded="full">
                                  <Power size={10} className="mr-1" />
                                  运行中
                                </Tag>
                              ) : (
                                <Tag variant="default" size="sm" rounded="full">
                                  <PowerOff size={10} className="mr-1" />
                                  已停用
                                </Tag>
                              )}
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                              <Tag variant="primary" size="sm">
                                {rule.funnelName}
                              </Tag>
                              <Tag variant="violet" size="sm">
                                监控步骤：{rule.stepName}
                              </Tag>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => toggleRule(rule.id)}
                              className="h-9 px-3 flex items-center gap-1.5 text-xs font-medium rounded-xl text-navy-600 hover:bg-navy-50 transition-colors"
                            >
                              {rule.isEnabled ? (
                                <>
                                  <PowerOff size={13} />
                                  停用
                                </>
                              ) : (
                                <>
                                  <Power size={13} />
                                  启用
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(rule.id)}
                              className="h-9 px-3 flex items-center gap-1.5 text-xs font-medium rounded-xl text-navy-600 hover:bg-navy-50 transition-colors"
                            >
                              <Edit size={13} />
                              编辑
                            </button>
                            <button
                              onClick={() => deleteRule(rule.id)}
                              className="h-9 px-3 flex items-center gap-1.5 text-xs font-medium rounded-xl text-navy-400 hover:text-danger-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} />
                              删除
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 rounded-xl bg-navy-50/60">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-500">
                              阈值类型
                            </p>
                            <p className="mt-1 text-sm font-semibold text-navy-800">
                              {rule.thresholdType === 'relative' ? '环比变化' : '绝对值阈值'}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-red-50/60">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500">
                              告警阈值
                            </p>
                            <p className="mt-1 text-sm font-semibold text-red-700 tabular flex items-center gap-1">
                              <TrendingDown size={13} />
                              {rule.thresholdType === 'relative'
                                ? rule.threshold > 0
                                  ? '+' + rule.threshold + '%'
                                  : rule.threshold + '%'
                                : formatPercent(rule.threshold, 1)}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-violet-50/60">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">
                              检查频率
                            </p>
                            <p className="mt-1 text-sm font-semibold text-violet-800">
                              {rule.checkInterval === 'daily' ? '每日 08:00' : '每小时整点'}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-amber-50/60">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                              最近触发
                            </p>
                            <p className="mt-1 text-sm font-semibold text-amber-800 tabular">
                              {rule.lastTriggeredAt
                                ? formatDateTime(rule.lastTriggeredAt).substring(5, 16)
                                : '从未触发'}
                            </p>
                          </div>
                        </div>

                        {rule.contacts.length > 0 && (
                          <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <Mail size={13} className="text-navy-400" />
                            <span className="text-xs text-navy-500">通知：</span>
                            {rule.contacts.map((c, ci) => (
                              <span
                                key={ci}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-navy-100 rounded-full"
                              >
                                <span className="font-medium text-navy-700">{c.name}</span>
                                <span className="text-navy-400">{c.email}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          {filteredHistory.length === 0 ? (
            <Card padding="lg">
              <div className="py-16 text-center">
                <Activity size={52} className="mx-auto text-navy-200 mb-4" />
                <p className="font-display font-semibold text-lg text-navy-700 mb-1">
                  暂无预警记录
                </p>
                <p className="text-sm text-navy-500">所有指标均在正常范围内</p>
              </div>
            </Card>
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-100 bg-navy-50/60">
                      <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                        级别
                      </th>
                      <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                        规则名称
                      </th>
                      <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                        步骤
                      </th>
                      <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                        当前值
                      </th>
                      <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                        阈值
                      </th>
                      <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                        触发时间
                      </th>
                      <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                        通知邮箱
                      </th>
                      <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                        状态
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((h) => (
                      <tr
                        key={h.id}
                        onClick={() => markHistoryRead(h.id)}
                        className={cn(
                          'border-b border-navy-50 transition-colors cursor-pointer',
                          !h.isRead ? 'bg-orange-50/30 hover:bg-orange-50/50' : 'hover:bg-navy-50/40'
                        )}
                      >
                        <td className="py-4 px-5">
                          <Tag
                            variant={h.severity === 'critical' ? 'danger' : 'warning'}
                            size="sm"
                            rounded="full"
                          >
                            {h.severity === 'critical' ? (
                              <>
                                <AlertCircle size={10} className="mr-1" />
                                紧急
                              </>
                            ) : (
                              <>
                                <AlertTriangle size={10} className="mr-1" />
                                警告
                              </>
                            )}
                          </Tag>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-navy-900">{h.ruleName}</span>
                            {!h.isRead && (
                              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-slow" />
                            )}
                          </div>
                          <p className="text-xs text-navy-500 mt-0.5 max-w-sm line-clamp-1">
                            {h.message}
                          </p>
                        </td>
                        <td className="py-4 px-5">
                          <div>
                            <p className="font-medium text-navy-800">{h.funnelName}</p>
                            <p className="text-xs text-navy-500 mt-0.5">{h.stepName}</p>
                          </div>
                        </td>
                        <td className="py-4 px-5 tabular font-semibold text-danger-600">
                          {formatPercent(h.actualValue, 2)}
                        </td>
                        <td className="py-4 px-5 tabular text-navy-700">
                          {h.thresholdType === 'relative'
                            ? h.threshold + '%'
                            : formatPercent(h.threshold, 2)}
                        </td>
                        <td className="py-4 px-5 text-navy-600 tabular text-xs">
                          <div>{formatDateTime(h.triggeredAt).substring(5, 10)}</div>
                          <div className="text-navy-400 mt-0.5">
                            {formatTimeOnly(h.triggeredAt)}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          {h.notifiedEmails && h.notifiedEmails.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {h.notifiedEmails.map((email, ei) => (
                                <span
                                  key={ei}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-navy-50 border border-navy-100 rounded-full text-navy-600"
                                >
                                  <Mail size={9} />
                                  {email}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-navy-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          {h.isRead ? (
                            <Tag variant="success" size="sm">
                              <Check size={10} className="mr-1" />
                              已处理
                            </Tag>
                          ) : (
                            <Tag variant="orange" size="sm">
                              <Clock size={10} className="mr-1" />
                              待处理
                            </Tag>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <ChevronRight size={16} className="text-navy-300 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      <Modal
        open={editModal.open}
        onClose={() => setEditModal({ id: null, open: false })}
        title={editingRule ? '编辑预警规则' : '新建预警规则'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal({ id: null, open: false })}>
              取消
            </Button>
            <Button onClick={saveRule}>保存规则</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                规则名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-4 text-sm border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 transition-all"
                placeholder="例如：最终转化率监控"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                监控漏斗
              </label>
              <Select
                value={formData.funnelId}
                options={funnels.map((f) => ({ value: f.id, label: f.name }))}
                onChange={(v) =>
                  setFormData({ ...formData, funnelId: v, stepIndex: 0 })
                }
                searchable
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                监控步骤
              </label>
              <Select
                value={String(formData.stepIndex)}
                options={stepOptions}
                onChange={(v) =>
                  setFormData({ ...formData, stepIndex: parseInt(v) })
                }
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                阈值类型
              </label>
              <Select
                value={formData.thresholdType}
                options={[
                  { value: 'relative', label: '环比变化（对比上一周期）' },
                  { value: 'absolute', label: '绝对值阈值' },
                ]}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    thresholdType: v as 'absolute' | 'relative',
                    threshold: v === 'relative' ? -10 : 0.5,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                {formData.thresholdType === 'relative'
                  ? '变化阈值（%，负数值表示下降）'
                  : '转化率阈值（例如 0.5 表示 50%）'}
              </label>
              <input
                type="number"
                step="any"
                value={formData.threshold}
                onChange={(e) =>
                  setFormData({ ...formData, threshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-10 px-4 text-sm tabular border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 transition-all"
              />
              <p className="mt-1 text-[11px] text-navy-400">
                {formData.thresholdType === 'relative'
                  ? `当转化率下降超过 ${Math.abs(formData.threshold)}% 时触发告警`
                  : `当转化率低于 ${(formData.threshold * 100).toFixed(1)}% 时触发告警`}
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                检查频率
              </label>
              <Select
                value={formData.checkInterval}
                options={[
                  { value: 'daily', label: '每日（推荐）' },
                  { value: 'hourly', label: '每小时（适合实时监控）' },
                ]}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    checkInterval: v as 'daily' | 'hourly',
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                冷却时间（分钟）
              </label>
              <input
                type="number"
                min={10}
                value={formData.coolDownMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coolDownMinutes: Math.max(10, parseInt(e.target.value) || 10),
                  })
                }
                className="w-full h-10 px-4 text-sm tabular border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 transition-all"
              />
              <p className="mt-1 text-[11px] text-navy-400">同一规则在此时间内只发送一次通知</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                邮件通知人
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    contacts: [
                      ...formData.contacts,
                      { name: '', email: '' },
                    ],
                  })
                }
                className="text-xs font-medium text-navy-600 hover:text-navy-800"
              >
                + 添加接收人
              </button>
            </div>
            <div className="space-y-2">
              {formData.contacts.map((c, ci) => (
                <div
                  key={ci}
                  className="flex items-center gap-2 p-2.5 bg-navy-50/60 rounded-xl"
                >
                  <input
                    type="text"
                    placeholder="姓名"
                    value={c.name}
                    onChange={(e) => {
                      const updated = [...formData.contacts];
                      updated[ci] = { ...c, name: e.target.value };
                      setFormData({ ...formData, contacts: updated });
                    }}
                    className="flex-1 h-8 px-3 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-200"
                  />
                  <div className="relative flex-1">
                    <Mail
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
                    />
                    <input
                      type="email"
                      placeholder="邮箱地址"
                      value={c.email}
                      onChange={(e) => {
                        const updated = [...formData.contacts];
                        updated[ci] = { ...c, email: e.target.value };
                        setFormData({ ...formData, contacts: updated });
                      }}
                      className="w-full h-8 pl-8 pr-3 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-200"
                    />
                  </div>
                  {formData.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          contacts: formData.contacts.filter((_, i) => i !== ci),
                        })
                      }
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-navy-400 hover:text-danger-600 hover:bg-red-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlertCenterPage;
