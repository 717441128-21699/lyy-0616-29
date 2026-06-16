import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'card flex flex-col items-center justify-center px-8 py-16 text-center',
        className
      )}
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-50">
        <Icon className="h-10 w-10 text-neutral-400" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-800">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
