import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ScrollText,
  FileCheck,
  Signature,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { SignaturePad } from '@/components/employee/SignaturePad';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dateUtils';

type ContractStep = 0 | 1 | 2 | 3;

const CONTRACT_STEPS: Array<{
  key: ContractStep;
  title: string;
  desc: string;
  icon: typeof ScrollText;
}> = [
  { key: 0, title: '生成合同', desc: '信息收集后自动生成', icon: ScrollText },
  { key: 1, title: '员工签署', desc: '本人确认并电子签名', icon: Signature },
  { key: 2, title: 'HR签署', desc: 'HR审核并签署盖章', icon: FileCheck },
  { key: 3, title: '签署完成', desc: '劳动合同正式生效', icon: CheckCircle2 },
];

export default function ContractSignPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentProcessId, setCurrentProcessId, currentUser } = useUserStore();
  const {
    getContractForProcess,
    getOnboardingProcessById,
    employeeSignContract,
  } = useOnboardingStore();

  const processId = id || currentProcessId || '';

  useEffect(() => {
    if (processId && !currentProcessId) {
      setCurrentProcessId(processId);
    }
  }, [processId, currentProcessId, setCurrentProcessId]);

  const contract = useMemo(() => getContractForProcess(processId), [processId, getContractForProcess]);
  const process = useMemo(() => getOnboardingProcessById(processId), [processId, getOnboardingProcessById]);

  const [signatureData, setSignatureData] = useState<string | null>(contract?.employeeSignature || null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentStep: ContractStep = useMemo(() => {
    if (!contract) return 0;
    if (contract.status === 'FULLY_SIGNED') return 3;
    if (contract.employeeSignature && contract.status === 'EMPLOYEE_SIGNED') return 2;
    if (contract.employeeSignature) return 2;
    return 1;
  }, [contract]);

  const handleSignatureSave = (data: string) => {
    setSignatureData(data);
  };

  const handleSubmit = () => {
    if (!signatureData || !agreed) return;
    setIsSubmitting(true);
    setTimeout(() => {
      employeeSignContract(processId, signatureData);
      setSubmitted(true);
      setIsSubmitting(false);
    }, 800);
  };

  const canSign = signatureData && agreed && !contract?.employeeSignature;

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
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
                合同签署
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                  !contract
                    ? 'bg-neutral-100 text-neutral-500'
                    : contract.status === 'FULLY_SIGNED'
                    ? 'bg-accent-50 text-accent-700'
                    : contract.employeeSignature
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-warning-50 text-warning-700',
                )}
              >
                {!contract ? (
                  <><Clock className="w-3.5 h-3.5" /> 待生成</>
                ) : contract.status === 'FULLY_SIGNED' ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> 已完成</>
                ) : contract.employeeSignature ? (
                  <><FileCheck className="w-3.5 h-3.5" /> 待HR签署</>
                ) : (
                  <><Signature className="w-3.5 h-3.5" /> 待签署</>
                )}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              请仔细阅读劳动合同，确认无误后完成电子签名
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 md:p-7"
        >
          <div className="flex items-start justify-between">
            {CONTRACT_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isDone = currentStep > step.key;
              return (
                <div key={step.key} className="flex-1 relative">
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={cn(
                        'w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 mb-2',
                        isDone
                          ? 'bg-gradient-to-br from-accent-400 to-teal-500 text-white shadow-lg shadow-accent-200'
                          : isActive
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200 ring-4 ring-primary-100'
                          : 'bg-neutral-100 text-neutral-400',
                      )}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="text-center max-w-[100px]">
                      <p
                        className={cn(
                          'text-xs md:text-sm font-semibold whitespace-nowrap',
                          isActive || isDone ? 'text-neutral-800' : 'text-neutral-400',
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] md:text-xs text-neutral-400 mt-0.5 hidden md:block">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                  {idx < CONTRACT_STEPS.length - 1 && (
                    <div className="absolute top-6 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-0.5 -z-0">
                      <div
                        className={cn(
                          'h-full transition-all duration-700',
                          currentStep > step.key
                            ? 'bg-gradient-to-r from-accent-400 to-teal-400'
                            : 'bg-neutral-200',
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="relative">
            <div className="absolute -inset-1 md:-inset-1.5 bg-gradient-to-r from-primary-200/40 via-accent-200/40 to-warning-200/40 rounded-3xl blur-xl opacity-60" />
            <div
              className="relative p-6 md:p-10 lg:p-14 bg-white rounded-2xl md:rounded-3xl shadow-xl border border-neutral-200/70"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(200, 200, 210, 0.12) 28px),
                  radial-gradient(circle at 10% 0%, rgba(15, 76, 129, 0.04) 0%, transparent 50%)
                `,
              }}
            >
              <div className="absolute top-5 right-6 md:top-8 md:right-10 flex items-center gap-1">
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
                    contract?.status === 'FULLY_SIGNED'
                      ? 'bg-accent-100 text-accent-700 border border-accent-200'
                      : contract
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-neutral-100 text-neutral-600 border border-neutral-200',
                  )}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {contract?.status === 'FULLY_SIGNED' ? '合同已生效' : contract ? '电子合同文本' : '草稿'}
                </div>
              </div>

              {contract && contract.status === 'FULLY_SIGNED' && (
                <div className="absolute top-12 right-10 w-28 h-28 md:w-36 md:h-36 pointer-events-none opacity-35 rotate-12 hidden md:block">
                  <div className="w-full h-full rounded-full border-4 border-accent-500 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-accent-600 font-black text-lg tracking-wider">星辰科技</div>
                      <div className="text-accent-500 font-bold text-[10px] mt-1 tracking-[0.3em]">合同专用章</div>
                    </div>
                  </div>
                </div>
              )}

              {contract ? (
                <>
                  <div className="text-center border-b-2 border-double border-neutral-300 pb-6 mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-[0.4em] mb-2">
                      劳 动 合 同 书
                    </h2>
                    <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
                      <span>编号：{contract.id}</span>
                      <span>版本：2025-V1.0</span>
                      <span>生成日期：{formatDate(contract.generatedAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm md:text-base leading-7 text-neutral-700 font-serif">
                    <p className="indent-8">
                      根据《中华人民共和国劳动法》、《中华人民共和国劳动合同法》及相关法律法规的规定，
                      <strong className="text-neutral-900"> 甲方（用人单位）星辰科技有限公司 </strong>
                      与
                      <strong className="text-neutral-900"> 乙方（劳动者）{process?.employeeName} </strong>
                      本着平等自愿、协商一致、诚实信用的原则，签订本劳动合同，共同遵守本合同所列条款。
                    </p>

                    <section className="pt-2">
                      <h3 className="font-bold text-neutral-900 mb-2 text-base">第一条 工作岗位与工作地点</h3>
                      <p className="indent-8">
                        1.1 甲方安排乙方在 <u className="font-semibold">{process?.department}</u> 部门，
                        从事 <u className="font-semibold">{process?.position}</u> 工作。
                      </p>
                      <p className="indent-8">
                        1.2 工作地点为：上海市浦东新区张江高科技园区。
                      </p>
                    </section>

                    <section className="pt-2">
                      <h3 className="font-bold text-neutral-900 mb-2 text-base">第二条 合同期限</h3>
                      <p className="indent-8">
                        2.1 本合同为固定期限劳动合同，自 <u>{formatDate(process?.startDate || '')}</u> 起，
                        至 <u>{formatDate(process?.startDate ? '' : '')}</u> 止，共计 <strong>叁年</strong>。
                      </p>
                      <p className="indent-8">
                        2.2 试用期自 <u>{formatDate(process?.startDate || '')}</u> 起，
                        至 <u>{formatDate(process?.probationEndDate || '')}</u> 止，共计 <strong>叁个月</strong>。
                      </p>
                    </section>

                    <section className="pt-2">
                      <h3 className="font-bold text-neutral-900 mb-2 text-base">第三条 工作时间与休息休假</h3>
                      <p className="indent-8">
                        3.1 实行标准工时制，每日工作不超过8小时，每周工作不超过40小时。
                      </p>
                      <p className="indent-8">
                        3.2 乙方依法享有国家规定的法定节假日、年休假、婚假、产假等休假权利。
                      </p>
                    </section>

                    <section className="pt-2">
                      <h3 className="font-bold text-neutral-900 mb-2 text-base">第四条 劳动报酬</h3>
                      <p className="indent-8">
                        4.1 乙方月基本工资（税前）为人民币{' '}
                        <strong className="text-lg text-primary-700 font-mono">
                          ¥{process?.salary?.toLocaleString() || '—'}
                        </strong>{' '}
                        元整。
                      </p>
                      <p className="indent-8">
                        4.2 甲方于每月10日前以银行转账方式支付上月工资。
                      </p>
                    </section>

                    <section className="pt-2">
                      <h3 className="font-bold text-neutral-900 mb-2 text-base">第五条 社会保险与福利待遇</h3>
                      <p className="indent-8">
                        5.1 甲方按国家和上海市规定为乙方缴纳五险一金。
                      </p>
                      <p className="indent-8">
                        5.2 乙方享有补充商业保险、年度体检、节日福利等公司福利待遇。
                      </p>
                    </section>

                    <section className="pt-2">
                      <h3 className="font-bold text-neutral-900 mb-2 text-base">第六条 保密与竞业限制</h3>
                      <p className="indent-8">
                        6.1 乙方对工作中知悉的甲方商业秘密、技术秘密等信息负有保密义务。
                      </p>
                      <p className="indent-8">
                        6.2 乙方离职后两年内不得在与甲方有竞争关系的单位任职。
                      </p>
                    </section>

                    <section className="pt-2">
                      <h3 className="font-bold text-neutral-900 mb-2 text-base">第七条 合同的解除与终止</h3>
                      <p className="indent-8">
                        本合同的解除、终止按照国家法律法规及甲方规章制度执行。
                      </p>
                    </section>

                    <section className="pt-2">
                      <h3 className="font-bold text-neutral-900 mb-2 text-base">第八条 其他约定</h3>
                      <p className="indent-8">
                        8.1 本合同一式两份，甲乙双方各执一份，具有同等法律效力。
                      </p>
                      <p className="indent-8">
                        8.2 本合同未尽事宜，按国家法律法规执行。
                      </p>
                    </section>

                    <div className="mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-neutral-600">提示：</strong>
                        以上为劳动合同主要条款摘要，正式签署版本包含全部完整条款。
                        签署前请务必阅读并理解完整合同内容。如有疑问请咨询HR。
                      </p>
                    </div>
                  </div>

                  {(contract.employeeSignature || contract.hrSignature) && (
                    <div className="mt-12 pt-8 border-t-2 border-dashed border-neutral-300 grid grid-cols-2 gap-8 md:gap-16">
                      <div className="text-center">
                        <p className="text-xs text-neutral-500 mb-3">乙方（劳动者）签署</p>
                        {contract.employeeSignature ? (
                          <div className="space-y-2">
                            <div className="w-32 h-20 mx-auto border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center overflow-hidden">
                              <img src={contract.employeeSignature} alt="员工签名" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="font-semibold text-neutral-800">{process?.employeeName}</div>
                            <p className="text-xs text-neutral-500">
                              签署于 {contract.employeeSignedAt ? formatDate(contract.employeeSignedAt) : '—'}
                            </p>
                          </div>
                        ) : (
                          <div className="w-32 h-20 mx-auto border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-300 text-xs">
                            待签名
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-neutral-500 mb-3">甲方（用人单位）签署</p>
                        {contract.hrSignature ? (
                          <div className="space-y-2">
                            <div className="w-32 h-20 mx-auto border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center overflow-hidden">
                              <img src={contract.hrSignature} alt="HR签名" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="font-semibold text-neutral-800">星辰科技有限公司（盖章）</div>
                            <p className="text-xs text-neutral-500">
                              HR签署于 {contract.hrSignedAt ? formatDate(contract.hrSignedAt) : '—'}
                            </p>
                          </div>
                        ) : (
                          <div className="w-32 h-20 mx-auto border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-300 text-xs">
                            HR待签署
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-20 md:py-28 text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-3xl bg-neutral-100 flex items-center justify-center">
                    <Clock className="w-10 h-10 md:w-12 md:h-12 text-neutral-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-neutral-800 mb-2">合同尚未生成</h3>
                  <p className="text-sm md:text-base text-neutral-500 max-w-md mx-auto leading-relaxed mb-6">
                    劳动合同将在您完成 <strong>个人信息填写</strong> 及 <strong>材料上传</strong> 后自动生成。
                    <br />
                    请先完成前置步骤后再返回签署合同。
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link to={`/employee/${processId}/personal-info`} className="btn-secondary !py-2.5 !px-5">
                      <UserCheck className="w-4 h-4" />
                      填写个人信息
                    </Link>
                    <Link to={`/employee/${processId}/documents`} className="btn-primary !py-2.5 !px-5">
                      <ScrollText className="w-4 h-4" />
                      上传材料
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              >
                <div className="card p-8 md:p-10 text-center relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent-400/15 blur-3xl" />
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                      className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-accent-400 to-teal-500 shadow-2xl shadow-accent-200 mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
                      合同签署成功！
                    </h2>
                    <p className="text-neutral-500 max-w-md mx-auto mb-2 leading-relaxed">
                      您已成功完成劳动合同的电子签名。
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8">
                      <Clock className="w-4 h-4" />
                      等待HR完成最终签署（预计1-2个工作日）
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link to={`/employee/${processId}/portal`} className="btn-secondary !py-3 !px-6 min-w-[160px] justify-center">
                        返回首页
                      </Link>
                      <Link to={`/employee/${processId}/portal`} className="btn-primary !py-3 !px-6 min-w-[180px] justify-center">
                        查看入职进度
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : contract && !contract.employeeSignature && (
              <motion.div
                key="sign"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-5"
              >
                <SignaturePad
                  onSave={handleSignatureSave}
                  savedSignature={signatureData || undefined}
                />

                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-warning-50/80 via-primary-50/50 to-accent-50/60 border border-warning-200/60">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div
                        className={cn(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                          agreed
                            ? 'bg-primary-500 border-primary-500'
                            : 'bg-white border-neutral-300 hover:border-primary-400',
                        )}
                      >
                        {agreed && <CheckCircle2 className="w-4 h-4 text-white stroke-[3]" />}
                      </div>
                    </div>
                    <div className="text-sm text-neutral-600 leading-relaxed">
                      <span className="font-semibold text-neutral-800">本人确认：</span>
                      我已认真阅读并完整理解《劳动合同书》的全部内容，
                      包括工作岗位、劳动报酬、休息休假、保密义务、合同解除等所有条款。
                      我确认所填写的个人信息真实有效，同意以电子签名方式签署本合同。
                    </div>
                  </label>
                </div>

                <div className="flex justify-center pb-2">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSign || isSubmitting}
                    className={cn(
                      'btn-primary !py-3.5 !px-10 text-base min-w-[200px] justify-center',
                      !canSign && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        确认签署合同
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </RoleBasedLayout>
  );
}
