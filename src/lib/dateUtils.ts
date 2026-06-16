import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays, parseISO, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import type {
  OnboardingProcess,
  OnboardingTask,
  OnboardingStatus,
  TaskStatus,
  TaskCategory,
  DocumentType,
  EvaluationResult,
} from '@/types';

export const formatDate = (dateStr: string | Date | undefined | null, pattern = 'yyyy-MM-dd'): string => {
  if (!dateStr) return '—';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (isNaN(d.getTime())) return '—';
    return format(d, pattern, { locale: zhCN });
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateStr: string | Date | undefined | null): string => {
  if (!dateStr) return '—';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (isNaN(d.getTime())) return '—';
    return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
  } catch {
    return '—';
  }
};

export const formatRelative = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (isNaN(d.getTime())) return '—';
    const diff = differenceInDays(d, new Date());
    if (diff === 0) return '今天';
    if (diff === 1) return '明天';
    if (diff === -1) return '昨天';
    if (diff > 0) return `${diff}天后`;
    return `${Math.abs(diff)}天前`;
  } catch {
    return '—';
  }
};

export const daysBetween = (from: string, to: string): number => {
  try {
    return differenceInDays(parseISO(to), parseISO(from));
  } catch {
    return 0;
  }
};

export const probationDaysLeft = (process_: OnboardingProcess): number => {
  try {
    return differenceInDays(parseISO(process_.probationEndDate), new Date());
  } catch {
    return 0;
  }
};

export const isProbationNearEnd = (process_: OnboardingProcess): boolean => {
  const days = probationDaysLeft(process_);
  return days <= 15 && days > 0;
};

export const isOverdue = (dueDate: string | undefined | null): boolean => {
  if (!dueDate) return false;
  try {
    return isBefore(parseISO(dueDate), new Date());
  } catch {
    return false;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getStatusConfig = (status: OnboardingStatus): { label: string; className: string; dotColor: string } => {
  const map: Record<OnboardingStatus, { label: string; className: string; dotColor: string }> = {
    CREATED: { label: '已创建', className: 'bg-neutral-100 text-neutral-700', dotColor: 'bg-neutral-500' },
    INFO_COLLECTING: { label: '信息收集中', className: 'bg-primary-50 text-primary-700', dotColor: 'bg-primary-500' },
    TASKS_IN_PROGRESS: { label: '任务进行中', className: 'bg-warning-50 text-warning-700', dotColor: 'bg-warning-500' },
    CONTRACT_PENDING: { label: '待签署合同', className: 'bg-accent-50 text-accent-700', dotColor: 'bg-accent-500' },
    PROBATION: { label: '试用期', className: 'bg-primary-100 text-primary-800', dotColor: 'bg-primary-600' },
    EVALUATION_PENDING: { label: '待转正评估', className: 'bg-warning-100 text-warning-800', dotColor: 'bg-warning-600 animate-pulse-soft' },
    COMPLETED: { label: '已完成入职', className: 'bg-accent-100 text-accent-800', dotColor: 'bg-accent-600' },
  };
  return map[status];
};

export const getTaskStatusConfig = (status: TaskStatus): { label: string; className: string } => {
  const map: Record<TaskStatus, { label: string; className: string }> = {
    PENDING: { label: '待开始', className: 'bg-neutral-100 text-neutral-600' },
    IN_PROGRESS: { label: '进行中', className: 'bg-primary-50 text-primary-700' },
    COMPLETED: { label: '已完成', className: 'bg-accent-50 text-accent-700' },
    OVERDUE: { label: '已逾期', className: 'bg-danger-50 text-danger-700' },
  };
  return map[status];
};

export const getCategoryConfig = (category: TaskCategory): { label: string; className: string; iconBg: string } => {
  const map: Record<TaskCategory, { label: string; className: string; iconBg: string }> = {
    IT: { label: 'IT支持', className: 'bg-[#EEF2FF] text-indigo-700', iconBg: 'bg-indigo-500' },
    ADMIN: { label: '行政支持', className: 'bg-[#FDF4FF] text-fuchsia-700', iconBg: 'bg-fuchsia-500' },
    MANAGER: { label: '直属经理', className: 'bg-[#EFF6FF] text-blue-700', iconBg: 'bg-blue-500' },
    EMPLOYEE: { label: '新员工', className: 'bg-[#ECFDF5] text-emerald-700', iconBg: 'bg-emerald-500' },
  };
  return map[category];
};

export const getDocumentTypeConfig = (type: DocumentType): { label: string; className: string; required: boolean } => {
  const map: Record<DocumentType, { label: string; className: string; required: boolean }> = {
    ID_CARD_FRONT: { label: '身份证正面', className: 'text-primary-700', required: true },
    ID_CARD_BACK: { label: '身份证背面', className: 'text-primary-700', required: true },
    DIPLOMA: { label: '学历证书', className: 'text-accent-700', required: true },
    PHOTO: { label: '一寸证件照', className: 'text-warning-700', required: true },
    OTHER: { label: '其他材料', className: 'text-neutral-600', required: false },
  };
  return map[type];
};

export const getEvaluationConfig = (result: EvaluationResult): { label: string; className: string } => {
  const map: Record<EvaluationResult, { label: string; className: string }> = {
    PASS: { label: '建议通过', className: 'bg-accent-100 text-accent-800' },
    EXTEND: { label: '延长试用期', className: 'bg-warning-100 text-warning-800' },
    FAIL: { label: '不予通过', className: 'bg-danger-100 text-danger-800' },
  };
  return map[result];
};

export const cnStatusBadge = (className: string) => cn('badge', className);

export { addDays };
