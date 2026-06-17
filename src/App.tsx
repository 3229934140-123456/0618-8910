import { Routes, Route, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/Dashboard';
import FunnelListPage from '@/pages/FunnelList';
import FunnelCreatePage from '@/pages/FunnelCreate';
import FunnelAnalysisPage from '@/pages/FunnelAnalysis';
import ChurnAnalysisPage from '@/pages/ChurnAnalysis';
import ReportListPage from '@/pages/ReportList';
import ReportDetailPage from '@/pages/ReportDetail';
import AlertCenterPage from '@/pages/AlertCenter';

const pageTitleMap: Record<string, { title: string; subtitle?: string }> = {
  '/': {
    title: '数据仪表盘',
    subtitle: '总览关键指标与预警信息，快速洞察业务健康状态',
  },
  '/funnels': {
    title: '漏斗分析',
    subtitle: '创建和管理转化漏斗，多维度分析用户行为路径',
  },
  '/funnels/new': {
    title: undefined as any,
  },
  '/reports': {
    title: '分析报告',
    subtitle: '创建、管理和分享分析报告，沉淀团队数据洞察',
  },
  '/alerts': {
    title: '监控预警中心',
    subtitle: '配置转化率监控规则，异常情况自动发送告警通知',
  },
};

function renderLayout() {
  const location = useLocation();
  const pathKey = Object.keys(pageTitleMap).find((k) => {
    if (k === '/') return location.pathname === '/';
    return location.pathname.startsWith(k);
  });
  const pageInfo = pathKey ? pageTitleMap[pathKey] : undefined;
  const hasSubRoute =
    location.pathname.includes('/funnels/') && location.pathname !== '/funnels/new' && location.pathname !== '/funnels';
  const title = pageInfo?.title;
  const subtitle = hasSubRoute ? undefined : pageInfo?.subtitle;

  return (
    <AppLayout title={title} subtitle={subtitle}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/funnels" element={<FunnelListPage />} />
        <Route path="/funnels/new" element={<FunnelCreatePage />} />
        <Route path="/funnels/:id" element={<FunnelAnalysisPage />} />
        <Route path="/funnels/:id/churn" element={<ChurnAnalysisPage />} />
        <Route path="/reports" element={<ReportListPage />} />
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="/alerts" element={<AlertCenterPage />} />
        <Route
          path="*"
          element={
            <div className="py-20 text-center max-w-lg mx-auto">
              <p className="font-display font-bold text-5xl text-navy-200 mb-3">404</p>
              <p className="font-display font-semibold text-xl text-navy-700 mb-1">
                页面不存在
              </p>
              <p className="text-sm text-navy-500">请检查您访问的地址是否正确</p>
            </div>
          }
        />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return renderLayout();
}
