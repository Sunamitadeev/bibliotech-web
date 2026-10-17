import React, { useState } from 'react';
import { Book } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLibraryStore } from '@/store/useLibraryStore';
import { storageService } from '@/services/storage';
import { Users, CheckCircle2, BookmarkPlus } from 'lucide-react';

interface ReservationModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ book, isOpen, onClose }) => {
  const { reserveBook } = useLibraryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!book) return null;

  const currentPendingReservations = storageService
    .getReservationsByBook(book.id)
    .filter((r) => r.status === 'PENDING').length;

  const nextQueuePosition = currentPendingReservations + 1;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    setIsSubmitting(true);
    const result = reserveBook(book);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Entrar na Fila de Reserva"
      description="Todos os exemplares deste livro estão emprestados no momento."
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        {/* Book summary */}
        <div className="flex gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <img
            src={book.thumbnail || '/placeholder-cover.svg'}
            alt={`Capa do livro ${book.title}`}
            className="w-16 h-24 object-cover rounded-lg shadow-sm shrink-0 bg-slate-200"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
              {book.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
              {book.authors.join(', ')}
            </p>
            <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
              0 exemplares disponíveis de {book.totalCopies}
            </div>
          </div>
        </div>

        {/* Queue explanation */}
        <div role="status" className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs">
            <Users className="h-4 w-4 text-amber-600" />
            <span>Posição Estimada na Fila: #{nextQueuePosition}</span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Assim que um aluno devolver um exemplar deste livro, o sistema notificará você imediatamente por toast e painel de controle para retirada.
          </p>
        </div>

        {/* Benefits list */}
        <ul aria-label="Condições da reserva" className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-none p-0 m-0">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
            <span>Prioridade garantida na ordem cronológica de reserva</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
            <span>Prazo de 48 horas para retirada após notificação de disponibilidade</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
            <span>Cancelamento a qualquer momento sem penalidades acadêmicas</span>
          </li>
        </ul>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <BookmarkPlus className="h-4 w-4" />
            Confirmar Reserva
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
