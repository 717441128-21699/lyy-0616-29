import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  showLabel = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const safeValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(safeValue);
    }, 50);
    return () => clearTimeout(timer);
  }, [safeValue]);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl bg-neutral-100',
          sizeMap[size]
        )}
      >
        <div
          className="h-full rounded-xl bg-gradient-primary transition-all duration-700 ease-out"
          style={{ width: `${displayValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 text-right text-xs font-medium text-neutral-500">
          {Math.round(displayValue)}%
        </div>
      )}
    </div>
  );
}
