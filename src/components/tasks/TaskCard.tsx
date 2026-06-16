import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Check,
  CalendarDays,
  User,
  Save,
  StickyNote,
} from 'lucide-react';
import type { OnboardingTask, TaskStatus } from '@/types';
import {
  formatDate,
  formatDateTime,
  formatRelative,
  getTaskStatusConfig,
  getCategoryConfig,
  cnStatusBadge,
} from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: OnboardingTask;
  onStatusChange: (taskId: string, status: TaskStatus, notes?: string) => void;
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [isChecking, setIsChecking] = useState(false);

  const statusConfig = getTaskStatusConfig(task.status);
  const categoryConfig = getCategoryConfig(task.category);
  const isCompleted = task.status === 'COMPLETED';

  const handleToggleComplete = () => {
    if (isCompleted) return;
    setIsChecking(true);
    setTimeout(() => {
      onStatusChange(task.id, 'COMPLETED', notes || undefined);
      setIsChecking(false);
    }, 600);
  };

  const handleSaveNotes = () => {
    onStatusChange(task.id, task.status, notes);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'card overflow-hidden transition-all',
        isCompleted && 'opacity-75',
      )}
    >
      <div
        className="flex items-center gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="flex items-center gap-3 flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleComplete}
              disabled={isCompleted || isChecking}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all',
                isCompleted
                  ? 'border-accent-500 bg-accent-500'
                  : isChecking
                  ? 'border-accent-400 bg-accent-400'
                  : 'border-neutral-300 bg-white hover:border-primary-400',
              )}
            >
              {(isCompleted || isChecking) && (
                <motion.div
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <Check className="h-4 w-4 text-white stroke-[3]" />
                </motion.div>
              )}
            </motion.button>
            {isChecking && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-md bg-accent-400"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                'font-medium text-neutral-900 truncate',
                isCompleted && 'line-through text-neutral-500',
              )}
            >
              {task.title}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={cnStatusBadge(categoryConfig.className)}>
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', categoryConfig.iconBg)}
                />
                {categoryConfig.label}
              </span>
              <span className={cnStatusBadge(statusConfig.className)}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500">
            <CalendarDays className="h-4 w-4" />
            <span>{formatRelative(task.dueDate)}</span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-400">{formatDate(task.dueDate)}</span>
          </div>

          <motion.button
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 bg-neutral-50/50 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {task.description && (
                    <div>
                      <h5 className="mb-2 text-sm font-medium text-neutral-700">
                        任务描述
                      </h5>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="label-field flex items-center gap-1.5 mb-2">
                      <StickyNote className="h-4 w-4 text-neutral-400" />
                      备注
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="添加任务备注..."
                      rows={3}
                      className="input-field resize-none"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleSaveNotes}
                        className="btn-secondary !px-4 !py-2 text-sm"
                      >
                        <Save className="h-4 w-4" />
                        保存备注
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="mb-2 text-sm font-medium text-neutral-700">
                      责任人信息
                    </h5>
                    <div className="rounded-xl bg-white p-4 border border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white shadow-sm">
                          {task.assigneeName.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                            <User className="h-3.5 w-3.5 text-neutral-400" />
                            {task.assigneeName}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {categoryConfig.label}负责人
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {task.completedAt && (
                    <div>
                      <h5 className="mb-2 text-sm font-medium text-neutral-700">
                        完成信息
                      </h5>
                      <div className="rounded-xl bg-accent-50 p-4 border border-accent-100">
                        <div className="flex items-center gap-2 text-accent-700">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">已完成</span>
                        </div>
                        <p className="text-xs text-accent-600 mt-1">
                          {formatDateTime(task.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
