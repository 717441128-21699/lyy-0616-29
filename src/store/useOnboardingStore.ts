import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, formatISO, differenceInDays, parseISO } from 'date-fns';
import type {
  OnboardingProcess,
  OnboardingTask,
  OnboardingStatus,
  TaskStatus,
  EmployeePersonalInfo,
  PolicyAcknowledgement,
  UploadedDocument,
  EmploymentContract,
  ProbationEvaluation,
  TaskCategory,
  User,
  Notification,
  NotificationType,
} from '@/types';
import {
  mockProcesses,
  mockTasks,
  mockPersonalInfos,
  mockAcknowledgements,
  mockDocuments,
  mockContracts,
  mockEvaluations,
  mockNotifications,
} from '@/data/mockProcesses';
import { mockUsers } from '@/data/mockUsers';
import { generateContractContent } from '@/lib/contractGenerator';
import { calculateOverallProgress } from '@/lib/progressCalculator';

const iso = (d: Date) => formatISO(d);
const today = new Date();

export const allUsers: User[] = mockUsers;

interface OnboardingState {
  processes: OnboardingProcess[];
  tasks: OnboardingTask[];
  personalInfos: Record<string, EmployeePersonalInfo>;
  acknowledgements: PolicyAcknowledgement[];
  documents: UploadedDocument[];
  contracts: EmploymentContract[];
  evaluations: ProbationEvaluation[];
  notifications: Notification[];
  lastEvaluationCheck: string | null;

  getAllOnboardingProcesses: () => OnboardingProcess[];
  getUserById: (userId: string) => User | undefined;
  getOnboardingProcessById: (id: string) => OnboardingProcess | undefined;
  getProcessesByStatus: (status: OnboardingStatus[]) => OnboardingProcess[];
  getProcessesByManager: (managerId: string) => OnboardingProcess[];
  getTasksForProcess: (processId: string) => OnboardingTask[];
  getTasksForAssignee: (assigneeId: string) => OnboardingTask[];
  getTasksForAssigneeByCategory: (assigneeId: string, category: TaskCategory) => OnboardingTask[];
  getPersonalInfo: (processId: string) => EmployeePersonalInfo | undefined;
  getAcknowledgementsForProcess: (processId: string) => PolicyAcknowledgement[];
  isPolicyAcknowledged: (processId: string, policyId: string) => boolean;
  getDocumentsForProcess: (processId: string) => UploadedDocument[];
  getContractForProcess: (processId: string) => EmploymentContract | undefined;
  getEvaluationForProcess: (processId: string) => ProbationEvaluation | undefined;
  getNotificationsForUser: (userId: string) => Notification[];
  getUnreadNotificationCount: (userId: string) => number;

  createOnboardingProcess: (data: {
    employeeName: string;
    employeeEmail: string;
    department: string;
    position: string;
    startDate: string;
    salary: number;
    managerId: string;
    itOwnerId: string;
    adminOwnerId: string;
    createdBy: string;
  }) => string;

  updateProcessStatus: (processId: string, status: OnboardingStatus) => void;
  recalculateProgress: (processId: string) => void;

  updatePersonalInfo: (processId: string, data: Partial<EmployeePersonalInfo>) => void;
  completePersonalInfo: (processId: string) => void;

  acknowledgePolicy: (processId: string, policyId: string) => void;

  uploadDocument: (processId: string, doc: Omit<UploadedDocument, 'id' | 'processId' | 'uploadDate'>) => void;
  removeDocument: (docId: string) => void;

  updateTaskStatus: (taskId: string, status: TaskStatus, notesOrAssigneeId?: string | undefined, notes?: string) => void;

  generateContract: (processId: string) => void;
  employeeSignContract: (processId: string, signatureData: string) => void;
  hrSignContract: (processId: string, signatureData: string) => void;

  submitEvaluation: (data: Omit<ProbationEvaluation, 'id' | 'submittedAt'>) => void;

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  checkEvaluationReminders: () => void;
  resetToMockData: () => void;
}

const generateDefaultTasks = (
  processId: string,
  startDate: string,
  itOwnerId: string,
  adminOwnerId: string,
  managerId: string,
): OnboardingTask[] => {
  const start = new Date(startDate);
  const getOwner = (id: string) => allUsers.find((u) => u.id === id) || { id, name: '未分配' };
  const itOwner = getOwner(itOwnerId);
  const adminOwner = getOwner(adminOwnerId);
  const managerOwner = getOwner(managerId);

  const taskDefs: Array<Omit<OnboardingTask, 'id' | 'processId' | 'status'>> = [
    { title: '开通企业邮箱与域账号', description: '分配正式邮箱、设置初始密码、加入通讯组', category: 'IT', assigneeId: itOwner.id, assigneeName: itOwner.name, dueDate: iso(addDays(start, 1)) },
    { title: '配置开发环境与工具', description: '安装IDE、Git等开发工具，配置代码仓库权限', category: 'IT', assigneeId: itOwner.id, assigneeName: itOwner.name, dueDate: iso(addDays(start, 2)) },
    { title: '发放工作电脑与外设', description: '申请笔记本电脑、显示器、键鼠套装', category: 'IT', assigneeId: itOwner.id, assigneeName: itOwner.name, dueDate: iso(addDays(start, 1)) },
    { title: '安排工位与办公区域', description: '根据部门分配办公工位，配置办公桌椅', category: 'ADMIN', assigneeId: adminOwner.id, assigneeName: adminOwner.name, dueDate: iso(addDays(start, 1)) },
    { title: '办理门禁卡与工牌', description: '制作员工工牌、办理门禁系统权限', category: 'ADMIN', assigneeId: adminOwner.id, assigneeName: adminOwner.name, dueDate: iso(addDays(start, 2)) },
    { title: '办公用品采购与发放', description: '配备笔记本、签字笔等基础办公用品', category: 'ADMIN', assigneeId: adminOwner.id, assigneeName: adminOwner.name, dueDate: iso(addDays(start, 1)) },
    { title: '组织入职欢迎会', description: '介绍团队成员、参观办公环境、安排午餐', category: 'MANAGER', assigneeId: managerOwner.id, assigneeName: managerOwner.name, dueDate: iso(addDays(start, 1)) },
    { title: '岗位职责与业务培训', description: '讲解岗位职责、业务流程、团队协作规范', category: 'MANAGER', assigneeId: managerOwner.id, assigneeName: managerOwner.name, dueDate: iso(addDays(start, 3)) },
    { title: '制定试用期工作计划', description: '明确试用期目标、关键交付物、检查节点', category: 'MANAGER', assigneeId: managerOwner.id, assigneeName: managerOwner.name, dueDate: iso(addDays(start, 3)) },
  ];

  return taskDefs.map((t, i) => ({
    ...t,
    id: `${processId}-task-${i + 1}`,
    processId,
    status: 'PENDING' as TaskStatus,
  }));
};

const getInitialState = () => ({
  processes: mockProcesses,
  tasks: mockTasks,
  personalInfos: mockPersonalInfos,
  acknowledgements: mockAcknowledgements,
  documents: mockDocuments,
  contracts: mockContracts,
  evaluations: mockEvaluations,
  notifications: mockNotifications,
  lastEvaluationCheck: null,
});

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      getAllOnboardingProcesses: () => get().processes,
      getUserById: (userId) => allUsers.find((u) => u.id === userId),
      getOnboardingProcessById: (id) => get().processes.find((p) => p.id === id),
      getProcessesByStatus: (status) => get().processes.filter((p) => status.includes(p.status)),
      getProcessesByManager: (managerId) => get().processes.filter((p) => p.managerId === managerId),
      getTasksForProcess: (processId) => get().tasks.filter((t) => t.processId === processId),
      getTasksForAssignee: (assigneeId) => get().tasks.filter((t) => t.assigneeId === assigneeId),
      getTasksForAssigneeByCategory: (assigneeId, category) =>
        get().tasks.filter((t) => t.assigneeId === assigneeId && t.category === category),
      getPersonalInfo: (processId) => get().personalInfos[processId],
      getAcknowledgementsForProcess: (processId) => get().acknowledgements.filter((a) => a.processId === processId),
      isPolicyAcknowledged: (processId, policyId) =>
        get().acknowledgements.some((a) => a.processId === processId && a.policyId === policyId),
      getDocumentsForProcess: (processId) => get().documents.filter((d) => d.processId === processId),
      getContractForProcess: (processId) => get().contracts.find((c) => c.processId === processId),
      getEvaluationForProcess: (processId) => get().evaluations.find((e) => e.processId === processId),
      getNotificationsForUser: (userId) =>
        get().notifications
          .filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getUnreadNotificationCount: (userId) =>
        get().notifications.filter((n) => n.userId === userId && !n.read).length,

      createOnboardingProcess: (data) => {
        const newId = `proc-${String(Date.now()).slice(-6)}`;
        const employeeId = `emp-${String(Date.now()).slice(-6)}`;
        const start = new Date(data.startDate);
        const probationEnd = iso(addDays(start, 90));

        const newProcess: OnboardingProcess = {
          id: newId,
          employeeId,
          employeeName: data.employeeName,
          employeeEmail: data.employeeEmail,
          department: data.department,
          position: data.position,
          startDate: data.startDate,
          salary: data.salary,
          contractType: '三年期劳动合同',
          probationEndDate: probationEnd,
          status: 'CREATED',
          overallProgress: 0,
          createdAt: iso(today),
          createdBy: data.createdBy,
          managerId: data.managerId,
          itOwnerId: data.itOwnerId,
          adminOwnerId: data.adminOwnerId,
          welcomeEmailSent: true,
        };

        const newTasks = generateDefaultTasks(
          newId,
          data.startDate,
          data.itOwnerId,
          data.adminOwnerId,
          data.managerId,
        );

        set((state) => ({
          processes: [...state.processes, newProcess],
          tasks: [...state.tasks, ...newTasks],
        }));

        get().addNotification({
          userId: data.itOwnerId,
          type: 'TASK_ASSIGNED',
          title: '新任务待处理',
          message: `新员工 ${data.employeeName} 的入职任务已分配给您，请及时处理。`,
          relatedProcessId: newId,
        });

        get().addNotification({
          userId: data.adminOwnerId,
          type: 'TASK_ASSIGNED',
          title: '新任务待处理',
          message: `新员工 ${data.employeeName} 的入职任务已分配给您，请及时处理。`,
          relatedProcessId: newId,
        });

        get().addNotification({
          userId: data.managerId,
          type: 'TASK_ASSIGNED',
          title: '新员工入职',
          message: `新员工 ${data.employeeName} 即将加入您的团队，请做好入职准备。`,
          relatedProcessId: newId,
        });

        return newId;
      },

      updateProcessStatus: (processId, status) => {
        set((state) => ({
          processes: state.processes.map((p) => (p.id === processId ? { ...p, status } : p)),
        }));
      },

      recalculateProgress: (processId) => {
        const state = get();
        const process_ = state.processes.find((p) => p.id === processId);
        if (!process_) return;
        const tasks = state.tasks.filter((t) => t.processId === processId);
        const personalInfo = state.personalInfos[processId];
        const processAcks = state.acknowledgements.filter((a) => a.processId === processId);
        const requiredPolicies = 4;
        const allPoliciesAcked = processAcks.length >= requiredPolicies;
        const docs = state.documents.filter((d) => d.processId === processId);
        const requiredDocs = 4;
        const allDocsUploaded = docs.length >= requiredDocs;
        const contract = state.contracts.find((c) => c.processId === processId);
        const evaluation = state.evaluations.find((e) => e.processId === processId);
        const contractSigned = contract?.status === 'FULLY_SIGNED';
        const evaluationSubmitted = !!evaluation;

        if (!contract && personalInfo?.isCompleted && allDocsUploaded) {
          get().generateContract(processId);
          return;
        }

        const progress = calculateOverallProgress(
          process_,
          tasks,
          personalInfo,
          allPoliciesAcked,
          allDocsUploaded,
          !!contractSigned,
          evaluationSubmitted,
        );

        let newStatus = process_.status;
        if (progress >= 100) newStatus = 'COMPLETED';
        else if (progress >= 85 && contractSigned && !evaluationSubmitted) newStatus = 'EVALUATION_PENDING';
        else if (progress >= 70 && contractSigned) newStatus = 'PROBATION';
        else if (progress >= 45 && contract) newStatus = 'CONTRACT_PENDING';
        else if (progress >= 20) newStatus = 'INFO_COLLECTING';
        else newStatus = 'CREATED';

        if (newStatus !== process_.status) {
          if (newStatus === 'CONTRACT_PENDING') {
            get().addNotification({
              userId: process_.employeeId,
              type: 'CONTRACT_READY',
              title: '劳动合同已生成',
              message: '您的劳动合同已生成，请尽快签署。',
              relatedProcessId: processId,
            });
          }
          if (newStatus === 'PROBATION') {
            get().addNotification({
              userId: process_.employeeId,
              type: 'WELCOME',
              title: '欢迎加入星辰科技',
              message: '您已完成入职手续，正式进入试用期。祝您工作顺利！',
              relatedProcessId: processId,
            });
          }
          if (newStatus === 'EVALUATION_PENDING') {
            get().addNotification({
              userId: process_.managerId,
              type: 'EVALUATION_REMINDER',
              title: '转正评估待提交',
              message: `${process_.employeeName} 的试用期即将结束，请及时提交转正评估。`,
              relatedProcessId: processId,
            });
          }
        }

        set((s) => ({
          processes: s.processes.map((p) => (p.id === processId ? { ...p, overallProgress: progress, status: newStatus } : p)),
        }));
      },

      updatePersonalInfo: (processId, data) => {
        const existing = get().personalInfos[processId];
        set((state) => ({
          personalInfos: {
            ...state.personalInfos,
            [processId]: {
              processId,
              fullName: data.fullName ?? existing?.fullName ?? '',
              gender: data.gender ?? existing?.gender ?? 'MALE',
              idNumber: data.idNumber ?? existing?.idNumber ?? '',
              birthDate: data.birthDate ?? existing?.birthDate ?? '',
              phone: data.phone ?? existing?.phone ?? '',
              address: data.address ?? existing?.address ?? '',
              bankAccount: data.bankAccount ?? existing?.bankAccount ?? '',
              bankName: data.bankName ?? existing?.bankName ?? '',
              education: data.education ?? existing?.education ?? [],
              emergencyContact: data.emergencyContact ?? existing?.emergencyContact ?? { name: '', relationship: '', phone: '' },
              isCompleted: existing?.isCompleted ?? false,
            },
          },
        }));
      },

      completePersonalInfo: (processId) => {
        set((state) => ({
          personalInfos: {
            ...state.personalInfos,
            [processId]: {
              ...state.personalInfos[processId],
              isCompleted: true,
            },
          },
        }));
        const proc = get().getOnboardingProcessById(processId);
        if (proc) {
          get().addNotification({
            userId: proc.createdBy,
            type: 'INFO_COMPLETED',
            title: '员工信息已提交',
            message: `${proc.employeeName} 已完成个人信息填写。`,
            relatedProcessId: processId,
          });
        }
        setTimeout(() => get().recalculateProgress(processId), 100);
      },

      acknowledgePolicy: (processId, policyId) => {
        if (get().isPolicyAcknowledged(processId, policyId)) return;
        set((state) => ({
          acknowledgements: [
            ...state.acknowledgements,
            { processId, policyId, acknowledgedAt: iso(new Date()) },
          ],
        }));
        setTimeout(() => get().recalculateProgress(processId), 100);
      },

      uploadDocument: (processId, doc) => {
        const id = `doc-${String(Date.now()).slice(-6)}`;
        set((state) => ({
          documents: [
            ...state.documents,
            { ...doc, id, processId, uploadDate: iso(new Date()) },
          ],
        }));
        setTimeout(() => get().recalculateProgress(processId), 100);
      },

      removeDocument: (docId) => {
        const doc = get().documents.find((d) => d.id === docId);
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== docId),
        }));
        if (doc) setTimeout(() => get().recalculateProgress(doc.processId), 100);
      },

      updateTaskStatus: (taskId, status, notesOrAssigneeId, notes) => {
        const task = get().tasks.find((t) => t.id === taskId);
        const finalNotes = typeof notesOrAssigneeId === 'string' && notes !== undefined
          ? notes
          : (notesOrAssigneeId as string | undefined);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status,
                  notes: finalNotes ?? t.notes,
                  completedAt: status === 'COMPLETED' ? iso(new Date()) : t.completedAt,
                }
              : t,
          ),
        }));
        if (task && status === 'COMPLETED') {
          const proc = get().getOnboardingProcessById(task.processId);
          if (proc) {
            const procTasks = get().getTasksForProcess(task.processId);
            const allDone = procTasks.every((t) => t.status === 'COMPLETED');
            if (allDone) {
              get().addNotification({
                userId: proc.createdBy,
                type: 'ALL_TASKS_DONE',
                title: '入职任务全部完成',
                message: `${proc.employeeName} 的所有入职任务已完成。`,
                relatedProcessId: task.processId,
              });
            }
          }
        }
        if (task) setTimeout(() => get().recalculateProgress(task.processId), 100);
      },

      generateContract: (processId) => {
        const state = get();
        if (state.contracts.find((c) => c.processId === processId)) return;
        const process_ = state.processes.find((p) => p.id === processId);
        if (!process_) return;
        const personalInfo = state.personalInfos[processId];
        const content = generateContractContent(process_, personalInfo);
        set((s) => ({
          contracts: [
            ...s.contracts,
            {
              id: `contract-${String(Date.now()).slice(-6)}`,
              processId,
              content,
              generatedAt: iso(new Date()),
              status: 'GENERATED',
            },
          ],
        }));
        setTimeout(() => get().recalculateProgress(processId), 100);
      },

      employeeSignContract: (processId, signatureData) => {
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.processId === processId
              ? {
                  ...c,
                  employeeSignature: signatureData,
                  employeeSignedAt: iso(new Date()),
                  status: 'EMPLOYEE_SIGNED',
                }
              : c,
          ),
        }));
        const proc = get().getOnboardingProcessById(processId);
        if (proc) {
          get().addNotification({
            userId: proc.createdBy,
            type: 'CONTRACT_READY',
            title: '员工已签署合同',
            message: `${proc.employeeName} 已完成劳动合同签署，请HR完成最终签署。`,
            relatedProcessId: processId,
          });
        }
        setTimeout(() => get().recalculateProgress(processId), 100);
      },

      hrSignContract: (processId, signatureData) => {
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.processId === processId
              ? {
                  ...c,
                  hrSignature: signatureData,
                  hrSignedAt: iso(new Date()),
                  status: 'FULLY_SIGNED',
                }
              : c,
          ),
        }));
        const proc = get().getOnboardingProcessById(processId);
        if (proc) {
          get().addNotification({
            userId: proc.employeeId,
            type: 'CONTRACT_READY',
            title: '劳动合同已生效',
            message: 'HR已完成合同签署，您的劳动合同已正式生效。',
            relatedProcessId: processId,
          });
        }
        setTimeout(() => get().recalculateProgress(processId), 100);
      },

      submitEvaluation: (data) => {
        const id = `eval-${String(Date.now()).slice(-6)}`;
        set((state) => ({
          evaluations: [
            ...state.evaluations,
            { ...data, id, submittedAt: iso(new Date()) },
          ],
        }));
        const proc = get().getOnboardingProcessById(data.processId);
        if (proc) {
          get().addNotification({
            userId: proc.createdBy,
            type: 'EVALUATION_SUBMITTED',
            title: '转正评估已提交',
            message: `${proc.employeeName} 的转正评估已提交，建议结果：${data.suggestedResult === 'PASS' ? '通过' : data.suggestedResult === 'EXTEND' ? '延长试用期' : '不予通过'}。`,
            relatedProcessId: data.processId,
          });
          get().addNotification({
            userId: proc.employeeId,
            type: 'EVALUATION_SUBMITTED',
            title: '转正评估结果已出',
            message: '您的转正评估已提交，请查看评估结果。',
            relatedProcessId: data.processId,
          });
        }
        setTimeout(() => get().recalculateProgress(data.processId), 100);
      },

      addNotification: (notification) => {
        const id = `notif-${String(Date.now()).slice(-6)}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id,
              read: false,
              createdAt: iso(new Date()),
            },
          ],
        }));
      },

      markNotificationRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          ),
        }));
      },

      markAllNotificationsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n,
          ),
        }));
      },

      checkEvaluationReminders: () => {
        const state = get();
        const todayStr = iso(today).split('T')[0];
        if (state.lastEvaluationCheck === todayStr) return;

        const procs = state.processes.filter(
          (p) => p.status === 'PROBATION' || p.status === 'EVALUATION_PENDING',
        );

        procs.forEach((proc) => {
          try {
            const probationEnd = parseISO(proc.probationEndDate);
            const daysLeft = differenceInDays(probationEnd, today);

            if (daysLeft <= 15 && daysLeft > 0) {
              const existingReminder = state.notifications.find(
                (n) =>
                  n.type === 'EVALUATION_REMINDER' &&
                  n.relatedProcessId === proc.id &&
                  n.userId === proc.managerId &&
                  n.createdAt.split('T')[0] === todayStr,
              );

              if (!existingReminder) {
                get().addNotification({
                  userId: proc.managerId,
                  type: 'EVALUATION_REMINDER' as NotificationType,
                  title: '转正评估提醒',
                  message: `${proc.employeeName} 的试用期将于 ${daysLeft} 天后结束，请及时提交转正评估表。`,
                  relatedProcessId: proc.id,
                });
                get().addNotification({
                  userId: proc.createdBy,
                  type: 'EVALUATION_REMINDER' as NotificationType,
                  title: '试用期即将到期提醒',
                  message: `${proc.employeeName} 的试用期还有 ${daysLeft} 天到期，请关注其转正评估进展。`,
                  relatedProcessId: proc.id,
                });
              }
            }
          } catch {
            // skip invalid dates
          }
        });

        set({ lastEvaluationCheck: todayStr });
      },

      resetToMockData: () => {
        set(getInitialState());
      },
    }),
    {
      name: 'onboarding-store',
      partialize: (state) => ({
        processes: state.processes,
        tasks: state.tasks,
        personalInfos: state.personalInfos,
        acknowledgements: state.acknowledgements,
        documents: state.documents,
        contracts: state.contracts,
        evaluations: state.evaluations,
        notifications: state.notifications,
        lastEvaluationCheck: state.lastEvaluationCheck,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => {
            state.checkEvaluationReminders();
          }, 500);
        }
      },
    },
  ),
);
