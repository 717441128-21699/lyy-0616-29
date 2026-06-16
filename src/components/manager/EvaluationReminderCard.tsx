import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, CalendarDays } from 'lucide-react';
import type { OnboardingProcess } from '@/types';
import { probationDaysLeft, formatDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface EvaluationReminderCardProps {
  process: OnboardingProcess;
  onEvaluate: () => void;
}

export default function EvaluationReminderCard({
  process,
  onEvaluate,
}: EvaluationReminderCardProps) {
  const daysLeft = probationDaysLeft(process);
  const isUrgent = daysLeft <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background:
          'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
        padding: '1px',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-6">
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-orange-400/15 blur-3xl"
        />

        <div className="relative z-10 flex items-center gap-6">
          <div className="relative shrink-0">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(245, 158, 11, 0.4)',
                  '0 0 0 12px rgba(245, 158, 11, 0)',
                  '0 0 0 0 rgba(245, 158, 11, 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={cn(
                'flex h-24 w-24 items-center justify-center rounded-2xl text-white font-bold shadow-lg',
                isUrgent
                  ? 'bg-gradient-to-br from-rose-500 to-orange-500'
                  : 'bg-gradient-to-br from-amber-500 to-orange-400',
              )}
            >
              <div className="text-center">
                <motion.div
                  key={daysLeft}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl leading-none"
                >
                  {Math.max(daysLeft, 0)}
                </motion.div>
                <div className="text-xs font-medium opacity-90 mt-1">
                  {daysLeft > 0 ? '天后到期' : '已到期'}
                </div>
              </div>
            </motion.div>
            {isUrgent && (
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-md"
              >
                <AlertTriangle className="h-4 w-4" />
              </motion.div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'badge',
                  isUrgent
                    ? 'bg-rose-100 text-rose-700 animate-pulse-soft'
                    : 'bg-amber-100 text-amber-700',
                )}
              >
                <CalendarDays className="h-3 w-3" />
                试用期即将结束
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 truncate">
              {process.employeeName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
              <span>{process.position}</span>
              <span className="text-neutral-300">·</span>
              <span>{process.department}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
              <span>
                入职日期：{formatDate(process.startDate)}
              </span>
              <span className="text-neutral-300">·</span>
              <span>
                试用到期：{formatDate(process.probationEndDate)}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEvaluate}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all',
                isUrgent
                  ? 'bg-gradient-to-br from-rose-500 to-orange-500 hover:shadow-xl hover:shadow-rose-200'
                  : 'bg-gradient-to-br from-amber-500 to-orange-400 hover:shadow-xl hover:shadow-amber-200',
              )}
            >
              立即评估
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
