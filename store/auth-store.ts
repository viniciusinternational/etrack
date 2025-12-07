import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole } from '@/types';
import type { UserPermissions } from '@/types/permissions';

interface UserState {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mdaId?: string;
  departmentId?: string;
  mustChangePassword?: boolean;
  permissions?: UserPermissions; // RBAS: JSON permissions
}

interface AuthStore {
  user: UserState | null;
  token: string | null;
  sessionExpiry: number | null; // Timestamp in milliseconds
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: UserState) => void;
  loginWithToken: (user: UserState, token: string) => void;
  logout: () => void;
  autoLogout: () => void;
  updateUser: (updates: Partial<UserState>) => void;
  checkSession: () => boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

// Session duration: 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      sessionExpiry: null,
      isAuthenticated: false,
      hasHydrated: false,
      login: (user) => {
        // Legacy login method - generates a token
        // Use a simple random string generator for token
        const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      const expiry = Date.now() + SESSION_DURATION;
        set({ user, token, sessionExpiry: expiry, isAuthenticated: true });
      },
      loginWithToken: (user, token) => {
        const expiry = Date.now() + SESSION_DURATION;
        set({ user, token, sessionExpiry: expiry, isAuthenticated: true });
      },
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          sessionExpiry: null, 
          isAuthenticated: false 
        });
      },
      autoLogout: () => {
        const state = get();
        if (state.isAuthenticated) {
          set({ 
            user: null, 
            token: null, 
            sessionExpiry: null, 
            isAuthenticated: false 
          });
          // Redirect will be handled by the component using this
        }
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      checkSession: () => {
        const state = get();
        if (!state.isAuthenticated || !state.sessionExpiry) {
          return false;
        }
        const now = Date.now();
        if (now >= state.sessionExpiry) {
          // Session expired
          get().autoLogout();
          return false;
        }
        return true;
      },
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        sessionExpiry: state.sessionExpiry,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check session validity on rehydration
          if (!state.checkSession()) {
            // Session expired, clear state
            state.logout();
          }
          // Mark as hydrated after rehydration
          state.setHasHydrated(true);
        }
      },
    }
  )
);
