import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Send,
  User,
  Building2,
  Briefcase,
  CalendarDays,
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import type { EvaluationResult } from '@/types';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dateUtils';

interface EvaluationFormProps {
  processId: string;
  managerId: string;
  onSuccess: () => void;
}

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: typeof Star;
  description: string;
}

function ScoreSlider({ label, value, onChange, icon: Icon, description }: ScoreSliderProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-accent-600';
    if (score >= 75) return 'text-primary-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getTrackGradient = (score: number) => {
    const percent = score;
    return `linear-gradient(to right, #0F4C81 0%, #2DD4A8 ${percent}%, #E7E5E4 ${percent}%)`;
  };

  return (
    <div className="rounded-2xl bg-neutral-50/80 p-5 border border-neutral-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-medium text-neutral-900">{label}</h4>
            <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
          </div>
        </div>
        <motion.div
          key={value}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={cn(
            'text-3xl font-bold tabular-nums',
            getScoreColor(value),
          )}
        >
          {value}
          <span className="text-base font-medium text-neutral-400 ml-1">/100</span>
        </motion.div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: getTrackGradient(value),
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-neutral-400">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

const resultOptions: Array<{
  value: EvaluationResult;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  color: string;
  activeBg: string;
  activeBorder: string;
  activeIcon: string;
}> = [
  {
    value: 'PASS',
    label: '建议通过',
    description: '表现优秀，符合岗位要求，建议按期转正',
    icon: CheckCircle2,
    color: 'text-accent-700',
    activeBg: 'bg-accent-50',
    activeBorder: 'border-accent-400 ring-4 ring-accent-100',
    activeIcon: 'text-accent-600',
  },
  {
    value: 'EXTEND',
    label: '延长试用期',
    description: '部分方面有待提升，建议延长试用期观察',
    icon: Clock,
    color: 'text-warning-700',
    activeBg: 'bg-warning-50',
    activeBorder: 'border-warning-400 ring-4 ring-warning-100',
    activeIcon: 'text-warning-600',
  },
  {
    value: 'FAIL',
    label: '不予通过',
    description: '未达到岗位要求，建议终止试用',
    icon: XCircle,
    color: 'text-danger-700',
    activeBg: 'bg-danger-50',
    activeBorder: 'border-danger-400 ring-4 ring-danger-100',
    activeIcon: 'text-danger-600',
  },
];

export default function EvaluationForm({ processId, managerId, onSuccess }: EvaluationFormProps) {
  const [workAbility, setWorkAbility] = useState(80);
  const [teamCollaboration, setTeamCollaboration] = useState(80);
  const [attendance, setAttendance] = useState(90);
  const [learningAgility, setLearningAgility] = useState(75);
  const [overallComment, setOverallComment] = useState('');
  const [suggestedResult, setSuggestedResult] = useState<EvaluationResult>('PASS');
  const [submitting, setSubmitting] = useState(false);

  const process_ = useOnboardingStore((s) => s.getOnboardingProcessById(processId));
  const submitEvaluation = useOnboardingStore((s) => s.submitEvaluation);

  const avgScore = Math.round((workAbility + teamCollaboration + attendance + learningAgility) / 4);

  const handleSubmit = () => {
    if (!overallComment.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      submitEvaluation({
        processId,
        managerId,
        workAbility,
        teamCollaboration,
        attendance,
        learningAgility,
        overallComment: overallComment.trim(),
        suggestedResult,
      });
      setSubmitting(false);
      onSuccess();
    }, 1000);
  };

  if (!process_) {
    return (
      <div className="card p-12 text-center text-neutral-500">
        未找到入职流程
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden mb-6"
      >
        <div className="bg-gradient-primary px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">转正评估</h2>
              <p className="text-sm opacity-90 mt-0.5">试用期结束综合评价</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-xl font-bold text-white shadow-lg">
              {process_.employeeName.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-neutral-900">{process_.employeeName}</h3>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                  {process_.department}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                  {process_.position}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
                  {formatDate(process_.startDate)} 入职
                </div>
              </div>
            </div>
            <motion.div
              key={avgScore}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center shrink-0"
            >
              <div className="text-4xl font-bold text-primary-600 tabular-nums">{avgScore}</div>
              <div className="text-xs text-neutral-500 mt-0.5">综合分</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-5 mb-6">
        <ScoreSlider
          label="工作能力"
          value={workAbility}
          onChange={setWorkAbility}
          icon={Star}
          description="专业技能、任务完成质量与效率"
        />
        <ScoreSlider
          label="团队协作"
          value={teamCollaboration}
          onChange={setTeamCollaboration}
          icon={User}
          description="沟通能力、团队配合、跨部门协作"
        />
        <ScoreSlider
          label="出勤情况"
          value={attendance}
          onChange={setAttendance}
          icon={CalendarDays}
          description="出勤率、守时情况、请假频率"
        />
        <ScoreSlider
          label="学习能力"
          value={learningAgility}
          onChange={setLearningAgility}
          icon={ClipboardCheck}
          description="接受新知识速度、自我提升意愿"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-600" />
          综合评语
        </h3>
        <textarea
          value={overallComment}
          onChange={(e) => setOverallComment(e.target.value)}
          placeholder="请详细描述员工在试用期内的综合表现，包括优点、不足及改进建议..."
          rows={6}
          className="input-field resize-none"
        />
        <div className="mt-2 flex justify-end text-xs text-neutral-400">
          {overallComment.length} 字
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary-600" />
          评估结果
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {resultOptions.map((option) => {
            const isActive = suggestedResult === option.value;
            const Icon = option.icon;
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: isActive ? 1 : 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSuggestedResult(option.value)}
                className={cn(
                  'relative text-left rounded-2xl border-2 p-4 transition-all',
                  isActive
                    ? cn(option.activeBg, option.activeBorder)
                    : 'bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      isActive ? cn('bg-white shadow-sm', option.activeIcon) : 'bg-neutral-100 text-neutral-400',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className={cn('font-semibold', isActive ? option.color : 'text-neutral-800')}>
                      {option.label}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3"
                  >
                    <div className={cn('h-5 w-5 rounded-full flex items-center justify-center', option.activeIcon.replace('text-', 'bg-').replace('-600', '-500'))}>
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center pb-4"
      >
        <button
          onClick={handleSubmit}
          disabled={submitting || !overallComment.trim()}
          className="btn-primary min-w-56 !py-3 text-base"
        >
          {submitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
              />
              提交中...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              提交评估
            </>
          )}
        </button>
      </motion.div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #0F4C81;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15, 76, 129, 0.3);
          transition: all 0.2s;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(15, 76, 129, 0.4);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #0F4C81;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15, 76, 129, 0.3);
        }
      `}</style>
    </div>
  );
}
