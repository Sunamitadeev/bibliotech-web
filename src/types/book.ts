export interface BookAuthor {
  name: string;
}

export type BookAvailabilityStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED';

export interface Book {
  id: string; // Google Books ID or custom ISBN
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description: string;
  pageCount?: number;
  categories: string[];
  averageRating?: number;
  ratingsCount?: number;
  thumbnail: string;
  smallThumbnail?: string;
  language?: string;
  isbn10?: string;
  isbn13?: string;
  previewLink?: string;
  infoLink?: string;
  
  // Library physical inventory management fields
  totalCopies: number;
  availableCopies: number;
  availabilityStatus: BookAvailabilityStatus;
}

// Google Books API Raw Response Types
export interface GoogleBookVolumeInfo {
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  language?: string;
  previewLink?: string;
  infoLink?: string;
}

export interface GoogleBookItem {
  id: string;
  etag?: string;
  volumeInfo: GoogleBookVolumeInfo;
}

export interface GoogleBooksApiResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBookItem[];
}
