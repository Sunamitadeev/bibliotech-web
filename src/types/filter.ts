export type BookCategory = 
  | 'ALL'
  | 'Fiction'
  | 'Science'
  | 'Computers' // Tecnologia / Computação
  | 'History'
  | 'Philosophy'
  | 'Business';

export interface CategoryOption {
  id: BookCategory;
  label: string;
  searchTerm?: string;
}

export const BOOK_CATEGORIES: CategoryOption[] = [
  { id: 'ALL', label: 'Todas as Categorias', searchTerm: '' },
  { id: 'Computers', label: 'Tecnologia & Computação', searchTerm: 'subject:computers' },
  { id: 'Science', label: 'Ciência & Pesquisa', searchTerm: 'subject:science' },
  { id: 'Fiction', label: 'Ficção & Literatura', searchTerm: 'subject:fiction' },
  { id: 'History', label: 'História', searchTerm: 'subject:history' },
  { id: 'Philosophy', label: 'Filosofia', searchTerm: 'subject:philosophy' },
  { id: 'Business', label: 'Administração & Negócios', searchTerm: 'subject:business' },
];

export type SortOption = 'relevance' | 'newest' | 'title_asc' | 'title_desc';

export interface SortDropdownOption {
  id: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortDropdownOption[] = [
  { id: 'relevance', label: 'Mais Relevantes' },
  { id: 'newest', label: 'Mais Recentes' },
  { id: 'title_asc', label: 'Título (A-Z)' },
  { id: 'title_desc', label: 'Título (Z-A)' },
];

export interface FilterParams {
  query: string;
  category: BookCategory;
  sort: SortOption;
  onlyAvailable: boolean;
  page: number;
  pageSize: number;
}
