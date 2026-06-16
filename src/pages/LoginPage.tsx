import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  ShieldCheck,
  Rocket,
  HeartHandshake,
  Mail,
  Lock,
  Link2,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Building2,
  UserCheck,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useForm } from 'react-hook-form';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

type LoginTab = 'HR' | 'IT' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

interface LoginFormData {
  email: string;
  password: string;
}

interface EmployeeLoginData {
  processId: string;
}

const tabConfig: Array<{
  key: LoginTab;
  label: string;
  presetEmail?: string;
}> = [
  { key: 'HR', label: 'HR人力资源', presetEmail: 'hr@company.com' },
  { key: 'IT', label: 'IT支持', presetEmail: 'it@company.com' },
  { key: 'ADMIN', label: '行政支持', presetEmail: 'admin@company.com' },
  { key: 'MANAGER', label: '部门经理', presetEmail: 'manager@company.com' },
  { key: 'EMPLOYEE', label: '新员工链接' },
];

const advantages = [
  {
    icon: Rocket,
    title: '高效入职',
    desc: '全流程自动化，入职时间缩短60%',
    color: 'from-accent-400 to-teal-400',
  },
  {
    icon: ShieldCheck,
    title: '合规保障',
    desc: '标准化流程，规避用工风险',
    color: 'from-primary-400 to-indigo-400',
  },
  {
    icon: HeartHandshake,
    title: '贴心体验',
    desc: '新员工一站式服务，提升归属感',
    color: 'from-rose-400 to-pink-400',
  },
  {
    icon: Users,
    title: '协同办公',
    desc: '多角色协同，责任清晰透明',
    color: 'from-amber-400 to-orange-400',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, currentProcessId, login, loginAsEmployee } = useUserStore();
  const [activeTab, setActiveTab] = useState<LoginTab>('HR');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    defaultValues: { email: 'hr@company.com', password: '123456' },
  });

  const {
    register: registerEmployee,
    handleSubmit: handleSubmitEmployee,
    formState: { errors: employeeErrors },
  } = useForm<EmployeeLoginData>({
    defaultValues: { processId: 'proc-001' },
  });

  useEffect(() => {
    if (activeTab !== 'EMPLOYEE') {
      const config = tabConfig.find((t) => t.key === activeTab);
      if (config?.presetEmail) {
        setValue('email', config.presetEmail);
        setValue('password', '123456');
      }
      reset({ email: config?.presetEmail, password: '123456' });
    }
    setLoginError(null);
  }, [activeTab, setValue, reset]);

  if (currentUser) {
    const redirect = (location.state as { from?: string })?.from;
    if (redirect) return <Navigate to={redirect} replace />;
    const roleRedirects: Record<UserRole, string> = {
      HR: '/hr/dashboard',
      IT: '/tasks',
      ADMIN: '/tasks',
      MANAGER: '/tasks',
      EMPLOYEE: currentProcessId ? `/employee/${currentProcessId}/portal` : '/login',
    };
    return <Navigate to={roleRedirects[currentUser.role]} replace />;
  }

  const onSubmitLogin = handleSubmit((data) => {
    setLoginError(null);
    const result = login(data.email, data.password, activeTab as UserRole);
    if (result.success) {
      setLoginSuccess(true);
      setTimeout(() => {
        const roleRedirects: Record<UserRole, string> = {
          HR: '/hr/dashboard',
          IT: '/tasks',
          ADMIN: '/tasks',
          MANAGER: '/tasks',
          EMPLOYEE: '/login',
        };
        navigate(roleRedirects[activeTab as UserRole], { replace: true });
      }, 600);
    } else {
      setLoginError(result.message || '登录失败，请检查账号密码');
    }
  });

  const onSubmitEmployee = handleSubmitEmployee((data) => {
    setLoginError(null);
    const result = loginAsEmployee(data.processId.trim());
    if (result.success) {
      setLoginSuccess(true);
      setTimeout(() => {
        navigate(`/employee/${data.processId.trim()}/portal`, { replace: true });
      }, 600);
    } else {
      setLoginError(result.message || '无效的入职链接');
    }
  });

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent-400/20 blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary-400/20 blur-3xl translate-y-1/3 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/5 blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">星辰入职系统</h1>
              <p className="text-sm text-white/60">Stellar Onboarding Platform</p>
            </div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                让每一位新成员<br />
                <span className="bg-gradient-to-r from-accent-300 to-teal-200 bg-clip-text text-transparent">
                  都能从容启程
                </span>
              </h2>
              <p className="text-lg text-white/70 max-w-md leading-relaxed">
                一站式员工入职管理平台，串联HR、IT、行政、部门经理多方协作，
                为新员工打造温暖高效的入职体验。
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {advantages.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="p-4 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/10 hover:bg-white/12 transition-colors"
                  >
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', item.color)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6 text-white/50 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>星辰科技有限公司</span>
            </div>
            <span>© 2025 All rights reserved</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">星辰入职系统</h1>
              <p className="text-xs text-neutral-500">Stellar Onboarding</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  {activeTab === 'EMPLOYEE' ? '新员工登录' : '欢迎回来'}
                </h2>
                <p className="text-neutral-500 text-sm">
                  {activeTab === 'EMPLOYEE'
                    ? '请使用HR发送的入职链接ID进行登录'
                    : '请选择身份并登录您的工作账号'}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap gap-1.5 p-1.5 bg-neutral-100 rounded-2xl">
                  {tabConfig.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'flex-1 min-w-[72px] px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300',
                        activeTab === tab.key
                          ? 'bg-white text-primary-700 shadow-md scale-[1.02]'
                          : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50',
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab !== 'EMPLOYEE' ? (
                  <motion.form
                    key="staff-login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={onSubmitLogin}
                    className="space-y-5"
                  >
                    <div>
                      <label className="label-field flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        邮箱地址
                      </label>
                      <input
                        type="email"
                        className={cn('input-field', errors.email && 'input-field-error')}
                        placeholder="name@company.com"
                        {...register('email', {
                          required: '请输入邮箱',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: '请输入有效邮箱',
                          },
                        })}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs text-danger-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.email.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label className="label-field flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-neutral-400" />
                        登录密码
                      </label>
                      <input
                        type="password"
                        className={cn('input-field', errors.password && 'input-field-error')}
                        placeholder="请输入密码"
                        {...register('password', {
                          required: '请输入密码',
                          minLength: { value: 6, message: '密码至少6位' },
                        })}
                      />
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs text-danger-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    <AnimatePresence>
                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm flex items-start gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {loginError}
                        </motion.div>
                      )}
                      {loginSuccess && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-3 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          登录成功，正在跳转...
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={loginSuccess}
                      className="btn-primary w-full !py-3 text-base"
                    >
                      {loginSuccess ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          登录中...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5" />
                          登 录
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="employee-login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={onSubmitEmployee}
                    className="space-y-5"
                  >
                    <div className="p-4 rounded-2xl bg-accent-50/50 border border-accent-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-5 h-5 text-accent-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800 text-sm mb-1">新员工入职通道</h3>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            HR已通过邮件向您发送入职邀请，包含唯一的入职链接ID。
                            请在下方输入该ID以进入入职流程。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="label-field flex items-center gap-1.5">
                        <Link2 className="w-4 h-4 text-neutral-400" />
                        入职链接ID
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-mono">proc-</span>
                        <input
                          type="text"
                          className={cn('input-field pl-16 font-mono tracking-wider', employeeErrors.processId && 'input-field-error')}
                          placeholder="001"
                          {...registerEmployee('processId', {
                            required: '请输入入职链接ID',
                          })}
                        />
                      </div>
                      {employeeErrors.processId && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs text-danger-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {employeeErrors.processId.message}
                        </motion.p>
                      )}
                    </div>

                    <AnimatePresence>
                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm flex items-start gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {loginError}
                        </motion.div>
                      )}
                      {loginSuccess && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-3 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          登录成功，欢迎入职！
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={loginSuccess}
                      className="btn-accent w-full !py-3 text-base"
                    >
                      {loginSuccess ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          进入中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          通过邮件链接登录
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="px-6 sm:px-8 py-5 bg-neutral-50/80 border-t border-neutral-100">
              <div className="text-xs text-neutral-500">
                <p className="font-medium text-neutral-600 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                  预设测试账号（密码统一：123456）
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[11px]">
                  <span className="text-neutral-600">HR:</span>
                  <span>hr@company.com</span>
                  <span className="text-neutral-600">IT:</span>
                  <span>it@company.com</span>
                  <span className="text-neutral-600">行政:</span>
                  <span>admin@company.com</span>
                  <span className="text-neutral-600">经理:</span>
                  <span>manager@company.com</span>
                  <span className="text-neutral-600">新员工:</span>
                  <span>proc-001 ~ proc-005</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
