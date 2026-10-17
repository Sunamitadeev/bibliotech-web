export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED' | 'WISHLIST';

export interface UserBookStatus {
  id: string; // unique key: `${userId}_${bookId}`
  userId: string;
  bookId: string;
  status: ReadingStatus;
  bookTitle: string;
  bookThumbnail: string;
  bookAuthors: string[];
  updatedAt: string;
  rating?: number; // 1 to 5 stars
  personalNotes?: string;
}

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  WANT_TO_READ: 'Quero Ler',
  READING: 'Lendo',
  COMPLETED: 'Concluído',
  WISHLIST: 'Lista de Desejos',
};
