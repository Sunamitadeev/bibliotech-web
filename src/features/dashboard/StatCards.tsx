import React from 'react';
import { Loan, Reservation, UserBookStatus } from '@/types';
import { isOverdue, isDueSoon } from '@/utils/dates';
import { BookOpen, AlertTriangle, Users, Heart } from 'lucide-react';

interface StatCardsProps {
  activeLoans: Loan[];
  reservations: Reservation[];
  wishlist: UserBookStatus[];
}

export const StatCards: React.FC<StatCardsProps> = ({ activeLoans, reservations, wishlist }) => {
  const overdueCount = activeLoans.filter((l) => isOverdue(l.dueDate)).length;
  const dueSoonCount = activeLoans.filter((l) => !isOverdue(l.dueDate) && isDueSoon(l.dueDate)).length;
  const pendingReservationsCount = reservations.filter((r) => r.status === 'PENDING' || r.status === 'NOTIFIED').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Loans Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Empréstimos Ativos
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {activeLoans.length}
          </span>
          <span className="text-xs text-slate-500">
            {activeLoans.length === 1 ? 'exemplar em posse' : 'exemplares em posse'}
          </span>
        </div>
        {dueSoonCount > 0 && (
          <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            ⚠️ {dueSoonCount} {dueSoonCount === 1 ? 'livro vence' : 'livros vencem'} nos próximos 3 dias
          </p>
        )}
      </div>

      {/* Overdue Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Prazos Vencidos
          </span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            overdueCount > 0
              ? 'bg-rose-100 text-rose-600 animate-pulse'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-2xl font-extrabold ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
            {overdueCount}
          </span>
          <span className="text-xs text-slate-500">
            {overdueCount === 1 ? 'pendência com atraso' : 'pendências com atraso'}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {overdueCount > 0 ? 'Regularize a entrega para evitar bloqueio no RA' : 'Nenhum atraso registrado!'}
        </p>
      </div>

      {/* Reservations Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Fila de Reservas
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {pendingReservationsCount}
          </span>
          <span className="text-xs text-slate-500">
            {pendingReservationsCount === 1 ? 'espera ativa' : 'esperas ativas'}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Prioridade automática por ordem de solicitação
        </p>
      </div>

      {/* Wishlist Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Lista de Desejos
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <Heart className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {wishlist.length}
          </span>
          <span className="text-xs text-slate-500">
            {wishlist.length === 1 ? 'obra salva' : 'obras salvas'}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Notificações automáticas de devolução
        </p>
      </div>
    </div>
  );
};
