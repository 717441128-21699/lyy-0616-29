import { motion } from 'framer-motion';
import { Check, ClipboardList, FileCheck, Upload, ListTodo, Signature } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { formatDateTime } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface ProgressTimelineProps {
  processId: string;
}

type NodeKey = 'info' | 'policy' | 'document' | 'task' | 'contract';
type NodeStatus = 'completed' | 'in_progress' | 'pending';

interface TimelineNode {
  key: NodeKey;
  step: number;
  title: string;
  description: string;
  icon: typeof ClipboardList;
  status: NodeStatus;
  completedAt?: string;
}

export function ProgressTimeline({ processId }: ProgressTimelineProps) {
  const getPersonalInfo = useOnboardingStore((s) => s.getPersonalInfo);
  const getAcknowledgementsForProcess = useOnboardingStore((s) => s.getAcknowledgementsForProcess);
  const getDocumentsForProcess = useOnboardingStore((s) => s.getDocumentsForProcess);
  const getTasksForProcess = useOnboardingStore((s) => s.getTasksForProcess);
  const getContractForProcess = useOnboardingStore((s) => s.getContractForProcess);
  const acknowledgements = useOnboardingStore((s) => s.acknowledgements);
  const documents = useOnboardingStore((s) => s.documents);

  const personalInfo = getPersonalInfo(processId);
  const policyAcks = getAcknowledgementsForProcess(processId);
  const uploadedDocs = getDocumentsForProcess(processId);
  const tasks = getTasksForProcess(processId);
  const contract = getContractForProcess(processId);

  const infoCompleted = personalInfo?.isCompleted ?? false;
  const policyCompleted = policyAcks.length >= 4;
  const requiredDocTypes = ['ID_CARD_FRONT', 'ID_CARD_BACK', 'DIPLOMA', 'PHOTO'];
  const docsCompleted = requiredDocTypes.every((type) =>
    uploadedDocs.some((d) => d.type === type),
  );
  const tasksCompleted = tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');
  const contractCompleted = contract?.status === 'FULLY_SIGNED';

  const statuses: Record<NodeKey, boolean> = {
    info: infoCompleted,
    policy: policyCompleted,
    document: docsCompleted,
    task: tasksCompleted,
    contract: contractCompleted,
  };

  let currentNode: NodeKey | null = null;
  const nodeOrder: NodeKey[] = ['info', 'policy', 'document', 'task', 'contract'];
  for (const key of nodeOrder) {
    if (!statuses[key]) {
      currentNode = key;
      break;
    }
  }

  const findCompletedAt = (key: NodeKey): string | undefined => {
    switch (key) {
      case 'info':
        return personalInfo?.isCompleted ? personalInfo.processId ? undefined : undefined : undefined;
      case 'policy':
        if (policyCompleted && policyAcks.length > 0) {
          const sorted = [...policyAcks].sort(
            (a, b) => new Date(b.acknowledgedAt).getTime() - new Date(a.acknowledgedAt).getTime(),
          );
          return sorted[0].acknowledgedAt;
        }
        return undefined;
      case 'document':
        if (docsCompleted && uploadedDocs.length > 0) {
          const sorted = [...uploadedDocs].sort(
            (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
          );
          return sorted[0].uploadDate;
        }
        return undefined;
      case 'task':
        if (tasksCompleted) {
          const sorted = [...tasks]
            .filter((t) => t.completedAt)
            .sort(
              (a, b) =>
                new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime(),
            );
          return sorted[0]?.completedAt;
        }
        return undefined;
      case 'contract':
        return contract?.hrSignedAt;
      default:
        return undefined;
    }
  };

  const nodes: TimelineNode[] = [
    {
      key: 'info',
      step: 1,
      title: '信息收集',
      description: '填写个人基础信息、教育经历、紧急联系人',
      icon: ClipboardList,
      status: statuses.info ? 'completed' : currentNode === 'info' ? 'in_progress' : 'pending',
      completedAt: findCompletedAt('info'),
    },
    {
      key: 'policy',
      step: 2,
      title: '政策确认',
      description: '阅读并确认公司各项规章制度',
      icon: FileCheck,
      status: statuses.policy ? 'completed' : currentNode === 'policy' ? 'in_progress' : 'pending',
      completedAt: findCompletedAt('policy'),
    },
    {
      key: 'document',
      step: 3,
      title: '材料上传',
      description: '上传身份证、学历证书、证件照等材料',
      icon: Upload,
      status: statuses.document ? 'completed' : currentNode === 'document' ? 'in_progress' : 'pending',
      completedAt: findCompletedAt('document'),
    },
    {
      key: 'task',
      step: 4,
      title: '任务处理',
      description: 'HR、IT、行政、经理协同完成各项入职任务',
      icon: ListTodo,
      status: statuses.task ? 'completed' : currentNode === 'task' ? 'in_progress' : 'pending',
      completedAt: findCompletedAt('task'),
    },
    {
      key: 'contract',
      step: 5,
      title: '合同签署',
      description: '签署劳动合同，完成入职手续',
      icon: Signature,
      status: statuses.contract ? 'completed' : currentNode === 'contract' ? 'in_progress' : 'pending',
      completedAt: findCompletedAt('contract'),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
          <ListTodo className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-800">入职进度</h2>
          <p className="text-sm text-neutral-500">共5个阶段，逐步完成入职流程</p>
        </div>
      </div>

      <div className="relative pl-2 md:pl-4">
        <div className="absolute left-[22px] md:left-[30px] top-2 bottom-2 w-0.5 bg-neutral-200">
          <motion.div
            className="w-full bg-gradient-to-b from-primary-500 via-accent-400 to-accent-500 origin-top"
            initial={{ scaleY: 0 }}
            animate={{
              scaleY: nodes.filter((n) => n.status === 'completed').length / nodes.length,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="space-y-8">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative flex gap-4 md:gap-6"
              >
                <div className="relative z-10 flex-shrink-0">
                  {node.status === 'completed' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3 + index * 0.08,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-accent-500 shadow-glow-accent flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 md:w-6 md:h-6 text-white animate-checkmark" />
                    </motion.div>
                  ) : node.status === 'in_progress' ? (
                    <div className="relative w-11 h-11 md:w-12 md:h-12">
                      <div className="absolute inset-0 rounded-full bg-primary-500/25 animate-ping" />
                      <div className="relative w-full h-full rounded-full bg-primary-500 shadow-glow-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm md:text-base">{node.step}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
                      <span className="text-neutral-400 font-bold text-sm md:text-base">{node.step}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-1 pb-2">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3
                      className={cn(
                        'text-base md:text-lg font-semibold',
                        node.status === 'completed' && 'text-accent-700',
                        node.status === 'in_progress' && 'text-primary-700',
                        node.status === 'pending' && 'text-neutral-500',
                      )}
                    >
                      {node.title}
                    </h3>
                    {node.status === 'in_progress' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        进行中
                      </span>
                    )}
                    {node.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-50 text-accent-600 text-xs font-medium">
                        <Check className="w-3 h-3" />
                        已完成
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm mb-2',
                      node.status === 'pending' ? 'text-neutral-400' : 'text-neutral-500',
                    )}
                  >
                    {node.description}
                  </p>
                  {node.completedAt && (
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      完成时间：{formatDateTime(node.completedAt)}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
