import { Loan, LoanCreationParams, Reservation, ReservationCreationParams, User, UserBookStatus, ReadingStatus, BookAvailabilityStatus } from '@/types';
import { BookInventoryRecord, ILibraryStorageService } from './storage.interface';
import { INITIAL_BOOK_INVENTORY, INITIAL_MOCK_LOANS, INITIAL_MOCK_READING_STATUSES, INITIAL_MOCK_RESERVATIONS, MOCK_USERS } from './mockData';
import { calculateDueDate, isOverdue } from '@/utils/dates';

const STORAGE_KEYS = {
  CURRENT_USER: 'bibliotech_current_user',
  USERS: 'bibliotech_users',
  LOANS: 'bibliotech_loans',
  RESERVATIONS: 'bibliotech_reservations',
  READING_STATUSES: 'bibliotech_reading_statuses',
  BOOK_INVENTORIES: 'bibliotech_book_inventories',
  INITIALIZED: 'bibliotech_initialized_v1',
};

const EVENT_CHANNEL = 'bibliotech-storage-event';

class LocalStorageService implements ILibraryStorageService {
  private listeners: Set<(eventType: string, payload?: unknown) => void> = new Set();

  constructor() {
    this.ensureInitialized();
    // Listen for storage events across tabs or windows
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key?.startsWith('bibliotech_')) {
          this.notifyListeners('storage-synced', { key: e.key });
        }
      });
    }
  }

  private notifyListeners(eventType: string, payload?: unknown) {
    this.listeners.forEach((listener) => {
      try {
        listener(eventType, payload);
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_CHANNEL, { detail: { eventType, payload } }));
    }
  }

  public subscribe(callback: (eventType: string, payload?: unknown) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Failed to parse localStorage key ${key}:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to set localStorage key ${key}:`, e);
    }
  }

  private ensureInitialized(): void {
    if (typeof window === 'undefined') return;
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
      this.resetToMockDefaults();
    }
  }

  public resetToMockDefaults(): void {
    this.setItem(STORAGE_KEYS.USERS, MOCK_USERS);
    this.setItem(STORAGE_KEYS.CURRENT_USER, MOCK_USERS[0]); // Default logged in as Ana Carolina
    this.setItem(STORAGE_KEYS.LOANS, INITIAL_MOCK_LOANS);
    this.setItem(STORAGE_KEYS.RESERVATIONS, INITIAL_MOCK_RESERVATIONS);
    this.setItem(STORAGE_KEYS.READING_STATUSES, INITIAL_MOCK_READING_STATUSES);
    this.setItem(STORAGE_KEYS.BOOK_INVENTORIES, INITIAL_BOOK_INVENTORY);
    this.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    this.notifyListeners('reset-defaults');
  }

  // --- Auth & Users ---
  public getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, MOCK_USERS[0]);
  }

  public setCurrentUser(user: User | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.notifyListeners('user-changed', user);
  }

  public getAllUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
  }

  // --- Loans ---
  public getAllLoans(): Loan[] {
    const loans = this.getItem<Loan[]>(STORAGE_KEYS.LOANS, []);
    // Dynamically update status to OVERDUE if dueDate is passed and still ACTIVE
    return loans.map((loan) => {
      if (loan.status === 'ACTIVE' && isOverdue(loan.dueDate)) {
        return { ...loan, status: 'OVERDUE' as const };
      }
      return loan;
    });
  }

  public getUserLoans(userId: string): Loan[] {
    return this.getAllLoans().filter((l) => l.userId === userId);
  }

  public getActiveLoans(userId?: string): Loan[] {
    const loans = this.getAllLoans().filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    if (userId) {
      return loans.filter((l) => l.userId === userId);
    }
    return loans;
  }

  public getLoanHistory(userId?: string): Loan[] {
    const loans = this.getAllLoans().filter((l) => l.status === 'RETURNED');
    if (userId) {
      return loans.filter((l) => l.userId === userId);
    }
    return loans;
  }

  public getLoanById(loanId: string): Loan | null {
    const loans = this.getAllLoans();
    return loans.find((l) => l.id === loanId) || null;
  }

  public createLoan(params: LoanCreationParams): { success: boolean; loan?: Loan; error?: string } {
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error: 'Faça login para realizar o empréstimo.' };
    }

    const activeUserLoans = this.getActiveLoans(params.userId);
    if (activeUserLoans.length >= user.maxActiveLoans) {
      return {
        success: false,
        error: `Limite de empréstimos atingido! Seu limite é de ${user.maxActiveLoans} exemplares simultâneos.`,
      };
    }

    // Check if user already has an active loan of this exact book
    const alreadyHasCopy = activeUserLoans.some((l) => l.bookId === params.book.id);
    if (alreadyHasCopy) {
      return {
        success: false,
        error: 'Você já possui um exemplar ativo deste livro.',
      };
    }

    // Check inventory availability
    const inventory = this.getBookInventory(params.book.id);
    if (inventory.availableCopies <= 0) {
      return {
        success: false,
        error: 'Nenhum exemplar físico disponível no momento. Deseja entrar na fila de reserva?',
      };
    }

    // Create loan record (14 calendar days)
    const nowIso = new Date().toISOString();
    const dueDateIso = calculateDueDate(nowIso, 14);

    const newLoan: Loan = {
      id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookId: params.book.id,
      bookTitle: params.book.title,
      bookThumbnail: params.book.thumbnail || params.book.smallThumbnail || '',
      bookAuthors: params.book.authors || ['Autor Desconhecido'],
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      borrowedAt: nowIso,
      dueDate: dueDateIso,
      status: 'ACTIVE',
      renewalCount: 0,
      notes: params.notes,
    };

    const loans = this.getItem<Loan[]>(STORAGE_KEYS.LOANS, []);
    loans.unshift(newLoan);
    this.setItem(STORAGE_KEYS.LOANS, loans);

    // Update Inventory
    const newAvailable = Math.max(0, inventory.availableCopies - 1);
    this.setBookInventory({
      ...inventory,
      availableCopies: newAvailable,
      status: newAvailable === 0 ? 'BORROWED' : 'AVAILABLE',
    });

    // If user had a reservation for this book, fulfill it
    const reservations = this.getAllReservations();
    const userRes = reservations.find((r) => r.bookId === params.book.id && r.userId === params.userId && r.status !== 'FULFILLED');
    if (userRes) {
      userRes.status = 'FULFILLED';
      this.setItem(STORAGE_KEYS.RESERVATIONS, reservations);
    }

    // Also update reading status to 'READING' automatically
    this.setReadingStatus(params.userId, params.book.id, 'READING', {
      title: params.book.title,
      thumbnail: params.book.thumbnail,
      authors: params.book.authors,
    });

    this.notifyListeners('loan-created', newLoan);
    return { success: true, loan: newLoan };
  }

  public returnLoan(loanId: string): { success: boolean; loan?: Loan; notifiedReservations?: Reservation[]; error?: string } {
    const loans = this.getItem<Loan[]>(STORAGE_KEYS.LOANS, []);
    const loanIndex = loans.findIndex((l) => l.id === loanId);

    if (loanIndex === -1) {
      return { success: false, error: 'Empréstimo não encontrado.' };
    }

    const loan = loans[loanIndex];
    if (loan.status === 'RETURNED') {
      return { success: false, error: 'Este livro já foi devolvido anteriormente.' };
    }

    loan.status = 'RETURNED';
    loan.returnedAt = new Date().toISOString();
    loans[loanIndex] = loan;
    this.setItem(STORAGE_KEYS.LOANS, loans);

    // Increment inventory
    const inventory = this.getBookInventory(loan.bookId);
    const updatedAvailable = inventory.availableCopies + 1;
    this.setBookInventory({
      ...inventory,
      availableCopies: updatedAvailable,
      status: 'AVAILABLE',
    });

    // Check waiting reservations queue
    const reservations = this.getAllReservations();
    const pendingForBook = reservations
      .filter((r) => r.bookId === loan.bookId && r.status === 'PENDING')
      .sort((a, b) => new Date(a.reservedAt).getTime() - new Date(b.reservedAt).getTime());

    const notifiedReservations: Reservation[] = [];
    if (pendingForBook.length > 0) {
      // Notify the first in queue
      const nextInLine = pendingForBook[0];
      nextInLine.status = 'NOTIFIED';
      nextInLine.notifiedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.RESERVATIONS, reservations);
      notifiedReservations.push(nextInLine);

      this.notifyListeners('reservation-available', {
        bookId: loan.bookId,
        bookTitle: loan.bookTitle,
        reservation: nextInLine,
      });
    }

    // Check users that have this book in their WISHLIST
    const allStatuses = this.getItem<UserBookStatus[]>(STORAGE_KEYS.READING_STATUSES, []);
    const wishlistUsers = allStatuses.filter((s) => s.bookId === loan.bookId && s.status === 'WISHLIST');

    this.notifyListeners('loan-returned', {
      loan,
      notifiedReservations,
      wishlistUsers,
    });

    return { success: true, loan, notifiedReservations };
  }

  public renewLoan(loanId: string): { success: boolean; loan?: Loan; error?: string } {
    const loans = this.getItem<Loan[]>(STORAGE_KEYS.LOANS, []);
    const loan = loans.find((l) => l.id === loanId);

    if (!loan) {
      return { success: false, error: 'Empréstimo não encontrado.' };
    }

    if (loan.status === 'RETURNED') {
      return { success: false, error: 'Não é possível renovar um empréstimo já devolvido.' };
    }

    // Check if there are other users waiting in queue for this book
    const reservations = this.getReservationsByBook(loan.bookId).filter((r) => r.status === 'PENDING');
    if (reservations.length > 0) {
      return {
        success: false,
        error: 'Renovação não permitida: existem outros estudantes na fila de espera para este exemplar.',
      };
    }

    if (loan.renewalCount >= 2) {
      return {
        success: false,
        error: 'Limite de renovações atingido (máximo de 2 renovações permitidas por exemplar).',
      };
    }

    // Extend due date by 14 days from current due date (or from today if overdue)
    const baseDate = isOverdue(loan.dueDate) ? new Date() : new Date(loan.dueDate);
    loan.dueDate = calculateDueDate(baseDate, 14);
    loan.renewalCount += 1;
    loan.status = 'ACTIVE';

    this.setItem(STORAGE_KEYS.LOANS, loans);
    this.notifyListeners('loan-renewed', loan);

    return { success: true, loan };
  }

  // --- Reservations ---
  public getAllReservations(): Reservation[] {
    return this.getItem<Reservation[]>(STORAGE_KEYS.RESERVATIONS, []);
  }

  public getUserReservations(userId: string): Reservation[] {
    return this.getAllReservations().filter((r) => r.userId === userId);
  }

  public getReservationsByBook(bookId: string): Reservation[] {
    return this.getAllReservations().filter((r) => r.bookId === bookId);
  }

  public createReservation(params: ReservationCreationParams): { success: boolean; reservation?: Reservation; error?: string } {
    const existing = this.getAllReservations().find(
      (r) => r.bookId === params.bookId && r.userId === params.userId && (r.status === 'PENDING' || r.status === 'NOTIFIED')
    );

    if (existing) {
      return { success: false, error: 'Você já possui uma reserva ativa para este livro.' };
    }

    // Check if user currently has this book borrowed
    const userLoans = this.getActiveLoans(params.userId);
    if (userLoans.some((l) => l.bookId === params.bookId)) {
      return { success: false, error: 'Você já possui este exemplar emprestado em sua posse.' };
    }

    const pendingForBook = this.getReservationsByBook(params.bookId).filter((r) => r.status === 'PENDING');
    const priorityPosition = pendingForBook.length + 1;

    const newReservation: Reservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookId: params.bookId,
      bookTitle: params.bookTitle,
      bookThumbnail: params.bookThumbnail,
      bookAuthors: params.bookAuthors,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      reservedAt: new Date().toISOString(),
      status: 'PENDING',
      priorityPosition,
    };

    const reservations = this.getAllReservations();
    reservations.push(newReservation);
    this.setItem(STORAGE_KEYS.RESERVATIONS, reservations);

    this.notifyListeners('reservation-created', newReservation);
    return { success: true, reservation: newReservation };
  }

  public cancelReservation(reservationId: string): { success: boolean; error?: string } {
    const reservations = this.getAllReservations();
    const index = reservations.findIndex((r) => r.id === reservationId);

    if (index === -1) {
      return { success: false, error: 'Reserva não encontrada.' };
    }

    reservations[index].status = 'CANCELLED';
    this.setItem(STORAGE_KEYS.RESERVATIONS, reservations);
    this.notifyListeners('reservation-cancelled', reservationId);
    return { success: true };
  }

  // --- Reading Status & Wishlist ---
  public getUserBookStatuses(userId: string): UserBookStatus[] {
    const statuses = this.getItem<UserBookStatus[]>(STORAGE_KEYS.READING_STATUSES, []);
    return statuses.filter((s) => s.userId === userId);
  }

  public getUserBookStatus(userId: string, bookId: string): UserBookStatus | null {
    const statuses = this.getUserBookStatuses(userId);
    return statuses.find((s) => s.bookId === bookId) || null;
  }

  public setReadingStatus(
    userId: string,
    bookId: string,
    status: ReadingStatus,
    bookDetails: { title: string; thumbnail: string; authors: string[] }
  ): UserBookStatus {
    const statuses = this.getItem<UserBookStatus[]>(STORAGE_KEYS.READING_STATUSES, []);
    const existingIndex = statuses.findIndex((s) => s.userId === userId && s.bookId === bookId);

    const record: UserBookStatus = {
      id: `${userId}_${bookId}`,
      userId,
      bookId,
      status,
      bookTitle: bookDetails.title,
      bookThumbnail: bookDetails.thumbnail,
      bookAuthors: bookDetails.authors,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      statuses[existingIndex] = { ...statuses[existingIndex], ...record };
    } else {
      statuses.push(record);
    }

    this.setItem(STORAGE_KEYS.READING_STATUSES, statuses);
    this.notifyListeners('reading-status-updated', record);
    return record;
  }

  public removeReadingStatus(userId: string, bookId: string): boolean {
    const statuses = this.getItem<UserBookStatus[]>(STORAGE_KEYS.READING_STATUSES, []);
    const filtered = statuses.filter((s) => !(s.userId === userId && s.bookId === bookId));
    this.setItem(STORAGE_KEYS.READING_STATUSES, filtered);
    this.notifyListeners('reading-status-removed', { userId, bookId });
    return true;
  }

  public getWishlist(userId: string): UserBookStatus[] {
    return this.getUserBookStatuses(userId).filter((s) => s.status === 'WISHLIST');
  }

  // --- Inventory Tracking ---
  public getBookInventory(bookId: string): BookInventoryRecord {
    const inventories = this.getItem<Record<string, BookInventoryRecord>>(STORAGE_KEYS.BOOK_INVENTORIES, {});
    if (inventories[bookId]) {
      return inventories[bookId];
    }

    // Default dynamic inventory rule for books from Google API:
    // Generate deterministic default based on book ID character code to create a realistic mix of available & borrowed
    const hash = bookId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalCopies = (hash % 3) + 1; // 1, 2, or 3 copies
    const availableCopies = (hash % 4 === 0) ? 0 : Math.max(1, totalCopies - (hash % 2));
    const status: BookAvailabilityStatus = availableCopies > 0 ? 'AVAILABLE' : 'BORROWED';

    const defaultRecord: BookInventoryRecord = {
      bookId,
      totalCopies,
      availableCopies,
      status,
    };

    // Cache it so inventory remains consistent
    inventories[bookId] = defaultRecord;
    this.setItem(STORAGE_KEYS.BOOK_INVENTORIES, inventories);
    return defaultRecord;
  }

  public setBookInventory(record: BookInventoryRecord): void {
    const inventories = this.getItem<Record<string, BookInventoryRecord>>(STORAGE_KEYS.BOOK_INVENTORIES, {});
    inventories[record.bookId] = record;
    this.setItem(STORAGE_KEYS.BOOK_INVENTORIES, inventories);
    this.notifyListeners('inventory-updated', record);
  }
}

// Export singleton instance
export const storageService = new LocalStorageService();
