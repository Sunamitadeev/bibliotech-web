import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { googleBooksService } from '@/services/api/googleBooks.service';
import { Book, BookCategory, SortOption } from '@/types';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { SortDropdown } from './SortDropdown';
import { BookCard } from './BookCard';
import { BookGridSkeleton } from './BookGridSkeleton';
import { LoanModal } from '@/features/loans/LoanModal';
import { ReservationModal } from '@/features/reservations/ReservationModal';
import { BookOpen, Sparkles, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CatalogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory>('ALL');
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevance');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [selectedBookForLoan, setSelectedBookForLoan] = useState<Book | null>(null);
  const [selectedBookForReservation, setSelectedBookForReservation] = useState<Book | null>(null);

  // TanStack Query for Google Books API integration and caching
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['books', searchQuery, selectedCategory, selectedSort, onlyAvailable, page],
    queryFn: () =>
      googleBooksService.searchBooks({
        query: searchQuery,
        category: selectedCategory,
        sort: selectedSort,
        onlyAvailable,
        page,
        pageSize,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    placeholderData: (previousData) => previousData, // keep previous page data while loading next
  });

  const books = data?.books || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleCategoryChange = (cat: BookCategory) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSelectedSort(sort);
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner with Academic Styling */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/15 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>Acervo Físico & Digital Unificado</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Descubra o Conhecimento na Biblioteca Universitária
          </h1>
          <p className="mt-4 text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            Consulte milhares de títulos acadêmicos, verifique disponibilidade de exemplares físicos em tempo real e realize empréstimos com renovação facilitada de 14 dias.
          </p>

          {/* Quick Search inside hero */}
          <div className="mt-8">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Pesquisar por título, autor, assunto ou ISBN..."
            />
          </div>
        </div>
      </section>

      {/* Filter and Sort Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
          <SortDropdown
            selectedSort={selectedSort}
            onSelectSort={handleSortChange}
            onlyAvailable={onlyAvailable}
            onToggleOnlyAvailable={(val) => {
              setOnlyAvailable(val);
              setPage(1);
            }}
          />
        </div>

        {/* Results summary bar */}
        <div aria-live="polite" aria-atomic="true" className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            {isLoading ? (
              'Consultando acervo institucional...'
            ) : (
              <>
                Exibindo <strong>{books.length}</strong> de aproximadamente <strong>{totalItems}</strong> títulos encontrados
                {searchQuery && (
                  <span> para a busca &ldquo;{searchQuery}&rdquo;</span>
                )}
              </>
            )}
          </span>
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1.5 text-indigo-600 font-medium animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" /> Atualizando...
            </span>
          )}
        </div>
      </section>

      {/* Book Grid / Loading / Error State */}
      <section aria-label="Catálogo de Livros">
        {isLoading ? (
          <BookGridSkeleton count={12} />
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-10 text-center dark:border-rose-900 dark:bg-rose-950/20">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Falha ao carregar o acervo
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {(error as Error)?.message || 'Não foi possível se comunicar com o serviço de livros. Tente novamente.'}
            </p>
            <Button variant="primary" size="sm" onClick={() => refetch()} className="mt-4 gap-2">
              <RefreshCw className="h-4 w-4" /> Tentar Novamente
            </Button>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhum livro encontrado
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Tente utilizar outros termos de busca, selecionar outra categoria ou desmarcar o filtro de disponibilidade.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setOnlyAvailable(false);
              }}
              className="mt-4"
            >
              Limpar Todos os Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onQuickLoan={(b) => setSelectedBookForLoan(b)}
                onQuickReserve={(b) => setSelectedBookForReservation(b)}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && books.length > 0 && (
          <div className="mt-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="gap-2 text-xs"
            >
              <ChevronLeft className="h-4 w-4" /> Página Anterior
            </Button>

            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Página {page} de {Math.min(totalPages, 50)}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || isFetching}
              className="gap-2 text-xs"
            >
              Próxima Página <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      {/* Modals */}
      <LoanModal
        book={selectedBookForLoan}
        isOpen={!!selectedBookForLoan}
        onClose={() => setSelectedBookForLoan(null)}
      />

      <ReservationModal
        book={selectedBookForReservation}
        isOpen={!!selectedBookForReservation}
        onClose={() => setSelectedBookForReservation(null)}
      />
    </div>
  );
};
