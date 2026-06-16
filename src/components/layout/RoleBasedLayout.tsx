import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUserStore } from '@/store/useUserStore';
import type { Notification } from '@/types';

interface RoleBasedLayoutProps {
  children: ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { currentUser, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [currentUser, navigate, notifications]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar
        userRole={currentUser.role}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={currentUser}
          onLogout={handleLogout}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-8 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
