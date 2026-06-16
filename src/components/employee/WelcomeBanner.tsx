import { motion } from 'framer-motion';
import { Calendar, Building2, Briefcase } from 'lucide-react';
import type { OnboardingProcess } from '@/types';
import { formatDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface WelcomeBannerProps {
  process: OnboardingProcess;
}

export function WelcomeBanner({ process }: WelcomeBannerProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = process.overallProgress;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-gradient-primary shadow-card p-8 md:p-10 text-white"
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent-400/20 blur-xl" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/5 blur-md" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex-1 space-y-5">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
          >
            欢迎加入星辰科技，{process.employeeName}！
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-x-8 gap-y-3 text-white/90"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 opacity-80" />
              <span className="text-sm md:text-base">
                入职日期：<span className="font-medium text-white">{formatDate(process.startDate)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 opacity-80" />
              <span className="text-sm md:text-base">
                所属部门：<span className="font-medium text-white">{process.department}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 opacity-80" />
              <span className="text-sm md:text-base">
                担任岗位：<span className="font-medium text-white">{process.position}</span>
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20"
          >
            <span className="w-2 h-2 rounded-full bg-accent-300 animate-pulse-soft" />
            <span className="text-sm font-medium">入职流程进行中，期待与您携手前行</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25, type: 'spring', stiffness: 100 }}
          className="relative flex-shrink-0"
        >
          <svg className="w-36 h-36 md:w-40 md:h-40 -rotate-90" viewBox="0 0 140 140">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5EEAD4" />
                <stop offset="100%" stopColor="#2DD4A8" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="10"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="text-4xl md:text-5xl font-bold"
            >
              {progress}%
            </motion.span>
            <span className="text-xs md:text-sm text-white/70 mt-1">整体进度</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
