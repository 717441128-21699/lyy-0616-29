import { useMemo } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  ClipboardCheck,
  ClipboardList,
  Home,
  FileUser,
  ShieldCheck,
  Upload,
  ScrollText,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  userRole: UserRole;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  HR: [
    { path: '/hr/dashboard', label: '仪表盘', icon: LayoutDashboard },
    { path: '/hr/new-onboarding', label: '新建入职', icon: UserPlus },
    { path: '/hr/employees', label: '员工列表', icon: Users },
  ],
  IT: [
    { path: '/tasks', label: '任务工作台', icon: ClipboardCheck },
  ],
  ADMIN: [
    { path: '/tasks', label: '任务工作台', icon: ClipboardCheck },
  ],
  MANAGER: [
    { path: '/tasks', label: '任务工作台', icon: ClipboardCheck },
    { path: '/manager/evaluations', label: '转正评估', icon: ClipboardList },
  ],
  EMPLOYEE: [
    { path: '/employee/home', label: '入职首页', icon: Home },
    { path: '/employee/personal-info', label: '个人信息', icon: FileUser },
    { path: '/employee/policies', label: '政策确认', icon: ShieldCheck },
    { path: '/employee/documents', label: '材料上传', icon: Upload },
    { path: '/employee/contract', label: '合同签署', icon: ScrollText },
  ],
};

export function Sidebar({ userRole, currentPath, onNavigate, onLogout }: SidebarProps) {
  const navItems = useMemo(() => roleNavItems[userRole] || [], [userRole]);

  return (
    <aside className="w-[260px] min-h-screen flex flex-col bg-gradient-to-b from-primary-900 to-primary-800 text-white shadow-xl">
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow-accent">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">星辰入职系统</h1>
            <p className="text-xs text-primary-200">Stellar Onboarding</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                isActive
                  ? 'bg-white text-primary-600 shadow-lg scale-[1.02]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-all',
                  isActive ? 'text-primary-600' : 'text-white/70 group-hover:text-white',
                )}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 text-white/70 group-hover:text-white transition-all" />
          <span className="font-medium text-sm">退出登录</span>
        </button>
      </div>
    </aside>
  );
}
