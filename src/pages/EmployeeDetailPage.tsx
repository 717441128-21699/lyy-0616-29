import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Building2,
  Briefcase,
  FileUser,
  ShieldCheck,
  Upload,
  ScrollText,
  ClipboardList,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  FileCheck,
  Signature,
  Star,
  MessageSquare,
  Trash2,
  Eye,
  Save,
  AlertCircle,
  X,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import StatusBadge from '@/components/shared/StatusBadge';
import TaskCard from '@/components/tasks/TaskCard';
import { SignaturePad } from '@/components/employee/SignaturePad';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useUserStore } from '@/store/useUserStore';
import type { TaskStatus, TaskCategory, EvaluationResult } from '@/types';
import { cn } from '@/lib/utils';
import {
  formatDate,
  formatDateTime,
  getDocumentTypeConfig,
  getEvaluationConfig,
  formatFileSize,
  getCategoryConfig,
  probationDaysLeft,
} from '@/lib/dateUtils';
import { calculateTasksProgress } from '@/lib/progressCalculator';

type DetailTab = 'tasks' | 'info' | 'documents' | 'contract' | 'evaluation';

const tabConfig: Array<{
  key: DetailTab;
  label: string;
  icon: typeof ClipboardList;
}> = [
  { key: 'tasks', label: '入职任务', icon: ClipboardList },
  { key: 'info', label: '个人信息', icon: FileUser },
  { key: 'documents', label: '材料审核', icon: Upload },
  { key: 'contract', label: '合同管理', icon: ScrollText },
  { key: 'evaluation', label: '转正评估', icon: ClipboardCheck },
];

export default function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const processId = id || '';

  const {
    getOnboardingProcessById,
    getTasksForProcess,
    getPersonalInfo,
    getDocumentsForProcess,
    getContractForProcess,
    getEvaluationForProcess,
    updateTaskStatus,
    generateContract,
    hrSignContract,
    removeDocument,
    getUserById,
  } = useOnboardingStore();

  const currentUser = useUserStore((s) => s.currentUser);

  const [activeTab, setActiveTab] = useState<DetailTab>('tasks');
  const [hrSignature, setHrSignature] = useState<string | null>(null);

  const process = useMemo(() => getOnboardingProcessById(processId), [processId, getOnboardingProcessById]);
  const tasks = useMemo(() => getTasksForProcess(processId), [processId, getTasksForProcess]);
  const personalInfo = useMemo(() => getPersonalInfo(processId), [processId, getPersonalInfo]);
  const documents = useMemo(() => getDocumentsForProcess(processId), [processId, getDocumentsForProcess]);
  const contract = useMemo(() => getContractForProcess(processId), [processId, getContractForProcess]);
  const evaluation = useMemo(() => getEvaluationForProcess(processId), [processId, getEvaluationForProcess]);

  const manager = useMemo(
    () => (process ? getUserById(process.managerId) : undefined),
    [process, getUserById],
  );
  const itOwner = useMemo(
    () => (process ? getUserById(process.itOwnerId) : undefined),
    [process, getUserById],
  );
  const adminOwner = useMemo(
    () => (process ? getUserById(process.adminOwnerId) : undefined),
    [process, getUserById],
  );

  const tasksByCategory = useMemo(() => {
    const groups: Record<TaskCategory, typeof tasks> = {
      IT: [],
      ADMIN: [],
      MANAGER: [],
      EMPLOYEE: [],
    };
    tasks.forEach((t) => {
      groups[t.category].push(t);
    });
    return groups;
  }, [tasks]);

  const infoProgress = useMemo(() => {
    if (!personalInfo) return 0;
    const fields = [
      personalInfo.fullName,
      personalInfo.idNumber,
      personalInfo.phone,
      personalInfo.address,
      personalInfo.bankAccount,
      personalInfo.bankName,
    ];
    const filled = fields.filter(Boolean).length;
    const eduFilled = personalInfo.education.length > 0 ? 1 : 0;
    const contactFilled = personalInfo.emergencyContact.name ? 1 : 0;
    return Math.round(((filled + eduFilled + contactFilled) / (fields.length + 2)) * 100);
  }, [personalInfo]);

  const policyProgress = useMemo(() => {
    const acks = useOnboardingStore.getState().getAcknowledgementsForProcess(processId);
    return Math.round((acks.length / 4) * 100);
  }, [processId]);

  const documentProgress = useMemo(() => {
    const requiredTypes = ['ID_CARD_FRONT', 'ID_CARD_BACK', 'DIPLOMA', 'PHOTO'];
    const hasType = requiredTypes.filter((type) => documents.some((d) => d.type === type)).length;
    return Math.round((hasType / 4) * 100);
  }, [documents]);

  const tasksProgress = useMemo(() => {
    const { completed, total } = calculateTasksProgress(tasks);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [tasks]);

  const handleTaskStatusChange = (taskId: string, status: TaskStatus, notes?: string) => {
    updateTaskStatus(taskId, status, notes);
  };

  const handleHrSignContract = () => {
    if (hrSignature && currentUser) {
      hrSignContract(processId, hrSignature);
    }
  };

  const handleGenerateContract = () => {
    generateContract(processId);
  };

  useEffect(() => {
    if (contract?.hrSignature) {
      setHrSignature(contract.hrSignature);
    }
  }, [contract]);

  if (!process) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-danger-50 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-danger-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">未找到入职流程</h2>
          <p className="text-neutral-500 mb-6">流程ID不存在或已被删除</p>
          <button onClick={() => navigate('/hr/dashboard')} className="btn-primary">
            <ArrowLeft className="w-4 h-4" />
            返回仪表盘
          </button>
        </div>
      </RoleBasedLayout>
    );
  }

  const MiniMetricCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: typeof FileUser;
    label: string;
    value: number;
    color: 'primary' | 'accent' | 'warning' | 'danger';
  }) => {
    const colorClasses: Record<string, string> = {
      primary: 'bg-primary-50 text-primary-600',
      accent: 'bg-accent-50 text-accent-600',
      warning: 'bg-warning-50 text-warning-600',
      danger: 'bg-danger-50 text-danger-600',
    };
    const barColors: Record<string, string> = {
      primary: 'bg-gradient-primary',
      accent: 'bg-gradient-accent',
      warning: 'bg-warning-400',
      danger: 'bg-danger-400',
    };
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-neutral-800 tabular-nums">{value}%</span>
        </div>
        <p className="text-sm font-medium text-neutral-700 mb-2.5">{label}</p>
        <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn('h-full rounded-full', barColors[color])}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button onClick={() => navigate('/hr/dashboard')} className="btn-secondary !py-2 !px-3">
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900 truncate">
                员工入职详情
              </h1>
              <StatusBadge status={process.status} />
            </div>
            <p className="text-sm text-neutral-500">
              流程编号：<span className="font-mono">{process.id}</span> · 创建于{' '}
              {formatDate(process.createdAt)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card overflow-hidden"
        >
          <div className="relative h-28 md:h-32 bg-gradient-primary overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-2xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-accent-400/20 blur-xl" />
          </div>
          <div className="px-6 md:px-8 pb-6 md:pb-8 -mt-12 md:-mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-xl border-4 border-white">
                  {process.employeeName.slice(0, 1)}
                </div>
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                  {process.employeeName}
                </h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-neutral-400" />
                    {process.department}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-neutral-400" />
                    {process.position}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-neutral-400" />
                    入职 {formatDate(process.startDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    试用期剩余 {Math.max(probationDaysLeft(process), 0)} 天
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-center p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {process.overallProgress}%
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">入职总进度</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniMetricCard icon={FileUser} label="信息完成度" value={infoProgress} color="primary" />
          <MiniMetricCard icon={ShieldCheck} label="政策确认度" value={policyProgress} color="accent" />
          <MiniMetricCard icon={Upload} label="材料上传度" value={documentProgress} color="warning" />
          <MiniMetricCard icon={ClipboardList} label="任务完成度" value={tasksProgress} color="primary" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          <div className="border-b border-neutral-100 px-2 sm:px-4">
            <div className="flex overflow-x-auto -mb-px">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'relative flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-all',
                      isActive ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-700',
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive && 'text-primary-500')} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="detailTabUnderline"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-primary rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  {(['IT', 'ADMIN', 'MANAGER'] as TaskCategory[]).map((category) => {
                    const categoryTasks = tasksByCategory[category];
                    const config = getCategoryConfig(category);
                    const { completed, total } = calculateTasksProgress(categoryTasks);
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className={cn('badge', config.className)}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', config.iconBg)} />
                              {config.label}任务
                            </span>
                            <span className="text-sm text-neutral-500">
                              责任人：
                              {category === 'IT'
                                ? itOwner?.name
                                : category === 'ADMIN'
                                ? adminOwner?.name
                                : manager?.name || '未分配'}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-neutral-700">
                            {completed}/{total}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {categoryTasks.length > 0 ? (
                            categoryTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onStatusChange={handleTaskStatusChange}
                              />
                            ))
                          ) : (
                            <div className="card p-8 text-center text-neutral-500 text-sm">
                              暂无{config.label}任务
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="max-w-3xl space-y-6"
                >
                  {personalInfo?.isCompleted ? (
                    <div className="p-4 rounded-xl bg-accent-50 border border-accent-100 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent-600 flex-shrink-0" />
                      <p className="text-sm text-accent-700">
                        员工已提交个人信息，所有信息均为员工本人填写
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-warning-50 border border-warning-100 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-warning-600 flex-shrink-0" />
                      <p className="text-sm text-warning-700">员工尚未完成个人信息填写</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InfoRow label="姓名" value={personalInfo?.fullName} />
                    <InfoRow
                      label="性别"
                      value={personalInfo?.gender === 'MALE' ? '男' : personalInfo?.gender === 'FEMALE' ? '女' : '-'}
                    />
                    <InfoRow label="身份证号" value={personalInfo?.idNumber} sensitive />
                    <InfoRow label="出生日期" value={personalInfo?.birthDate} />
                    <InfoRow label="手机号" value={personalInfo?.phone} sensitive />
                    <InfoRow label="开户行" value={personalInfo?.bankName} />
                    <InfoRow label="银行卡号" value={personalInfo?.bankAccount} sensitive full />
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                      <FileUser className="w-5 h-5 text-primary-500" />
                      居住地址
                    </h3>
                    <div className="card p-4 text-sm text-neutral-700">
                      {personalInfo?.address || '—'}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-accent-500" />
                      教育经历
                    </h3>
                    {personalInfo?.education && personalInfo.education.length > 0 ? (
                      <div className="space-y-3">
                        {personalInfo.education.map((edu, idx) => (
                          <div key={idx} className="card p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <span className="font-semibold text-neutral-800">{edu.school}</span>
                              <span className="text-xs text-neutral-500">
                                {edu.startDate} ~ {edu.endDate}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                              <span>{edu.degree}</span>
                              <span className="text-neutral-300">·</span>
                              <span>{edu.major}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="card p-6 text-center text-neutral-500 text-sm">
                        暂无教育经历
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-warning-500" />
                      紧急联系人
                    </h3>
                    <div className="card p-4">
                      {personalInfo?.emergencyContact?.name ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-500 block mb-1">姓名</span>
                            <span className="font-medium text-neutral-800">
                              {personalInfo.emergencyContact.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block mb-1">关系</span>
                            <span className="font-medium text-neutral-800">
                              {personalInfo.emergencyContact.relationship}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block mb-1">电话</span>
                            <span className="font-medium text-neutral-800 font-mono">
                              {personalInfo.emergencyContact.phone}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-neutral-500 text-sm">暂无紧急联系人</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.length > 0 ? (
                      documents.map((doc) => {
                        const config = getDocumentTypeConfig(doc.type);
                        return (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-4 flex flex-col"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className={cn('badge', config.className)}>{config.label}</span>
                              {config.required ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 font-medium">
                                  必填
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-medium">
                                  可选
                                </span>
                              )}
                            </div>
                            <div className="flex-1 mb-4">
                              {doc.previewUrl ? (
                                <div className="w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100">
                                  <img
                                    src={doc.previewUrl}
                                    alt={doc.fileName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-32 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 flex items-center justify-center">
                                  <FileCheck className="w-10 h-10 text-neutral-300" />
                                </div>
                              )}
                            </div>
                            <div className="mb-3 min-h-0">
                              <p className="text-sm font-medium text-neutral-800 truncate">
                                {doc.fileName}
                              </p>
                              <div className="flex items-center justify-between mt-1 text-xs text-neutral-500">
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span>{formatDate(doc.uploadDate)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-neutral-100">
                              <button className="btn-secondary flex-1 !py-2 !px-3 text-xs">
                                <Eye className="w-3.5 h-3.5" />
                                预览
                              </button>
                              <button
                                onClick={() => removeDocument(doc.id)}
                                className="btn-secondary !py-2 !px-3 text-xs hover:!text-danger-600 hover:!border-danger-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="col-span-full card p-12 text-center text-neutral-500">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                        <p>员工暂未上传任何材料</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'contract' && (
                <motion.div
                  key="contract"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="max-w-3xl space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                        <ScrollText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800">劳动合同</h3>
                        <p className="text-xs text-neutral-500">{process.contractType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract?.status === 'FULLY_SIGNED' && (
                        <span className="badge bg-accent-100 text-accent-700">
                          <CheckCircle2 className="w-3 h-3" />
                          双方已签署
                        </span>
                      )}
                      {contract?.status === 'EMPLOYEE_SIGNED' && (
                        <span className="badge bg-primary-50 text-primary-700">
                          <Clock className="w-3 h-3" />
                          等待HR签署
                        </span>
                      )}
                      {contract?.status === 'GENERATED' && (
                        <span className="badge bg-warning-50 text-warning-700">
                          <Clock className="w-3 h-3" />
                          等待员工签署
                        </span>
                      )}
                    </div>
                  </div>

                  {!contract ? (
                    <div className="card p-10 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                        <ScrollText className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                        合同尚未生成
                      </h3>
                      <p className="text-sm text-neutral-500 mb-5 max-w-md mx-auto">
                        合同将在员工完成个人信息填写和材料上传后自动生成。
                        您也可以点击下方按钮手动生成。
                      </p>
                      <button onClick={handleGenerateContract} className="btn-primary">
                        <Signature className="w-4 h-4" />
                        立即生成合同
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative p-6 md:p-10 bg-white rounded-2xl shadow-lg border border-neutral-200"
                        style={{
                          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(220, 220, 220, 0.2) 28px)`,
                        }}
                      >
                        <div className="absolute top-4 right-4 text-6xl font-black text-neutral-100 select-none rotate-12">
                          COPY
                        </div>
                        <div className="text-center mb-8 border-b-2 border-neutral-200 pb-6">
                          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-wider mb-2">
                            劳动合同书
                          </h2>
                          <p className="text-sm text-neutral-500">
                            {process.contractType} · 编号：{contract.id}
                          </p>
                        </div>
                        <div className="space-y-3 text-sm md:text-base leading-7 text-neutral-700 font-serif">
                          <p>
                            甲方（用人单位）：<span className="font-semibold">星辰科技有限公司</span>
                          </p>
                          <p>
                            乙方（劳动者）：<span className="font-semibold">{process.employeeName}</span>
                          </p>
                          <p>
                            根据《中华人民共和国劳动法》、《中华人民共和国劳动合同法》等法律法规的规定，
                            甲乙双方本着平等自愿、协商一致的原则，签订本合同，共同遵守本合同所列条款。
                          </p>
                          <div className="space-y-2 mt-6">
                            <p>一、工作岗位与地点</p>
                            <p className="pl-6">
                              1.1 甲方安排乙方从事 <span className="font-semibold">{process.position}</span> 工作。
                            </p>
                            <p className="pl-6">1.2 工作部门：{process.department}。</p>
                          </div>
                          <div className="space-y-2 mt-4">
                            <p>二、合同期限</p>
                            <p className="pl-6">
                              2.1 本合同自 {formatDate(process.startDate)} 起生效，为期三年。
                            </p>
                            <p className="pl-6">
                              2.2 试用期三个月，自 {formatDate(process.startDate)} 至 {formatDate(process.probationEndDate)}。
                            </p>
                          </div>
                          <div className="space-y-2 mt-4">
                            <p>三、劳动报酬</p>
                            <p className="pl-6">
                              3.1 乙方月基本工资为税前人民币 {process.salary.toLocaleString()} 元整。
                            </p>
                          </div>
                          <p className="mt-6 text-neutral-500 text-xs text-center">
                            （合同正文仅展示摘要，完整条款请参阅正式合同文件）
                          </p>
                        </div>

                        {(contract.employeeSignature || contract.hrSignature) && (
                          <div className="mt-10 pt-8 border-t border-dashed border-neutral-200 grid grid-cols-2 gap-8">
                            <div className="text-center">
                              <p className="text-xs text-neutral-500 mb-3">乙方（员工）签署</p>
                              {contract.employeeSignature ? (
                                <div className="space-y-2">
                                  <div className="w-32 h-16 mx-auto border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center">
                                    <Signature className="w-8 h-8 text-accent-500" />
                                  </div>
                                  <p className="text-xs text-neutral-600">
                                    签署于 {contract.employeeSignedAt ? formatDate(contract.employeeSignedAt) : '-'}
                                  </p>
                                </div>
                              ) : (
                                <div className="w-32 h-16 mx-auto border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center text-neutral-300 text-xs">
                                  待签署
                                </div>
                              )}
                              <p className="mt-3 font-medium text-neutral-800">{process.employeeName}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-neutral-500 mb-3">甲方（HR）签署</p>
                              {contract.hrSignature ? (
                                <div className="space-y-2">
                                  <div className="w-32 h-16 mx-auto border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center">
                                    <Signature className="w-8 h-8 text-primary-500" />
                                  </div>
                                  <p className="text-xs text-neutral-600">
                                    签署于 {contract.hrSignedAt ? formatDate(contract.hrSignedAt) : '-'}
                                  </p>
                                </div>
                              ) : (
                                <div className="w-32 h-16 mx-auto border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center text-neutral-300 text-xs">
                                  待签署
                                </div>
                              )}
                              <p className="mt-3 font-medium text-neutral-800">
                                {currentUser?.name || 'HR'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {contract.status !== 'FULLY_SIGNED' && contract.employeeSignature && !contract.hrSignature && (
                        <div className="space-y-4">
                          <SignaturePad
                            onSave={(data) => setHrSignature(data)}
                            savedSignature={hrSignature || undefined}
                          />
                          <div className="flex justify-center">
                            <button
                              onClick={handleHrSignContract}
                              disabled={!hrSignature}
                              className="btn-primary !py-3 !px-8 min-w-[200px]"
                            >
                              <Signature className="w-5 h-5" />
                              确认HR签署
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'evaluation' && (
                <motion.div
                  key="evaluation"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="max-w-3xl"
                >
                  {evaluation ? (
                    <div className="space-y-6">
                      <div className="card overflow-hidden">
                        <div className="bg-gradient-primary px-6 py-5 text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                              <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">试用期评估结果</h3>
                              <p className="text-sm opacity-90 mt-0.5">
                                提交于 {evaluation.submittedAt ? formatDateTime(evaluation.submittedAt) : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-6 mb-6">
                            <div className="text-center p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                              <div className="text-4xl font-bold text-primary-600 tabular-nums">
                                {Math.round(
                                  (evaluation.workAbility +
                                    evaluation.teamCollaboration +
                                    evaluation.attendance +
                                    evaluation.learningAgility) /
                                    4,
                                )}
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">综合分</div>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                              <ScoreRow label="工作能力" value={evaluation.workAbility} />
                              <ScoreRow label="团队协作" value={evaluation.teamCollaboration} />
                              <ScoreRow label="出勤情况" value={evaluation.attendance} />
                              <ScoreRow label="学习能力" value={evaluation.learningAgility} />
                            </div>
                          </div>

                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-primary-500" />
                              综合评语
                            </h4>
                            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                              {evaluation.overallComment}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm text-neutral-600">评估结果：</span>
                            <span
                              className={cn(
                                'badge',
                                getEvaluationConfig(evaluation.suggestedResult).className,
                              )}
                            >
                              <Star className="w-3 h-3" />
                              {getEvaluationConfig(evaluation.suggestedResult).label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card p-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-neutral-100 flex items-center justify-center">
                        <Clock className="w-10 h-10 text-neutral-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                        尚未进行转正评估
                      </h3>
                      <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
                        试用期结束前，由直属经理 {manager?.name || '（未分配）'} 完成转正评估。
                      </p>
                      {process.status === 'EVALUATION_PENDING' && (
                        <Link to="/manager/evaluations" className="btn-primary">
                          <ClipboardCheck className="w-4 h-4" />
                          通知经理进行评估
                        </Link>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </RoleBasedLayout>
  );
}

function InfoRow({
  label,
  value,
  sensitive,
  full,
}: {
  label: string;
  value?: string;
  sensitive?: boolean;
  full?: boolean;
}) {
  return (
    <div className={cn('card p-4', full && 'md:col-span-2')}>
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="font-medium text-neutral-800 font-mono text-sm break-all">
        {value
          ? sensitive && value.length > 6
            ? value.slice(0, 4) + '****' + value.slice(-4)
            : value
          : '—'}
      </p>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const color =
    value >= 90 ? 'text-accent-600' : value >= 75 ? 'text-primary-600' : value >= 60 ? 'text-warning-600' : 'text-danger-600';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-neutral-500">{label}</span>
        <span className={cn('font-semibold text-sm tabular-nums', color)}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            value >= 90
              ? 'bg-accent-500'
              : value >= 75
              ? 'bg-primary-500'
              : value >= 60
              ? 'bg-warning-500'
              : 'bg-danger-500',
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function GraduationCap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
