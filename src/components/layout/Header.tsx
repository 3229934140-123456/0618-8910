import React, { useState } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  Check,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useAlertStore } from '@/store/alertStore';
import { formatDateTime } from '@/utils/date';
import { Tag } from '@/components/ui/Tag';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, rightSlot }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { history, markHistoryRead, markAllRead, getUnreadCount } = useAlertStore();
  const unread = getUnreadCount();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-navy-100">
      <div className="flex items-center gap-6 h-16 px-6">
        <div className="flex-1 min-w-0">
          {title ? (
            <div className="flex flex-col">
              <h1 className="font-display font-semibold text-xl text-navy-900 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-navy-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          ) : (
            <div className="relative max-w-xl">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                placeholder="全局搜索：漏斗名称、报告、用户ID..."
                className="w-full h-10 pl-10 pr-4 text-sm bg-navy-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-200 focus:bg-white focus:border-navy-200 transition-all placeholder:text-navy-400"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rightSlot}

          <div className="h-8 w-px bg-navy-100 mx-2" />

          <div className="hidden md:flex items-center gap-2 px-3 h-9 bg-navy-50 rounded-xl">
            <Clock size={14} className="text-navy-500 flex-shrink-0" />
            <span className="text-xs text-navy-600 tabular font-medium">
              {formatDateTime(new Date()).substring(5, 16)}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setAlertOpen(!alertOpen);
                setProfileOpen(false);
              }}
              className={cn(
                'relative h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200',
                alertOpen
                  ? 'bg-navy-50 text-navy-800'
                  : 'text-navy-500 hover:bg-navy-50 hover:text-navy-700'
              )}
            >
              <Bell size={19} strokeWidth={1.75} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-bold text-white bg-orange-500 rounded-full animate-pulse-slow">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {alertOpen && (
              <div className="absolute right-0 top-full mt-2 w-[420px] max-h-[75vh] bg-white border border-navy-100 rounded-2xl shadow-elevation-2 overflow-hidden animate-slide-up z-50">
                <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-base text-navy-900">
                      预警通知
                    </h3>
                    {unread > 0 && (
                      <Tag variant="danger" rounded="full">
                        {unread} 条未读
                      </Tag>
                    )}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1"
                  >
                    <Check size={12} />
                    全部已读
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[60vh]">
                  {history.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <Bell size={40} className="mx-auto text-navy-300 mb-3" />
                      <p className="text-sm text-navy-500">暂无预警通知</p>
                    </div>
                  ) : (
                    history.slice(0, 20).map((h) => (
                      <button
                        key={h.id}
                        onClick={() => markHistoryRead(h.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-5 py-4 text-left border-b border-navy-50 transition-colors',
                          !h.isRead ? 'bg-orange-50/40 hover:bg-orange-50/60' : 'hover:bg-navy-50/40'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                            h.severity === 'critical' ? 'bg-red-100 text-danger-500' : 'bg-amber-100 text-warning-500'
                          )}
                        >
                          {h.severity === 'critical' ? (
                            <AlertCircle size={16} />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-navy-900 truncate">
                              {h.ruleName}
                            </p>
                            {!h.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-navy-600 mt-1 line-clamp-2">
                            {h.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-navy-400 flex items-center gap-1 tabular">
                              <Clock size={11} />
                              {formatDateTime(h.triggeredAt).substring(5, 16)}
                            </span>
                            <Tag variant={h.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                              {h.funnelName} · {h.stepName}
                            </Tag>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="px-5 py-3 border-t border-navy-100 bg-navy-50/40">
                  <a
                    href="#/alerts"
                    onClick={() => setAlertOpen(false)}
                    className="block text-center text-sm font-medium text-navy-700 hover:text-navy-900"
                  >
                    查看全部预警规则 →
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setAlertOpen(false);
              }}
              className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-xl hover:bg-navy-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg gradient-orange flex items-center justify-center text-white text-xs font-bold">
                运
              </div>
              <span className="hidden md:block text-sm font-medium text-navy-800">运营管理员</span>
              <ChevronDown size={14} className="text-navy-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-navy-100 rounded-2xl shadow-elevation-2 overflow-hidden animate-slide-up z-50">
                <div className="px-4 py-4 border-b border-navy-100">
                  <p className="font-semibold text-navy-900">运营管理员</p>
                  <p className="text-xs text-navy-500 mt-0.5">admin@funnelflow.io</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50 text-left">
                    <Calendar size={16} /> 个人设置
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50 text-left">
                    <Bell size={16} /> 通知偏好
                  </button>
                </div>
                <div className="border-t border-navy-100 py-1">
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 text-left">
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
