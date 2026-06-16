import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  ListTodo,
  CheckCheck,
  Clock,
  Sparkles,
  Inbox,
  Calendar,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import TaskCategoryTabs from '@/components/tasks/TaskCategoryTabs';
import TaskCard from '@/components/tasks/TaskCard';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import type { TaskCategory, TaskStatus, OnboardingProcess } from '@/types';
import { cn } from '@/lib/utils';
import { isToday } from 'date-fns';

export default function TasksWorkspacePage() {
  const { currentUser } = useUserStore();
  const { getTasksForAssignee, updateTaskStatus, getOnboardingProcessById } = useOnboardingStore();

  const assigneeId = currentUser?.id || '';

  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState<TaskCategory | 'ALL'>(
    currentUser?.role === 'IT' ? 'IT' : currentUser?.role === 'ADMIN' ? 'ADMIN' : currentUser?.role === 'MANAGER' ? 'MANAGER' : 'ALL',
  );

  const allTasks = useMemo(() => getTasksForAssignee(assigneeId), [assigneeId, getTasksForAssignee]);

  const getEmployeeNameForTask = (processId: string): string => {
    const p = getOnboardingProcessById(processId) as OnboardingProcess | undefined;
    return p?.employeeName || '';
  };

  const counts = useMemo(() => {
    const base = { ALL: 0, IT: 0, ADMIN: 0, MANAGER: 0 };
    allTasks.forEach((t) => {
      base.ALL++;
      if (t.category === 'IT') base.IT++;
      if (t.category === 'ADMIN') base.ADMIN++;
      if (t.category === 'MANAGER') base.MANAGER++;
    });
    return base;
  }, [allTasks]);

  const statPending = allTasks.filter((t) => t.status !== 'COMPLETED').length;
  const statTodayDue = allTasks.filter((t) => {
    if (t.status === 'COMPLETED') return false;
    try {
      return isToday(new Date(t.dueDate));
    } catch {
      return false;
    }
  }).length;
  const statCompleted = allTasks.filter((t) => t.status === 'COMPLETED').length;

  const filteredTasks = useMemo(() => {
    let list = allTasks;
    if (activeCategory !== 'ALL') {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(kw) ||
          (t.description || '').toLowerCase().includes(kw) ||
          getEmployeeNameForTask(t.processId).toLowerCase().includes(kw),
      );
    }
    return list.sort((a, b) => {
      const rank: Record<TaskStatus, number> = { PENDING: 0, IN_PROGRESS: 1, OVERDUE: 2, COMPLETED: 3 };
      const sa = rank[a.status] ?? 9;
      const sb = rank[b.status] ?? 9;
      if (sa !== sb) return sa - sb;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [allTasks, activeCategory, searchKeyword]);

  const handleStatusChange = (taskId: string, status: TaskStatus, notes?: string) => {
    updateTaskStatus(taskId, status, assigneeId, notes);
  };

  useEffect(() => {
    if (currentUser && activeCategory === 'ALL') {
      if (currentUser.role === 'IT') setActiveCategory('IT');
      else if (currentUser.role === 'ADMIN') setActiveCategory('ADMIN');
      else if (currentUser.role === 'MANAGER') setActiveCategory('MANAGER');
    }
  }, [currentUser]);

  const roleLabel = {
    IT: 'IT支持中心',
    ADMIN: '行政办公室',
    MANAGER: '直属经理',
    HR: '人力资源',
    EMPLOYEE: '',
  }[currentUser?.role || 'HR'];

  const pendingTasks = filteredTasks.filter((t) => t.status !== 'COMPLETED');
  const completedTasks = filteredTasks.filter((t) => t.status === 'COMPLETED');

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 truncate">
                任务工作台
              </h1>
              {roleLabel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {roleLabel}
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-neutral-500">
              您好，<span className="font-medium text-neutral-700">{currentUser?.name}</span>。
              以下是分配给您的入职协助任务
            </p>
          </div>

          <div className="relative w-full md:w-72 lg:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索任务名称、员工姓名..."
              className="input-field !pl-10 !py-2.5"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4"
        >
          {[
            {
              label: '我的待办',
              value: statPending,
              icon: ListTodo,
              color: 'from-warning-400 to-orange-500',
              bg: 'from-warning-50 to-orange-50',
              ring: 'ring-warning-200/60',
            },
            {
              label: '今日到期',
              value: statTodayDue,
              icon: Calendar,
              color: 'from-primary-500 to-indigo-500',
              bg: 'from-primary-50 to-indigo-50',
              ring: 'ring-primary-200/60',
            },
            {
              label: '已完成',
              value: statCompleted,
              icon: CheckCheck,
              color: 'from-accent-400 to-teal-500',
              bg: 'from-accent-50 to-teal-50',
              ring: 'ring-accent-200/60',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ y: -3 }}
                className={cn(
                  'card p-4 md:p-5 relative overflow-hidden',
                  'bg-gradient-to-br',
                  card.bg,
                  'ring-1',
                  card.ring,
                )}
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/40 blur-2xl" />
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-neutral-500 mb-1.5">{card.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold text-neutral-900 tabular-nums">
                        {card.value}
                      </span>
                      <span className="text-xs text-neutral-400">项</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md',
                      'bg-gradient-to-br',
                      card.color,
                    )}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TaskCategoryTabs
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            counts={counts}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="card p-12 md:p-20 text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
                  <Inbox className="w-10 h-10 md:w-12 md:h-12 text-neutral-300" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-neutral-800 mb-2">
                  暂无匹配任务
                </h3>
                <p className="text-sm md:text-base text-neutral-500 max-w-sm mx-auto">
                  {searchKeyword ? '尝试更换搜索关键词查看更多结果' : '当前分类下暂无待处理任务'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {pendingTasks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="w-4 h-4 text-warning-600" />
                    <span className="text-sm font-semibold text-neutral-700">
                      待处理
                      <span className="ml-1.5 px-2 py-0.5 rounded-full bg-warning-100 text-warning-700 text-xs font-medium">
                        {pendingTasks.length}
                      </span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    {pendingTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {completedTasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-2 mt-2 border-t border-neutral-100"
                >
                  <div className="flex items-center gap-2 pt-1">
                    <CheckCheck className="w-4 h-4 text-accent-600" />
                    <span className="text-sm font-semibold text-neutral-700">
                      已完成
                      <span className="ml-1.5 px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 text-xs font-medium">
                        {completedTasks.length}
                      </span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    {completedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RoleBasedLayout>
  );
}
