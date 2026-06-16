import type {
  OnboardingProcess,
  OnboardingTask,
  EmployeePersonalInfo,
  PolicyAcknowledgement,
  UploadedDocument,
  EmploymentContract,
  ProbationEvaluation,
  Notification,
} from '@/types';
import { addDays, formatISO } from 'date-fns';

const today = new Date();
const iso = (d: Date) => formatISO(d, { representation: 'complete' });

export const mockProcesses: OnboardingProcess[] = [
  {
    id: 'proc-001',
    employeeId: 'emp-001',
    employeeName: '苏雨涵',
    employeeEmail: 'suyuhan@example.com',
    department: '产品研发部',
    position: '高级前端工程师',
    startDate: iso(addDays(today, -30)),
    salary: 28000,
    contractType: '三年期劳动合同',
    probationEndDate: iso(addDays(today, 60)),
    status: 'PROBATION',
    overallProgress: 85,
    createdAt: iso(addDays(today, -35)),
    createdBy: 'hr-001',
    managerId: 'mgr-001',
    itOwnerId: 'it-001',
    adminOwnerId: 'admin-001',
    welcomeEmailSent: true,
  },
  {
    id: 'proc-002',
    employeeId: 'emp-002',
    employeeName: '周明轩',
    employeeEmail: 'zhoumingxuan@example.com',
    department: '市场营销部',
    position: '品牌经理',
    startDate: iso(addDays(today, -7)),
    salary: 22000,
    contractType: '三年期劳动合同',
    probationEndDate: iso(addDays(today, 83)),
    status: 'TASKS_IN_PROGRESS',
    overallProgress: 50,
    createdAt: iso(addDays(today, -10)),
    createdBy: 'hr-001',
    managerId: 'mgr-002',
    itOwnerId: 'it-001',
    adminOwnerId: 'admin-001',
    welcomeEmailSent: true,
  },
  {
    id: 'proc-003',
    employeeId: 'emp-003',
    employeeName: '陈思琪',
    employeeEmail: 'chensiqi@example.com',
    department: '产品研发部',
    position: '产品经理',
    startDate: iso(addDays(today, 3)),
    salary: 25000,
    contractType: '三年期劳动合同',
    probationEndDate: iso(addDays(today, 93)),
    status: 'INFO_COLLECTING',
    overallProgress: 20,
    createdAt: iso(addDays(today, -2)),
    createdBy: 'hr-001',
    managerId: 'mgr-001',
    itOwnerId: 'it-001',
    adminOwnerId: 'admin-001',
    welcomeEmailSent: true,
  },
  {
    id: 'proc-004',
    employeeId: 'emp-004',
    employeeName: '王浩然',
    employeeEmail: 'wanghaoran@example.com',
    department: '产品研发部',
    position: '后端工程师',
    startDate: iso(addDays(today, -85)),
    salary: 26000,
    contractType: '三年期劳动合同',
    probationEndDate: iso(addDays(today, 5)),
    status: 'EVALUATION_PENDING',
    overallProgress: 95,
    createdAt: iso(addDays(today, -90)),
    createdBy: 'hr-001',
    managerId: 'mgr-001',
    itOwnerId: 'it-001',
    adminOwnerId: 'admin-001',
    welcomeEmailSent: true,
  },
  {
    id: 'proc-005',
    employeeId: 'emp-005',
    employeeName: '李梦蝶',
    employeeEmail: 'limengdie@example.com',
    department: '产品研发部',
    position: 'UI设计师',
    startDate: iso(addDays(today, -100)),
    salary: 20000,
    contractType: '三年期劳动合同',
    probationEndDate: iso(addDays(today, -10)),
    status: 'COMPLETED',
    overallProgress: 100,
    createdAt: iso(addDays(today, -105)),
    createdBy: 'hr-001',
    managerId: 'mgr-001',
    itOwnerId: 'it-001',
    adminOwnerId: 'admin-001',
    welcomeEmailSent: true,
  },
];

const createTasksForProcess = (
  processId: string,
  processIndex: number,
): OnboardingTask[] => {
  const offsets = [
    { title: '开通企业邮箱与域账号', desc: '分配正式邮箱、设置初始密码、加入通讯组', cat: 'IT' as const, days: 1 },
    { title: '配置开发环境与工具', desc: '安装IDE、Git、Docker等开发工具，配置代码仓库权限', cat: 'IT' as const, days: 2 },
    { title: '发放工作电脑与外设', desc: '申请笔记本电脑、显示器、键鼠套装', cat: 'IT' as const, days: 1 },
    { title: '安排工位与办公区域', desc: '根据部门分配办公工位，配置办公桌椅', cat: 'ADMIN' as const, days: 1 },
    { title: '办理门禁卡与工牌', desc: '制作员工工牌、办理门禁系统权限', cat: 'ADMIN' as const, days: 2 },
    { title: '办公用品采购与发放', desc: '配备笔记本、签字笔、文件夹等基础办公用品', cat: 'ADMIN' as const, days: 1 },
    { title: '组织入职欢迎会', desc: '介绍团队成员、参观办公环境、安排午餐', cat: 'MANAGER' as const, days: 1 },
    { title: '岗位职责与业务培训', desc: '讲解岗位职责、业务流程、团队协作规范', cat: 'MANAGER' as const, days: 3 },
    { title: '制定试用期工作计划', desc: '明确试用期目标、关键交付物、检查节点', cat: 'MANAGER' as const, days: 3 },
  ];

  // 根据流程索引决定哪些任务已完成
  const completionStates: Record<number, boolean[]> = {
    0: [true, true, true, true, true, true, true, true, false], // 苏雨涵 85%
    1: [true, true, false, true, false, true, false, false, false], // 周明轩 50%
    2: [false, false, false, false, false, false, false, false, false], // 陈思琪 20%
    3: [true, true, true, true, true, true, true, true, true], // 王浩然 95%
    4: [true, true, true, true, true, true, true, true, true], // 李梦蝶 100%
  };

  const assignees: Record<string, { id: string; name: string }> = {
    IT: { id: 'it-001', name: '陈志强' },
    ADMIN: { id: 'admin-001', name: '王丽萍' },
    MANAGER: processId === 'proc-002' ? { id: 'mgr-002', name: '张慧敏' } : { id: 'mgr-001', name: '刘建国' },
  };

  return offsets.map((t, idx) => {
    const proc = mockProcesses.find((p) => p.id === processId)!;
    const startDate = new Date(proc.startDate);
    const dueDate = iso(addDays(startDate, t.days));
    const completed = completionStates[processIndex]?.[idx] ?? false;
    return {
      id: `${processId}-task-${idx + 1}`,
      processId,
      title: t.title,
      description: t.desc,
      category: t.cat,
      assigneeId: assignees[t.cat].id,
      assigneeName: assignees[t.cat].name,
      status: completed ? ('COMPLETED' as const) : ('PENDING' as const),
      dueDate,
      completedAt: completed ? iso(addDays(startDate, t.days - 1)) : undefined,
    };
  });
};

export const mockTasks: OnboardingTask[] = [
  ...createTasksForProcess('proc-001', 0),
  ...createTasksForProcess('proc-002', 1),
  ...createTasksForProcess('proc-003', 2),
  ...createTasksForProcess('proc-004', 3),
  ...createTasksForProcess('proc-005', 4),
];

export const mockPersonalInfos: Record<string, EmployeePersonalInfo> = {
  'proc-001': {
    processId: 'proc-001',
    fullName: '苏雨涵',
    gender: 'FEMALE',
    idNumber: '310101199508153827',
    birthDate: '1995-08-15',
    phone: '13912345678',
    address: '上海市浦东新区张江高科技园区博云路2号',
    bankAccount: '6228480402564890018',
    bankName: '中国农业银行上海张江支行',
    education: [
      {
        school: '同济大学',
        degree: '硕士研究生',
        major: '软件工程',
        startDate: '2017-09-01',
        endDate: '2020-06-30',
      },
      {
        school: '华东师范大学',
        degree: '大学本科',
        major: '计算机科学与技术',
        startDate: '2013-09-01',
        endDate: '2017-06-30',
      },
    ],
    emergencyContact: {
      name: '苏建国',
      relationship: '父亲',
      phone: '13698765432',
    },
    isCompleted: true,
  },
  'proc-002': {
    processId: 'proc-002',
    fullName: '周明轩',
    gender: 'MALE',
    idNumber: '320102199602201358',
    birthDate: '1996-02-20',
    phone: '13787654321',
    address: '南京市鼓楼区中山北路100号',
    bankAccount: '',
    bankName: '',
    education: [],
    emergencyContact: { name: '', relationship: '', phone: '' },
    isCompleted: false,
  },
  'proc-003': {
    processId: 'proc-003',
    fullName: '陈思琪',
    gender: 'FEMALE',
    idNumber: '',
    birthDate: '',
    phone: '',
    address: '',
    bankAccount: '',
    bankName: '',
    education: [],
    emergencyContact: { name: '', relationship: '', phone: '' },
    isCompleted: false,
  },
};

export const mockAcknowledgements: PolicyAcknowledgement[] = [
  { policyId: 'policy-001', processId: 'proc-001', acknowledgedAt: iso(addDays(today, -32)) },
  { policyId: 'policy-002', processId: 'proc-001', acknowledgedAt: iso(addDays(today, -32)) },
  { policyId: 'policy-003', processId: 'proc-001', acknowledgedAt: iso(addDays(today, -31)) },
  { policyId: 'policy-004', processId: 'proc-001', acknowledgedAt: iso(addDays(today, -31)) },
  { policyId: 'policy-001', processId: 'proc-002', acknowledgedAt: iso(addDays(today, -8)) },
  { policyId: 'policy-002', processId: 'proc-002', acknowledgedAt: iso(addDays(today, -8)) },
];

export const mockDocuments: UploadedDocument[] = [
  { id: 'doc-001', processId: 'proc-001', type: 'ID_CARD_FRONT', fileName: '苏雨涵_身份证正面.jpg', uploadDate: iso(addDays(today, -33)), fileSize: 2145380 },
  { id: 'doc-002', processId: 'proc-001', type: 'ID_CARD_BACK', fileName: '苏雨涵_身份证背面.jpg', uploadDate: iso(addDays(today, -33)), fileSize: 1982450 },
  { id: 'doc-003', processId: 'proc-001', type: 'DIPLOMA', fileName: '苏雨涵_硕士毕业证.pdf', uploadDate: iso(addDays(today, -33)), fileSize: 3205400 },
  { id: 'doc-004', processId: 'proc-001', type: 'PHOTO', fileName: '苏雨涵_一寸照片.jpg', uploadDate: iso(addDays(today, -33)), fileSize: 485200 },
  { id: 'doc-005', processId: 'proc-002', type: 'ID_CARD_FRONT', fileName: '周明轩_身份证正面.jpg', uploadDate: iso(addDays(today, -6)), fileSize: 2560000 },
];

export const mockContracts: EmploymentContract[] = [
  {
    id: 'contract-001',
    processId: 'proc-001',
    content: '',
    generatedAt: iso(addDays(today, -28)),
    employeeSignature: 'employee-sig-proc001',
    employeeSignedAt: iso(addDays(today, -27)),
    hrSignature: 'hr-sig-proc001',
    hrSignedAt: iso(addDays(today, -27)),
    status: 'FULLY_SIGNED',
  },
  {
    id: 'contract-004',
    processId: 'proc-004',
    content: '',
    generatedAt: iso(addDays(today, -82)),
    employeeSignature: 'employee-sig-proc004',
    employeeSignedAt: iso(addDays(today, -81)),
    hrSignature: 'hr-sig-proc004',
    hrSignedAt: iso(addDays(today, -81)),
    status: 'FULLY_SIGNED',
  },
  {
    id: 'contract-005',
    processId: 'proc-005',
    content: '',
    generatedAt: iso(addDays(today, -98)),
    employeeSignature: 'employee-sig-proc005',
    employeeSignedAt: iso(addDays(today, -97)),
    hrSignature: 'hr-sig-proc005',
    hrSignedAt: iso(addDays(today, -97)),
    status: 'FULLY_SIGNED',
  },
  {
    id: 'contract-002',
    processId: 'proc-002',
    content: '',
    generatedAt: iso(addDays(today, -5)),
    status: 'GENERATED',
  },
];

export const mockEvaluations: ProbationEvaluation[] = [
  {
    id: 'eval-005',
    processId: 'proc-005',
    managerId: 'mgr-001',
    workAbility: 92,
    teamCollaboration: 88,
    attendance: 100,
    learningAgility: 90,
    overallComment:
      '该员工在试用期内表现出色，快速掌握了设计规范和协作流程，独立完成了3个核心项目的UI设计工作。设计风格简洁现代，能够很好地理解产品需求并提出建设性建议。团队协作良好，沟通积极主动。建议按期转正，后续可在动效设计方面进一步培养。',
    suggestedResult: 'PASS',
    submittedAt: iso(addDays(today, -12)),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'mgr-001',
    type: 'EVALUATION_REMINDER',
    title: '转正评估提醒',
    message: '王浩然的试用期将于5天后结束，请及时提交转正评估表。',
    read: false,
    createdAt: iso(addDays(today, -1)),
    relatedProcessId: 'proc-004',
  },
  {
    id: 'notif-002',
    userId: 'hr-001',
    type: 'EVALUATION_REMINDER',
    title: '试用期即将到期提醒',
    message: '王浩然的试用期还有5天到期，请关注其转正评估进展。',
    read: false,
    createdAt: iso(addDays(today, -1)),
    relatedProcessId: 'proc-004',
  },
  {
    id: 'notif-003',
    userId: 'it-001',
    type: 'TASK_ASSIGNED',
    title: '新任务待处理',
    message: '您有3项新员工入职任务待处理（周明轩、陈思琪）。',
    read: false,
    createdAt: iso(addDays(today, -2)),
  },
  {
    id: 'notif-004',
    userId: 'admin-001',
    type: 'TASK_ASSIGNED',
    title: '新任务待处理',
    message: '您有2项新员工入职任务待处理（周明轩、陈思琪）。',
    read: true,
    createdAt: iso(addDays(today, -3)),
  },
  {
    id: 'notif-005',
    userId: 'hr-001',
    type: 'INFO_COMPLETED',
    title: '员工信息已提交',
    message: '苏雨涵已完成个人信息填写，请审核。',
    read: true,
    createdAt: iso(addDays(today, -32)),
    relatedProcessId: 'proc-001',
  },
];
