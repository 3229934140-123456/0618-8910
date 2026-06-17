import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFunnelStore } from '@/store/funnelStore';
import {
  GitBranch,
  Plus,
  Search,
  Star,
  Clock,
  Filter,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Tabs } from '@/components/ui/Tabs';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/helpers';

type ViewMode = 'card' | 'list';
type FilterTab = 'all' | 'favorite' | 'mine';

const FunnelListPage: React.FC = () => {
  const navigate = useNavigate();
  const { funnels, toggleFavorite, getFunnelResult } = useFunnelStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    let result = [...funnels];
    if (filterTab === 'favorite') result = result.filter((f) => f.isFavorite);
    if (filterTab === 'mine') result = result.filter((f) => f.createdBy === '当前用户' || f.createdBy === '张运营');
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(kw) ||
          f.description.toLowerCase().includes(kw) ||
          f.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [funnels, search, filterTab]);

  return (
    <div className="space-y-5">
      <Card padding="md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
            <div className="flex-1 relative max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索漏斗名称、描述、标签..."
                className="w-full h-10 pl-10 pr-4 text-sm bg-navy-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:bg-white focus:border-navy-200 transition-all placeholder:text-navy-400"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Tabs
                tabs={[
                  { id: 'all', label: '全部' },
                  { id: 'favorite', label: '收藏', icon: <Star size={14} /> },
                  { id: 'mine', label: '我的' },
                ]}
                active={filterTab}
                onChange={(v) => setFilterTab(v as FilterTab)}
                variant="pills"
              />
              <div className="w-px h-7 bg-navy-100" />
              <div className="p-1 bg-navy-50 rounded-xl inline-flex">
                <button
                  onClick={() => setViewMode('card')}
                  className={cn(
                    'h-8 w-8 flex items-center justify-center rounded-lg transition-all',
                    viewMode === 'card'
                      ? 'bg-white text-navy-700 shadow-card'
                      : 'text-navy-400 hover:text-navy-600'
                  )}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'h-8 w-8 flex items-center justify-center rounded-lg transition-all',
                    viewMode === 'list'
                      ? 'bg-white text-navy-700 shadow-card'
                      : 'text-navy-400 hover:text-navy-600'
                  )}
                >
                  <ListIcon size={15} />
                </button>
              </div>
              <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/funnels/new')}>
                新建漏斗
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {filtered.length === 0 ? (
        <Card padding="lg">
          <div className="py-16 text-center">
            <GitBranch size={52} className="mx-auto text-navy-200 mb-4" />
            <p className="font-display font-semibold text-lg text-navy-700 mb-1">
              暂无漏斗
            </p>
            <p className="text-sm text-navy-500 mb-5">创建您的第一个转化漏斗，开始分析用户行为</p>
            <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/funnels/new')}>
              创建漏斗
            </Button>
          </div>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((f, i) => {
            const result = getFunnelResult(f.id);
            return (
              <Card
                key={f.id}
                hoverable
                padding="lg"
                onClick={() => navigate(`/funnels/${f.id}`)}
                className="relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 gradient-card-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display font-semibold text-lg text-navy-900 truncate">
                        {f.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(f.id);
                        }}
                        className="flex-shrink-0"
                      >
                        <Star
                          size={16}
                          className={cn(
                            'transition-all',
                            f.isFavorite
                              ? 'text-orange-500 fill-orange-500'
                              : 'text-navy-300 hover:text-orange-400'
                          )}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-navy-500 line-clamp-2">{f.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-navy-50 to-white border border-navy-100">
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">步骤</p>
                    <p className="font-display font-bold text-navy-700 mt-0.5 tabular">
                      {f.steps.length}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 uppercase tracking-wider">转化率</p>
                    <p className="font-display font-bold text-emerald-700 mt-0.5 tabular">
                      {(result.totalConversionRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-50 to-white border border-orange-100">
                    <p className="text-[10px] text-orange-500 uppercase tracking-wider">用户</p>
                    <p className="font-display font-bold text-orange-700 mt-0.5 tabular">
                      {result.steps[0]?.userCount?.toLocaleString()?.slice(0, 4) || '-'}K
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {f.tags.slice(0, 3).map((t) => (
                    <Tag key={t} variant="primary" size="sm">
                      {t}
                    </Tag>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-navy-100 text-xs">
                  <span className="text-navy-500">创建人 {f.createdBy}</span>
                  <div className="flex items-center gap-1 text-navy-400 tabular">
                    <Clock size={12} />
                    {formatDateTime(f.updatedAt).substring(5, 16)}
                  </div>
                </div>

                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-white shadow-elevation-1">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50/60">
                  <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                    漏斗名称
                  </th>
                  <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                    标签
                  </th>
                  <th className="text-right py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                    步骤
                  </th>
                  <th className="text-right py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                    转化率
                  </th>
                  <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                    创建人
                  </th>
                  <th className="text-left py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                    更新时间
                  </th>
                  <th className="text-right py-3.5 px-5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const result = getFunnelResult(f.id);
                  return (
                    <tr
                      key={f.id}
                      onClick={() => navigate(`/funnels/${f.id}`)}
                      className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(f.id);
                            }}
                          >
                            <Star
                              size={14}
                              className={cn(
                                f.isFavorite
                                  ? 'text-orange-500 fill-orange-500'
                                  : 'text-navy-300'
                              )}
                            />
                          </button>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy-900 truncate max-w-sm">
                              {f.name}
                            </p>
                            <p className="text-xs text-navy-500 truncate max-w-sm mt-0.5">
                              {f.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1">
                          {f.tags.slice(0, 2).map((t) => (
                            <Tag key={t} size="sm" variant="primary">
                              {t}
                            </Tag>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right tabular font-semibold text-navy-700">
                        {f.steps.length}
                      </td>
                      <td className="py-4 px-5 text-right tabular">
                        <Tag
                          variant={
                            result.totalConversionRate >= 0.2
                              ? 'success'
                              : result.totalConversionRate >= 0.1
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {(result.totalConversionRate * 100).toFixed(1)}%
                        </Tag>
                      </td>
                      <td className="py-4 px-5 text-navy-600">{f.createdBy}</td>
                      <td className="py-4 px-5 text-navy-500 tabular text-xs">
                        {formatDateTime(f.updatedAt).substring(5, 16)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <ChevronRight size={16} className="text-navy-300 ml-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FunnelListPage;
