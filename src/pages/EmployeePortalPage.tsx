import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FileUser,
  ShieldCheck,
  Upload,
  ScrollText,
  ListTodo,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  UserCheck,
  Monitor,
  FileText,
  Sparkles,
  ClipboardCheck,
  XCircle,
} from 'lucide-react';
import { WelcomeBanner } from '@/components/employee/WelcomeBanner';
import { ProgressTimeline } from '@/components/employee/ProgressTimeline';
import StatusBadge from '@/components/shared/StatusBadge';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';

export default function EmployeePortalPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentProcessId, setCurrentProcessId, currentUser } = useUserStore();
  const {
    getOnboardingProcessById,
    getPersonalInfo,
    getAcknowledgementsForProcess,
    getDocumentsForProcess,
    getContractForProcess,
    getEvaluationForProcess,
    getUserById,
  } = useOnboardingStore();

  const processId = id || currentProcessId || '';

  useEffect(() => {
    if (processId && !currentProcessId) {
      setCurrentProcessId(processId);
    }
  }, [processId, currentProcessId, setCurrentProcessId]);

  const process = useMemo(() => getOnboardingProcessById(processId), [processId, getOnboardingProcessById]);
  const personalInfo = useMemo(() => getPersonalInfo(processId), [processId, getPersonalInfo]);
  const acks = useMemo(() => getAcknowledgementsForProcess(processId), [processId, getAcknowledgementsForProcess]);
  const docs = useMemo(() => getDocumentsForProcess(processId), [processId, getDocumentsForProcess]);
  const contract = useMemo(() => getContractForProcess(processId), [processId, getContractForProcess]);
  const evaluation = useMemo(() => getEvaluationForProcess(processId), [processId, getEvaluationForProcess]);

  const manager = process ? getUserById(process.managerId) : undefined;
  const itOwner = process ? getUserById(process.itOwnerId) : undefined;
  const adminOwner = process ? getUserById(process.adminOwnerId) : undefined;

  const personalInfoStatus = useMemo(() => {
    if (personalInfo?.isCompleted) return { status: 'done', label: '已完成', color: 'text-accent-600', bg: 'bg-accent-50 border-accent-200' };
    if (personalInfo?.fullName) return { status: 'progress', label: '进行中', color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200' };
    return { status: 'pending', label: '未开始', color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200' };
  }, [personalInfo]);

  const policyStatus = useMemo(() => {
    const count = acks.length;
    if (count >= 4) return { status: 'done', label: '已完成', color: 'text-accent-600', bg: 'bg-accent-50 border-accent-200' };
    if (count > 0) return { status: 'progress', label: `${count}/4`, color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200' };
    return { status: 'pending', label: '未开始', color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200' };
  }, [acks]);

  const documentStatus = useMemo(() => {
    const requiredTypes: Array<'ID_CARD_FRONT' | 'ID_CARD_BACK' | 'DIPLOMA' | 'PHOTO'> = ['ID_CARD_FRONT', 'ID_CARD_BACK', 'DIPLOMA', 'PHOTO'];
    const approvedCount = requiredTypes.filter((type) =>
      docs.some((d) => d.type === type && d.reviewStatus === 'APPROVED'),
    ).length;
    const rejectedCount = docs.filter((d) => d.reviewStatus === 'REJECTED').length;
    const pendingCount = requiredTypes.filter((type) =>
      docs.some((d) => d.type === type && d.reviewStatus === 'PENDING'),
    ).length;
    if (approvedCount >= 4) return { status: 'done', label: '已通过', color: 'text-accent-600', bg: 'bg-accent-50 border-accent-200' };
    if (rejectedCount > 0) return { status: 'rejected', label: `${rejectedCount}项驳回`, color: 'text-danger-600', bg: 'bg-danger-50 border-danger-200' };
    if (pendingCount > 0 || approvedCount > 0) return { status: 'progress', label: `审核中 ${approvedCount}/4`, color: 'text-warning-600', bg: 'bg-warning-50 border-warning-200' };
    return { status: 'pending', label: '未上传', color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200' };
  }, [docs]);

  const contractStatus = useMemo(() => {
    if (!contract) return { status: 'pending', label: '待生成', color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200' };
    if (contract.status === 'FULLY_SIGNED') return { status: 'done', label: '已签署', color: 'text-accent-600', bg: 'bg-accent-50 border-accent-200' };
    if (contract.employeeSignature) return { status: 'done', label: '已签署', color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200' };
    return { status: 'progress', label: '待签署', color: 'text-warning-600', bg: 'bg-warning-50 border-warning-200' };
  }, [contract]);

  const evaluationStatus = useMemo(() => {
    if (!process) return { status: 'pending', label: '未开始', color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200' };
    if (evaluation) {
      const labelConfig: Record<string, string> = { PASS: '已通过', EXTEND: '延长试用', FAIL: '未通过' };
      const colorConfig: Record<string, string> = {
        PASS: 'text-accent-600 bg-accent-50 border-accent-200',
        EXTEND: 'text-warning-600 bg-warning-50 border-warning-200',
        FAIL: 'text-danger-600 bg-danger-50 border-danger-200',
      };
      return {
        status: 'done',
        label: labelConfig[evaluation.suggestedResult] || '已评估',
        color: colorConfig[evaluation.suggestedResult] || 'text-primary-600 bg-primary-50 border-primary-200',
      };
    }
    if (process.status === 'PROBATION') return { status: 'pending', label: '试用中', color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200' };
    if (process.status === 'EVALUATION_PENDING') return { status: 'progress', label: '待评估', color: 'text-warning-600', bg: 'bg-warning-50 border-warning-200' };
    return { status: 'pending', label: '未开始', color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200' };
  }, [process, evaluation]);

  const quickActions = [
    {
      key: 'personal-info',
      icon: FileUser,
      title: '个人信息',
      desc: '填写基本信息、教育经历、紧急联系人',
      status: personalInfoStatus,
      path: `/employee/${processId}/personal-info`,
      gradient: 'from-primary-500 to-primary-600',
      iconBg: 'bg-primary-100 text-primary-600',
    },
    {
      key: 'policies',
      icon: ShieldCheck,
      title: '政策确认',
      desc: '阅读并确认公司各项规章制度',
      status: policyStatus,
      path: `/employee/${processId}/policies`,
      gradient: 'from-fuchsia-500 to-pink-500',
      iconBg: 'bg-fuchsia-100 text-fuchsia-600',
    },
    {
      key: 'documents',
      icon: documentStatus.status === 'rejected' ? XCircle : Upload,
      title: '材料上传',
      desc: documentStatus.status === 'rejected'
        ? '部分材料被驳回，请重新提交'
        : documentStatus.status === 'done'
          ? '所有材料审核已通过'
          : '上传身份证、学历证书、证件照等',
      status: documentStatus,
      path: `/employee/${processId}/documents`,
      gradient: documentStatus.status === 'rejected'
        ? 'from-danger-500 to-rose-500'
        : 'from-warning-500 to-orange-500',
      iconBg: documentStatus.status === 'rejected'
        ? 'bg-danger-100 text-danger-600'
        : documentStatus.status === 'done'
          ? 'bg-accent-100 text-accent-600'
          : 'bg-warning-100 text-warning-600',
    },
    {
      key: 'contract',
      icon: ScrollText,
      title: '合同签署',
      desc: '在线电子签署劳动合同',
      status: contractStatus,
      path: `/employee/${processId}/contract`,
      gradient: 'from-accent-500 to-teal-500',
      iconBg: 'bg-accent-100 text-accent-600',
    },
    {
      key: 'evaluation',
      icon: evaluation?.suggestedResult === 'FAIL' ? AlertCircle : ClipboardCheck,
      title: '转正评估',
      desc: evaluation ? '查看您的试用期评估结果' : process?.status === 'PROBATION' ? '试用期进行中，评估待提交' : '提交评估后可在此查看',
      status: evaluationStatus,
      path: `/employee/${processId}/evaluation`,
      gradient: evaluation?.suggestedResult === 'FAIL'
        ? 'from-danger-500 to-rose-500'
        : evaluation?.suggestedResult === 'EXTEND'
          ? 'from-warning-500 to-orange-500'
          : evaluation
            ? 'from-accent-500 to-teal-500'
            : 'from-violet-500 to-indigo-500',
      iconBg: evaluation?.suggestedResult === 'FAIL'
        ? 'bg-danger-100 text-danger-600'
        : evaluation?.suggestedResult === 'EXTEND'
          ? 'bg-warning-100 text-warning-600'
          : evaluation
            ? 'bg-accent-100 text-accent-600'
            : 'bg-violet-100 text-violet-600',
    },
    {
      key: 'progress',
      icon: ListTodo,
      title: '进度总览',
      desc: '查看完整入职流程进度',
      status: { status: 'progress', label: `${process?.overallProgress || 0}%`, color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200' },
      path: '#',
      gradient: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const contacts = [
    {
      role: 'HR 人力资源',
      user: { name: '林晓雯', email: 'hr@company.com', phone: '138-0000-0001', avatar: '林', color: 'bg-gradient-to-br from-rose-400 to-pink-500' },
      icon: UserCheck,
      iconColor: 'text-rose-500',
    },
    {
      role: '直属经理',
      user: manager
        ? { name: manager.name, email: manager.email, phone: manager.phone || '—', avatar: manager.name.slice(0, 1), color: 'bg-gradient-to-br from-blue-400 to-indigo-500' }
        : undefined,
      icon: Building2,
      iconColor: 'text-blue-500',
    },
    {
      role: 'IT 支持',
      user: itOwner
        ? { name: itOwner.name, email: itOwner.email, phone: itOwner.phone || '—', avatar: itOwner.name.slice(0, 1), color: 'bg-gradient-to-br from-indigo-400 to-violet-500' }
        : undefined,
      icon: Monitor,
      iconColor: 'text-indigo-500',
    },
    {
      role: '行政支持',
      user: adminOwner
        ? { name: adminOwner.name, email: adminOwner.email, phone: adminOwner.phone || '—', avatar: adminOwner.name.slice(0, 1), color: 'bg-gradient-to-br from-amber-400 to-orange-500' }
        : undefined,
      icon: FileText,
      iconColor: 'text-amber-500',
    },
  ];

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'done') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4" />;
    if (status === 'progress') return <Clock className="w-4 h-4 animate-pulse" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (!process) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-danger-50 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-danger-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">入职流程不存在</h2>
          <p className="text-neutral-500 mb-6">请检查链接是否正确，或联系HR获取有效的入职链接</p>
          <Link to="/login" className="btn-primary">
            返回登录
          </Link>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <WelcomeBanner process={process} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800">快速操作</h2>
              <p className="text-sm text-neutral-500">按步骤完成入职流程，点击卡片进入</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isClickable = action.path !== '#';
              return (
                <motion.button
                  key={action.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.06 }}
                  whileHover={isClickable ? { y: -4, scale: 1.02 } : {}}
                  whileTap={isClickable ? { scale: 0.98 } : {}}
                  onClick={() => isClickable && navigate(action.path)}
                  className={cn(
                    'group relative text-left p-5 rounded-2xl bg-white border border-neutral-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden',
                    isClickable && 'cursor-pointer',
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl -translate-y-1/2 translate-x-1/2 bg-gradient-to-br',
                      action.gradient,
                    )}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', action.iconBg)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                          action.status.bg,
                          action.status.color,
                        )}
                      >
                        <StatusIcon status={action.status.status} />
                        {action.status.label}
                      </div>
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-1.5 flex items-center gap-2">
                      {action.title}
                      {isClickable && (
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      )}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{action.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ProgressTimeline processId={processId} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800">关键联系人</h2>
              <p className="text-sm text-neutral-500">入职过程中有任何问题，请随时联系以下同事</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contacts.map((contact, index) => {
              const Icon = contact.icon;
              if (!contact.user) return null;
              return (
                <motion.div
                  key={contact.role}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="card p-5"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0',
                        contact.user.color,
                      )}
                    >
                      {contact.user.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className={cn('inline-flex items-center gap-1 text-xs font-medium mb-1', contact.iconColor)}>
                        <Icon className="w-3.5 h-3.5" />
                        {contact.role}
                      </div>
                      <h3 className="font-semibold text-neutral-800 truncate">{contact.user.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{contact.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="font-mono">{contact.user.phone}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </RoleBasedLayout>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
