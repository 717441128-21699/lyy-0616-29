import { useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

interface RoleBasedLayoutProps {
  children: ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { currentUser, logout } = useUserStore();
  const { getNotificationsForUser, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead, checkEvaluationReminders } = useOnboardingStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    checkEvaluationReminders();
  }, [currentUser, navigate, checkEvaluationReminders]);

  const notifications = useMemo(() => {
    if (!currentUser) return [];
    return getNotificationsForUser(currentUser.id).slice(0, 10);
  }, [currentUser, getNotificationsForUser]);

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return getUnreadNotificationCount(currentUser.id);
  }, [currentUser, getUnreadNotificationCount]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllNotificationsRead(currentUser.id);
    }
  };

  const handleNotificationClick = (notifId: string) => {
    markNotificationRead(notifId);
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
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
        />
        <main className="flex-1 p-8 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
