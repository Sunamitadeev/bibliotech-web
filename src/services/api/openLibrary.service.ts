import { Book, FilterParams } from '@/types';
import { storageService } from '../storage';
import { SearchBooksResult } from './googleBooks.service';

const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const COVERS_BASE_URL = 'https://covers.openlibrary.org/b/id';

// In-memory cache to quickly resolve book details navigated from search
const openLibraryCache = new Map<string, Book>();

/**
 * Normalizes Open Library search document into application's Book entity
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOpenLibraryDoc(doc: any): Book {
  const cleanId = (doc.key || '').replace(/^\/works\//, '') || String(doc.cover_i || Math.random());
  const inventory = storageService.getBookInventory(cleanId);

  const isbn13 = doc.isbn?.find((i: string) => i.length === 13) || doc.isbn?.[0];
  const isbn10 = doc.isbn?.find((i: string) => i.length === 10);

  const coverUrl = doc.cover_i
    ? `${COVERS_BASE_URL}/${doc.cover_i}-M.jpg`
    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';

  const book: Book = {
    id: cleanId,
    title: doc.title || 'Título Indisponível',
    subtitle: doc.subtitle,
    authors: doc.author_name && doc.author_name.length > 0 ? doc.author_name : ['Autor Desconhecido'],
    publisher: doc.publisher && doc.publisher.length > 0 ? doc.publisher[0] : 'Editora Não Informada',
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
    description:
      doc.first_sentence && doc.first_sentence.length > 0
        ? doc.first_sentence[0]
        : 'Obra acadêmica catalogada no acervo universitário (Open Library). Exemplar disponível para consulta e empréstimo.',
    pageCount: doc.number_of_pages_median,
    categories:
      doc.subject && doc.subject.length > 0
        ? doc.subject.slice(0, 3)
        : ['Ciências e Tecnologia'],
    averageRating: doc.ratings_average ? Number(doc.ratings_average.toFixed(1)) : 4.5,
    ratingsCount: doc.ratings_count || 12,
    thumbnail: coverUrl,
    smallThumbnail: coverUrl,
    language: doc.language?.[0] || 'pt',
    isbn10,
    isbn13,
    previewLink: `https://openlibrary.org/works/${cleanId}`,
    infoLink: `https://openlibrary.org/works/${cleanId}`,
    totalCopies: inventory.totalCopies,
    availableCopies: inventory.availableCopies,
    availabilityStatus: inventory.status,
  };

  openLibraryCache.set(cleanId, book);
  return book;
}

export const openLibraryService = {
  /**
   * Search books on Open Library
   */
  async searchBooks(params: FilterParams): Promise<SearchBooksResult> {
    const queryParts: string[] = [];
    const cleanQuery = params.query.trim();

    if (cleanQuery) {
      queryParts.push(cleanQuery);
    }

    if (params.category && params.category !== 'ALL') {
      queryParts.push(params.category.toLowerCase());
    }

    // Default academic query if empty
    const searchTerm = queryParts.length > 0 ? queryParts.join(' ') : 'computer science';

    const url = new URL(`${OPEN_LIBRARY_BASE_URL}/search.json`);
    url.searchParams.set('q', searchTerm);
    url.searchParams.set('page', String(params.page));
    url.searchParams.set('limit', String(params.pageSize));

    if (params.sort === 'newest') {
      url.searchParams.set('sort', 'new');
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Open Library API error: HTTP ${response.status}`);
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let books: Book[] = (data.docs || []).map((doc: any) => normalizeOpenLibraryDoc(doc));

    if (params.sort === 'title_asc') {
      books.sort((a, b) => a.title.localeCompare(b.title));
    } else if (params.sort === 'title_desc') {
      books.sort((a, b) => b.title.localeCompare(a.title));
    }

    if (params.onlyAvailable) {
      books = books.filter((b) => b.availableCopies > 0);
    }

    return {
      books,
      totalItems: data.numFound || books.length,
    };
  },

  /**
   * Fetch single book by Open Library Work ID
   */
  async getBookById(id: string): Promise<Book | null> {
    const cleanId = id.replace(/^\/works\//, '');
    const cached = openLibraryCache.get(cleanId);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${OPEN_LIBRARY_BASE_URL}/works/${encodeURIComponent(cleanId)}.json`);
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const inventory = storageService.getBookInventory(cleanId);

      let description = 'Sinopse disponível para este exemplar no acervo acadêmico.';
      if (typeof data.description === 'string') {
        description = data.description;
      } else if (data.description && typeof data.description.value === 'string') {
        description = data.description.value;
      }

      const coverId = data.covers?.[0];
      const coverUrl = coverId
        ? `${COVERS_BASE_URL}/${coverId}-M.jpg`
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';

      // Resolve author name if author reference is provided
      let authorName = 'Autor(a) da Obra';
      if (data.authors && data.authors.length > 0 && data.authors[0].author?.key) {
        try {
          const authorRes = await fetch(`${OPEN_LIBRARY_BASE_URL}${data.authors[0].author.key}.json`);
          if (authorRes.ok) {
            const authorData = await authorRes.json();
            if (authorData.name) {
              authorName = authorData.name;
            }
          }
        } catch {
          // ignore author fetch error
        }
      }

      const book: Book = {
        id: cleanId,
        title: data.title || 'Título Indisponível',
        subtitle: data.subtitle,
        authors: [authorName],
        publisher: 'Acervo Acadêmico',
        publishedDate: data.first_publish_date,
        description,
        categories: data.subjects?.slice(0, 3) || ['Geral'],
        averageRating: 4.5,
        ratingsCount: 20,
        thumbnail: coverUrl,
        smallThumbnail: coverUrl,
        language: 'pt',
        previewLink: `https://openlibrary.org/works/${cleanId}`,
        infoLink: `https://openlibrary.org/works/${cleanId}`,
        totalCopies: inventory.totalCopies,
        availableCopies: inventory.availableCopies,
        availabilityStatus: inventory.status,
      };

      openLibraryCache.set(cleanId, book);
      return book;
    } catch {
      return null;
    }
  },
};
