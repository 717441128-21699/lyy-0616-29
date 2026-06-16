import type { TaskStatus } from '@/types';
import { getTaskStatusConfig } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export default function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = getTaskStatusConfig(status);

  return (
    <span className={cn('badge', config.className, className)}>
      {config.label}
    </span>
  );
}
