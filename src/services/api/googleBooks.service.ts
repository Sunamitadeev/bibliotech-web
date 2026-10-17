import { Book, FilterParams, GoogleBooksApiResponse, GoogleBookItem } from '@/types';
import { storageService } from '../storage';
import { openLibraryService } from './openLibrary.service';

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Ensures HTTPS and high resolution for Google Books thumbnails
 */
function normalizeThumbnail(imageLinks?: GoogleBookItem['volumeInfo']['imageLinks']): string {
  if (!imageLinks) {
    return '';
  }
  const rawUrl = imageLinks.thumbnail || imageLinks.smallThumbnail || imageLinks.medium || imageLinks.large || '';
  if (!rawUrl) return '';
  return rawUrl.replace(/^http:\/\//i, 'https://');
}

/**
 * Normalizes raw Google Books API item into our application's Book entity
 */
export function normalizeGoogleBook(item: GoogleBookItem): Book {
  const info = item.volumeInfo || {};
  const inventory = storageService.getBookInventory(item.id);

  const isbn13Obj = info.industryIdentifiers?.find((id) => id.type === 'ISBN_13');
  const isbn10Obj = info.industryIdentifiers?.find((id) => id.type === 'ISBN_10');

  return {
    id: item.id,
    title: info.title || 'Título Indisponível',
    subtitle: info.subtitle,
    authors: info.authors && info.authors.length > 0 ? info.authors : ['Autor Não Informado'],
    publisher: info.publisher || 'Editora Não Informada',
    publishedDate: info.publishedDate,
    description: info.description || 'Nenhuma sinopse disponível para este exemplar no acervo.',
    pageCount: info.pageCount,
    categories: info.categories && info.categories.length > 0 ? info.categories : ['Geral'],
    averageRating: info.averageRating,
    ratingsCount: info.ratingsCount,
    thumbnail: normalizeThumbnail(info.imageLinks),
    smallThumbnail: info.imageLinks?.smallThumbnail ? info.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://') : undefined,
    language: info.language,
    isbn10: isbn10Obj?.identifier,
    isbn13: isbn13Obj?.identifier,
    previewLink: info.previewLink,
    infoLink: info.infoLink,
    totalCopies: inventory.totalCopies,
    availableCopies: inventory.availableCopies,
    availabilityStatus: inventory.status,
  };
}

export interface SearchBooksResult {
  books: Book[];
  totalItems: number;
}

/**
 * Builds Google Books API search query string based on filters
 */
function buildQueryString(params: FilterParams): string {
  const parts: string[] = [];
  const cleanQuery = params.query.trim();

  if (cleanQuery) {
    parts.push(cleanQuery);
  }

  if (params.category && params.category !== 'ALL') {
    parts.push(`subject:${params.category.toLowerCase()}`);
  }

  // If both query and category are empty, search an engaging university catalog collection
  if (parts.length === 0) {
    return 'computer science OR software engineering OR algorithms OR mathematics OR physics';
  }

  return parts.join(' ');
}

export const googleBooksService = {
  /**
   * Search volumes with pagination and filters
   */
  async searchBooks(params: FilterParams): Promise<SearchBooksResult> {
    const q = buildQueryString(params);
    const startIndex = (params.page - 1) * params.pageSize;
    const maxResults = Math.min(params.pageSize, 40);

    const url = new URL(GOOGLE_BOOKS_BASE_URL);
    url.searchParams.set('q', q);
    url.searchParams.set('startIndex', startIndex.toString());
    url.searchParams.set('maxResults', maxResults.toString());
    url.searchParams.set('printType', 'books');

    if (params.sort === 'newest') {
      url.searchParams.set('orderBy', 'newest');
    } else {
      url.searchParams.set('orderBy', 'relevance');
    }

    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    if (apiKey) {
      url.searchParams.set('key', apiKey);
    }

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Google Books API HTTP ${response.status}`);
      }

      const data: GoogleBooksApiResponse = await response.json();
      let books: Book[] = (data.items || []).map(normalizeGoogleBook);

      // If Google Books returned 0 results or had an empty query, try Open Library
      if (books.length === 0) {
        return await openLibraryService.searchBooks(params);
      }

      // Client-side sort options for title asc/desc
      if (params.sort === 'title_asc') {
        books.sort((a, b) => a.title.localeCompare(b.title));
      } else if (params.sort === 'title_desc') {
        books.sort((a, b) => b.title.localeCompare(a.title));
      }

      // Filter by availability if requested
      if (params.onlyAvailable) {
        books = books.filter((b) => b.availableCopies > 0);
      }

      return {
        books,
        totalItems: data.totalItems || books.length,
      };
    } catch (error) {
      console.warn('Google Books API indisponível ou limitada, recorrendo à Open Library:', error);

      try {
        const olResult = await openLibraryService.searchBooks(params);
        if (olResult.books.length > 0) {
          return olResult;
        }
      } catch (olError) {
        console.warn('Open Library também indisponível, recorrendo aos livros de fallback:', olError);
      }

      // Fallback books in case of rate limit or network error
      const fallbackBooks = getFallbackBooks(params);
      return {
        books: fallbackBooks,
        totalItems: fallbackBooks.length,
      };
    }
  },

  /**
   * Fetches single book by Google Volume ID or Open Library ID
   */
  async getBookById(id: string): Promise<Book | null> {
    // If ID belongs to Open Library (e.g., OL... or works...)
    if (id.startsWith('OL') || id.includes('works')) {
      const olBook = await openLibraryService.getBookById(id);
      if (olBook) return olBook;
    }

    try {
      const url = new URL(`${GOOGLE_BOOKS_BASE_URL}/${encodeURIComponent(id)}`);
      const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
      if (apiKey) {
        url.searchParams.set('key', apiKey);
      }

      const response = await fetch(url.toString());

      if (response.ok) {
        const item: GoogleBookItem = await response.json();
        return normalizeGoogleBook(item);
      }
    } catch (error) {
      console.warn(`Erro ao buscar livro ${id} no Google Books, consultando Open Library:`, error);
    }

    // Try Open Library if Google failed or returned error
    try {
      const olBook = await openLibraryService.getBookById(id);
      if (olBook) return olBook;
    } catch {
      // ignore
    }

    const fallback = getFallbackBooks().find((b) => b.id === id);
    return fallback || null;
  },
};

/**
 * Curated fallback books ensuring high quality offline/error resilience
 */
function getFallbackBooks(params?: FilterParams): Book[] {
  const rawList: Book[] = [
    {
      id: 'clean-code-id',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      subtitle: 'A Handbook of Agile Software Craftsmanship',
      authors: ['Robert C. Martin'],
      publisher: 'Prentice Hall',
      publishedDate: '2008-08-01',
      description: '<p>Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn\'t have to be that way.</p><p>Noted software expert Robert C. Martin presents a revolutionary paradigm with Clean Code.</p>',
      pageCount: 464,
      categories: ['Computers', 'Software Engineering'],
      averageRating: 4.5,
      ratingsCount: 320,
      thumbnail: 'https://books.google.com/books/content?id=_i6bDeoCQzsC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      language: 'en',
      isbn10: '0132350882',
      isbn13: '9780132350884',
      totalCopies: 2,
      availableCopies: 0,
      availabilityStatus: 'BORROWED',
    },
    {
      id: 'design-patterns-id',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      authors: ['Erich Gamma', 'Richard Helm', 'Ralph Johnson', 'John Vlissides'],
      publisher: 'Addison-Wesley',
      publishedDate: '1994-10-31',
      description: '<p>Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.</p>',
      pageCount: 395,
      categories: ['Computers', 'Architecture'],
      averageRating: 4.6,
      ratingsCount: 280,
      thumbnail: 'https://books.google.com/books/content?id=K8ddDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      language: 'en',
      isbn10: '0201633612',
      isbn13: '9780201633610',
      totalCopies: 2,
      availableCopies: 1,
      availabilityStatus: 'AVAILABLE',
    },
    {
      id: 'pragmatic-programmer-id',
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      authors: ['David Thomas', 'Andrew Hunt'],
      publisher: 'Addison-Wesley Professional',
      publishedDate: '2019-09-13',
      description: '<p>The Pragmatic Programmer is one of those rare tech books you\'ll read, re-read, and read to your team again over the years. Whether you\'re new to the field or an experienced practitioner, you\'ll come away with fresh insights every time.</p>',
      pageCount: 352,
      categories: ['Computers', 'Software Development'],
      averageRating: 4.8,
      ratingsCount: 410,
      thumbnail: 'https://books.google.com/books/content?id=5wBQEp6nqa8C&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      language: 'en',
      isbn10: '0135957052',
      isbn13: '9780135957059',
      totalCopies: 3,
      availableCopies: 2,
      availabilityStatus: 'AVAILABLE',
    },
    {
      id: 'refactoring-id',
      title: 'Refactoring: Improving the Design of Existing Code',
      authors: ['Martin Fowler'],
      publisher: 'Addison-Wesley',
      publishedDate: '2018-11-20',
      description: '<p>For more than twenty years, serious programmers have relied on Martin Fowler\'s Refactoring to improve the design of existing code and to raise software maintainability, as well as to make existing code easier to understand.</p>',
      pageCount: 448,
      categories: ['Computers', 'Refactoring'],
      averageRating: 4.7,
      ratingsCount: 215,
      thumbnail: 'https://books.google.com/books/content?id=01t1DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      language: 'en',
      isbn10: '0134757599',
      isbn13: '9780134757599',
      totalCopies: 1,
      availableCopies: 0,
      availabilityStatus: 'BORROWED',
    },
  ];

  if (!params) return rawList;

  let filtered = rawList;
  if (params.query && params.query.trim()) {
    const q = params.query.toLowerCase().trim();
    const matches = rawList.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.authors.some((a) => a.toLowerCase().includes(q)) ||
        b.categories.some((c) => c.toLowerCase().includes(q))
    );
    if (matches.length > 0) {
      filtered = matches;
    }
  }

  if (params.onlyAvailable) {
    filtered = filtered.filter((b) => b.availableCopies > 0);
  }
  return filtered;
}
