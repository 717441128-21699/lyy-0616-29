import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { OnboardingProcess, TaskCategory } from '@/types';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { formatDate, getStatusConfig, cnStatusBadge } from '@/lib/dateUtils';
import { calculateTasksProgress } from '@/lib/progressCalculator';
import { cn } from '@/lib/utils';

interface ProgressTableProps {
  processes: OnboardingProcess[];
  onViewDetail?: (processId: string) => void;
}

function ProgressBar({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-neutral-100', height)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={cn(
          'h-full rounded-full',
          value >= 100
            ? 'bg-gradient-accent'
            : value >= 60
            ? 'bg-gradient-primary'
            : value >= 30
            ? 'bg-warning-400'
            : 'bg-danger-400',
        )}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: OnboardingProcess['status'] }) {
  const config = getStatusConfig(status);
  return (
    <span className={cnStatusBadge(config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}

function MiniTaskProgress({ completed, total }: { completed: number; total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">
          {completed}/{total}
        </span>
        <span className="font-medium text-neutral-700">{percent}%</span>
      </div>
      <ProgressBar value={percent} size="sm" />
    </div>
  );
}

function CategoryTaskProgress({
  category,
  processId,
}: {
  category: TaskCategory;
  processId: string;
}) {
  const tasks = useOnboardingStore
    .getState()
    .getTasksForProcess(processId)
    .filter((t) => t.category === category);
  const { completed, total } = calculateTasksProgress(tasks);

  const colorMap: Record<TaskCategory, string> = {
    IT: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    ADMIN: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
    MANAGER: 'bg-blue-50 text-blue-700 border-blue-100',
    EMPLOYEE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  const labelMap: Record<TaskCategory, string> = {
    IT: 'IT',
    ADMIN: '行政',
    MANAGER: '经理',
    EMPLOYEE: '员工',
  };

  return (
    <div className={cn('rounded-xl border p-2.5', colorMap[category])}>
      <div className="mb-1.5 text-xs font-medium">{labelMap[category]}</div>
      <MiniTaskProgress completed={completed} total={total} />
    </div>
  );
}

export default function ProgressTable({ processes, onViewDetail }: ProgressTableProps) {
  if (processes.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
          <svg
            className="h-8 w-8 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-neutral-800">暂无入职流程</h3>
        <p className="text-sm text-neutral-500">点击"新建入职"开始添加新员工</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                员工信息
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-700">
                入职日期
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-700 w-48">
                总体进度
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-700">
                状态
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-700">
                IT任务
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-700">
                行政任务
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-700">
                经理任务
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process, index) => (
              <motion.tr
                key={process.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50 last:border-0"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white shadow-sm"
                      style={{
                        backgroundImage:
                          index % 3 === 0
                            ? 'linear-gradient(135deg, #0F4C81 0%, #2DD4A8 100%)'
                            : index % 3 === 1
                            ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
                            : 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                      }}
                    >
                      {process.employeeName.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-neutral-900">
                        {process.employeeName}
                      </div>
                      <div className="truncate text-sm text-neutral-500">
                        {process.department} · {process.position}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-600">
                  {formatDate(process.startDate)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <ProgressBar value={process.overallProgress} />
                    </div>
                    <span className="text-sm font-semibold text-neutral-800">
                      {process.overallProgress}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={process.status} />
                </td>
                <td className="px-4 py-4 w-40">
                  <CategoryTaskProgress category="IT" processId={process.id} />
                </td>
                <td className="px-4 py-4 w-40">
                  <CategoryTaskProgress category="ADMIN" processId={process.id} />
                </td>
                <td className="px-4 py-4 w-40">
                  <CategoryTaskProgress category="MANAGER" processId={process.id} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetail?.(process.id)}
                    className="btn-secondary !px-3 !py-1.5 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    查看
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
