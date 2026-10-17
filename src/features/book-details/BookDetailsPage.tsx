import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { googleBooksService } from '@/services/api/googleBooks.service';
import { sanitizeHtml } from '@/utils/sanitize';
import { calculateDueDate, formatDateBR } from '@/utils/dates';
import { ReadingStatusSelector } from './ReadingStatusSelector';
import { LoanModal } from '@/features/loans/LoanModal';
import { ReservationModal } from '@/features/reservations/ReservationModal';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  BookOpen,
  Hash,
  ShieldCheck,
  Heart,
  ExternalLink,
  Star,
  Users,
} from 'lucide-react';

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const { isBookInWishlist, toggleWishlist } = useLibraryStore();

  const { data: book, isLoading, isError, error } = useQuery({
    queryKey: ['book', id],
    queryFn: () => googleBooksService.getBookById(id || ''),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in py-4">
        <Skeleton className="h-6 w-32 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4 rounded" />
            <Skeleton className="h-5 w-1/2 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Livro não encontrado
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          {(error as Error)?.message || 'Não conseguimos localizar as informações deste exemplar no catálogo.'}
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="primary" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Catálogo
          </Button>
        </Link>
      </div>
    );
  }

  const inWishlist = isBookInWishlist(book.id);
  const isAvailable = book.availableCopies > 0;
  const sanitizedDescription = sanitizeHtml(book.description);
  const defaultDueDate = calculateDueDate(new Date(), 14);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in py-2">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Catálogo Geral
        </Link>
      </div>

      {/* Main Book Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Cover & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900">
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={`Capa do livro ${book.title}`}
                className="h-full w-full object-cover rounded-xl"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-slate-100 p-6 text-center dark:bg-slate-800">
                <BookOpen className="h-16 w-16 text-indigo-400 mb-3 opacity-60" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {book.title}
                </p>
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={() => toggleWishlist(book)}
              aria-label={inWishlist ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              className={`absolute top-5 right-5 p-2.5 rounded-full backdrop-blur-md shadow-lg transition-transform active:scale-95 ${
                inWishlist
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white/90 text-slate-700 hover:text-rose-500 dark:bg-slate-900/90 dark:text-slate-200'
              }`}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Availability Status Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status no Acervo
              </span>
              {isAvailable ? (
                <Badge variant="success" size="md">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Disponível ({book.availableCopies}/{book.totalCopies})
                </Badge>
              ) : (
                <Badge variant="danger" size="md">
                  <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                  Emprestado (0/{book.totalCopies})
                </Badge>
              )}
            </div>

            {/* Action Trigger */}
            {isAvailable ? (
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsLoanModalOpen(true)}
                  className="w-full gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <ShieldCheck className="h-5 w-5" />
                  Solicitar Empréstimo (14 Dias)
                </Button>
                <p className="text-[11px] text-center text-slate-500">
                  Devolução prevista para {formatDateBR(defaultDueDate)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsReservationModalOpen(true)}
                  className="w-full gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                >
                  <Users className="h-5 w-5" />
                  Entrar na Fila de Reserva
                </Button>
                <p className="text-[11px] text-center text-slate-500">
                  Você será notificado imediatamente assim que um exemplar for devolvido
                </p>
              </div>
            )}
          </div>

          {/* Reading Status Selector */}
          <ReadingStatusSelector book={book} />
        </div>

        {/* Right Col: Metadata, Synopsis & Specs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Title Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {book.categories.map((cat, idx) => (
                <Badge key={idx} variant="purple" size="sm">
                  {cat}
                </Badge>
              ))}
              {book.averageRating && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {book.averageRating.toFixed(1)} ({book.ratingsCount || 0} avaliações)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {book.subtitle}
              </p>
            )}

            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Por <strong className="text-slate-900 dark:text-white">{book.authors.join(', ')}</strong>
            </p>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 shadow-sm text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Editora</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{book.publisher || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Publicação</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{book.publishedDate ? formatDateBR(book.publishedDate) : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Páginas</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{book.pageCount ? `${book.pageCount} páginas` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Idioma</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{book.language || 'PT'}</span>
            </div>
          </div>

          {/* Sanitized Synopsis with XSS Mitigation */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" /> Sinopse Oficial do Acervo
            </h3>
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>

          {/* Technical Identification Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Hash className="h-4 w-4 text-indigo-600" /> Identificação e Catalogação Bibliográfica
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Código do Livro / ISBN-13</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{book.isbn13 || book.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">ISBN-10</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{book.isbn10 || 'Identificador Interno'}</span>
              </div>
            </div>

            {book.infoLink && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <a
                  href={book.infoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                >
                  Consultar Registro Completo no Google Books <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoanModal
        book={book}
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
      />

      <ReservationModal
        book={book}
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
      />
    </div>
  );
};
