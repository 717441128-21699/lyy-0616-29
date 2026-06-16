import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileText,
  AlertCircle,
  UserCheck,
  GraduationCap,
  Image as ImageIcon,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { DocumentUploader } from '@/components/employee/DocumentUploader';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';
import type { DocumentType } from '@/types';

interface RequiredDoc {
  type: DocumentType;
  label: string;
  icon: typeof UserCheck;
  color: string;
}

const REQUIRED_DOCS: RequiredDoc[] = [
  { type: 'ID_CARD_FRONT', label: '身份证正面', icon: UserCheck, color: 'from-primary-400 to-primary-500' },
  { type: 'ID_CARD_BACK', label: '身份证背面', icon: FileText, color: 'from-primary-500 to-indigo-500' },
  { type: 'DIPLOMA', label: '学历证书', icon: GraduationCap, color: 'from-accent-400 to-teal-500' },
  { type: 'PHOTO', label: '一寸证件照', icon: ImageIcon, color: 'from-warning-400 to-orange-500' },
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentProcessId, setCurrentProcessId } = useUserStore();
  const { getDocumentsForProcess } = useOnboardingStore();

  const processId = id || currentProcessId || '';

  useEffect(() => {
    if (processId && !currentProcessId) {
      setCurrentProcessId(processId);
    }
  }, [processId, currentProcessId, setCurrentProcessId]);

  const documents = useMemo(() => getDocumentsForProcess(processId), [processId, getDocumentsForProcess]);

  const uploadStatus = useMemo(() => {
    return REQUIRED_DOCS.map((doc) => ({
      ...doc,
      uploaded: documents.some((d) => d.type === doc.type),
    }));
  }, [documents]);

  const requiredCount = REQUIRED_DOCS.length;
  const completedCount = uploadStatus.filter((d) => d.uploaded).length;
  const allDone = completedCount >= requiredCount;
  const progressPercent = Math.round((completedCount / requiredCount) * 100);

  return (
    <RoleBasedLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/employee/${processId}/portal`)}
            className="btn-secondary !py-2 !px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900 truncate">
                材料上传
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-50 text-warning-600 text-xs font-medium">
                <Upload className="w-3.5 h-3.5" />
                已完成 {completedCount}/{requiredCount}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              请按要求上传以下入职材料，支持JPG、PNG、PDF格式
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 md:p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning-500" />
                    必填材料完成进度
                  </h3>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'text-2xl md:text-3xl font-bold tabular-nums',
                      allDone
                        ? 'bg-gradient-to-r from-accent-500 to-teal-500 bg-clip-text text-transparent'
                        : 'text-warning-600',
                    )}
                  >
                    {progressPercent}%
                  </span>
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    allDone
                      ? 'bg-gradient-to-r from-accent-400 to-teal-500'
                      : 'bg-gradient-to-r from-warning-400 to-orange-500',
                  )}
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-neutral-100" />

            <div className="flex gap-3 flex-wrap">
              {uploadStatus.map((doc) => {
                const Icon = doc.icon;
                return (
                  <div
                    key={doc.type}
                    className="flex flex-col items-center"
                    title={`${doc.label}${doc.uploaded ? '：已上传' : '：未上传'}`}
                  >
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 transition-all',
                        doc.uploaded
                          ? `bg-gradient-to-br ${doc.color} text-white shadow-md`
                          : 'bg-neutral-100 text-neutral-400',
                      )}
                    >
                      {doc.uploaded ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs text-neutral-500 whitespace-nowrap">
                      {doc.label.slice(0, 4)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-primary-50/60 via-accent-50/40 to-warning-50/50 border border-primary-100/50"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-800 mb-1.5 flex items-center gap-2">
                上传说明
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-medium">
                  请务必阅读
                </span>
              </h3>
              <ul className="text-sm text-neutral-600 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>身份证：</strong>请上传清晰的彩色扫描件或照片，四角完整、无遮挡反光
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>学历证书：</strong>请上传最高学历的毕业证书，如有学位证建议同时上传
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>证件照：</strong>请上传近期白底/蓝底一寸免冠证件照（正装最佳）
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                  <span>
                    单个文件不超过 <strong>10MB</strong>，支持格式：<strong>JPG、PNG、PDF</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <DocumentUploader processId={processId} />
        </motion.div>

        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div className="card p-6 md:p-8 text-center relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-accent-400/15 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-primary-400/15 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-teal-500 flex items-center justify-center shadow-lg shadow-accent-200"
                    >
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-neutral-900 mb-0.5">
                        材料上传完成！
                      </h3>
                      <p className="text-sm text-neutral-500">
                        所有必填材料已提交，接下来进入合同签署环节
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/employee/${processId}/portal`}
                      className="btn-secondary !py-3 !px-5"
                    >
                      返回首页
                    </Link>
                    <Link
                      to={`/employee/${processId}/contract`}
                      className="btn-primary !py-3 !px-6"
                    >
                      下一步：合同签署
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RoleBasedLayout>
  );
}
