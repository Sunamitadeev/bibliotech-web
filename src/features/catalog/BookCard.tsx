import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '@/types';
import { Heart, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLibraryStore } from '@/store/useLibraryStore';

interface BookCardProps {
  book: Book;
  onQuickLoan?: (book: Book) => void;
  onQuickReserve?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onQuickLoan, onQuickReserve }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { isBookInWishlist, toggleWishlist, getReadingStatusForBook } = useLibraryStore();

  const inWishlist = isBookInWishlist(book.id);
  const readingStatus = getReadingStatusForBook(book.id);
  const isAvailable = book.availableCopies > 0;

  const readingStatusMap = {
    WANT_TO_READ: { label: 'Quero Ler', variant: 'purple' as const },
    READING: { label: 'Lendo Agora', variant: 'info' as const },
    COMPLETED: { label: 'Concluído', variant: 'success' as const },
    WISHLIST: { label: 'Lista de Desejos', variant: 'warning' as const },
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      {/* Cover Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
        )}

        {book.thumbnail && !imageError ? (
          <img
            src={book.thumbnail}
            alt={`Capa do livro ${book.title}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
            <BookOpen className="h-10 w-10 text-indigo-400 mb-2 opacity-60" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-3">
              {book.title}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
              {book.authors.join(', ')}
            </p>
          </div>
        )}

        {/* Wishlist Button Overlay */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(book);
          }}
          aria-label={inWishlist ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
            inWishlist
              ? 'bg-rose-500 text-white hover:bg-rose-600 scale-110'
              : 'bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white dark:bg-slate-900/80 dark:text-slate-300'
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Status Badge Overlay */}
        <div className="absolute bottom-2.5 left-2.5">
          {isAvailable ? (
            <Badge variant="success" size="sm" className="shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Disponível ({book.availableCopies}/{book.totalCopies})
            </Badge>
          ) : (
            <Badge variant="danger" size="sm" className="shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
              Emprestado (Fila Ativa)
            </Badge>
          )}
        </div>
      </div>

      {/* Book Metadata */}
      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {book.categories[0] || 'Geral'}
          </span>
          {readingStatus && (
            <Badge variant={readingStatusMap[readingStatus].variant} size="sm">
              {readingStatusMap[readingStatus].label}
            </Badge>
          )}
        </div>

        <Link
          to={`/books/${book.id}`}
          className="text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-2 leading-snug transition-colors"
          title={book.title}
        >
          {book.title}
        </Link>

        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
          {book.authors.join(', ')}
        </p>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{book.publisher || 'Edição Acadêmica'}</span>
          {book.publishedDate && (
            <span>{book.publishedDate.substring(0, 4)}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
          <Link to={`/books/${book.id}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Detalhes
            </Button>
          </Link>

          {isAvailable ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onQuickLoan ? onQuickLoan(book) : null}
              className="w-full text-xs"
            >
              Emprestar
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onQuickReserve ? onQuickReserve(book) : null}
              className="w-full text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              Reservar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
