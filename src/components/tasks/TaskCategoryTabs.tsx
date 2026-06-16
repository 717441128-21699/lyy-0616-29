import { motion } from 'framer-motion';
import { Monitor, FileText, Users, LayoutGrid } from 'lucide-react';
import type { TaskCategory } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCategoryTabsProps {
  activeCategory: TaskCategory | 'ALL';
  onChange: (category: TaskCategory | 'ALL') => void;
  counts?: {
    ALL: number;
    IT: number;
    ADMIN: number;
    MANAGER: number;
  };
}

const tabs: Array<{
  key: TaskCategory | 'ALL';
  label: string;
  icon: typeof Monitor;
  color: string;
  activeColor: string;
}> = [
  {
    key: 'ALL',
    label: '全部',
    icon: LayoutGrid,
    color: 'text-neutral-600 hover:text-neutral-800',
    activeColor: 'text-primary-600',
  },
  {
    key: 'IT',
    label: 'IT支持',
    icon: Monitor,
    color: 'text-indigo-600 hover:text-indigo-700',
    activeColor: 'text-indigo-600',
  },
  {
    key: 'ADMIN',
    label: '行政支持',
    icon: FileText,
    color: 'text-fuchsia-600 hover:text-fuchsia-700',
    activeColor: 'text-fuchsia-600',
  },
  {
    key: 'MANAGER',
    label: '直属经理',
    icon: Users,
    color: 'text-blue-600 hover:text-blue-700',
    activeColor: 'text-blue-600',
  },
];

const underlineColorMap: Record<string, string> = {
  ALL: 'bg-gradient-primary',
  IT: 'bg-indigo-500',
  ADMIN: 'bg-fuchsia-500',
  MANAGER: 'bg-blue-500',
};

export default function TaskCategoryTabs({
  activeCategory,
  onChange,
  counts = { ALL: 0, IT: 0, ADMIN: 0, MANAGER: 0 },
}: TaskCategoryTabsProps) {
  return (
    <div className="relative border-b border-neutral-200">
      <div className="flex items-center gap-1 -mb-px">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.key;
          const Icon = tab.icon;
          const count = counts[tab.key as keyof typeof counts] || 0;

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={cn(
                'group relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all',
                isActive ? tab.activeColor : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-transform group-hover:scale-110',
                  isActive && 'scale-110',
                )}
              />
              <span>{tab.label}</span>
              <motion.span
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                  isActive
                    ? cn(
                        tab.key === 'ALL' && 'bg-primary-100 text-primary-700',
                        tab.key === 'IT' && 'bg-indigo-100 text-indigo-700',
                        tab.key === 'ADMIN' && 'bg-fuchsia-100 text-fuchsia-700',
                        tab.key === 'MANAGER' && 'bg-blue-100 text-blue-700',
                      )
                    : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200',
                )}
              >
                {count}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="categoryTabUnderline"
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full',
                    underlineColorMap[tab.key],
                  )}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
