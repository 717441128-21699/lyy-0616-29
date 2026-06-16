import type { OnboardingStatus } from '@/types';
import { getStatusConfig } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OnboardingStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span className={cn('badge', config.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}
