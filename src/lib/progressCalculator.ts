import type { OnboardingProcess, OnboardingTask, EmployeePersonalInfo } from '@/types';

export const calculateOverallProgress = (
  process_: OnboardingProcess,
  tasks: OnboardingTask[],
  personalInfo?: EmployeePersonalInfo,
  allPoliciesAcknowledged = false,
  allDocumentsUploaded = false,
  contractFullySigned = false,
): number => {
  const processTasks = tasks.filter((t) => t.processId === process_.id);
  const totalTasks = processTasks.length;
  const completedTasks = processTasks.filter((t) => t.status === 'COMPLETED').length;

  const weights = {
    personalInfo: 15,
    policies: 10,
    documents: 10,
    tasks: 40,
    contract: 25,
  };

  let score = 0;
  score += (personalInfo?.isCompleted ? 1 : 0) * weights.personalInfo;
  score += (allPoliciesAcknowledged ? 1 : 0) * weights.policies;
  score += (allDocumentsUploaded ? 1 : 0) * weights.documents;
  score += totalTasks > 0 ? (completedTasks / totalTasks) * weights.tasks : 0;
  score += contractFullySigned ? weights.contract : 0;

  return Math.round(score);
};

export const calculateTasksProgress = (tasks: OnboardingTask[]): { completed: number; total: number; percent: number } => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
};
