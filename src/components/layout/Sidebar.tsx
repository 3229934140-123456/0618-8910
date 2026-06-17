import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  FileBarChart,
  BellRing,
  Users,
  TrendingUp,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useState } from 'react';
import { useAlertStore } from '@/store/alertStore';

const navItems = [
  { to: '/', label: '数据仪表盘', icon: LayoutDashboard, end: true },
  { to: '/funnels', label: '漏斗分析', icon: GitBranch },
  { to: '/reports', label: '分析报告', icon: FileBarChart },
  { to: '/alerts', label: '监控预警', icon: BellRing },
];

const bottomItems = [
  { to: '/users', label: '用户标签', icon: Users },
  { to: '/settings', label: '系统设置', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const unreadCount = useAlertStore((s) => s.getUnreadCount());
  const criticalCount = useAlertStore((s) => s.getCriticalCount());
  const [hoverExpand, setHoverExpand] = useState(false);
  const expanded = collapsed ? hoverExpand : true;

  const renderLink = (item: typeof navItems[0], end?: boolean) => {
    const isActive = end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);
    const Icon = item.icon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={end}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl transition-all duration-200',
          expanded ? 'px-3 h-10' : 'px-0 h-10 justify-center mx-2',
          isActive
            ? 'bg-gradient-to-r from-navy-700/90 to-navy-600/80 text-white shadow-elevation-1 shadow-navy-900/20'
            : 'text-navy-300 hover:text-white hover:bg-white/10'
        )}
      >
        <div className="relative flex-shrink-0">
          <Icon size={20} strokeWidth={1.75} />
          {item.label === '监控预警' && (unreadCount > 0 || criticalCount > 0) && (
            <span
              className={cn(
                'absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-[16px] text-[10px] font-bold rounded-full px-1',
                criticalCount > 0
                  ? 'bg-orange-500 text-white animate-pulse-slow'
                  : 'bg-orange-400 text-white'
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {expanded && (
          <span className="font-medium text-sm whitespace-nowrap transition-opacity duration-150">
            {item.label}
          </span>
        )}
        {isActive && expanded && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
        )}
      </NavLink>
    );
  };

  return (
    <aside
      onMouseEnter={() => collapsed && setHoverExpand(true)}
      onMouseLeave={() => collapsed && setHoverExpand(false)}
      className={cn(
        'flex flex-col h-full gradient-navy shadow-2xl transition-all duration-300 ease-out relative z-30',
        expanded ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/95 flex items-center justify-center shadow-elevation-1">
          <TrendingUp size={20} className="text-navy-700" strokeWidth={2.2} />
        </div>
        {expanded && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-white leading-tight">
              FunnelFlow
            </span>
            <span className="text-[10px] text-navy-200/80 tracking-wide">
              USER ANALYTICS
            </span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 py-3">
          <div className="relative group/search">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              type="text"
              placeholder="搜索漏斗、报告..."
              className="w-full h-9 pl-9 pr-3 text-sm bg-white/10 border border-white/10 text-white placeholder:text-navy-300/70 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1 px-2 py-3 overflow-y-auto">
        {expanded && (
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold tracking-widest text-navy-300/60 uppercase">
            核心功能
          </p>
        )}
        {navItems.map((item) => renderLink(item, item.end))}

        <div className={cn('mt-4', expanded ? '' : 'border-t border-white/10 mx-4')} />
        {expanded && (
          <p className="px-3 pb-2 pt-3 text-[10px] font-semibold tracking-widest text-navy-300/60 uppercase">
            其他
          </p>
        )}
        {bottomItems.map((item) => renderLink(item))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 h-9 px-2 rounded-lg text-navy-200 hover:text-white hover:bg-white/10 transition-colors"
          title={expanded ? '收起' : '展开'}
        >
          {expanded ? (
            <>
              <ChevronLeft size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium">收起菜单</span>
            </>
          ) : (
            <ChevronRight size={18} className="mx-auto" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
