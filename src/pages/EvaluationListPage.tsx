import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowRight,
  CalendarDays,
  Inbox,
  Trophy,
  Star,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import EvaluationReminderCard from '@/components/manager/EvaluationReminderCard';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import type { OnboardingProcess } from '@/types';
import { cn } from '@/lib/utils';
import { probationDaysLeft, formatDate } from '@/lib/dateUtils';

export default function EvaluationListPage() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { getAllOnboardingProcesses, getEvaluationForProcess } = useOnboardingStore();

  const managerId = currentUser?.id || '';

  const allProcesses = useMemo(() => getAllOnboardingProcesses(), [getAllOnboardingProcesses]);

  const pendingEvaluations = useMemo(() => {
    return allProcesses
      .filter((p: OnboardingProcess) => p.managerId === managerId)
      .filter((p: OnboardingProcess) => {
        const ev = getEvaluationForProcess(p.id);
        if (ev) return false;
        const daysLeft = probationDaysLeft(p);
        return daysLeft <= 30 && p.status !== 'COMPLETED';
      })
      .sort((a: OnboardingProcess, b: OnboardingProcess) => probationDaysLeft(a) - probationDaysLeft(b));
  }, [allProcesses, managerId, getEvaluationForProcess]);

  const completedEvaluations = useMemo(() => {
    return allProcesses
      .filter((p: OnboardingProcess) => p.managerId === managerId)
      .filter((p: OnboardingProcess) => {
        const ev = getEvaluationForProcess(p.id);
        return !!ev;
      })
      .map((p: OnboardingProcess) => ({
        process: p,
        evaluation: getEvaluationForProcess(p.id),
      }))
      .sort((a, b) => {
        const at = a.evaluation?.submittedAt ? new Date(a.evaluation.submittedAt).getTime() : 0;
        const bt = b.evaluation?.submittedAt ? new Date(b.evaluation.submittedAt).getTime() : 0;
        return bt - at;
      });
  }, [allProcesses, managerId, getEvaluationForProcess]);

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 truncate">
                转正评估中心
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                <Users className="w-3.5 h-3.5" />
                团队管理
              </span>
            </div>
            <p className="text-sm md:text-base text-neutral-500">
              您好，<span className="font-medium text-neutral-700">{currentUser?.name}</span>。
              请及时完成团队成员的试用期转正评估
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-warning-50 to-orange-50 border border-warning-200/60">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
              <div>
                <p className="text-[10px] text-warning-600 leading-none">待评估</p>
                <p className="text-lg font-bold text-warning-700 tabular-nums leading-tight">
                  {pendingEvaluations.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-accent-50 to-teal-50 border border-accent-200/60">
              <Trophy className="w-5 h-5 text-accent-600" />
              <div>
                <p className="text-[10px] text-accent-600 leading-none">已完成</p>
                <p className="text-lg font-bold text-accent-700 tabular-nums leading-tight">
                  {completedEvaluations.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {pendingEvaluations.length > 0 ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-warning-500 to-orange-500" />
                <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                  待处理评估
                  <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-warning-100 text-warning-700 text-xs font-bold">
                    {pendingEvaluations.length}
                  </span>
                </h2>
              </div>

              <div className="space-y-3 md:space-y-4">
                {pendingEvaluations.map((process, idx) => (
                  <motion.div
                    key={process.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <EvaluationReminderCard
                      process={process}
                      onEvaluate={() => navigate(`/manager/evaluation/${process.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-pending"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-accent-50 via-teal-50/40 to-primary-50/40 border border-accent-100/60 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent-400/15 blur-2xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-400 to-teal-500 flex items-center justify-center shadow-xl shadow-accent-200"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <div className="text-center md:text-left flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-1">
                    太棒了！暂无待处理评估
                  </h3>
                  <p className="text-sm md:text-base text-neutral-500 max-w-lg">
                    您已完成所有团队成员的转正评估。请持续关注团队成员试用期结束日期，
                    提前做好评估准备工作。
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {completedEvaluations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 pt-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-accent-500 to-teal-500" />
                <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                  已完成评估
                  <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-accent-100 text-accent-700 text-xs font-bold">
                    {completedEvaluations.length}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {completedEvaluations.map(({ process, evaluation }, idx) => {
                  const resultConfig = {
                    PASS: { label: '已通过', color: 'accent', icon: CheckCircle2 },
                    EXTEND: { label: '延长试用', color: 'warning', icon: AlertTriangle },
                    FAIL: { label: '未通过', color: 'danger', icon: AlertTriangle },
                  }[evaluation?.suggestedResult || 'PASS'];
                  const ResultIcon = resultConfig.icon;
                  const avgScore = evaluation
                    ? Math.round((evaluation.workAbility + evaluation.teamCollaboration + evaluation.attendance + evaluation.learningAgility) / 4)
                    : 0;

                  return (
                    <motion.div
                      key={process.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ y: -4 }}
                      className="card p-5 cursor-pointer relative overflow-hidden group"
                      onClick={() => navigate(`/manager/evaluation/${process.id}`)}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-accent-50/50 to-primary-50/50 opacity-60 group-hover:opacity-90 transition-opacity -mr-10 -mt-10" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                              {process.employeeName.slice(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-neutral-900 truncate">{process.employeeName}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                                <span>{process.position}</span>
                              </div>
                            </div>
                          </div>
                          <motion.div
                            whileHover={{ x: 2 }}
                            className="w-8 h-8 rounded-xl bg-neutral-100 group-hover:bg-primary-100 flex items-center justify-center text-neutral-400 group-hover:text-primary-600 transition-colors flex-shrink-0"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                            <p className="text-[10px] text-neutral-400 mb-0.5">入职日期</p>
                            <p className="text-xs font-medium text-neutral-700">{formatDate(process.startDate)}</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                            <p className="text-[10px] text-neutral-400 mb-0.5">评估日期</p>
                            <p className="text-xs font-medium text-neutral-700">
                              {evaluation?.submittedAt ? formatDate(evaluation.submittedAt) : '—'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-neutral-50 to-white border border-neutral-100">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50">
                              <Star className="w-3 h-3 text-primary-600 fill-current" />
                              <span className="text-sm font-bold text-primary-700 tabular-nums">{avgScore}</span>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                              resultConfig.color === 'accent' && 'bg-accent-100 text-accent-700',
                              resultConfig.color === 'warning' && 'bg-warning-100 text-warning-700',
                              resultConfig.color === 'danger' && 'bg-danger-100 text-danger-700',
                            )}
                          >
                            <ResultIcon className="w-3 h-3" />
                            {resultConfig.label}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {pendingEvaluations.length === 0 && completedEvaluations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card p-12 md:p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
                <Inbox className="w-12 h-12 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">暂无评估记录</h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                您暂未负责管理的试用期员工。如有团队成员即将结束试用期，
                相关评估提醒会在此处显示。
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
