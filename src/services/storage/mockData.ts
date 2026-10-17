import { User, Loan, Reservation, UserBookStatus } from '@/types';
import { BookInventoryRecord } from './storage.interface';
import { calculateDueDate } from '@/utils/dates';

export const MOCK_USERS: User[] = [
  {
    id: 'user-ana',
    name: 'Ana Carolina Souza',
    email: 'ana.souza@universidade.edu.br',
    studentId: 'RA-202410882',
    course: 'Engenharia de Software',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    maxActiveLoans: 3,
  },
  {
    id: 'user-marcos',
    name: 'Prof. Dr. Marcos Vinicius Silva',
    email: 'm.silva@universidade.edu.br',
    studentId: 'PROF-5021',
    course: 'Ciência da Computação',
    role: 'PROFESSOR',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    maxActiveLoans: 5,
  },
  {
    id: 'user-beatriz',
    name: 'Beatriz Lima',
    email: 'beatriz.lima@universidade.edu.br',
    studentId: 'RA-202390114',
    course: 'Design Digital',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    maxActiveLoans: 3,
  },
];

// Helper date math for seed loans
const now = new Date();
const d = (daysAgo: number) => {
  const target = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return target.toISOString();
};

export const INITIAL_MOCK_LOANS: Loan[] = [
  // Overdue loan (borrowed 18 days ago, due 4 days ago)
  {
    id: 'loan-seed-1',
    bookId: 'clean-code-id',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    bookThumbnail: 'https://books.google.com/books/content?id=_i6bDeoCQzsC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    bookAuthors: ['Robert C. Martin'],
    userId: 'user-ana',
    userName: 'Ana Carolina Souza',
    userEmail: 'ana.souza@universidade.edu.br',
    borrowedAt: d(18),
    dueDate: d(4), // 4 days overdue
    status: 'ACTIVE',
    renewalCount: 0,
    notes: 'Livro para disciplina de Projeto Integrador',
  },
  // Due soon loan (borrowed 12 days ago, due in 2 days)
  {
    id: 'loan-seed-2',
    bookId: 'design-patterns-id',
    bookTitle: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    bookThumbnail: 'https://books.google.com/books/content?id=K8ddDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    bookAuthors: ['Erich Gamma', 'Richard Helm', 'Ralph Johnson', 'John Vlissides'],
    userId: 'user-ana',
    userName: 'Ana Carolina Souza',
    userEmail: 'ana.souza@universidade.edu.br',
    borrowedAt: d(12),
    dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days left
    status: 'ACTIVE',
    renewalCount: 1,
  },
  // Returned loan in history
  {
    id: 'loan-seed-3',
    bookId: 'pragmatic-programmer-id',
    bookTitle: 'The Pragmatic Programmer: Your Journey to Mastery',
    bookThumbnail: 'https://books.google.com/books/content?id=5wBQEp6nqa8C&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    bookAuthors: ['David Thomas', 'Andrew Hunt'],
    userId: 'user-ana',
    userName: 'Ana Carolina Souza',
    userEmail: 'ana.souza@universidade.edu.br',
    borrowedAt: d(35),
    dueDate: d(21),
    returnedAt: d(22),
    status: 'RETURNED',
    renewalCount: 0,
  },
  // Another user's loan
  {
    id: 'loan-seed-4',
    bookId: 'refactoring-id',
    bookTitle: 'Refactoring: Improving the Design of Existing Code',
    bookThumbnail: 'https://books.google.com/books/content?id=01t1DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    bookAuthors: ['Martin Fowler'],
    userId: 'user-marcos',
    userName: 'Prof. Dr. Marcos Vinicius Silva',
    userEmail: 'm.silva@universidade.edu.br',
    borrowedAt: d(5),
    dueDate: calculateDueDate(d(5), 14),
    status: 'ACTIVE',
    renewalCount: 0,
  },
];

export const INITIAL_MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-seed-1',
    bookId: 'refactoring-id',
    bookTitle: 'Refactoring: Improving the Design of Existing Code',
    bookThumbnail: 'https://books.google.com/books/content?id=01t1DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    bookAuthors: ['Martin Fowler'],
    userId: 'user-ana',
    userName: 'Ana Carolina Souza',
    userEmail: 'ana.souza@universidade.edu.br',
    reservedAt: d(3),
    status: 'PENDING',
    priorityPosition: 1,
  },
];

export const INITIAL_MOCK_READING_STATUSES: UserBookStatus[] = [
  {
    id: 'user-ana_clean-code-id',
    userId: 'user-ana',
    bookId: 'clean-code-id',
    status: 'READING',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    bookThumbnail: 'https://books.google.com/books/content?id=_i6bDeoCQzsC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    bookAuthors: ['Robert C. Martin'],
    updatedAt: d(18),
  },
  {
    id: 'user-ana_pragmatic-programmer-id',
    userId: 'user-ana',
    bookId: 'pragmatic-programmer-id',
    status: 'COMPLETED',
    bookTitle: 'The Pragmatic Programmer: Your Journey to Mastery',
    bookThumbnail: 'https://books.google.com/books/content?id=5wBQEp6nqa8C&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    bookAuthors: ['David Thomas', 'Andrew Hunt'],
    updatedAt: d(22),
    rating: 5,
  },
  {
    id: 'user-ana_wishlist-1',
    userId: 'user-ana',
    bookId: 'structure-interpretation-id',
    status: 'WISHLIST',
    bookTitle: 'Structure and Interpretation of Computer Programs',
    bookThumbnail: 'https://books.google.com/books/content?id=s6n0CwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    bookAuthors: ['Harold Abelson', 'Gerald Jay Sussman'],
    updatedAt: d(2),
  },
];

export const INITIAL_BOOK_INVENTORY: Record<string, BookInventoryRecord> = {
  'clean-code-id': {
    bookId: 'clean-code-id',
    totalCopies: 1,
    availableCopies: 0,
    status: 'BORROWED',
  },
  'design-patterns-id': {
    bookId: 'design-patterns-id',
    totalCopies: 2,
    availableCopies: 1,
    status: 'AVAILABLE',
  },
  'refactoring-id': {
    bookId: 'refactoring-id',
    totalCopies: 1,
    availableCopies: 0,
    status: 'BORROWED',
  },
};
