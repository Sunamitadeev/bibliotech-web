import { Loan, LoanCreationParams, Reservation, ReservationCreationParams, User, UserBookStatus, ReadingStatus, BookAvailabilityStatus } from '@/types';

export interface BookInventoryRecord {
  bookId: string;
  totalCopies: number;
  availableCopies: number;
  status: BookAvailabilityStatus;
}

export interface ILibraryStorageService {
  // Auth & Users
  getCurrentUser(): User | null;
  setCurrentUser(user: User | null): void;
  getAllUsers(): User[];
  
  // Loans
  getAllLoans(): Loan[];
  getUserLoans(userId: string): Loan[];
  getActiveLoans(userId?: string): Loan[];
  getLoanHistory(userId?: string): Loan[];
  getLoanById(loanId: string): Loan | null;
  createLoan(params: LoanCreationParams): { success: boolean; loan?: Loan; error?: string };
  returnLoan(loanId: string): { success: boolean; loan?: Loan; notifiedReservations?: Reservation[]; error?: string };
  renewLoan(loanId: string): { success: boolean; loan?: Loan; error?: string };
  
  // Reservations (Fila de Espera)
  getAllReservations(): Reservation[];
  getUserReservations(userId: string): Reservation[];
  getReservationsByBook(bookId: string): Reservation[];
  createReservation(params: ReservationCreationParams): { success: boolean; reservation?: Reservation; error?: string };
  cancelReservation(reservationId: string): { success: boolean; error?: string };
  
  // Reading Status & Wishlist
  getUserBookStatuses(userId: string): UserBookStatus[];
  getUserBookStatus(userId: string, bookId: string): UserBookStatus | null;
  setReadingStatus(
    userId: string,
    bookId: string,
    status: ReadingStatus,
    bookDetails: { title: string; thumbnail: string; authors: string[] }
  ): UserBookStatus;
  removeReadingStatus(userId: string, bookId: string): boolean;
  getWishlist(userId: string): UserBookStatus[];

  // Inventory tracking per book
  getBookInventory(bookId: string): BookInventoryRecord;
  setBookInventory(record: BookInventoryRecord): void;
  
  // Storage Events
  subscribe(callback: (eventType: string, payload?: unknown) => void): () => void;
  resetToMockDefaults(): void;
}
