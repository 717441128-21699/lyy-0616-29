import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileUser,
  User,
  IdCard,
  Banknote,
  GraduationCap,
  HeartHandshake,
  ClipboardCheck,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Phone,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useUserStore } from '@/store/useUserStore';
import type { EducationRecord } from '@/types';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  idNumber: string;
  birthDate: string;
  phone: string;
  address: string;
  bankName: string;
  bankAccount: string;
  education: EducationRecord[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const STEPS: Array<{
  num: Step;
  title: string;
  subtitle: string;
  icon: typeof User;
  iconBg: string;
}> = [
  { num: 1, title: '基本信息', subtitle: '姓名、身份证、联系方式等', icon: User, iconBg: 'bg-primary-100 text-primary-600' },
  { num: 2, title: '银行信息', subtitle: '工资发放账户信息', icon: Banknote, iconBg: 'bg-warning-100 text-warning-600' },
  { num: 3, title: '教育经历', subtitle: '最高学历及学习经历', icon: GraduationCap, iconBg: 'bg-accent-100 text-accent-600' },
  { num: 4, title: '紧急联系人', subtitle: '紧急情况下的联系人', icon: HeartHandshake, iconBg: 'bg-rose-100 text-rose-600' },
  { num: 5, title: '核对提交', subtitle: '确认所有信息无误', icon: ClipboardCheck, iconBg: 'bg-fuchsia-100 text-fuchsia-600' },
];

const DEGREE_OPTIONS = ['高中/中专', '大专', '大学本科', '硕士研究生', '博士研究生', '其他'];

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentProcessId, setCurrentProcessId } = useUserStore();
  const { getPersonalInfo, updatePersonalInfo, completePersonalInfo, getOnboardingProcessById } = useOnboardingStore();

  const processId = id || currentProcessId || '';

  useEffect(() => {
    if (processId && !currentProcessId) {
      setCurrentProcessId(processId);
    }
  }, [processId, currentProcessId, setCurrentProcessId]);

  const existingInfo = useMemo(() => getPersonalInfo(processId), [processId, getPersonalInfo]);
  const process = useMemo(() => getOnboardingProcessById(processId), [processId, getOnboardingProcessById]);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(() => ({
    fullName: existingInfo?.fullName || process?.employeeName || '',
    gender: existingInfo?.gender || 'MALE',
    idNumber: existingInfo?.idNumber || '',
    birthDate: existingInfo?.birthDate || '',
    phone: existingInfo?.phone || '',
    address: existingInfo?.address || '',
    bankName: existingInfo?.bankName || '',
    bankAccount: existingInfo?.bankAccount || '',
    education: existingInfo?.education?.length ? existingInfo.education : [
      { school: '', degree: '', major: '', startDate: '', endDate: '' },
    ],
    emergencyContact: existingInfo?.emergencyContact || { name: '', relationship: '', phone: '' },
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', major: '', startDate: '', endDate: '' }],
    }));
  };

  const removeEducation = (idx: number) => {
    if (formData.education.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  const updateEducation = (idx: number, field: keyof EducationRecord, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === idx ? { ...edu, [field]: value } : edu)),
    }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = '请输入姓名';
    if (!formData.idNumber.trim()) errs.idNumber = '请输入身份证号';
    if (formData.idNumber && formData.idNumber.length !== 18) errs.idNumber = '身份证号应为18位';
    if (!formData.birthDate) errs.birthDate = '请选择出生日期';
    if (!formData.phone.trim()) errs.phone = '请输入手机号';
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) errs.phone = '请输入有效的手机号';
    if (!formData.address.trim()) errs.address = '请输入居住地址';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.bankName.trim()) errs.bankName = '请输入开户行';
    if (!formData.bankAccount.trim()) errs.bankAccount = '请输入银行卡号';
    if (formData.bankAccount && formData.bankAccount.length < 15) errs.bankAccount = '银行卡号长度不正确';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    const hasValidEducation = formData.education.some(
      (edu) => edu.school.trim() && edu.degree && edu.major.trim() && edu.startDate && edu.endDate,
    );
    if (!hasValidEducation) errs.education = '请至少填写一条完整的教育经历';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!formData.emergencyContact.name.trim()) errs.ecName = '请输入紧急联系人姓名';
    if (!formData.emergencyContact.relationship.trim()) errs.ecRel = '请输入与您的关系';
    if (!formData.emergencyContact.phone.trim()) errs.ecPhone = '请输入紧急联系人电话';
    if (formData.emergencyContact.phone && !/^1[3-9]\d{9}$/.test(formData.emergencyContact.phone))
      errs.ecPhone = '请输入有效的手机号';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    let valid = true;
    if (currentStep === 1) valid = validateStep1();
    else if (currentStep === 2) valid = validateStep2();
    else if (currentStep === 3) valid = validateStep3();
    else if (currentStep === 4) valid = validateStep4();

    if (valid) {
      updatePersonalInfo(processId, formData);
      if (currentStep < 5) {
        setCurrentStep((s) => (s + 1) as Step);
        setErrors({});
      }
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      updatePersonalInfo(processId, formData);
      setCurrentStep((s) => (s - 1) as Step);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    updatePersonalInfo(processId, formData);
    setTimeout(() => {
      completePersonalInfo(processId);
      setSubmitted(true);
      setIsSubmitting(false);
    }, 800);
  };

  if (submitted) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto py-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent-400/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary-400/15 blur-3xl" />
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-accent-400 to-teal-500 shadow-2xl shadow-accent-200 mb-6"
              >
                <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">个人信息提交成功！</h2>
              <p className="text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
                您的个人信息已成功提交并保存。
                接下来请继续完成政策确认、材料上传和合同签署等步骤。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate(`/employee/${processId}/portal`)}
                  className="btn-primary !py-3 !px-6 min-w-[160px] justify-center"
                >
                  返回入职首页
                </button>
                <button
                  onClick={() => navigate(`/employee/${processId}/policies`)}
                  className="btn-accent !py-3 !px-6 min-w-[160px] justify-center"
                >
                  下一步：政策确认
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </RoleBasedLayout>
    );
  }

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
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900 truncate">个人信息填写</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">
                <FileUser className="w-3.5 h-3.5" />
                步骤 {currentStep}/5
              </span>
            </div>
            <p className="text-sm text-neutral-500">请准确填写以下信息，以便HR完成后续入职手续</p>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex items-start gap-2 md:gap-4">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex-1 min-w-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10',
                        isDone
                          ? 'bg-gradient-to-br from-accent-400 to-teal-500 text-white shadow-lg shadow-accent-200'
                          : isActive
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200 ring-4 ring-primary-100'
                          : 'bg-neutral-100 text-neutral-400',
                      )}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      )}
                    </div>
                    <div className="mt-2 md:mt-3 text-center hidden sm:block">
                      <p
                        className={cn(
                          'text-xs md:text-sm font-semibold whitespace-nowrap',
                          isActive || isDone ? 'text-neutral-800' : 'text-neutral-400',
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] md:text-xs text-neutral-400 mt-0.5 hidden lg:block">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="hidden sm:block absolute w-full h-0.5 top-5 md:top-6 left-1/2 -z-0"
                      style={{ transform: 'translateX(50%)' }}
                    >
                      <div className={cn('h-full transition-all duration-500', isDone ? 'bg-gradient-to-r from-accent-400 to-teal-400' : 'bg-neutral-200')} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 md:p-8"
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <StepHeader step={STEPS[0]} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <FormField label="姓名" icon={User} error={errors.fullName} required>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="请输入真实姓名"
                      className={cn('input-field', errors.fullName && 'input-field-error')}
                    />
                  </FormField>
                  <FormField label="性别" required>
                    <div className="flex gap-3">
                      {(['MALE', 'FEMALE'] as const).map((g) => (
                        <label
                          key={g}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all',
                            formData.gender === g
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 hover:border-primary-200 text-neutral-600',
                          )}
                        >
                          <input
                            type="radio"
                            name="gender"
                            checked={formData.gender === g}
                            onChange={() => updateField('gender', g)}
                            className="sr-only"
                          />
                          <span className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center',
                            formData.gender === g ? 'border-primary-500' : 'border-neutral-300')}
                          >
                            {formData.gender === g && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                          </span>
                          {g === 'MALE' ? '男' : '女'}
                        </label>
                      ))}
                    </div>
                  </FormField>
                  <FormField label="身份证号" icon={IdCard} error={errors.idNumber} required>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => updateField('idNumber', e.target.value)}
                      placeholder="请输入18位身份证号码"
                      maxLength={18}
                      className={cn('input-field font-mono', errors.idNumber && 'input-field-error')}
                    />
                  </FormField>
                  <FormField label="出生日期" icon={CalendarDays} error={errors.birthDate} required>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => updateField('birthDate', e.target.value)}
                      className={cn('input-field', errors.birthDate && 'input-field-error')}
                    />
                  </FormField>
                  <FormField label="手机号" icon={Phone} error={errors.phone} required>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="请输入11位手机号"
                      maxLength={11}
                      className={cn('input-field font-mono', errors.phone && 'input-field-error')}
                    />
                  </FormField>
                  <FormField label="居住地址" icon={MapPin} error={errors.address} required full>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="请输入详细居住地址（省市区+街道门牌号）"
                      className={cn('input-field', errors.address && 'input-field-error')}
                    />
                  </FormField>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <StepHeader step={STEPS[1]} />
                <div className="p-4 rounded-xl bg-warning-50 border border-warning-100 text-sm text-warning-700 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-0.5">温馨提示</p>
                    <p className="text-warning-600/90 text-xs">
                      请准确填写银行卡信息，用于每月工资发放。建议使用工商银行、建设银行、农业银行等大行储蓄卡。
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <FormField label="开户银行" icon={Banknote} error={errors.bankName} required full>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => updateField('bankName', e.target.value)}
                      placeholder="如：中国工商银行上海张江支行"
                      className={cn('input-field', errors.bankName && 'input-field-error')}
                    />
                  </FormField>
                  <FormField label="银行卡号" icon={Banknote} error={errors.bankAccount} required full>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={(e) => updateField('bankAccount', e.target.value.replace(/\D/g, ''))}
                      placeholder="请输入银行卡号（纯数字，无空格）"
                      maxLength={22}
                      className={cn('input-field font-mono text-lg tracking-wider', errors.bankAccount && 'input-field-error')}
                    />
                  </FormField>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <StepHeader step={STEPS[2]} />
                {errors.education && (
                  <div className="p-3 rounded-xl bg-danger-50 border border-danger-100 text-sm text-danger-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.education}
                  </div>
                )}
                <div className="space-y-4">
                  {formData.education.map((edu, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 md:p-5 rounded-2xl bg-neutral-50/60 border border-neutral-100 relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700">
                          <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          教育经历 {formData.education.length > 1 ? `#${idx + 1}` : ''}
                        </span>
                        {formData.education.length > 1 && (
                          <button
                            onClick={() => removeEducation(idx)}
                            className="text-xs text-danger-500 hover:text-danger-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-danger-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            删除
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="学校名称" icon={GraduationCap} required>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                            placeholder="如：同济大学"
                            className="input-field"
                          />
                        </FormField>
                        <FormField label="学位学历" required>
                          <select
                            value={edu.degree}
                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                            className="input-field appearance-none pr-10"
                          >
                            <option value="">请选择学历</option>
                            {DEGREE_OPTIONS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </FormField>
                        <FormField label="专业名称" required>
                          <input
                            type="text"
                            value={edu.major}
                            onChange={(e) => updateEducation(idx, 'major', e.target.value)}
                            placeholder="如：软件工程"
                            className="input-field"
                          />
                        </FormField>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField label="开始年月" required>
                            <input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(idx, 'startDate', e.target.value)}
                              className="input-field"
                            />
                          </FormField>
                          <FormField label="结束年月" required>
                            <input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(idx, 'endDate', e.target.value)}
                              className="input-field"
                            />
                          </FormField>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button
                    onClick={addEducation}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50/40 text-neutral-500 hover:text-primary-600 flex items-center justify-center gap-2 text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    添加一条教育经历
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <StepHeader step={STEPS[3]} />
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-700 flex items-start gap-3">
                  <HeartHandshake className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-0.5">紧急联系人说明</p>
                    <p className="text-rose-600/90 text-xs">
                      当您发生紧急情况（如突发疾病、意外事故等）时，我们将第一时间联系此人。请务必填写准确信息。
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                  <FormField label="联系人姓名" icon={User} error={errors.ecName} required>
                    <input
                      type="text"
                      value={formData.emergencyContact.name}
                      onChange={(e) =>
                        updateField('emergencyContact', { ...formData.emergencyContact, name: e.target.value })
                      }
                      placeholder="请输入姓名"
                      className={cn('input-field', errors.ecName && 'input-field-error')}
                    />
                  </FormField>
                  <FormField label="与您的关系" error={errors.ecRel} required>
                    <input
                      type="text"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) =>
                        updateField('emergencyContact', { ...formData.emergencyContact, relationship: e.target.value })
                      }
                      placeholder="如：父母、配偶、兄弟姐妹"
                      className={cn('input-field', errors.ecRel && 'input-field-error')}
                    />
                  </FormField>
                  <FormField label="联系电话" icon={Phone} error={errors.ecPhone} required>
                    <input
                      type="tel"
                      value={formData.emergencyContact.phone}
                      onChange={(e) =>
                        updateField('emergencyContact', {
                          ...formData.emergencyContact,
                          phone: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      placeholder="请输入11位手机号"
                      maxLength={11}
                      className={cn('input-field font-mono', errors.ecPhone && 'input-field-error')}
                    />
                  </FormField>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <StepHeader step={STEPS[4]} />
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-50 via-accent-50/50 to-warning-50 border border-primary-100/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 mb-1">信息核对</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        请仔细核对以下所有信息，确保准确无误。
                        提交后如需修改，请联系HR进行调整。
                      </p>
                    </div>
                  </div>
                </div>

                <ReviewSection title="基本信息" icon={User}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <ReviewRow label="姓名" value={formData.fullName} />
                    <ReviewRow label="性别" value={formData.gender === 'MALE' ? '男' : '女'} />
                    <ReviewRow label="身份证号" value={formData.idNumber} sensitive />
                    <ReviewRow label="出生日期" value={formData.birthDate} />
                    <ReviewRow label="手机号" value={formData.phone} sensitive />
                    <ReviewRow label="居住地址" value={formData.address} full />
                  </div>
                </ReviewSection>

                <ReviewSection title="银行信息" icon={Banknote}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <ReviewRow label="开户行" value={formData.bankName} full />
                    <ReviewRow label="银行卡号" value={formData.bankAccount} sensitive full />
                  </div>
                </ReviewSection>

                <ReviewSection title="教育经历" icon={GraduationCap}>
                  {formData.education.filter((e) => e.school).map((edu, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 mb-3 last:mb-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <ReviewRow label="学校" value={edu.school} />
                        <ReviewRow label="学历" value={edu.degree} />
                        <ReviewRow label="专业" value={edu.major} />
                        <ReviewRow label="时间" value={`${edu.startDate} ~ ${edu.endDate}`} />
                      </div>
                    </div>
                  ))}
                </ReviewSection>

                <ReviewSection title="紧急联系人" icon={HeartHandshake}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <ReviewRow label="姓名" value={formData.emergencyContact.name} />
                    <ReviewRow label="关系" value={formData.emergencyContact.relationship} />
                    <ReviewRow label="电话" value={formData.emergencyContact.phone} sensitive />
                  </div>
                </ReviewSection>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-3"
        >
          <button
            onClick={goPrev}
            disabled={currentStep === 1}
            className={cn(
              'btn-secondary !py-3 !px-6 min-w-[120px] justify-center',
              currentStep === 1 && 'opacity-50 cursor-not-allowed',
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            上一步
          </button>
          {currentStep < 5 ? (
            <button onClick={goNext} className="btn-primary !py-3 !px-8 min-w-[140px] justify-center">
              下一步
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-accent !py-3 !px-8 min-w-[160px] justify-center"
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
                  <Check className="w-5 h-5" />
                  确认提交
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </RoleBasedLayout>
  );
}

function StepHeader({ step }: { step: typeof STEPS[number] }) {
  const Icon = step.icon;
  return (
    <div className="flex items-center gap-4 pb-4 border-b border-neutral-100 mb-2">
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', step.iconBg)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-neutral-900">{step.title}</h2>
        <p className="text-sm text-neutral-500">{step.subtitle}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  error,
  children,
  required,
  full,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={cn(full && 'md:col-span-2')}>
      <label className="label-field flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className="w-4 h-4 text-neutral-400" />}
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-danger-600 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

function ReviewSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-neutral-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ReviewRow({
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
  const displayValue = value
    ? sensitive && value.length > 8
      ? value.slice(0, 4) + '****' + value.slice(-4)
      : value
    : '—';
  return (
    <div className={cn('flex items-start gap-3 py-2', full && 'md:col-span-2')}>
      <span className="text-neutral-500 w-24 md:w-28 flex-shrink-0">{label}</span>
      <span className={cn('text-neutral-800 flex-1 break-all', !value && 'text-neutral-400')}>
        {displayValue}
      </span>
    </div>
  );
}
