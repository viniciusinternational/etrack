import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/types';

interface UserState {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mdaId?: string;
  departmentId?: string;
}

interface AuthStore {
  user: UserState | null;
  isAuthenticated: boolean;
  login: (user: UserState) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserState>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
