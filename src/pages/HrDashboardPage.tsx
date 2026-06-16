import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import StatsCard from '@/components/hr/StatsCard';
import ProgressTable from '@/components/hr/ProgressTable';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import type { OnboardingStatus } from '@/types';
import { cn } from '@/lib/utils';
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

export default function HrDashboardPage() {
  const navigate = useNavigate();
  const { processes, getProcessesByStatus } = useOnboardingStore();

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

  const evaluationPendingCount = useMemo(
    () => getProcessesByStatus(['EVALUATION_PENDING']).length,
    [getProcessesByStatus],
  );

  const filteredProcesses = useMemo(() => {
    let result = [...processes];

    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (deptFilter !== 'ALL') {
      result = result.filter((p) => p.department === deptFilter);
    }

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
            value={evaluationPendingCount}
            delta={evaluationPendingCount > 0 ? '请及时安排评估' : '一切正常'}
            trend="down"
            color="warning"
          />
        </motion.div>

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
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowDeptDropdown(false);
                  }}
                  className="btn-secondary !py-2.5 !px-4 min-w-[140px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">
                      {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      showStatusDropdown && 'rotate-180',
                    )}
                  />
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
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setShowStatusDropdown(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between',
                          statusFilter === opt.value
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-neutral-600 hover:bg-neutral-50',
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
                  onClick={() => {
                    setShowDeptDropdown(!showDeptDropdown);
                    setShowStatusDropdown(false);
                  }}
                  className="btn-secondary !py-2.5 !px-4 min-w-[140px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm truncate max-w-[80px]">
                      {deptFilter === 'ALL' ? '全部部门' : deptFilter}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      showDeptDropdown && 'rotate-180',
                    )}
                  />
                </button>

                {showDeptDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-20 top-full mt-2 right-0 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 overflow-hidden max-h-72 overflow-y-auto"
                  >
                    <button
                      onClick={() => {
                        setDeptFilter('ALL');
                        setShowDeptDropdown(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between',
                        deptFilter === 'ALL'
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-50',
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
                          onClick={() => {
                            setDeptFilter(dept);
                            setShowDeptDropdown(false);
                          }}
                          disabled={!hasData}
                          className={cn(
                            'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between',
                            deptFilter === dept
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : hasData
                              ? 'text-neutral-600 hover:bg-neutral-50'
                              : 'text-neutral-300 cursor-not-allowed',
                          )}
                        >
                          <span>{dept}</span>
                          {hasData && (
                            <span className="text-xs text-neutral-400">
                              {processes.filter((p) => p.department === dept).length}
                            </span>
                          )}
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
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-50 text-accent-600">
                  状态: {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className="ml-1 hover:text-accent-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {deptFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-50 text-warning-600">
                  部门: {deptFilter}
                  <button
                    onClick={() => setDeptFilter('ALL')}
                    className="ml-1 hover:text-warning-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setDeptFilter('ALL');
                }}
                className="text-neutral-500 hover:text-primary-600 underline underline-offset-2"
              >
                清空全部
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              入职流程列表
              <span className="text-sm font-normal text-neutral-500">
                共 {filteredProcesses.length} 条记录
              </span>
            </h2>
          </div>
          <ProgressTable processes={filteredProcesses} onViewDetail={handleViewDetail} />
        </motion.div>
      </div>
    </RoleBasedLayout>
  );
}
