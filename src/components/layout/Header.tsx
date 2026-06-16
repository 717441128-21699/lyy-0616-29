import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import type { User as UserType, Notification } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  notifications?: Notification[];
  unreadCount?: number;
}

const roleLabels: Record<string, string> = {
  HR: '人力资源',
  IT: '信息技术',
  ADMIN: '行政管理',
  MANAGER: '部门经理',
  EMPLOYEE: '新员工',
};

export function Header({ user, onLogout, notifications = [], unreadCount = 0 }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}&backgroundColor=ffd5dc`;

  return (
    <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-40">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索员工、任务、文档..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative w-11 h-11 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-center transition-all group"
          >
            <Bell className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-danger-500 text-white text-xs font-bold flex items-center justify-center shadow-md animate-pulse-soft">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-card-hover border border-neutral-200 overflow-hidden animate-fade-in-up">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-semibold text-neutral-800">通知中心</h3>
                <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">
                  全部已读
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Bell className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-500">暂无新通知</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'px-5 py-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer',
                        !notif.read && 'bg-primary-50/50',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800">{notif.title}</p>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-neutral-400 mt-2">
                            {new Date(notif.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50">
                <button className="w-full text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
                  查看全部通知
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-primary flex items-center justify-center shadow-md">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }}
                />
              ) : null}
              {!user.avatar ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white hidden" />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{user.name}</p>
              <p className="text-xs text-neutral-500">{roleLabels[user.role] || user.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-card-hover border border-neutral-200 overflow-hidden animate-fade-in-up">
              <div className="px-5 py-4 border-b border-neutral-100 bg-gradient-to-br from-primary-50 to-accent-50">
                <p className="font-semibold text-neutral-800">{user.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
              </div>
              <div className="py-2">
                <button className="w-full px-5 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-400" />
                  个人设置
                </button>
              </div>
              <div className="border-t border-neutral-100 py-2">
                <button
                  onClick={onLogout}
                  className="w-full px-5 py-2.5 text-left text-sm text-danger-600 hover:bg-danger-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
