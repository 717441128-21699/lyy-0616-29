import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Mail,
  Building2,
  Briefcase,
  CalendarDays,
  Banknote,
  Users,
  Monitor,
  FileText,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { cn } from '@/lib/utils';

interface OnboardingFormProps {
  onSuccess: (newProcessId: string) => void;
  onCancel: () => void;
}

type FormStep = 1 | 2;

interface FormData {
  employeeName: string;
  employeeEmail: string;
  department: string;
  position: string;
  startDate: string;
  salary: number;
  managerId: string;
  itOwnerId: string;
  adminOwnerId: string;
}

const DEPARTMENTS = [
  '技术研发部',
  '产品设计部',
  '市场运营部',
  '销售部',
  '人力资源部',
  '财务部',
  '行政部',
  '客户服务部',
];

export default function OnboardingForm({ onSuccess, onCancel }: OnboardingFormProps) {
  const [step, setStep] = useState<FormStep>(1);
  const [submitting, setSubmitting] = useState(false);

  const managers = useUserStore((s) => s.getUsersByRole('MANAGER'));
  const itUsers = useUserStore((s) => s.getUsersByRole('IT'));
  const adminUsers = useUserStore((s) => s.getUsersByRole('ADMIN'));
  const currentUser = useUserStore((s) => s.currentUser);
  const createProcess = useOnboardingStore((s) => s.createOnboardingProcess);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      employeeName: '',
      employeeEmail: '',
      department: '',
      position: '',
      startDate: '',
      salary: undefined as unknown as number,
      managerId: '',
      itOwnerId: '',
      adminOwnerId: '',
    },
  });

  const validateStep1 = async () => {
    const valid = await trigger([
      'employeeName',
      'employeeEmail',
      'department',
      'position',
      'startDate',
      'salary',
    ]);
    if (valid) setStep(2);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const newId = createProcess({
        ...data,
        salary: Number(data.salary),
        createdBy: currentUser.id,
      });
      setTimeout(() => {
        setSubmitting(false);
        onSuccess(newId);
      }, 800);
    } catch {
      setSubmitting(false);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="relative bg-gradient-primary px-8 py-6 text-white">
          <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">新建入职流程</span>
            </div>
            <h2 className="text-2xl font-bold">添加新员工</h2>
            <p className="mt-1 text-sm opacity-80">
              填写基本信息并分配责任人
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-2 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <StepIndicator current={step} total={2} />
        </div>
        </div>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-8 py-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    员工基本信息
                  </h3>
                  <p className="text-sm text-neutral-500">
                    填写新员工的个人和岗位信息
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="姓名"
                    icon={Users}
                    error={errors.employeeName?.message}
                  >
                    <input
                      type="text"
                      placeholder="请输入姓名"
                      className={cn(
                        'input-field',
                        errors.employeeName && 'input-field-error',
                      )}
                      {...register('employeeName', {
                        required: '请输入姓名',
                        minLength: { value: 2, message: '姓名至少2个字符' },
                      })}
                    />
                  </FormField>
                  <FormField
                    label="邮箱"
                    icon={Mail}
                    error={errors.employeeEmail?.message}
                  >
                    <input
                      type="email"
                      placeholder="name@company.com"
                      className={cn(
                        'input-field',
                        errors.employeeEmail && 'input-field-error',
                      )}
                      {...register('employeeEmail', {
                        required: '请输入邮箱',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: '请输入有效邮箱',
                        },
                      })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="部门"
                    icon={Building2}
                    error={errors.department?.message}
                  >
                    <select
                      className={cn(
                        'input-field appearance-none',
                        errors.department && 'input-field-error',
                      )}
                      {...register('department', {
                        required: '请选择部门',
                      })}
                    >
                      <option value="">请选择部门</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField
                    label="岗位"
                    icon={Briefcase}
                    error={errors.position?.message}
                  >
                    <input
                      type="text"
                      placeholder="如：前端工程师"
                      className={cn(
                        'input-field',
                        errors.position && 'input-field-error',
                      )}
                      {...register('position', {
                        required: '请输入岗位',
                      })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="入职日期"
                    icon={CalendarDays}
                    error={errors.startDate?.message}
                  >
                    <input
                      type="date"
                      className={cn(
                        'input-field',
                        errors.startDate && 'input-field-error',
                      )}
                      {...register('startDate', {
                        required: '请选择入职日期',
                      })}
                    />
                  </FormField>
                  <FormField
                    label="薪资 (元/月)"
                    icon={Banknote}
                    error={errors.salary?.message}
                  >
                    <input
                      type="number"
                      placeholder="15000"
                      className={cn(
                        'input-field',
                        errors.salary && 'input-field-error',
                      )}
                      {...register('salary', {
                        required: '请输入薪资',
                        min: { value: 1, message: '薪资必须大于0' },
                      })}
                    />
                  </FormField>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-8 py-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    责任人分配
                  </h3>
                  <p className="text-sm text-neutral-500">
                    为该员工分配各环节负责人
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <FormField
                  label="直属经理"
                  icon={Users}
                  error={errors.managerId?.message}
                >
                  <Controller
                    name="managerId"
                    control={control}
                    rules={{ required: '请选择直属经理' }}
                    render={({ field }) => (
                      <UserSelect
                        placeholder="选择直属经理"
                        users={managers}
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.managerId}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="IT负责人"
                  icon={Monitor}
                  error={errors.itOwnerId?.message}
                >
                  <Controller
                    name="itOwnerId"
                    control={control}
                    rules={{ required: '请选择IT负责人' }}
                    render={({ field }) => (
                      <UserSelect
                        users={itUsers}
                        placeholder="选择IT负责人"
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.itOwnerId}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="行政负责人"
                  icon={FileText}
                  error={errors.adminOwnerId?.message}
                >
                  <Controller
                    name="adminOwnerId"
                    control={control}
                    rules={{ required: '请选择行政负责人' }}
                    render={({ field }) => (
                      <UserSelect
                        users={adminUsers}
                        placeholder="选择行政负责人"
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.adminOwnerId}
                      />
                    )}
                  />
                </FormField>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50/50 px-8 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={submitting}
          >
            取消
          </button>
          <div className="flex gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary"
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" />
                上一步
              </button>
            )}
            {step === 1 ? (
              <button
                type="button"
                onClick={validateStep1}
                className="btn-primary"
              >
                下一步
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    创建中...
                  </>
                ) : (
                  <>
                  <Check className="h-4 w-4" />
                  确认创建
                </>
              )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex w-full items-center gap-3">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={stepNum} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all',
                isActive
                  ? 'bg-white text-primary-600 shadow-glow-primary'
                  : isDone
                  ? 'bg-white/90 text-primary-700'
                  : 'bg-white/20 text-white/70',
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : stepNum}
            </div>
            {stepNum < total && (
              <div
                className={cn(
                  'h-1 flex-1 rounded-full transition-all',
                  isDone ? 'bg-white/80' : 'bg-white/20',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label-field flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-neutral-400" />
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-danger-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function UserSelect({
  users,
  value,
  onChange,
  placeholder,
  error,
}: {
  users: Array<{ id: string; name: string; email: string; avatar?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'input-field appearance-none pr-10',
          error && 'input-field-error',
        )}
      >
        <option value="">{placeholder}</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          className="h-4 w-4 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-neutral-50 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
            {users.find((u) => u.id === value)?.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-neutral-800">
              {users.find((u) => u.id === value)?.name}
            </div>
            <div className="truncate text-xs text-neutral-500">
              {users.find((u) => u.id === value)?.email}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
