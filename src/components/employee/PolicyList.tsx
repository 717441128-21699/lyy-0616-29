import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BookOpen,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { mockPolicies } from '@/data/mockPolicies';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { formatDateTime } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface PolicyListProps {
  processId: string;
}

export function PolicyList({ processId }: PolicyListProps) {
  const isPolicyAcknowledged = useOnboardingStore((s) => s.isPolicyAcknowledged);
  const acknowledgePolicy = useOnboardingStore((s) => s.acknowledgePolicy);
  const getAcknowledgementsForProcess = useOnboardingStore((s) => s.getAcknowledgementsForProcess);
  const acknowledgements = getAcknowledgementsForProcess(processId);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-lg font-bold text-neutral-800 mb-3 mt-4 first:mt-0">
            {trimmed.slice(2)}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-base font-semibold text-neutral-700 mb-2 mt-5 first:mt-0">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.match(/^\d+\.\s\*\*/)) {
        return (
          <p key={idx} className="text-sm text-neutral-600 leading-relaxed mb-2 pl-1">
            {trimmed.replace(/^\d+\.\s/, '')}
          </p>
        );
      }
      if (trimmed.match(/^\d+\.\s/)) {
        return (
          <p key={idx} className="text-sm text-neutral-600 leading-relaxed mb-2 pl-1">
            {trimmed}
          </p>
        );
      }
      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="text-sm text-neutral-600 leading-relaxed mb-1 ml-5 list-disc">
            {trimmed.slice(2)}
          </li>
        );
      }
      return (
        <p key={idx} className="text-sm text-neutral-600 leading-relaxed mb-2">
          {trimmed}
        </p>
      );
    });
  };

  const acknowledgedCount = mockPolicies.filter((p) =>
    isPolicyAcknowledged(processId, p.id),
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDF4FF] flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-fuchsia-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-800">政策文件</h2>
            <p className="text-sm text-neutral-500">
              已确认 {acknowledgedCount} / {mockPolicies.length} 项政策
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          请仔细阅读后确认
        </div>
      </div>

      <div className="space-y-4">
        {mockPolicies.map((policy, index) => {
          const acknowledged = isPolicyAcknowledged(processId, policy.id);
          const ack = acknowledgements.find((a) => a.policyId === policy.id);
          const isExpanded = expandedId === policy.id;

          return (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className={cn(
                'rounded-xl border transition-all overflow-hidden',
                acknowledged
                  ? 'border-accent-200 bg-accent-50/30'
                  : isExpanded
                    ? 'border-primary-300 bg-white shadow-card-hover'
                    : 'border-neutral-200 bg-white hover:border-primary-200 hover:shadow-sm',
              )}
            >
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3
                        className={cn(
                          'text-base md:text-lg font-semibold',
                          acknowledged ? 'text-accent-700' : 'text-neutral-800',
                        )}
                      >
                        {policy.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-xs font-medium">
                        {policy.version}
                      </span>
                      {acknowledged && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          已确认
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {policy.summary}
                    </p>
                    {acknowledged && ack && (
                      <p className="text-xs text-accent-600/80 mt-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        确认时间：{formatDateTime(ack.acknowledgedAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleExpand(policy.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all',
                        isExpanded
                          ? 'bg-primary-500 text-white shadow-glow-primary'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600',
                      )}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">{isExpanded ? '收起' : '查看详情'}</span>
                      <span className="sm:hidden">{isExpanded ? '收起' : '详情'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 border-t border-neutral-100">
                        <div className="max-h-80 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                          {renderContent(policy.content)}
                        </div>

                        {!acknowledged && (
                          <div className="mt-5 pt-5 border-t border-neutral-100">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => acknowledgePolicy(processId, policy.id)}
                              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold shadow-glow-accent transition-all"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              我已认真阅读并确认遵守以上规定
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!acknowledged && !isExpanded && (
                <div className="px-4 md:px-5 pb-4 -mt-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => acknowledgePolicy(processId, policy.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-50 text-accent-600 hover:bg-accent-100 text-sm font-medium border border-accent-200/60 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    确认已阅
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
