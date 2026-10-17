import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  toasts: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: 'notif-welcome',
      title: 'Bem-vindo ao BiblioTech',
      message: 'Explore o acervo universitário, realize empréstimos de até 14 dias e acompanhe sua fila de espera.',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 'notif-due-alert',
      title: 'Atenção aos Prazos de Devolução',
      message: 'Você possui um livro com prazo de devolução vencido no painel de controle.',
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: '/dashboard',
      actionLabel: 'Ver Empréstimos',
    },
  ],
  toasts: [],

  addNotification: (params) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: AppNotification = {
      ...params,
      id,
      timestamp: new Date().toISOString(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      toasts: [...state.toasts, newNotif],
    }));

    // Auto dismiss toast after 5.5s
    setTimeout(() => {
      get().dismissToast(id);
    }, 5500);
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [], toasts: [] });
  },
}));
