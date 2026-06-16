import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  ScrollText,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Sparkles,
  Building2,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  ArrowRight,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import StatsCard from '@/components/hr/StatsCard';
import ProgressTable from '@/components/hr/ProgressTable';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import type { OnboardingStatus, EvaluationResult } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate, probationDaysLeft, getEvaluationConfig } from '@/lib/dateUtils';
import { addDays, startOfWeek, isAfter, parseISO } from 'date-fns';

const ALL_DEPARTMENTS = [
  '技术研发部',
  '产品设计部',
  '市场运营部',
  '销售部',
  '人力资源部',
  '财务部',
  '行政部',
  '客户服务部',
];

const STATUS_OPTIONS: Array<{ value: OnboardingStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '全部状态' },
  { value: 'CREATED', label: '已创建' },
  { value: 'INFO_COLLECTING', label: '信息收集中' },
  { value: 'TASKS_IN_PROGRESS', label: '任务进行中' },
  { value: 'CONTRACT_PENDING', label: '待签署合同' },
  { value: 'PROBATION', label: '试用期' },
  { value: 'EVALUATION_PENDING', label: '待转正评估' },
  { value: 'COMPLETED', label: '已完成' },
];

type DashboardTab = 'overview' | 'evaluations';
type EvalSubTab = 'pending' | 'archived';
type PendingEvalCategory = 'all' | 'confirm' | 'extend' | 'terminate';

const EVAL_ARCHIVE_OPTIONS: Array<{ value: 'ALL' | 'PASS' | 'EXTEND' | 'FAIL'; label: string; icon: typeof CheckCircle2; color: string }> = [
  { value: 'ALL', label: '全部归档', icon: ClipboardCheck, color: 'text-neutral-600' },
  { value: 'PASS', label: '已转正', icon: CheckCircle2, color: 'text-accent-600' },
  { value: 'EXTEND', label: '延期设置', icon: Clock, color: 'text-warning-600' },
  { value: 'FAIL', label: '不通过记录', icon: XCircle, color: 'text-danger-600' },
];

const PENDING_CATEGORY_OPTIONS: Array<{ value: PendingEvalCategory; label: string; icon: typeof CheckCircle2; color: string; matchResult?: 'PASS' | 'EXTEND' | 'FAIL' }> = [
  { value: 'all', label: '全部待处理', icon: ClipboardCheck, color: 'text-neutral-600' },
  { value: 'confirm', label: '待确认转正', icon: CheckCircle2, color: 'text-accent-600', matchResult: 'PASS' },
  { value: 'extend', label: '待设置延期', icon: Clock, color: 'text-warning-600', matchResult: 'EXTEND' },
  { value: 'terminate', label: '待记录不通过', icon: XCircle, color: 'text-danger-600', matchResult: 'FAIL' },
];

export default function HrDashboardPage() {
  const navigate = useNavigate();
  const { processes, getProcessesByStatus, evaluations, getEvaluationForProcess, getOnboardingProcessById } = useOnboardingStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [evalSubTab, setEvalSubTab] = useState<EvalSubTab>('pending');
  const [pendingCategory, setPendingCategory] = useState<PendingEvalCategory>('all');
  const [archiveFilter, setArchiveFilter] = useState<'ALL' | 'PASS' | 'EXTEND' | 'FAIL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | 'ALL'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const totalProcesses = processes.length;

  const weekNewCount = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return processes.filter((p) => isAfter(parseISO(p.createdAt), weekStart)).length;
  }, [processes]);

  const contractPendingCount = useMemo(
    () => getProcessesByStatus(['CONTRACT_PENDING']).length,
    [getProcessesByStatus],
  );

  const nearEndProbationCount = useMemo(() => {
    return processes.filter((p) => {
      if (p.status === 'COMPLETED') return false;
      const days = probationDaysLeft(p);
      return days > 0 && days <= 15 && (p.status === 'PROBATION' || p.status === 'EVALUATION_PENDING');
    }).length;
  }, [processes]);

  const probationTrackingCount = useMemo(() => {
    return processes.filter((p) => {
      if (p.status === 'COMPLETED') return false;
      const days = probationDaysLeft(p);
      return days > 15 && (p.status === 'PROBATION' || p.status === 'EVALUATION_PENDING');
    }).length;
  }, [processes]);

  const allEvaluations = useMemo(() => {
    return processes
      .map((p) => {
        const eval_ = getEvaluationForProcess(p.id);
        return { process: p, evaluation: eval_ };
      })
      .filter((item) => !!item.evaluation)
      .sort((a, b) =>
        new Date(b.evaluation!.submittedAt).getTime() - new Date(a.evaluation!.submittedAt).getTime(),
      );
  }, [processes, evaluations, getEvaluationForProcess]);

  const pendingEvaluations = useMemo(() => {
    let result = allEvaluations.filter(
      (item) => !item.evaluation?.followUpStatus || item.evaluation.followUpStatus === 'PENDING_REVIEW',
    );
    if (pendingCategory !== 'all') {
      const match = PENDING_CATEGORY_OPTIONS.find((c) => c.value === pendingCategory)?.matchResult;
      if (match) result = result.filter((item) => item.evaluation?.suggestedResult === match);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) =>
        item.process.employeeName.toLowerCase().includes(q) ||
        item.process.department.toLowerCase().includes(q) ||
        item.process.position.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allEvaluations, pendingCategory, searchQuery]);

  const archivedEvaluations = useMemo(() => {
    let result = allEvaluations.filter(
      (item) =>
        item.evaluation?.followUpStatus &&
        item.evaluation.followUpStatus !== 'PENDING_REVIEW',
    );
    if (archiveFilter !== 'ALL') {
      result = result.filter(
        (item) =>
          (archiveFilter === 'PASS' && item.evaluation?.followUpStatus === 'CONFIRMED') ||
          (archiveFilter === 'EXTEND' && item.evaluation?.followUpStatus === 'EXTEND_SET') ||
          (archiveFilter === 'FAIL' && item.evaluation?.followUpStatus === 'TERMINATION_RECORDED'),
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) =>
        item.process.employeeName.toLowerCase().includes(q) ||
        item.process.department.toLowerCase().includes(q) ||
        item.process.position.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allEvaluations, archiveFilter, searchQuery]);

  const pendingCounts = useMemo(() => ({
    all: pendingEvaluations.length,
    confirm: allEvaluations.filter((item) =>
      (!item.evaluation?.followUpStatus || item.evaluation.followUpStatus === 'PENDING_REVIEW') &&
      item.evaluation?.suggestedResult === 'PASS',
    ).length,
    extend: allEvaluations.filter((item) =>
      (!item.evaluation?.followUpStatus || item.evaluation.followUpStatus === 'PENDING_REVIEW') &&
      item.evaluation?.suggestedResult === 'EXTEND',
    ).length,
    terminate: allEvaluations.filter((item) =>
      (!item.evaluation?.followUpStatus || item.evaluation.followUpStatus === 'PENDING_REVIEW') &&
      item.evaluation?.suggestedResult === 'FAIL',
    ).length,
  }), [pendingEvaluations, allEvaluations]);

  const archiveCounts = useMemo(() => ({
    all: archivedEvaluations.length,
    pass: allEvaluations.filter((item) => item.evaluation?.followUpStatus === 'CONFIRMED').length,
    extend: allEvaluations.filter((item) => item.evaluation?.followUpStatus === 'EXTEND_SET').length,
    fail: allEvaluations.filter((item) => item.evaluation?.followUpStatus === 'TERMINATION_RECORDED').length,
  }), [archivedEvaluations, allEvaluations]);

  const filteredProcesses = useMemo(() => {
    let result = [...processes];
    if (statusFilter !== 'ALL') result = result.filter((p) => p.status === statusFilter);
    if (deptFilter !== 'ALL') result = result.filter((p) => p.department === deptFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.employeeName.toLowerCase().includes(q) ||
          p.employeeEmail.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [processes, statusFilter, deptFilter, searchQuery]);

  const departmentsInUse = useMemo(() => {
    const set = new Set(processes.map((p) => p.department));
    return Array.from(set);
  }, [processes]);

  const handleViewDetail = (processId: string) => {
    navigate(`/hr/employee/${processId}`);
  };

  const tabConfig = [
    { key: 'overview' as DashboardTab, label: '入职流程总览', icon: Users },
    { key: 'evaluations' as DashboardTab, label: '转正评估中心', icon: ClipboardCheck },
  ];

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">HR 仪表盘</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                总览
              </span>
            </div>
            <p className="text-neutral-500 text-sm">
              管理新员工入职流程，实时追踪各环节进度
            </p>
          </div>
          <button
            onClick={() => navigate('/hr/new-onboarding')}
            className="btn-primary !py-3 !px-6"
          >
            <UserPlus className="w-5 h-5" />
            新建入职流程
          </button>
        </motion.div>

        <div className="flex gap-2 border-b border-neutral-200">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
              >
                <StatsCard
                  icon={Users}
                  title="在途入职"
                  value={totalProcesses}
                  delta={`${totalProcesses > 0 ? totalProcesses : 0}位新员工`}
                  trend="up"
                  color="primary"
                />
                <StatsCard
                  icon={UserPlus}
                  title="本周新增"
                  value={weekNewCount}
                  delta={`较上周 ${weekNewCount > 0 ? '+' : ''}${weekNewCount}`}
                  trend={weekNewCount >= 0 ? 'up' : 'down'}
                  color="accent"
                />
                <StatsCard
                  icon={ScrollText}
                  title="待签合同"
                  value={contractPendingCount}
                  delta={contractPendingCount > 0 ? '需要跟进' : '暂无待办'}
                  trend="up"
                  color="primary"
                />
                <StatsCard
                  icon={AlertTriangle}
                  title="试用期预警"
                  value={nearEndProbationCount}
                  delta={nearEndProbationCount > 0 ? `${nearEndProbationCount}人即将到期` : '一切正常'}
                  trend={nearEndProbationCount > 0 ? 'down' : 'up'}
                  color="warning"
                />
              </motion.div>

              {probationTrackingCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-primary-50/60 via-indigo-50/40 to-accent-50/30 border border-primary-100/50 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4.5 h-4.5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700">
                      <span className="font-semibold text-primary-700">{probationTrackingCount}</span> 位员工正在试用期中（距结束超过15天），
                      可在「转正评估中心」查看全部记录
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('evaluations')}
                    className="btn-secondary !py-2 !px-4 text-xs flex-shrink-0"
                  >
                    查看评估中心
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-4 md:p-5"
              >
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="搜索员工姓名、邮箱、岗位或流程ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-12"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <button
                        onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowDeptDropdown(false); }}
                        className="btn-secondary !py-2.5 !px-4 min-w-[140px] justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          <span className="text-sm">
                            {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                          </span>
                        </div>
                        <ChevronDown className={cn('w-4 h-4 transition-transform', showStatusDropdown && 'rotate-180')} />
                      </button>
                      {showStatusDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-20 top-full mt-2 right-0 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 overflow-hidden"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => { setStatusFilter(opt.value); setShowStatusDropdown(false); }}
                              className={cn(
                                'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between',
                                statusFilter === opt.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50',
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => { setShowDeptDropdown(!showDeptDropdown); setShowStatusDropdown(false); }}
                        className="btn-secondary !py-2.5 !px-4 min-w-[140px] justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm truncate max-w-[80px]">
                            {deptFilter === 'ALL' ? '全部部门' : deptFilter}
                          </span>
                        </div>
                        <ChevronDown className={cn('w-4 h-4 transition-transform', showDeptDropdown && 'rotate-180')} />
                      </button>
                      {showDeptDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-20 top-full mt-2 right-0 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 overflow-hidden max-h-72 overflow-y-auto"
                        >
                          <button
                            onClick={() => { setDeptFilter('ALL'); setShowDeptDropdown(false); }}
                            className={cn(
                              'w-full px-4 py-2.5 text-left text-sm transition-colors',
                              deptFilter === 'ALL' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50',
                            )}
                          >
                            全部部门
                          </button>
                          <div className="h-px bg-neutral-100 mx-2 my-1" />
                          {ALL_DEPARTMENTS.map((dept) => {
                            const hasData = departmentsInUse.includes(dept);
                            return (
                              <button
                                key={dept}
                                onClick={() => { setDeptFilter(dept); setShowDeptDropdown(false); }}
                                disabled={!hasData}
                                className={cn(
                                  'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between',
                                  deptFilter === dept
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : hasData ? 'text-neutral-600 hover:bg-neutral-50' : 'text-neutral-300 cursor-not-allowed',
                                )}
                              >
                                <span>{dept}</span>
                                {hasData && <span className="text-xs text-neutral-400">{processes.filter((p) => p.department === dept).length}</span>}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
                {(searchQuery || statusFilter !== 'ALL' || deptFilter !== 'ALL') && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-neutral-500">筛选条件：</span>
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600">
                        搜索: {searchQuery}
                        <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-primary-800">×</button>
                      </span>
                    )}
                    {statusFilter !== 'ALL' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-50 text-accent-600">
                        状态: {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                        <button onClick={() => setStatusFilter('ALL')} className="ml-1 hover:text-accent-800">×</button>
                      </span>
                    )}
                    {deptFilter !== 'ALL' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-50 text-warning-600">
                        部门: {deptFilter}
                        <button onClick={() => setDeptFilter('ALL')} className="ml-1 hover:text-warning-800">×</button>
                      </span>
                    )}
                    <button
                      onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setDeptFilter('ALL'); }}
                      className="text-neutral-500 hover:text-primary-600 underline underline-offset-2"
                    >
                      清空全部
                    </button>
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500" />
                    入职流程列表
                    <span className="text-sm font-normal text-neutral-500">共 {filteredProcesses.length} 条记录</span>
                  </h2>
                </div>
                <ProgressTable processes={filteredProcesses} onViewDetail={handleViewDetail} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="evaluations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex gap-2 border-b border-neutral-200">
                <button
                  onClick={() => setEvalSubTab('pending')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                    evalSubTab === 'pending'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700',
                  )}
                >
                  <Clock className="w-4 h-4" />
                  待处理
                  {pendingCounts.all > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-danger-100 text-danger-700 text-xs font-bold">
                      {pendingCounts.all}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setEvalSubTab('archived')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                    evalSubTab === 'archived'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700',
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  已归档
                  {archiveCounts.all > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-accent-100 text-accent-700 text-xs font-bold">
                      {archiveCounts.all}
                    </span>
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {evalSubTab === 'pending' ? (
                  <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {PENDING_CATEGORY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const count = opt.value === 'all' ? pendingCounts.all
                          : opt.value === 'confirm' ? pendingCounts.confirm
                          : opt.value === 'extend' ? pendingCounts.extend
                          : pendingCounts.terminate;
                        return (
                          <motion.button
                            key={opt.value}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPendingCategory(opt.value)}
                            className={cn(
                              'card p-4 text-left transition-all relative overflow-hidden',
                              pendingCategory === opt.value && 'ring-2 ring-primary-400 shadow-md',
                              opt.value === 'confirm' && 'bg-gradient-to-br from-accent-50/60 to-white',
                              opt.value === 'extend' && 'bg-gradient-to-br from-warning-50/60 to-white',
                              opt.value === 'terminate' && 'bg-gradient-to-br from-danger-50/60 to-white',
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Icon className={cn('w-5 h-5', opt.color)} />
                              <span className="text-2xl font-bold tabular-nums text-neutral-900">{count}</span>
                            </div>
                            <p className="text-sm font-medium text-neutral-700">{opt.label}</p>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="搜索待处理员工姓名、部门或岗位..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                      />
                    </div>

                    {pendingEvaluations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {pendingEvaluations.map(({ process, evaluation: eval_ }) => {
                          if (!eval_) return null;
                          const resultConfig = getEvaluationConfig(eval_.suggestedResult);
                          const ResultIcon = resultConfig.icon;
                          const avgScore = Math.round((eval_.workAbility + eval_.teamCollaboration + eval_.attendance + eval_.learningAgility) / 4);
                          const isUrgent = eval_.suggestedResult === 'FAIL';
                          return (
                            <motion.div
                              key={process.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ y: -3 }}
                              className={cn(
                                'card p-5 cursor-pointer group relative overflow-hidden',
                                isUrgent && 'border-danger-300 bg-gradient-to-br from-danger-50/40 to-white',
                                eval_.suggestedResult === 'EXTEND' && 'border-warning-200 bg-gradient-to-br from-warning-50/40 to-white',
                              )}
                              onClick={() => handleViewDetail(process.id)}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                    {process.employeeName.slice(0, 1)}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-neutral-900 truncate">{process.employeeName}</h4>
                                    <p className="text-xs text-neutral-500">{process.department} · {process.position}</p>
                                  </div>
                                </div>
                                <span className={cn('badge flex-shrink-0 animate-pulse', resultConfig.className)}>
                                  <ResultIcon className="w-3 h-3" />
                                  {resultConfig.label}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                                  <p className="text-[10px] text-neutral-400 mb-0.5">综合评分</p>
                                  <div className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 text-primary-500 fill-current" />
                                    <span className="text-sm font-bold text-primary-700 tabular-nums">{avgScore}</span>
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                                  <p className="text-[10px] text-neutral-400 mb-0.5">评估时间</p>
                                  <p className="text-xs font-medium text-neutral-700">{formatDate(eval_.submittedAt)}</p>
                                </div>
                              </div>

                              <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 mb-3">
                                <p className="text-xs font-semibold text-primary-700 flex items-center gap-1.5 mb-1">
                                  <ArrowRight className="w-3.5 h-3.5" />
                                  {eval_.suggestedResult === 'PASS' && '待 HR 确认转正'}
                                  {eval_.suggestedResult === 'EXTEND' && '待 HR 设置延期试用期'}
                                  {eval_.suggestedResult === 'FAIL' && '待 HR 记录不通过处理'}
                                </p>
                                <p className="text-[11px] text-primary-600/80">点击进入员工详情页进行处理</p>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                                <p className="text-xs text-neutral-400 line-clamp-1 flex-1 mr-2">{eval_.overallComment}</p>
                                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="card p-12 text-center">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-accent-400" />
                        <h3 className="text-lg font-bold text-neutral-800 mb-2">全部已处理完毕！</h3>
                        <p className="text-sm text-neutral-500">当前分类下没有待处理的评估，干得漂亮</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="archived" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {EVAL_ARCHIVE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const count = opt.value === 'ALL' ? archiveCounts.all
                          : opt.value === 'PASS' ? archiveCounts.pass
                          : opt.value === 'EXTEND' ? archiveCounts.extend
                          : archiveCounts.fail;
                        return (
                          <motion.button
                            key={opt.value}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setArchiveFilter(opt.value)}
                            className={cn(
                              'card p-4 text-left transition-all relative overflow-hidden',
                              archiveFilter === opt.value && 'ring-2 ring-primary-400 shadow-md',
                              opt.value === 'PASS' && 'bg-gradient-to-br from-accent-50/60 to-white',
                              opt.value === 'EXTEND' && 'bg-gradient-to-br from-warning-50/60 to-white',
                              opt.value === 'FAIL' && 'bg-gradient-to-br from-danger-50/60 to-white',
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Icon className={cn('w-5 h-5', opt.color)} />
                              <span className="text-2xl font-bold tabular-nums text-neutral-900">{count}</span>
                            </div>
                            <p className="text-sm font-medium text-neutral-700">{opt.label}</p>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="搜索归档员工姓名、部门或岗位..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                      />
                    </div>

                    {archivedEvaluations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {archivedEvaluations.map(({ process, evaluation: eval_ }) => {
                          if (!eval_) return null;
                          const resultConfig = getEvaluationConfig(eval_.suggestedResult);
                          const ResultIcon = resultConfig.icon;
                          const avgScore = Math.round((eval_.workAbility + eval_.teamCollaboration + eval_.attendance + eval_.learningAgility) / 4);
                          const followUpLabel: Record<string, { label: string; className: string }> = {
                            CONFIRMED: { label: '已转正', className: 'text-accent-600 bg-accent-100' },
                            EXTEND_SET: { label: '已设置延期', className: 'text-warning-600 bg-warning-100' },
                            TERMINATION_RECORDED: { label: '不通过已记录', className: 'text-danger-600 bg-danger-100' },
                          };
                          const followUp = eval_.followUpStatus ? followUpLabel[eval_.followUpStatus] : null;
                          return (
                            <motion.div
                              key={process.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ y: -3 }}
                              className="card p-5 cursor-pointer group"
                              onClick={() => handleViewDetail(process.id)}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-neutral-500 to-neutral-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                    {process.employeeName.slice(0, 1)}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-neutral-900 truncate">{process.employeeName}</h4>
                                    <p className="text-xs text-neutral-500">{process.department} · {process.position}</p>
                                  </div>
                                </div>
                                <span className={cn('badge flex-shrink-0', resultConfig.className)}>
                                  <ResultIcon className="w-3 h-3" />
                                  {resultConfig.label}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                                  <p className="text-[10px] text-neutral-400 mb-0.5">综合评分</p>
                                  <div className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 text-primary-500 fill-current" />
                                    <span className="text-sm font-bold text-primary-700 tabular-nums">{avgScore}</span>
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                                  <p className="text-[10px] text-neutral-400 mb-0.5">评估时间</p>
                                  <p className="text-xs font-medium text-neutral-700">{formatDate(eval_.submittedAt)}</p>
                                </div>
                              </div>

                              {followUp && (
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 mb-3">
                                  <span className="text-xs text-neutral-500">归档状态</span>
                                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', followUp.className)}>
                                    {followUp.label}
                                  </span>
                                </div>
                              )}

                              {eval_.followUpStatus === 'EXTEND_SET' && eval_.followUpData?.newProbationEndDate && (
                                <div className="p-2.5 rounded-xl bg-warning-50 border border-warning-100 mb-3">
                                  <p className="text-[10px] text-warning-600 font-medium mb-0.5">新试用结束日</p>
                                  <p className="text-xs font-semibold text-warning-700">
                                    {formatDate(eval_.followUpData.newProbationEndDate)}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                                <p className="text-xs text-neutral-400 line-clamp-1 flex-1 mr-2">{eval_.overallComment}</p>
                                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="card p-12 text-center">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                        <h3 className="text-lg font-bold text-neutral-800 mb-2">暂无归档记录</h3>
                        <p className="text-sm text-neutral-500">评估处理完成后会自动归档到这里</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RoleBasedLayout>
  );
}
