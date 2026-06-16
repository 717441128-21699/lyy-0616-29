import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ColorVariant = 'primary' | 'accent' | 'warning' | 'danger';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down';
  color: ColorVariant;
}

const colorMap: Record<ColorVariant, { iconBg: string; glow: string; gradient: string }> = {
  primary: {
    iconBg: 'bg-primary-500',
    glow: 'shadow-glow-primary',
    gradient: 'from-primary-500/20 via-transparent to-transparent',
  },
  accent: {
    iconBg: 'bg-accent-500',
    glow: 'shadow-glow-accent',
    gradient: 'from-accent-500/20 via-transparent to-transparent',
  },
  warning: {
    iconBg: 'bg-warning-500',
    glow: '0 0 20px rgba(245, 158, 11, 0.35)',
    gradient: 'from-warning-500/20 via-transparent to-transparent',
  },
  danger: {
    iconBg: 'bg-danger-500',
    glow: '0 0 20px rgba(239, 68, 68, 0.35)',
    gradient: 'from-danger-500/20 via-transparent to-transparent',
  },
};

function AnimatedNumber({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') return;
    const duration = 1200;
    const startTime = performance.now();
    const startValue = 0;
    const endValue = value;

    let animationFrameId: number;
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + (endValue - startValue) * easeOutExpo);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  if (typeof value !== 'number') {
    return <span>{value}</span>;
  }
  return <span>{displayValue.toLocaleString()}</span>;
}

export default function StatsCard({ icon: Icon, title, value, delta, trend, color }: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('card-glass relative overflow-hidden p-6')}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            color === 'primary'
              ? 'radial-gradient(circle at top left, rgba(15, 76, 129, 0.18) 0%, transparent 60%)'
              : color === 'accent'
              ? 'radial-gradient(circle at top left, rgba(45, 212, 168, 0.18) 0%, transparent 60%)'
              : color === 'warning'
              ? 'radial-gradient(circle at top left, rgba(245, 158, 11, 0.18) 0%, transparent 60%)'
              : 'radial-gradient(circle at top left, rgba(239, 68, 68, 0.18) 0%, transparent 60%)',
        }}
        aria-hidden
      />
    <div className="relative z-10 flex items-start gap-4">
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg',
          colors.iconBg,
          color === 'primary' && 'shadow-glow-primary',
          color === 'accent' && 'shadow-glow-accent',
        )}
        style={{
          boxShadow:
            color === 'warning'
              ? '0 0 20px rgba(245, 158, 11, 0.35)'
              : color === 'danger'
              ? '0 0 20px rgba(239, 68, 68, 0.35)'
              : undefined,
        }}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <motion.p
          className="mt-1.5 text-3xl font-bold text-neutral-900"
          style={{ fontFamily: 'HarmonyOS Sans, system-ui, sans-serif' }}
        >
          <AnimatedNumber value={value} />
        </motion.p>
        {delta && (
          <div className="mt-2 flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-accent-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger-600" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                trend === 'up' ? 'text-accent-600' : 'text-danger-600',
              )}
            >
              {delta}
            </span>
            <span className="text-sm text-neutral-400">较上周</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);
}