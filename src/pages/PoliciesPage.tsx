import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { PolicyList } from '@/components/employee/PolicyList';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useUserStore } from '@/store/useUserStore';
import { mockPolicies } from '@/data/mockPolicies';
import { cn } from '@/lib/utils';

export default function PoliciesPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentProcessId, setCurrentProcessId } = useUserStore();
  const { getAcknowledgementsForProcess, isPolicyAcknowledged } = useOnboardingStore();

  const processId = id || currentProcessId || '';

  useEffect(() => {
    if (processId && !currentProcessId) {
      setCurrentProcessId(processId);
    }
  }, [processId, currentProcessId, setCurrentProcessId]);

  const acknowledgedCount = useMemo(() => {
    return mockPolicies.filter((p) => isPolicyAcknowledged(processId, p.id)).length;
  }, [processId, isPolicyAcknowledged]);

  const allDone = acknowledgedCount >= mockPolicies.length;

  const progressPercent = Math.round((acknowledgedCount / mockPolicies.length) * 100);

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/employee/${processId}/portal`)}
            className="btn-secondary !py-2 !px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900 truncate">
                政策确认
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-600 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                已确认 {acknowledgedCount}/{mockPolicies.length}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              请仔细阅读并确认以下公司规章制度和政策文件
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-50 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-fuchsia-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">确认进度</h3>
                <p className="text-xs text-neutral-500">
                  共 {mockPolicies.length} 项政策文件
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-transparent tabular-nums">
                {progressPercent}%
              </div>
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full transition-all duration-500',
                allDone
                  ? 'bg-gradient-to-r from-accent-400 to-teal-400'
                  : 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
              )}
            />
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {mockPolicies.map((policy) => {
              const done = isPolicyAcknowledged(processId, policy.id);
              return (
                <div
                  key={policy.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    done
                      ? 'bg-accent-50 text-accent-700 border border-accent-100'
                      : 'bg-neutral-100 text-neutral-500',
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300" />
                  )}
                  {policy.title}
                </div>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!allDone ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1 }}
            >
              <PolicyList processId={processId} />
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div className="card p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent-400/15 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary-400/15 blur-3xl" />
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-accent-400 to-teal-500 shadow-2xl shadow-accent-200 mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
                    恭喜！所有政策已确认
                  </h2>
                  <p className="text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
                    您已成功确认所有 <span className="font-semibold text-accent-600">{mockPolicies.length}</span> 项公司政策文件。
                    请继续完成后续的材料上传步骤。
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to={`/employee/${processId}/portal`}
                      className="btn-secondary !py-3 !px-6 min-w-[160px] justify-center"
                    >
                      返回首页
                    </Link>
                    <Link
                      to={`/employee/${processId}/documents`}
                      className="btn-accent !py-3 !px-6 min-w-[180px] justify-center"
                    >
                      下一步：材料上传
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RoleBasedLayout>
  );
}
