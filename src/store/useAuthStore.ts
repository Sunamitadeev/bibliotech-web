import { create } from 'zustand';
import { User } from '@/types';
import { storageService, MOCK_USERS } from '@/services/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  availableUsers: User[];
  login: (userId: string) => boolean;
  logout: () => void;
  switchUser: (user: User) => void;
  refreshUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = storageService.getCurrentUser();
  const availableUsers = storageService.getAllUsers();

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,
    availableUsers: availableUsers.length > 0 ? availableUsers : MOCK_USERS,

    login: (userId: string) => {
      const users = storageService.getAllUsers();
      const targetUser = users.find((u) => u.id === userId);
      if (targetUser) {
        storageService.setCurrentUser(targetUser);
        set({ user: targetUser, isAuthenticated: true });
        return true;
      }
      return false;
    },

    logout: () => {
      storageService.setCurrentUser(null);
      set({ user: null, isAuthenticated: false });
    },

    switchUser: (user: User) => {
      storageService.setCurrentUser(user);
      set({ user, isAuthenticated: true });
    },

    refreshUser: () => {
      const current = storageService.getCurrentUser();
      set({ user: current, isAuthenticated: !!current });
    },
  };
});
