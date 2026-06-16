import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Briefcase,
  Building2,
  CheckCircle2,
  Star,
  AlertTriangle,
  XCircle,
  ClipboardCheck,
  User,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Clock,
  FileCheck,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import EvaluationForm from '@/components/manager/EvaluationForm';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, probationDaysLeft, getEvaluationConfig } from '@/lib/dateUtils';
import type { OnboardingProcess, ProbationEvaluation } from '@/types';

export default function EvaluationPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useUserStore();
  const { getOnboardingProcessById, getEvaluationForProcess } = useOnboardingStore();

  const processId = id || '';
  const process = useMemo(() => getOnboardingProcessById(processId) as OnboardingProcess | undefined, [processId, getOnboardingProcessById]);
  const evaluation = useMemo(() => getEvaluationForProcess(processId) as ProbationEvaluation | undefined, [processId, getEvaluationForProcess]);
  const [submitted, setSubmitted] = useState(!!evaluation);

  useEffect(() => {
    if (evaluation) setSubmitted(true);
  }, [evaluation]);

  const managerId = currentUser?.id || '';
  const daysLeft = probationDaysLeft(process);
  const totalDays = process ? Math.max(
    (new Date(process.probationEndDate).getTime() - new Date(process.startDate).getTime()) / (1000 * 60 * 60 * 24),
    1,
  ) : 1;
  const passedDays = process ? totalDays - daysLeft : 0;
  const progressPercent = process ? Math.min(Math.max(Math.round((passedDays / totalDays) * 100), 0), 100) : 0;
  const isEmployeeView = currentUser?.role === 'EMPLOYEE' || managerId === process.employeeId;
  const isManagerView = currentUser?.role === 'MANAGER';
  const canEditEvaluation = !submitted && !isEmployeeView && isManagerView;

  const resultConfig = evaluation
    ? getEvaluationConfig(evaluation.suggestedResult)
    : null;

  const avgScore = evaluation
    ? Math.round((evaluation.workAbility + evaluation.teamCollaboration + evaluation.attendance + evaluation.learningAgility) / 4)
    : 0;

  const isUrgent = daysLeft <= 7;

  if (!process) {
    return (
      <RoleBasedLayout>
        <div className="max-w-4xl mx-auto">
          <div className="card p-12 md:p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-neutral-100 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 mb-2">未找到入职流程</h2>
            <p className="text-sm text-neutral-500 mb-6">请返回评估列表选择其他员工</p>
            <Link to="/manager/evaluations" className="btn-secondary !py-2.5 !px-5 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回评估列表
            </Link>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (progressPercent / 100) * circumference;

  const scoreDimensionConfig = [
    { key: 'workAbility', label: '工作能力', value: evaluation?.workAbility, icon: Star, color: 'from-primary-500 to-primary-600' },
    { key: 'teamCollaboration', label: '团队协作', value: evaluation?.teamCollaboration, icon: User, color: 'from-blue-500 to-indigo-500' },
    { key: 'attendance', label: '出勤情况', value: evaluation?.attendance, icon: CalendarDays, color: 'from-accent-500 to-teal-500' },
    { key: 'learningAgility', label: '学习能力', value: evaluation?.learningAgility, icon: ClipboardCheck, color: 'from-fuchsia-500 to-purple-500' },
  ];

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to={isEmployeeView ? `/employee/${processId}/portal` : '/manager/evaluations'}
            className="btn-secondary !py-2 !px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            {isEmployeeView ? '返回首页' : '返回列表'}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900 truncate">
                {isEmployeeView ? '我的转正评估' : '转正评估详情'}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                  submitted
                    ? 'bg-accent-50 text-accent-700'
                    : isUrgent
                    ? 'bg-rose-50 text-rose-700 animate-pulse-soft'
                    : 'bg-warning-50 text-warning-700',
                )}
              >
                {submitted ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> 已评估</>
                ) : isUrgent ? (
                  <><AlertTriangle className="w-3.5 h-3.5" /> 临近到期</>
                ) : (
                  <><CalendarDays className="w-3.5 h-3.5" /> 待评估</>
                )}
              </span>
            </div>
            <p className="text-sm text-neutral-500 truncate">
              {isEmployeeView
                ? '您的试用期评估结果与后续处理进度'
                : <>对 <span className="font-medium text-neutral-700">{process.employeeName}</span> 的试用期表现进行综合评估</>
              }
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden relative"
        >
          <div
            className={cn(
              'relative',
              isUrgent && !submitted
                ? 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500'
                : 'bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600',
            )}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/40 blur-3xl" />
              <div className="absolute -bottom-16 -left-10 w-60 h-60 rounded-full bg-white/20 blur-3xl" />
            </div>

            <div className="relative z-10 p-5 md:p-7 lg:p-8 text-white">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                <div className="relative shrink-0">
                  <div className="relative w-[120px] h-[120px] md:w-[136px] md:h-[136px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                      <circle
                        cx="56"
                        cy="56"
                        r="44"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="44"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        strokeDasharray={circumference}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
                        className="text-4xl md:text-5xl font-extrabold tabular-nums leading-none"
                      >
                        {progressPercent}
                      </motion.span>
                      <span className="text-[10px] md:text-xs opacity-85 mt-1">试用期进度</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-lg font-bold shadow-lg">
                          {process.employeeName.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-2xl md:text-3xl font-bold truncate">{process.employeeName}</h2>
                          <p className="text-sm md:text-base opacity-90">{process.position}</p>
                        </div>
                      </div>
                    </div>

                    {submitted && avgScore > 0 && (
                      <div className="text-center sm:text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur border border-white/20">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="text-3xl md:text-4xl font-bold tabular-nums leading-none">
                            {avgScore}
                          </span>
                          <span className="text-sm opacity-90">/100</span>
                        </div>
                        <p className="text-xs opacity-80 mt-1.5">综合得分</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 md:p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                      <div className="flex items-center gap-1.5 mb-1 opacity-90">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] md:text-xs">所属部门</span>
                      </div>
                      <p className="text-sm md:text-base font-semibold truncate">{process.department}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                      <div className="flex items-center gap-1.5 mb-1 opacity-90">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="text-[10px] md:text-xs">工作岗位</span>
                      </div>
                      <p className="text-sm md:text-base font-semibold truncate">{process.position}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                      <div className="flex items-center gap-1.5 mb-1 opacity-90">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span className="text-[10px] md:text-xs">入职日期</span>
                      </div>
                      <p className="text-sm md:text-base font-semibold">{formatDate(process.startDate)}</p>
                    </div>
                    <div
                      className={cn(
                        'p-3 md:p-4 rounded-2xl backdrop-blur border',
                        isUrgent && !submitted
                          ? 'bg-rose-950/40 border-rose-300/40'
                          : 'bg-white/10 border-white/15',
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1 opacity-90">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-[10px] md:text-xs">剩余天数</span>
                      </div>
                      <motion.p
                        key={daysLeft}
                        initial={{ scale: 1.15, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-lg md:text-xl font-extrabold tabular-nums"
                      >
                        {daysLeft > 0 ? `${daysLeft} 天` : '已到期'}
                      </motion.p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs md:text-sm opacity-90">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15">
                      试用到期：{formatDate(process.probationEndDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted && evaluation ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card p-5 md:p-6 lg:p-7 relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-accent-50 to-teal-50 blur-3xl opacity-70" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
                      className={cn(
                        'w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0',
                        evaluation.suggestedResult === 'PASS' && 'bg-gradient-to-br from-accent-400 to-teal-500',
                        evaluation.suggestedResult === 'EXTEND' && 'bg-gradient-to-br from-warning-400 to-orange-500',
                        evaluation.suggestedResult === 'FAIL' && 'bg-gradient-to-br from-danger-400 to-rose-500',
                      )}
                    >
                      {evaluation.suggestedResult === 'PASS' && <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-white" />}
                      {evaluation.suggestedResult === 'EXTEND' && <AlertTriangle className="w-7 h-7 md:w-8 md:h-8 text-white" />}
                      {evaluation.suggestedResult === 'FAIL' && <XCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl md:text-2xl font-bold text-neutral-900">
                          {resultConfig?.label}
                        </h3>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                            resultConfig?.className,
                          )}
                        >
                          <Sparkles className="w-3 h-3" />
                          评估结果
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        评估人：<span className="font-medium text-neutral-700">{currentUser?.name}</span>
                        <span className="mx-2 text-neutral-300">·</span>
                        评估时间：{evaluation.submittedAt ? formatDate(evaluation.submittedAt) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Link
                      to={isEmployeeView ? `/employee/${processId}/portal` : '/manager/evaluations'}
                      className="btn-secondary !py-2.5 !px-5 flex-1 md:flex-none justify-center"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {isEmployeeView ? '返回首页' : '返回列表'}
                    </Link>
                    {!isEmployeeView && (
                      <Link
                        to="/hr/dashboard"
                        className="btn-primary !py-2.5 !px-5 flex-1 md:flex-none justify-center"
                      >
                        查看全部进度
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-base md:text-lg font-bold text-neutral-800 mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary-500 to-indigo-500" />
                  各维度评分
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {scoreDimensionConfig.map((dim, idx) => {
                    const Icon = dim.icon;
                    const v = dim.value || 0;
                    return (
                      <motion.div
                        key={dim.key}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 + idx * 0.05 }}
                        className="card p-5 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br', dim.color)}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-800">{dim.label}</h4>
                              <p className="text-xs text-neutral-500 mt-0.5">维度评分</p>
                            </div>
                          </div>
                          <motion.span
                            key={v}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl md:text-4xl font-extrabold tabular-nums text-neutral-900"
                          >
                            {v}
                          </motion.span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${v}%` }}
                            transition={{ delay: 0.2 + idx * 0.05, duration: 0.9, ease: 'easeOut' }}
                            className={cn('h-full rounded-full bg-gradient-to-r', dim.color)}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-5 md:p-7"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-neutral-800">综合评语</h3>
                    <p className="text-xs text-neutral-500">经理评价与改进建议</p>
                  </div>
                </div>
                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-neutral-50/80 to-white border border-neutral-100">
                  <p className="text-sm md:text-base text-neutral-700 leading-8 whitespace-pre-wrap">
                    {evaluation.overallComment}
                  </p>
                </div>
              </motion.div>

              {evaluation.followUpStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="card p-5 md:p-7"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-neutral-800">后续处理进度</h3>
                      <p className="text-xs text-neutral-500">当前流转状态</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-neutral-200" />
                    <div className="space-y-6">
                      <div className="relative flex items-start gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0',
                          'bg-accent-100 text-accent-600',
                        )}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="pt-1.5">
                          <p className="text-sm font-semibold text-neutral-800">经理评估已提交</p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            建议结果：{resultConfig?.label} · {formatDate(evaluation.submittedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="relative flex items-start gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0',
                          evaluation.followUpStatus === 'PENDING_REVIEW'
                            ? 'bg-primary-100 text-primary-600 animate-pulse'
                            : 'bg-accent-100 text-accent-600',
                        )}>
                          {evaluation.followUpStatus === 'PENDING_REVIEW'
                            ? <Clock className="w-5 h-5" />
                            : <CheckCircle2 className="w-5 h-5" />
                          }
                        </div>
                        <div className="pt-1.5">
                          <p className="text-sm font-semibold text-neutral-800">HR 后续处理</p>
                          {evaluation.followUpStatus === 'PENDING_REVIEW' && (
                            <p className="text-xs text-primary-600 mt-0.5 font-medium">等待HR处理中...</p>
                          )}
                          {evaluation.followUpStatus === 'CONFIRMED' && evaluation.followUpData && (
                            <>
                              <p className="text-xs text-accent-600 mt-0.5 font-medium">已确认转正 ✓</p>
                              <p className="text-xs text-neutral-400 mt-0.5">确认时间：{formatDateTime(evaluation.followUpData.confirmedAt)}</p>
                            </>
                          )}
                          {evaluation.followUpStatus === 'EXTEND_SET' && evaluation.followUpData && (
                            <>
                              <p className="text-xs text-warning-600 mt-0.5 font-medium">试用期已延长</p>
                              <p className="text-xs text-neutral-500 mt-0.5">新结束日期：{formatDate(evaluation.followUpData.newProbationEndDate)}</p>
                              {evaluation.followUpData.improvementPlan && (
                                <div className="mt-2 p-3 rounded-lg bg-warning-50 border border-warning-100">
                                  <p className="text-xs text-warning-600 font-medium mb-1">改进计划</p>
                                  <p className="text-neutral-600 text-xs whitespace-pre-wrap">{evaluation.followUpData.improvementPlan}</p>
                                </div>
                              )}
                            </>
                          )}
                          {evaluation.followUpStatus === 'TERMINATION_RECORDED' && evaluation.followUpData && (
                            <>
                              <p className="text-xs text-danger-600 mt-0.5 font-medium">不通过处理已记录</p>
                              {evaluation.followUpData.terminationReason && (
                                <div className="mt-2 p-3 rounded-lg bg-danger-50 border border-danger-100">
                                  <p className="text-xs text-danger-600 font-medium mb-1">处理原因</p>
                                  <p className="text-neutral-600 text-xs whitespace-pre-wrap">{evaluation.followUpData.terminationReason}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <Link
                  to={isEmployeeView ? `/employee/${processId}/portal` : '/manager/evaluations'}
                  className="btn-secondary !py-2.5 !px-5 flex-1 md:flex-none justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {isEmployeeView ? '返回首页' : '返回列表'}
                </Link>
              </div>
            </motion.div>
          ) : isEmployeeView ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-8 md:p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-50 to-indigo-50 flex items-center justify-center">
                <ClipboardCheck className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">等待经理提交评估</h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
                您的直属经理将在试用期结束前完成转正评估。请持续关注工作表现，
                如有疑问可随时联系您的经理或 HR。
              </p>
              <Link
                to={`/employee/${processId}/portal`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回员工首页
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <EvaluationForm
                processId={processId}
                managerId={managerId}
                onSuccess={() => setSubmitted(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RoleBasedLayout>
  );
}
