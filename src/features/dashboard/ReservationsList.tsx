import React from 'react';
import { Reservation } from '@/types';
import { useLibraryStore } from '@/store/useLibraryStore';
import { formatDateBR } from '@/utils/dates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, XCircle, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReservationsListProps {
  reservations: Reservation[];
}

export const ReservationsList: React.FC<ReservationsListProps> = ({ reservations }) => {
  const { cancelReservation } = useLibraryStore();

  const activeReservations = reservations.filter(
    (r) => r.status === 'PENDING' || r.status === 'NOTIFIED'
  );

  if (activeReservations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Nenhuma reserva ativa
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Quando um livro de seu interesse estiver 100% emprestado, você poderá entrar na fila de espera prioritária e acompanhar o progresso aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeReservations.map((res) => {
        const isNotified = res.status === 'NOTIFIED';

        return (
          <div
            key={res.id}
            className={`rounded-2xl border p-5 shadow-sm transition-all bg-white dark:bg-slate-900 ${
              isNotified
                ? 'border-emerald-300 ring-1 ring-emerald-300/50 dark:border-emerald-800'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
              {/* Book Info */}
              <div className="flex gap-4 items-start min-w-0">
                <img
                  src={res.bookThumbnail || '/placeholder-cover.svg'}
                  alt={res.bookTitle}
                  className="w-14 h-20 object-cover rounded-xl shadow-sm shrink-0 bg-slate-100"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isNotified ? (
                      <Badge variant="success" size="sm">
                        <BellRing className="h-3 w-3 inline mr-1" />
                        Disponível para Retirada!
                      </Badge>
                    ) : (
                      <Badge variant="info" size="sm">
                        <Users className="h-3 w-3 inline mr-1" />
                        Posição #{res.priorityPosition || 1} na fila de espera
                      </Badge>
                    )}
                  </div>

                  <Link
                    to={`/books/${res.bookId}`}
                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-1 transition-colors"
                  >
                    {res.bookTitle}
                  </Link>

                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {res.bookAuthors.join(', ')}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Solicitado em: {formatDateBR(res.reservedAt)}
                  </p>

                  {isNotified && (
                    <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                      🎉 O exemplar foi devolvido ao acervo! Compareça ao balcão de atendimento em até 48h para formalizar o empréstimo.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelReservation(res.id)}
                  className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar Reserva
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
