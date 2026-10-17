import { Book } from './book';

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookThumbnail: string;
  bookAuthors: string[];
  userId: string;
  userName: string;
  userEmail: string;
  borrowedAt: string; // ISO 8601 date string
  dueDate: string;    // ISO 8601 date string (14 days from borrowedAt)
  returnedAt?: string; // ISO 8601 date string if returned
  status: LoanStatus;
  renewalCount: number;
  notes?: string;
}

export interface LoanCreationParams {
  book: Book;
  userId: string;
  userName: string;
  userEmail: string;
  notes?: string;
}
