import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Book } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { calculateDueDate, formatDateBR } from '@/utils/dates';
import { useAuthStore } from '@/store/useAuthStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LoanModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

const loanFormSchema = z.object({
  notes: z
    .string()
    .max(250, 'As observações não podem exceder 250 caracteres.')
    .optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'É obrigatório aceitar o regulamento do prazo de 14 dias para prosseguir.' }),
  }),
});

type LoanFormData = z.infer<typeof loanFormSchema>;

export const LoanModal: React.FC<LoanModalProps> = ({ book, isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { borrowBook, activeLoans } = useLibraryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      notes: '',
      acceptTerms: false as unknown as true,
    },
  });

  if (!book) return null;

  const dueDate = calculateDueDate(new Date(), 14);
  const activeCount = activeLoans.length;
  const maxLoans = user?.maxActiveLoans || 3;
  const hasReachedLimit = activeCount >= maxLoans;

  const onSubmit = (data: LoanFormData) => {
    if (!book || hasReachedLimit) return;
    setIsSubmitting(true);
    const sanitizedNotes = data.notes?.trim() || undefined;
    const result = borrowBook(book, sanitizedNotes);
    setIsSubmitting(false);

    if (result.success) {
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirmar Empréstimo de Livro"
      description="Revise as condições e prazos antes de concluir a solicitação."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Book summary card */}
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
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
              <span>Exemplares disponíveis: <strong className="text-emerald-600">{book.availableCopies}</strong></span>
              <span>•</span>
              <span>Total no acervo: {book.totalCopies}</span>
            </div>
          </div>
        </div>

        {/* Due date notice */}
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200 font-semibold text-xs">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <span>Regra de Devolução (14 Dias Corridos)</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">Data Limite de Entrega:</span>
            <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
              {formatDateBR(dueDate)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            * Renovações online são permitidas até 2 vezes, desde que não haja reservas pendentes.
          </p>
        </div>

        {/* Academic user check */}
        <div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Beneficiário:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Registro Acadêmico:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{user?.studentId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Saldo de Empréstimos:</span>
            <span className={`font-semibold ${hasReachedLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
              {activeCount} de {maxLoans} ativos
            </span>
          </div>
        </div>

        {hasReachedLimit && (
          <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Você já atingiu o limite de {maxLoans} empréstimos simultâneos permitidos. Devolva um exemplar para solicitar outro.</span>
          </div>
        )}

        {/* Notes Input validated with React Hook Form + Zod */}
        <div>
          <label htmlFor="loan-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Observações / Disciplina Acadêmica (Opcional):
          </label>
          <input
            id="loan-notes"
            type="text"
            placeholder="Ex.: Pesquisa para TCC / Disciplina de Algoritmos"
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? 'loan-notes-error' : undefined}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white transition-all"
            {...register('notes')}
          />
          {errors.notes && (
            <p id="loan-notes-error" role="alert" className="mt-1 text-xs text-rose-600 font-medium">
              {errors.notes.message}
            </p>
          )}
        </div>

        {/* Terms acceptance checkbox */}
        <div className="pt-1">
          <div className="flex items-start gap-2.5">
            <input
              id="loan-accept-terms"
              type="checkbox"
              aria-invalid={!!errors.acceptTerms}
              aria-describedby={errors.acceptTerms ? 'loan-terms-error' : undefined}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              {...register('acceptTerms')}
            />
            <label htmlFor="loan-accept-terms" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              Declaro estar ciente do prazo de devolução de <strong>14 dias corridos</strong> e das regras de conservação do exemplar.
            </label>
          </div>
          {errors.acceptTerms && (
            <p id="loan-terms-error" role="alert" className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={hasReachedLimit || isSubmitting}
            isLoading={isSubmitting}
            className="gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Confirmar Empréstimo
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
