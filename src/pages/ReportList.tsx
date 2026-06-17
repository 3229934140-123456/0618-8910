import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReportStore, useFunnelStore } from '@/store';
import {
  FileBarChart,
  Plus,
  Search,
  Star,
  Share2,
  Clock,
  User,
  Eye,
  Download,
  Copy,
  Mail,
  ChevronRight,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/utils/date';
import { cn, generateId } from '@/utils/helpers';
import { motion } from 'framer-motion';

const ReportListPage: React.FC = () => {
  const navigate = useNavigate();
  const { reports, deleteReport, toggleShare, addReport } = useReportStore();
  const { funnels, getFunnelResult } = useFunnelStore();
  const [search, setSearch] = useState('');
  const [shareModal, setShareModal] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return reports;
    const kw = search.trim().toLowerCase();
    return reports.filter(
      (r) => r.title.toLowerCase().includes(kw) || r.summary.toLowerCase().includes(kw)
    );
  }, [reports, search]);

  const shareReport = reports.find((r) => r.id === shareModal);

  const handleQuickCreate = () => {
    const sampleFunnel = funnels[0];
    if (!sampleFunnel) return;
    const result = getFunnelResult(sampleFunnel.id);
    const newReport = addReport({
      title: '快速分析报告 - ' + formatDateTime(new Date()).substring(0, 10),
      summary: `基于「${sampleFunnel.name}」的自动生成分析报告，全链路转化率为 ${(result.totalConversionRate * 100).toFixed(2)}%`,
      funnelId: sampleFunnel.id,
      contentBlocks: [
        { id: generateId(), type: 'heading', level: 2, content: '核心指标概览' },
        {
          id: generateId(),
          type: 'metric-grid',
          metrics: [
            { label: '访问用户', value: result.steps[0]?.userCount || 0, format: 'number', trend: 5.2 },
            {
              label: '总转化率',
              value: result.totalConversionRate,
              format: 'percent',
              trend: 3.1,
            },
          ],
        },
        { id: generateId(), type: 'heading', level: 2, content: '漏斗分析' },
        { id: generateId(), type: 'funnel-chart', funnelId: sampleFunnel.id },
        {
          id: generateId(),
          type: 'paragraph',
          content:
            '本报告由系统自动生成，您可以在此基础上添加更多分析内容和个性化说明，然后分享给团队成员。',
        },
      ],
      isShared: false,
    });
    navigate(`/reports/${newReport.id}`);
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center gap-4"
      >
        <div className="flex-1 relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索报告标题、摘要..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-navy-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:bg-white focus:border-navy-200 transition-all placeholder:text-navy-400"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" leftIcon={<FileBarChart size={15} />} onClick={handleQuickCreate}>
            快速生成
          </Button>
          <Button leftIcon={<Plus size={15} />} onClick={handleQuickCreate}>
            创建报告
          </Button>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <Card padding="lg">
          <div className="py-16 text-center">
            <FileBarChart size={52} className="mx-auto text-navy-200 mb-4" />
            <p className="font-display font-semibold text-lg text-navy-700 mb-1">
              暂无分析报告
            </p>
            <p className="text-sm text-navy-500 mb-5">从漏斗分析页面创建报告，或使用快速生成模板</p>
            <Button leftIcon={<Plus size={16} />} onClick={handleQuickCreate}>
              创建第一个报告
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r, i) => {
            const funnel = r.funnelId ? useFunnelStore.getState().getFunnel(r.funnelId) : null;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Card
                  hoverable
                  padding="lg"
                  onClick={() => navigate(`/reports/${r.id}`)}
                  className="group h-full flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-orange-500 to-emerald-500 opacity-70" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl gradient-card-1 flex items-center justify-center text-white">
                        <FileBarChart size={17} />
                      </div>
                      {r.isShared && (
                        <Tag variant="success" size="sm" rounded="full">
                          已分享
                        </Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareModal(r.id);
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-colors"
                        title="分享"
                      >
                        <Share2 size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(r.id);
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-navy-400 hover:text-danger-600 hover:bg-red-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-navy-900 line-clamp-2 group-hover:text-navy-700 mb-2">
                    {r.title}
                  </h3>
                  <p className="text-sm text-navy-500 line-clamp-3 mb-4 flex-1">
                    {r.summary}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-navy-100 text-xs">
                    <div className="flex items-center gap-3 text-navy-500">
                      <span className="flex items-center gap-1">
                        <User size={11} /> {r.createdBy}
                      </span>
                      <span className="flex items-center gap-1 tabular">
                        <Clock size={11} />
                        {formatDateTime(r.updatedAt).substring(5, 16)}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-navy-300 group-hover:text-navy-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!shareModal}
        onClose={() => setShareModal(null)}
        title="分享报告"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShareModal(null)}>
              关闭
            </Button>
            <Button
              onClick={() => {
                if (shareModal) toggleShare(shareModal);
              }}
            >
              {shareReport?.isShared ? '取消分享' : '开启分享'}
            </Button>
          </>
        }
      >
        {shareReport && (
          <div className="space-y-5">
            <p className="text-sm text-navy-600">
              开启分享后，团队成员可以通过链接访问此报告（只读模式）
            </p>

            <div
              className={cn(
                'p-4 rounded-2xl border transition-all',
                shareReport.isShared
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-navy-50/60 border-navy-100'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                  分享状态
                </p>
                <Tag variant={shareReport.isShared ? 'success' : 'default'} size="sm" rounded="full">
                  {shareReport.isShared ? '已开启' : '未开启'}
                </Tag>
              </div>
              {shareReport.isShared && (
                <>
                  <p className="text-[11px] text-navy-500 mt-3 mb-1.5">分享链接</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 h-9 bg-white border border-navy-200 rounded-xl text-xs text-navy-600 tabular truncate">
                      <LinkIcon size={13} className="text-navy-400 flex-shrink-0" />
                      <span className="truncate">
                        https://app.funnelflow.io/s/{shareReport.shareToken}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Copy size={13} />}
                    >
                      复制
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                通过邮件发送给团队成员
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-navy-100">
                  <Mail size={14} className="text-navy-400" />
                  <span className="text-sm text-navy-700 flex-1">zhangyy@example.com</span>
                  <Tag variant="primary" size="sm">运营负责人</Tag>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-navy-100">
                  <Mail size={14} className="text-navy-400" />
                  <span className="text-sm text-navy-700 flex-1">liprod@example.com</span>
                  <Tag variant="violet" size="sm">产品经理</Tag>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full" leftIcon={<Mail size={14} />}>
                添加更多接收人
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除报告？"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteConfirm) deleteReport(deleteConfirm);
                setDeleteConfirm(null);
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-600">删除后无法恢复，如果报告已分享，所有链接将失效。</p>
      </Modal>
    </div>
  );
};

export default ReportListPage;
