import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FunnelStep } from '@/types';
import { useFunnelStore } from '@/store/funnelStore';
import FunnelEditor from '@/components/funnel/FunnelEditor';
import { EVENT_CATALOG } from '@/services/mockData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { ArrowLeft, Save, Eye, Wand2, Sparkles, GitBranchPlus } from 'lucide-react';
import { generateId } from '@/utils/helpers';
import { motion } from 'framer-motion';

const FunnelCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addFunnel } = useFunnelStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const [steps, setSteps] = useState<FunnelStep[]>([
    { id: generateId(), name: '访问首页', eventName: 'page_view_home', order: 0 },
    { id: generateId(), name: '完成注册', eventName: 'register_submit', order: 1 },
    { id: generateId(), name: '浏览商品', eventName: 'page_view_product_detail', order: 2 },
    { id: generateId(), name: '提交订单', eventName: 'order_create', order: 3 },
    { id: generateId(), name: '支付成功', eventName: 'order_pay_success', order: 4 },
  ]);

  const quickTemplates = [
    {
      name: '注册转化模板',
      desc: '用户注册→完善资料→首单转化',
      events: ['page_view_home', 'register_submit', 'profile_edit_submit', 'page_view_product_detail', 'order_create', 'order_pay_success'],
    },
    {
      name: '购物转化模板',
      desc: '浏览→加购→下单→支付标准电商路径',
      events: ['page_view_product_list', 'page_view_product_detail', 'click_add_cart', 'page_view_checkout', 'order_create', 'order_pay_success'],
    },
    {
      name: '活动转化模板',
      desc: '大促活动页→领券→下单转化',
      events: ['banner_click', 'coupon_click', 'page_view_product_detail', 'order_create', 'order_pay_success'],
    },
  ];

  const applyTemplate = (t: typeof quickTemplates[0]) => {
    setName(t.name.replace('模板', ''));
    setDescription(t.desc);
    setSteps(
      t.events.map((e, i) => {
        const item = EVENT_CATALOG.find((c) => c.eventName === e);
        return {
          id: generateId(),
          name: item?.eventLabel || `步骤 ${i + 1}`,
          eventName: e,
          order: i,
        };
      })
    );
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSave = (draft = false) => {
    if (!name.trim()) {
      setError('请输入漏斗名称');
      return;
    }
    if (steps.length < 2) {
      setError('漏斗至少需要2个步骤');
      return;
    }
    const hasDuplicate = new Set(steps.map((s) => s.eventName)).size !== steps.length;
    if (hasDuplicate) {
      setError('漏斗步骤中存在重复的埋点事件，请检查');
      return;
    }

    setError('');
    const newFunnel = addFunnel({
      name: name.trim(),
      description: description.trim(),
      tags,
      steps: steps.map((s, i) => ({ ...s, order: i })),
    });

    if (!draft) {
      navigate(`/funnels/${newFunnel.id}`);
    } else {
      navigate('/funnels');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/funnels')}
        >
          返回漏斗列表
        </Button>
        <div>
          <h2 className="font-display font-bold text-2xl text-navy-900">创建新漏斗</h2>
          <p className="text-sm text-navy-500 mt-0.5">
            定义转化漏斗步骤，系统将自动从埋点数据中计算转化率
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles size={18} className="text-orange-500" />
              快速模板
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {quickTemplates.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="group p-4 rounded-2xl border border-navy-100 bg-gradient-to-br from-white to-navy-50/40 hover:border-orange-200 hover:from-orange-50/40 hover:to-white transition-all text-left hover:shadow-elevation-1 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Wand2 size={14} />
                    </div>
                    <span className="font-semibold text-navy-900">{t.name}</span>
                  </div>
                  <p className="text-xs text-navy-500 line-clamp-2">{t.desc}</p>
                  <div className="mt-3 text-[11px] text-orange-600 font-medium flex items-center gap-1">
                    {t.events.length} 个步骤
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                      → 点击应用
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card padding="lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranchPlus size={18} className="text-navy-600" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                  漏斗名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：注册到首单转化漏斗、大促活动页转化漏斗"
                  className="w-full h-11 px-4 text-sm border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                  漏斗描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="描述漏斗分析的目的、关注的用户路径等"
                  className="w-full px-4 py-3 text-sm border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 transition-all resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-navy-500 mb-2">
                  标签（最多5个）
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-navy-200 rounded-xl bg-white min-h-[46px]">
                  {tags.map((t) => (
                    <Tag key={t} variant="orange" size="md">
                      {t}
                      <button
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        className="ml-1.5 hover:text-danger-600 transition-colors"
                      >
                        ×
                      </button>
                    </Tag>
                  ))}
                  {tags.length < 5 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="输入标签后回车"
                      className="flex-1 min-w-[140px] h-8 px-2 text-sm bg-transparent focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                漏斗步骤定义
                <Tag variant="orange" size="sm">
                  {steps.length} 步
                </Tag>
              </CardTitle>
              <p className="text-xs text-navy-500 mt-1">
                拖拽调整步骤顺序，为每一步选择对应的埋点事件
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <FunnelEditor steps={steps} onChange={setSteps} error={error} />
          </CardBody>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex items-center justify-end gap-3 sticky bottom-6 z-10 p-4 bg-white/80 backdrop-blur-md border border-navy-100 rounded-2xl shadow-elevation-1"
      >
        <Button variant="ghost" onClick={() => navigate('/funnels')}>
          取消
        </Button>
        <Button variant="outline" leftIcon={<Save size={16} />} onClick={() => handleSave(true)}>
          保存草稿
        </Button>
        <Button leftIcon={<Eye size={16} />} onClick={() => handleSave(false)}>
          保存并开始分析
        </Button>
      </motion.div>
    </div>
  );
};

export default FunnelCreatePage;
