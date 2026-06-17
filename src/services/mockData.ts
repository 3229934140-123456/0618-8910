import type {
  Funnel,
  FunnelStep,
  ChurnedUser,
  BehaviorEvent,
  EventCatalogItem,
  UserDimensionOption,
  Report,
  AlertRule,
  AlertHistoryItem,
  DashboardOverview,
  FunnelResult,
  FunnelStepResult,
  DimensionSplit,
  PeriodCompare,
} from '@/types';
import { generateId, randomInt, randomBetween, pickRandom, pickMultipleRandom } from '@/utils/helpers';
import { subDays, addMinutes, subMinutes, subYears, subHours } from 'date-fns';

export const EVENT_CATALOG: EventCatalogItem[] = [
  { eventName: 'page_view_home', eventLabel: '浏览首页', category: '页面访问', description: '用户访问首页' },
  { eventName: 'page_view_product_list', eventLabel: '浏览商品列表', category: '页面访问', description: '用户浏览商品列表页' },
  { eventName: 'page_view_product_detail', eventLabel: '浏览商品详情', category: '页面访问', description: '用户浏览商品详情页' },
  { eventName: 'page_view_cart', eventLabel: '访问购物车', category: '页面访问', description: '用户访问购物车页面' },
  { eventName: 'page_view_checkout', eventLabel: '访问结算页', category: '页面访问', description: '用户访问订单结算页面' },
  { eventName: 'register_submit', eventLabel: '提交注册', category: '用户行为', description: '用户提交注册表单' },
  { eventName: 'login_success', eventLabel: '登录成功', category: '用户行为', description: '用户成功登录' },
  { eventName: 'profile_edit_submit', eventLabel: '提交资料完善', category: '用户行为', description: '用户完善个人资料' },
  { eventName: 'click_add_cart', eventLabel: '点击加入购物车', category: '点击行为', description: '用户点击加入购物车按钮' },
  { eventName: 'search_submit', eventLabel: '提交搜索', category: '搜索行为', description: '用户提交搜索请求' },
  { eventName: 'order_create', eventLabel: '创建订单', category: '交易行为', description: '用户成功创建订单' },
  { eventName: 'order_pay_success', eventLabel: '支付成功', category: '交易行为', description: '用户完成订单支付' },
  { eventName: 'coupon_click', eventLabel: '点击优惠券', category: '营销行为', description: '用户点击领取优惠券' },
  { eventName: 'share_click', eventLabel: '点击分享', category: '社交行为', description: '用户点击分享按钮' },
  { eventName: 'banner_click', eventLabel: '点击Banner', category: '营销行为', description: '用户点击首页Banner' },
];

export const CHANNELS = [
  { value: 'organic', label: '自然流量' },
  { value: 'wechat', label: '微信推广' },
  { value: 'weibo', label: '微博推广' },
  { value: 'douyin', label: '抖音推广' },
  { value: 'baidu', label: '百度搜索' },
  { value: 'referral', label: '用户推荐' },
  { value: 'ad_direct', label: '信息流广告' },
];

export const CITIES = [
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangzhou', label: '广州' },
  { value: 'shenzhen', label: '深圳' },
  { value: 'hangzhou', label: '杭州' },
  { value: 'chengdu', label: '成都' },
  { value: 'nanjing', label: '南京' },
  { value: 'wuhan', label: '武汉' },
  { value: 'xian', label: '西安' },
  { value: 'chongqing', label: '重庆' },
];

export const DEVICES = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web', label: 'PC端' },
  { value: 'mini_program', label: '小程序' },
];

export const USER_LEVELS = [
  { value: 'new', label: '新用户' },
  { value: 'normal', label: '普通用户' },
  { value: 'silver', label: '银牌会员' },
  { value: 'gold', label: '金牌会员' },
  { value: 'platinum', label: '铂金会员' },
];

export const DIMENSION_OPTIONS: UserDimensionOption[] = [
  { field: 'channel', label: '来源渠道', values: CHANNELS },
  { field: 'city', label: '所在城市', values: CITIES },
  { field: 'device', label: '设备类型', values: DEVICES },
  { field: 'userLevel', label: '用户等级', values: USER_LEVELS },
];

const DEFAULT_STEP_EVENTS: { name: string; eventName: string }[] = [
  { name: '访问首页', eventName: 'page_view_home' },
  { name: '完成注册', eventName: 'register_submit' },
  { name: '完善资料', eventName: 'profile_edit_submit' },
  { name: '浏览商品', eventName: 'page_view_product_detail' },
  { name: '加入购物车', eventName: 'click_add_cart' },
  { name: '提交订单', eventName: 'order_create' },
  { name: '支付成功', eventName: 'order_pay_success' },
];

const generateSteps = (count: number, startIndex = 0): FunnelStep[] => {
  return DEFAULT_STEP_EVENTS.slice(startIndex, startIndex + count).map((s, i) => ({
    id: generateId(),
    name: s.name,
    eventName: s.eventName,
    order: i,
  }));
};

const now = new Date();

export const INITIAL_FUNNELS: Funnel[] = [
  {
    id: 'f-reg-order',
    name: '注册到首单转化漏斗',
    description: '分析新用户从注册到首次下单的完整转化路径，识别关键流失节点',
    tags: ['核心转化', '新用户'],
    steps: generateSteps(5, 0),
    createdAt: subDays(now, 30).toISOString(),
    updatedAt: subDays(now, 2).toISOString(),
    createdBy: '张运营',
    isFavorite: true,
    lastViewedAt: subMinutes(now, 30).toISOString(),
  },
  {
    id: 'f-cart-pay',
    name: '购物车到支付漏斗',
    description: '衡量购物车加购到最终支付的转化效率，重点关注结算环节流失',
    tags: ['交易转化', '购物车'],
    steps: generateSteps(5, 3),
    createdAt: subDays(now, 20).toISOString(),
    updatedAt: subDays(now, 5).toISOString(),
    createdBy: '李产品',
    isFavorite: true,
    lastViewedAt: subHours(now, 3).toISOString(),
  },
  {
    id: 'f-onboarding',
    name: '新用户激活漏斗',
    description: '注册后7天内的用户激活流程，衡量用户引导页和新手任务的转化',
    tags: ['用户激活', '新手引导'],
    steps: generateSteps(3, 0),
    createdAt: subDays(now, 45).toISOString(),
    updatedAt: subDays(now, 8).toISOString(),
    createdBy: '王增长',
    isFavorite: false,
  },
  {
    id: 'f-activity',
    name: '618大促活动漏斗',
    description: '618大促期间的活动落地页到下单转化分析',
    tags: ['活动运营', '大促'],
    steps: [
      { id: 's1', name: '访问活动页', eventName: 'banner_click', order: 0 },
      { id: 's2', name: '领取优惠券', eventName: 'coupon_click', order: 1 },
      ...generateSteps(4, 3),
    ],
    createdAt: subDays(now, 15).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
    createdBy: '张运营',
    isFavorite: false,
  },
];

const EVENT_POOL = EVENT_CATALOG.filter(e =>
  ['page', 'click', 'search', 'form', 'transaction'].some(t => e.category.toLowerCase().includes(t) || true)
);

const EVENT_CATEGORY_MAP: Record<string, BehaviorEvent['category']> = {
  page_view_home: 'page',
  page_view_product_list: 'page',
  page_view_product_detail: 'page',
  page_view_cart: 'page',
  page_view_checkout: 'page',
  register_submit: 'form',
  login_success: 'form',
  profile_edit_submit: 'form',
  click_add_cart: 'click',
  search_submit: 'search',
  order_create: 'transaction',
  order_pay_success: 'transaction',
  coupon_click: 'click',
  share_click: 'click',
  banner_click: 'click',
};

const generateBehaviorPath = (churnedStepIndex: number, funnelEvents: string[]): BehaviorEvent[] => {
  const events: BehaviorEvent[] = [];
  let baseTime = new Date();

  const stepsToInclude = churnedStepIndex + 1;
  const eventsBeforeDrop = Math.min(stepsToInclude, funnelEvents.length);

  for (let i = 0; i < eventsBeforeDrop; i++) {
    const eventName = funnelEvents[i];
    const catalogItem = EVENT_CATALOG.find(e => e.eventName === eventName);
    baseTime = addMinutes(baseTime, randomInt(1, 15));
    events.push({
      id: generateId(),
      eventName,
      eventLabel: catalogItem?.eventLabel || eventName,
      timestamp: baseTime.toISOString(),
      category: EVENT_CATEGORY_MAP[eventName] || 'other',
    });
  }

  const extraEventCount = randomInt(2, 6);
  for (let i = 0; i < extraEventCount; i++) {
    const cat = pickRandom(EVENT_POOL);
    baseTime = addMinutes(baseTime, randomInt(1, 10));
    events.push({
      id: generateId(),
      eventName: cat.eventName,
      eventLabel: cat.eventLabel,
      timestamp: baseTime.toISOString(),
      category: EVENT_CATEGORY_MAP[cat.eventName] || 'other',
    });
  }

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const generateChurnedUsers = (
  funnelSteps: FunnelStep[],
  count = 50,
  targetStep?: number
): ChurnedUser[] => {
  const users: ChurnedUser[] = [];
  const funnelEvents = funnelSteps.map(s => s.eventName);

  for (let i = 0; i < count; i++) {
    const lastStepIdx = targetStep !== undefined ? targetStep : randomInt(0, funnelSteps.length - 2);
    const ch = subDays(new Date(), randomInt(0, 14));
    const chFinal = subMinutes(ch, randomInt(10, 120));
    const regDate = subYears(chFinal, randomBetween(0, 1));

    users.push({
      userId: 'U' + (100000 + randomInt(1000, 99999)).toString(),
      userProperties: {
        channel: pickRandom(CHANNELS).value,
        city: pickRandom(CITIES).value,
        registerDate: regDate.toISOString(),
        device: pickRandom(DEVICES).value,
        userLevel: pickRandom(USER_LEVELS).value,
      },
      lastStepId: funnelSteps[lastStepIdx].id,
      lastStepIndex: lastStepIdx,
      churnedAt: chFinal.toISOString(),
      behaviorPath: generateBehaviorPath(lastStepIdx, funnelEvents),
    });
  }

  return users.sort((a, b) => new Date(b.churnedAt).getTime() - new Date(a.churnedAt).getTime());
};

export const calculateFunnelResult = (
  funnel: Funnel,
  period: { start: string; end: string }
): FunnelResult => {
  const stepCount = funnel.steps.length;
  const steps: FunnelStepResult[] = [];

  const seed = period.start.length + funnel.id.length;
  const rand = (min: number, max: number) => {
    const x = Math.sin(seed + min * 0.7 + max * 1.3) * 10000;
    const r = x - Math.floor(x);
    return Math.floor(r * (max - min + 1)) + min;
  };

  let prevCount = 10000 + rand(5000, 30000);
  let firstCount = prevCount;

  for (let i = 0; i < stepCount; i++) {
    const step = funnel.steps[i];

    if (i === 0) {
      const c = 15000 + rand(8000, 40000);
      prevCount = c;
      firstCount = c;
      steps.push({
        stepId: step.id,
        stepName: step.name,
        userCount: c,
        conversionRate: 1,
        overallConversionRate: 1,
        dropOffCount: 0,
        dropOffRate: 0,
      });
    } else {
      const baseRate = 0.45 + (rand(5, 45) / 100);
      const decay = 1 - (i * 0.03);
      const conversionRate = Math.max(0.15, baseRate * decay);
      const currentCount = Math.floor(prevCount * conversionRate);
      const dropOffCount = prevCount - currentCount;

      steps.push({
        stepId: step.id,
        stepName: step.name,
        userCount: currentCount,
        conversionRate: conversionRate,
        overallConversionRate: currentCount / firstCount,
        dropOffCount,
        dropOffRate: dropOffCount / prevCount,
      });

      prevCount = currentCount;
    }
  }

  return {
    funnelId: funnel.id,
    period,
    steps,
    totalConversionRate: steps.length > 0 ? steps[steps.length - 1].userCount / steps[0].userCount : 0,
  };
};

export const calculateDimensionSplit = (
  funnel: Funnel,
  period: { start: string; end: string },
  dimension: UserDimensionOption
): DimensionSplit => {
  const splitGroups = dimension.values.slice(0, Math.min(6, dimension.values.length));

  return {
    dimension: dimension.field,
    dimensionLabel: dimension.label,
    groups: splitGroups.map((v, idx) => {
      const modifiedFunnel: Funnel = {
        ...funnel,
        id: funnel.id + '-' + v.value,
        steps: funnel.steps.map((s, si) => ({
          ...s,
          name: s.name,
        })),
      };

      const result = calculateFunnelResult(modifiedFunnel, {
        start: new Date(new Date(period.start).getTime() + idx * 3600000).toISOString(),
        end: new Date(new Date(period.end).getTime() + idx * 3600000).toISOString(),
      });

      const adjustFactor = 0.5 + (idx * 0.12) + ((idx % 3) * 0.05);
      result.steps.forEach(s => {
        s.userCount = Math.floor(s.userCount * adjustFactor);
      });
      result.steps.forEach((s, si) => {
        if (si === 0) return;
        const prev = result.steps[si - 1].userCount;
        s.conversionRate = prev > 0 ? s.userCount / prev : 0;
        s.dropOffCount = prev - s.userCount;
        s.dropOffRate = prev > 0 ? s.dropOffCount / prev : 0;
      });
      if (result.steps.length > 0) {
        const first = result.steps[0].userCount;
        const last = result.steps[result.steps.length - 1].userCount;
        result.totalConversionRate = first > 0 ? last / first : 0;
        result.steps.forEach(s => {
          s.overallConversionRate = first > 0 ? s.userCount / first : 0;
        });
      }

      return {
        value: v.value,
        result,
      };
    }),
  };
};

export const calculatePeriodCompare = (
  funnel: Funnel,
  periodA: { start: string; end: string; label: string },
  periodB: { start: string; end: string; label: string }
): PeriodCompare => {
  const resultA = calculateFunnelResult(funnel, periodA);
  const resultB = calculateFunnelResult(funnel, periodB);

  const variationSeed = periodB.start.length;
  resultB.steps.forEach((s, i) => {
    const varFactor = 0.9 + (((variationSeed + i * 13) % 25) / 100);
    s.userCount = Math.floor(s.userCount * varFactor);
  });

  resultB.steps.forEach((s, si) => {
    if (si === 0) return;
    const prev = resultB.steps[si - 1].userCount;
    s.conversionRate = prev > 0 ? s.userCount / prev : 0;
    s.dropOffCount = prev - s.userCount;
    s.dropOffRate = prev > 0 ? s.dropOffCount / prev : 0;
  });
  if (resultB.steps.length > 0) {
    const first = resultB.steps[0].userCount;
    const last = resultB.steps[resultB.steps.length - 1].userCount;
    resultB.totalConversionRate = first > 0 ? last / first : 0;
    resultB.steps.forEach(s => {
      s.overallConversionRate = first > 0 ? s.userCount / first : 0;
    });
  }

  const diff = resultA.steps.map((stepA, i) => {
    const stepB = resultB.steps[i];
    if (!stepB) {
      return { stepId: stepA.stepId, valueDiff: 0, rateDiff: 0, rateDiffPercent: 0 };
    }
    const valueDiff = stepB.userCount - stepA.userCount;
    const rateDiff = stepB.conversionRate - stepA.conversionRate;
    const rateDiffPercent = stepA.conversionRate > 0 ? (rateDiff / stepA.conversionRate) * 100 : 0;
    return {
      stepId: stepA.stepId,
      valueDiff,
      rateDiff,
      rateDiffPercent,
    };
  });

  return { periodA, periodB, resultA, resultB, diff };
};

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'r-001',
    title: '6月第2周转化周报',
    summary: '本周整体转化率环比提升8.2%，购物车环节流失率下降明显，移动端表现优于PC端',
    funnelId: 'f-reg-order',
    contentBlocks: [
      { id: 'b1', type: 'heading', level: 2, content: '核心指标概览' },
      {
        id: 'b2',
        type: 'metric-grid',
        metrics: [
          { label: '总访问用户', value: 128456, format: 'number', trend: 12.5 },
          { label: '注册转化率', value: 42.3, format: 'percent', trend: 5.8 },
          { label: '首单转化率', value: 18.7, format: 'percent', trend: -2.1 },
          { label: '平均客单价', value: 268.5, format: 'currency', trend: 3.4 },
        ],
      },
      { id: 'b3', type: 'heading', level: 2, content: '注册到首单转化漏斗' },
      { id: 'b4', type: 'funnel-chart', funnelId: 'f-reg-order' },
      { id: 'b5', type: 'heading', level: 3, content: '关键发现' },
      {
        id: 'b6',
        type: 'paragraph',
        content:
          '本周"完善资料"到"浏览商品"的转化率从56%提升至62%，主要得益于新推出的个性化推荐弹窗。但在"提交订单"环节转化率环比下降3.5个百分点，建议排查支付页面加载性能问题。',
      },
    ],
    createdAt: subDays(now, 1).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
    createdBy: '张运营',
    shareToken: 'sh-rpt-a1b2c3',
    isShared: true,
  },
  {
    id: 'r-002',
    title: '购物车流失专项分析',
    summary: '购物车整体弃置率约68%，运费过高和支付方式不便是主要原因，建议推出满减免邮活动',
    funnelId: 'f-cart-pay',
    contentBlocks: [
      { id: 'b1', type: 'heading', level: 2, content: '购物车转化分析' },
      { id: 'b2', type: 'funnel-chart', funnelId: 'f-cart-pay' },
      {
        id: 'b3',
        type: 'paragraph',
        content:
          '从购物车到支付的整体转化率为31.8%，其中从购物车页到结算页流失率最高，达到47%。通过流失用户行为分析发现，有38%的用户在查看运费后退单。',
      },
    ],
    createdAt: subDays(now, 5).toISOString(),
    updatedAt: subDays(now, 3).toISOString(),
    createdBy: '李产品',
    isShared: false,
  },
  {
    id: 'r-003',
    title: '5月用户激活月报',
    summary: '5月新用户7日留存率为38.2%，较4月提升4.5个百分点，抖音渠道增长贡献最大',
    funnelId: 'f-onboarding',
    contentBlocks: [
      { id: 'b1', type: 'heading', level: 2, content: '用户激活漏斗' },
      { id: 'b2', type: 'funnel-chart', funnelId: 'f-onboarding' },
      {
        id: 'b3',
        type: 'paragraph',
        content:
          '本月新用户激活率整体向好，特别是完善资料环节，通过简化表单字段从3步减少到1步，转化率提升了12个百分点。',
      },
    ],
    createdAt: subDays(now, 14).toISOString(),
    updatedAt: subDays(now, 12).toISOString(),
    createdBy: '王增长',
    shareToken: 'sh-rpt-x7y8z9',
    isShared: true,
  },
];

export const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'a-001',
    funnelId: 'f-reg-order',
    funnelName: '注册到首单转化漏斗',
    stepId: 'step-reg-pay',
    stepName: '支付成功',
    name: '最终转化率监控',
    thresholdType: 'relative',
    threshold: -10,
    checkInterval: 'daily',
    contacts: [
      { name: '张运营', email: 'zhangyy@example.com' },
      { name: '李产品', email: 'liprod@example.com' },
    ],
    isEnabled: true,
    lastTriggeredAt: subDays(now, 2).toISOString(),
    coolDownMinutes: 360,
    createdAt: subDays(now, 30).toISOString(),
  },
  {
    id: 'a-002',
    funnelId: 'f-cart-pay',
    funnelName: '购物车到支付漏斗',
    stepId: 'step-checkout-pay',
    stepName: '支付成功率',
    name: '支付环节转化率告警',
    thresholdType: 'absolute',
    threshold: 0.65,
    checkInterval: 'hourly',
    contacts: [
      { name: '技术负责人', email: 'techlead@example.com' },
    ],
    isEnabled: true,
    coolDownMinutes: 120,
    createdAt: subDays(now, 20).toISOString(),
  },
  {
    id: 'a-003',
    funnelId: 'f-reg-order',
    funnelName: '注册到首单转化漏斗',
    stepId: 'step-register',
    stepName: '完成注册',
    name: '注册转化率监控',
    thresholdType: 'relative',
    threshold: -5,
    checkInterval: 'daily',
    contacts: [
      { name: '增长团队', email: 'growth@example.com' },
    ],
    isEnabled: false,
    coolDownMinutes: 720,
    createdAt: subDays(now, 10).toISOString(),
  },
];

export const INITIAL_ALERT_HISTORY: AlertHistoryItem[] = [
  {
    id: 'h-001',
    ruleId: 'a-001',
    ruleName: '最终转化率监控',
    funnelName: '注册到首单转化漏斗',
    stepName: '支付成功',
    triggeredAt: subDays(now, 2).toISOString(),
    actualValue: 0.162,
    previousValue: 0.189,
    threshold: -10,
    thresholdType: 'relative',
    message: '支付成功率较前日下降14.3%，低于阈值10%，请立即排查原因',
    isRead: false,
    severity: 'critical',
  },
  {
    id: 'h-002',
    ruleId: 'a-002',
    ruleName: '支付环节转化率告警',
    funnelName: '购物车到支付漏斗',
    stepName: '支付成功率',
    triggeredAt: subDays(now, 4).toISOString(),
    actualValue: 0.623,
    previousValue: 0.681,
    threshold: 0.65,
    thresholdType: 'absolute',
    message: '支付环节转化率为62.3%，低于阈值65%，建议关注',
    isRead: true,
    severity: 'warning',
  },
  {
    id: 'h-003',
    ruleId: 'a-001',
    ruleName: '最终转化率监控',
    funnelName: '注册到首单转化漏斗',
    stepName: '支付成功',
    triggeredAt: subDays(now, 8).toISOString(),
    actualValue: 0.168,
    previousValue: 0.187,
    threshold: -10,
    thresholdType: 'relative',
    message: '支付成功率较前日下降10.2%，触发阈值',
    isRead: true,
    severity: 'warning',
  },
];

export const DASHBOARD_DATA: DashboardOverview = {
  activeUsers: 286451,
  activeUsersTrend: 8.4,
  totalConversions: 38291,
  totalConversionsTrend: 12.7,
  avgConversionRate: 0.213,
  avgConversionRateTrend: 3.9,
  activeAlerts: 3,
};

