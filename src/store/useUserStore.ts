import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { allUsers, useOnboardingStore } from './useOnboardingStore';

interface UserState {
  currentUser: User | null;
  currentProcessId: string | null;
  allUsers: User[];
  login: (email: string, password: string, role: UserRole) => { success: boolean; message?: string };
  loginAsEmployee: (processId: string) => { success: boolean; employeeName?: string; message?: string };
  logout: () => void;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  setCurrentProcessId: (id: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentProcessId: null,
      allUsers: allUsers,

      login: (email, password, role) => {
        const user = allUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role,
        );
        if (user) {
          set({ currentUser: user, currentProcessId: null });
          return { success: true };
        }
        return { success: false, message: '邮箱、密码或角色不匹配' };
      },

      loginAsEmployee: (processId) => {
        const process_ = useOnboardingStore.getState().getOnboardingProcessById(processId);
        if (!process_) {
          return { success: false, message: '无效的入职链接' };
        }
        const employeeUser: User = {
          id: process_.employeeId,
          name: process_.employeeName,
          email: process_.employeeEmail,
          role: 'EMPLOYEE',
          department: process_.department,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${process_.employeeId}&backgroundColor=ffd5dc`,
        };
        set({ currentUser: employeeUser, currentProcessId: processId });
        return { success: true, employeeName: process_.employeeName };
      },

      logout: () => set({ currentUser: null, currentProcessId: null }),

      getUserById: (id) => get().allUsers.find((u) => u.id === id),

      getUsersByRole: (role) => get().allUsers.filter((u) => u.role === role),

      setCurrentProcessId: (id) => set({ currentProcessId: id }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentProcessId: state.currentProcessId,
      }),
    },
  ),
);
