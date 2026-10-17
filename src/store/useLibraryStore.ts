import { create } from 'zustand';
import { Book, Loan, Reservation, UserBookStatus, ReadingStatus } from '@/types';
import { storageService } from '@/services/storage';
import { useAuthStore } from './useAuthStore';
import { useNotificationStore } from './useNotificationStore';

interface LibraryState {
  activeLoans: Loan[];
  loanHistory: Loan[];
  reservations: Reservation[];
  readingStatuses: UserBookStatus[];
  isLoading: boolean;
  
  // Data fetchers
  refreshData: () => void;
  
  // Loan actions
  borrowBook: (book: Book, notes?: string) => { success: boolean; error?: string };
  returnBook: (loanId: string) => { success: boolean; error?: string };
  renewBook: (loanId: string) => { success: boolean; error?: string };
  
  // Reservation actions
  reserveBook: (book: Book) => { success: boolean; error?: string };
  cancelReservation: (reservationId: string) => { success: boolean; error?: string };
  
  // Reading status actions
  setReadingStatus: (book: Book, status: ReadingStatus) => void;
  toggleWishlist: (book: Book) => boolean; // returns true if added, false if removed
  getReadingStatusForBook: (bookId: string) => ReadingStatus | null;
  isBookInWishlist: (bookId: string) => boolean;
}

export const useLibraryStore = create<LibraryState>((set, get) => {
  const loadUserData = () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      return {
        activeLoans: [],
        loanHistory: [],
        reservations: [],
        readingStatuses: [],
      };
    }
    return {
      activeLoans: storageService.getActiveLoans(user.id),
      loanHistory: storageService.getLoanHistory(user.id),
      reservations: storageService.getUserReservations(user.id),
      readingStatuses: storageService.getUserBookStatuses(user.id),
    };
  };

  const initialData = loadUserData();

  // Setup storage listener for real-time reactivity
  if (typeof window !== 'undefined') {
    storageService.subscribe((eventType, payload) => {
      get().refreshData();

      // Check if another return made a wishlisted book available
      if (eventType === 'loan-returned') {
        const currentUser = useAuthStore.getState().user;
        const data = payload as { loan: Loan; notifiedReservations?: Reservation[]; wishlistUsers?: UserBookStatus[] };
        
        if (currentUser && data?.wishlistUsers?.some((w) => w.userId === currentUser.id)) {
          useNotificationStore.getState().addNotification({
            title: '🎉 Exemplar Disponível!',
            message: `O livro "${data.loan.bookTitle}" da sua Lista de Desejos agora possui um exemplar disponível na biblioteca!`,
            type: 'success',
            actionUrl: `/books/${data.loan.bookId}`,
            actionLabel: 'Ver Livro',
          });
        }

        // If current user had a reservation that was notified
        if (currentUser && data?.notifiedReservations?.some((r) => r.userId === currentUser.id)) {
          useNotificationStore.getState().addNotification({
            title: '🔔 Sua Reserva Chegou!',
            message: `O exemplar reservado "${data.loan.bookTitle}" foi devolvido e está reservado para você retirar.`,
            type: 'success',
            actionUrl: '/dashboard',
            actionLabel: 'Ver Reservas',
          });
        }
      }
    });

    // Also listen to auth changes to reload user data
    useAuthStore.subscribe(() => {
      get().refreshData();
    });
  }

  return {
    activeLoans: initialData.activeLoans,
    loanHistory: initialData.loanHistory,
    reservations: initialData.reservations,
    readingStatuses: initialData.readingStatuses,
    isLoading: false,

    refreshData: () => {
      const updated = loadUserData();
      set({
        activeLoans: updated.activeLoans,
        loanHistory: updated.loanHistory,
        reservations: updated.reservations,
        readingStatuses: updated.readingStatuses,
      });
    },

    borrowBook: (book: Book, notes?: string) => {
      const user = useAuthStore.getState().user;
      if (!user) {
        return { success: false, error: 'Faça login na sua conta institucional para realizar empréstimos.' };
      }

      const result = storageService.createLoan({
        book,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        notes,
      });

      if (result.success) {
        useNotificationStore.getState().addNotification({
          title: 'Empréstimo Confirmado!',
          message: `O livro "${book.title}" foi emprestado com sucesso. Devolução em 14 dias.`,
          type: 'success',
          actionUrl: '/dashboard',
          actionLabel: 'Ver no Painel',
        });
        get().refreshData();
        return { success: true };
      } else {
        useNotificationStore.getState().addNotification({
          title: 'Não foi possível emprestar',
          message: result.error || 'Erro ao processar empréstimo.',
          type: 'error',
        });
        return { success: false, error: result.error };
      }
    },

    returnBook: (loanId: string) => {
      const result = storageService.returnLoan(loanId);
      if (result.success && result.loan) {
        useNotificationStore.getState().addNotification({
          title: 'Devolução Realizada com Sucesso',
          message: `O exemplar de "${result.loan.bookTitle}" foi devolvido ao acervo e o status atualizado.`,
          type: 'success',
        });
        get().refreshData();
        return { success: true };
      } else {
        useNotificationStore.getState().addNotification({
          title: 'Erro na devolução',
          message: result.error || 'Falha ao registrar devolução.',
          type: 'error',
        });
        return { success: false, error: result.error };
      }
    },

    renewBook: (loanId: string) => {
      const result = storageService.renewLoan(loanId);
      if (result.success && result.loan) {
        useNotificationStore.getState().addNotification({
          title: 'Empréstimo Renovado!',
          message: `O prazo de devolução de "${result.loan.bookTitle}" foi estendido por mais 14 dias corridos.`,
          type: 'success',
        });
        get().refreshData();
        return { success: true };
      } else {
        useNotificationStore.getState().addNotification({
          title: 'Renovação não autorizada',
          message: result.error || 'Erro ao renovar empréstimo.',
          type: 'warning',
        });
        return { success: false, error: result.error };
      }
    },

    reserveBook: (book: Book) => {
      const user = useAuthStore.getState().user;
      if (!user) {
        return { success: false, error: 'Faça login para entrar na fila de reserva.' };
      }

      const result = storageService.createReservation({
        bookId: book.id,
        bookTitle: book.title,
        bookThumbnail: book.thumbnail,
        bookAuthors: book.authors,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      });

      if (result.success && result.reservation) {
        useNotificationStore.getState().addNotification({
          title: 'Reserva Confirmada!',
          message: `Você está na posição #${result.reservation.priorityPosition} da fila de espera para "${book.title}".`,
          type: 'info',
          actionUrl: '/dashboard',
          actionLabel: 'Ver Minhas Reservas',
        });
        get().refreshData();
        return { success: true };
      } else {
        useNotificationStore.getState().addNotification({
          title: 'Falha na Reserva',
          message: result.error || 'Erro ao criar reserva.',
          type: 'error',
        });
        return { success: false, error: result.error };
      }
    },

    cancelReservation: (reservationId: string) => {
      const result = storageService.cancelReservation(reservationId);
      if (result.success) {
        useNotificationStore.getState().addNotification({
          title: 'Reserva Cancelada',
          message: 'Você saiu da fila de espera deste exemplar.',
          type: 'info',
        });
        get().refreshData();
        return { success: true };
      }
      return { success: false, error: result.error };
    },

    setReadingStatus: (book: Book, status: ReadingStatus) => {
      const user = useAuthStore.getState().user;
      if (!user) {
        useNotificationStore.getState().addNotification({
          title: 'Atenção',
          message: 'Faça login para salvar seus status de leitura.',
          type: 'warning',
        });
        return;
      }

      storageService.setReadingStatus(user.id, book.id, status, {
        title: book.title,
        thumbnail: book.thumbnail,
        authors: book.authors,
      });

      get().refreshData();
      useNotificationStore.getState().addNotification({
        title: 'Status Atualizado',
        message: `Livro marcado como "${status === 'WANT_TO_READ' ? 'Quero Ler' : status === 'READING' ? 'Lendo' : status === 'COMPLETED' ? 'Concluído' : 'Lista de Desejos'}".`,
        type: 'success',
      });
    },

    toggleWishlist: (book: Book) => {
      const user = useAuthStore.getState().user;
      if (!user) {
        useNotificationStore.getState().addNotification({
          title: 'Atenção',
          message: 'Faça login para gerenciar sua lista de desejos.',
          type: 'warning',
        });
        return false;
      }

      const current = storageService.getUserBookStatus(user.id, book.id);
      if (current && current.status === 'WISHLIST') {
        storageService.removeReadingStatus(user.id, book.id);
        get().refreshData();
        useNotificationStore.getState().addNotification({
          title: 'Removido da Lista de Desejos',
          message: `"${book.title}" foi removido da sua lista.`,
          type: 'info',
        });
        return false;
      } else {
        storageService.setReadingStatus(user.id, book.id, 'WISHLIST', {
          title: book.title,
          thumbnail: book.thumbnail,
          authors: book.authors,
        });
        get().refreshData();
        useNotificationStore.getState().addNotification({
          title: 'Adicionado à Lista de Desejos',
          message: `"${book.title}" salvo! Você será notificado quando novos exemplares ficarem disponíveis.`,
          type: 'success',
        });
        return true;
      }
    },

    getReadingStatusForBook: (bookId: string) => {
      const user = useAuthStore.getState().user;
      if (!user) return null;
      const status = storageService.getUserBookStatus(user.id, bookId);
      return status?.status || null;
    },

    isBookInWishlist: (bookId: string) => {
      const user = useAuthStore.getState().user;
      if (!user) return false;
      const status = storageService.getUserBookStatus(user.id, bookId);
      return status?.status === 'WISHLIST';
    },
  };
});
