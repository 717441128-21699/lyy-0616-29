import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import LoginPage from '@/pages/LoginPage';
import HrDashboardPage from '@/pages/HrDashboardPage';
import NewOnboardingPage from '@/pages/NewOnboardingPage';
import EmployeeDetailPage from '@/pages/EmployeeDetailPage';
import EmployeePortalPage from '@/pages/EmployeePortalPage';
import PersonalInfoPage from '@/pages/PersonalInfoPage';
import PoliciesPage from '@/pages/PoliciesPage';
import DocumentsPage from '@/pages/DocumentsPage';
import ContractSignPage from '@/pages/ContractSignPage';
import TasksWorkspacePage from '@/pages/TasksWorkspacePage';
import EvaluationListPage from '@/pages/EvaluationListPage';
import EvaluationPage from '@/pages/EvaluationPage';

function RootRedirect() {
  const currentUser = useUserStore((s) => s.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    switch (currentUser.role) {
      case 'HR':
        navigate('/hr/dashboard', { replace: true });
        break;
      case 'IT':
      case 'ADMIN':
        navigate('/tasks', { replace: true });
        break;
      case 'MANAGER':
        navigate('/tasks', { replace: true });
        break;
      case 'EMPLOYEE': {
        const processId = useUserStore.getState().currentProcessId;
        if (processId) {
          navigate(`/employee/${processId}/portal`, { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        break;
      }
      default:
        navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
        <p className="text-neutral-500">正在跳转...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/hr/dashboard" element={<HrDashboardPage />} />
        <Route path="/hr/new-onboarding" element={<NewOnboardingPage />} />
        <Route path="/hr/employee/:id" element={<EmployeeDetailPage />} />
        <Route path="/employee/:id/portal" element={<EmployeePortalPage />} />
        <Route path="/employee/:id/personal-info" element={<PersonalInfoPage />} />
        <Route path="/employee/:id/policies" element={<PoliciesPage />} />
        <Route path="/employee/:id/documents" element={<DocumentsPage />} />
        <Route path="/employee/:id/contract" element={<ContractSignPage />} />
        <Route path="/employee/:id/evaluation" element={<EvaluationPage />} />
        <Route path="/tasks" element={<TasksWorkspacePage />} />
        <Route path="/manager/evaluations" element={<EvaluationListPage />} />
        <Route path="/manager/evaluation/:id" element={<EvaluationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
