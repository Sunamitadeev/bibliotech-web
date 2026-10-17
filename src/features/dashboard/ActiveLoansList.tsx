import React, { useState } from 'react';
import { Loan } from '@/types';
import { useLibraryStore } from '@/store/useLibraryStore';
import { formatDateBR, getDueDateStatus } from '@/utils/dates';
import { Button } from '@/components/ui/button';
import { Calendar, RotateCcw, CheckCircle, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActiveLoansListProps {
  loans: Loan[];
}

export const ActiveLoansList: React.FC<ActiveLoansListProps> = ({ loans }) => {
  const { returnBook, renewBook } = useLibraryStore();
  const [loadingLoanId, setLoadingLoanId] = useState<string | null>(null);

  const handleReturn = (loanId: string) => {
    setLoadingLoanId(loanId);
    returnBook(loanId);
    setLoadingLoanId(null);
  };

  const handleRenew = (loanId: string) => {
    setLoadingLoanId(loanId);
    renewBook(loanId);
    setLoadingLoanId(null);
  };

  if (loans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Nenhum empréstimo ativo no momento
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Você não possui livros em posse no momento. Explore nosso catálogo acadêmico para solicitar novos exemplares.
        </p>
        <Link to="/" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Explorar Catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => {
        const dueStatus = getDueDateStatus(loan.dueDate);
        const isLoadingThis = loadingLoanId === loan.id;

        return (
          <div
            key={loan.id}
            className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 bg-white dark:bg-slate-900 ${
              dueStatus.isOverdue
                ? 'border-rose-300 ring-1 ring-rose-300/50 dark:border-rose-900'
                : dueStatus.isDueSoon
                ? 'border-amber-300 dark:border-amber-800'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
              {/* Book Info */}
              <div className="flex gap-4 items-start min-w-0">
                <img
                  src={loan.bookThumbnail || '/placeholder-cover.svg'}
                  alt={loan.bookTitle}
                  className="w-16 h-24 object-cover rounded-xl shadow-sm shrink-0 bg-slate-100"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${dueStatus.badgeClass}`}>
                      {dueStatus.isOverdue && <AlertTriangle className="h-3 w-3" />}
                      {dueStatus.label}
                    </span>
                    {loan.renewalCount > 0 && (
                      <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                        Renovado ({loan.renewalCount}/2)
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/books/${loan.bookId}`}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-1 transition-colors"
                  >
                    {loan.bookTitle}
                  </Link>

                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {loan.bookAuthors.join(', ')}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Emprestado: <strong>{formatDateBR(loan.borrowedAt)}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      Devolução: <strong className={dueStatus.isOverdue ? 'text-rose-600' : 'text-slate-900 dark:text-white'}>{formatDateBR(loan.dueDate)}</strong>
                    </span>
                  </div>

                  {loan.notes && (
                    <p className="mt-1.5 text-[11px] text-slate-500 italic">
                      Obs: &ldquo;{loan.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleReturn(loan.id)}
                  isLoading={isLoadingThis}
                  className="flex-1 sm:flex-initial w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs shadow-sm shadow-emerald-600/20"
                >
                  <CheckCircle className="h-4 w-4" />
                  Devolver Agora
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRenew(loan.id)}
                  isLoading={isLoadingThis}
                  disabled={loan.renewalCount >= 2}
                  className="flex-1 sm:flex-initial w-full gap-1.5 text-xs"
                  title={loan.renewalCount >= 2 ? 'Limite de 2 renovações atingido' : 'Estender prazo em +14 dias'}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Renovar (+14d)
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
