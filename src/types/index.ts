export type UserRole = 'HR' | 'IT' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  password?: string;
}

export type OnboardingStatus =
  | 'CREATED'
  | 'INFO_COLLECTING'
  | 'TASKS_IN_PROGRESS'
  | 'CONTRACT_PENDING'
  | 'PROBATION'
  | 'EVALUATION_PENDING'
  | 'COMPLETED';

export interface OnboardingProcess {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  position: string;
  startDate: string;
  salary: number;
  contractType: string;
  probationEndDate: string;
  status: OnboardingStatus;
  overallProgress: number;
  createdAt: string;
  createdBy: string;
  managerId: string;
  itOwnerId: string;
  adminOwnerId: string;
  welcomeEmailSent: boolean;
}

export type TaskCategory = 'IT' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export interface OnboardingTask {
  id: string;
  processId: string;
  title: string;
  description: string;
  category: TaskCategory;
  assigneeId: string;
  assigneeName: string;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  notes?: string;
}

export interface EducationRecord {
  id?: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface EmployeePersonalInfo {
  processId: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  idNumber: string;
  birthDate: string;
  phone: string;
  address: string;
  bankAccount: string;
  bankName: string;
  education: EducationRecord[];
  emergencyContact: EmergencyContact;
  isCompleted: boolean;
}

export interface PolicyDocument {
  id: string;
  title: string;
  version: string;
  summary: string;
  content: string;
}

export interface PolicyAcknowledgement {
  policyId: string;
  processId: string;
  acknowledgedAt: string;
}

export type DocumentType = 'ID_CARD_FRONT' | 'ID_CARD_BACK' | 'DIPLOMA' | 'PHOTO' | 'OTHER';

export type DocumentReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UploadedDocument {
  id: string;
  processId: string;
  type: DocumentType;
  fileName: string;
  uploadDate: string;
  fileSize: number;
  previewUrl?: string;
  reviewStatus?: DocumentReviewStatus;
  reviewReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface EmploymentContract {
  id: string;
  processId: string;
  content: string;
  generatedAt: string;
  employeeSignature?: string;
  employeeSignedAt?: string;
  hrSignature?: string;
  hrSignedAt?: string;
  status: 'GENERATED' | 'EMPLOYEE_SIGNED' | 'FULLY_SIGNED';
}

export type EvaluationResult = 'PASS' | 'EXTEND' | 'FAIL';

export interface ProbationEvaluation {
  id: string;
  processId: string;
  managerId: string;
  workAbility: number;
  teamCollaboration: number;
  attendance: number;
  learningAgility: number;
  overallComment: string;
  suggestedResult: EvaluationResult;
  submittedAt: string;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'CONTRACT_READY'
  | 'EVALUATION_REMINDER'
  | 'EVALUATION_SUBMITTED'
  | 'WELCOME'
  | 'INFO_COMPLETED'
  | 'ALL_TASKS_DONE';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedProcessId?: string;
}
