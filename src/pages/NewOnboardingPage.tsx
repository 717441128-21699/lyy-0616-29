import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import OnboardingForm from '@/components/hr/OnboardingForm';

export default function NewOnboardingPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);
  const [newProcessId, setNewProcessId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState('');

  const handleSuccess = (processId: string) => {
    setNewProcessId(processId);
    setShowForm(false);
  };

  const handleCancel = () => {
    navigate('/hr/dashboard');
  };

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/hr/dashboard')}
              className="btn-secondary !py-2 !px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  创建新员工入职流程
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-50 text-accent-600 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  新流程
                </span>
              </div>
              <p className="text-neutral-500 text-sm">
                填写员工信息并分配各环节责任人，系统将自动生成入职任务
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-card border border-neutral-100">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 via-accent-400 to-warning-400" />
                <div className="p-6 md:p-10">
                  <OnboardingForm onSuccess={handleSuccess} onCancel={handleCancel} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-card border border-neutral-100">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-accent-400 via-teal-400 to-primary-500" />
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary-400/10 blur-3xl" />

                <div className="relative z-10 p-8 md:p-14 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-accent-400 to-teal-500 shadow-2xl shadow-accent-200 mb-6"
                  >
                    <CheckCircle2 className="w-12 h-12 md:w-14 md:h-14 text-white" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3"
                  >
                    入职流程创建成功！
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-neutral-500 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed"
                  >
                    系统已自动为新员工生成 9 项入职任务，
                    并向 IT、行政、经理等相关责任人发送了任务通知。
                  </motion.p>

                  {newProcessId && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="max-w-md mx-auto mb-10 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-neutral-50 to-primary-50/30 border border-primary-100/50"
                    >
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">流程编号</p>
                          <p className="font-mono font-semibold text-primary-700 text-sm md:text-base">
                            {newProcessId}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">员工姓名</p>
                          <p className="font-semibold text-neutral-800 text-sm md:text-base">
                            {employeeName || '新员工'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3"
                  >
                    {newProcessId && (
                      <Link
                        to={`/hr/employee/${newProcessId}`}
                        className="btn-primary !py-3 !px-6 min-w-[180px] justify-center"
                      >
                        查看入职详情
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    )}
                    <Link
                      to="/hr/dashboard"
                      className="btn-secondary !py-3 !px-6 min-w-[180px] justify-center"
                    >
                      返回仪表盘
                    </Link>
                    {newProcessId && (
                      <button
                        onClick={() => {
                          const baseUrl = window.location.origin;
                          const employeeLink = `${baseUrl}/login?employee=${newProcessId}`;
                          navigator.clipboard.writeText(employeeLink);
                        }}
                        className="btn-outline !py-3 !px-6 min-w-[180px] justify-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                        复制入职链接
                      </button>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 pt-8 border-t border-neutral-100"
                  >
                    <p className="text-xs text-neutral-400 mb-4">您可以继续：</p>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                      <button
                        onClick={() => {
                          setNewProcessId(null);
                          setShowForm(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-primary-600 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        再创建一个入职流程
                      </button>
                      <Link
                        to="/tasks"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-primary-600 transition-colors"
                      >
                        查看任务工作台
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RoleBasedLayout>
  );
}
