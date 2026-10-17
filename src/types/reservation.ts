export type ReservationStatus = 'PENDING' | 'NOTIFIED' | 'FULFILLED' | 'CANCELLED';

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookThumbnail: string;
  bookAuthors: string[];
  userId: string;
  userName: string;
  userEmail: string;
  reservedAt: string; // ISO Date
  status: ReservationStatus;
  notifiedAt?: string; // Date when copy became available
  priorityPosition?: number; // Position in waiting queue (1, 2, 3...)
}

export interface ReservationCreationParams {
  bookId: string;
  bookTitle: string;
  bookThumbnail: string;
  bookAuthors: string[];
  userId: string;
  userName: string;
  userEmail: string;
}
