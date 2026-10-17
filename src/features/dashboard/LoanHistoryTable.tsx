import React from 'react';
import { Loan } from '@/types';
import { formatDateBR } from '@/utils/dates';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoanHistoryTableProps {
  loans: Loan[];
}

export const LoanHistoryTable: React.FC<LoanHistoryTableProps> = ({ loans }) => {
  if (loans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <History className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Nenhum histórico de devolução registrado
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Assim que você realizar a devolução de exemplares emprestados, os registros acadêmicos ficarão arquivados aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Exemplar</th>
              <th className="py-3.5 px-4">Data Empréstimo</th>
              <th className="py-3.5 px-4">Data Devolução</th>
              <th className="py-3.5 px-4">Renovações</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={loan.bookThumbnail || '/placeholder-cover.svg'}
                      alt={loan.bookTitle}
                      className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0 bg-slate-100"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/books/${loan.bookId}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-1 transition-colors"
                      >
                        {loan.bookTitle}
                      </Link>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {loan.bookAuthors.join(', ')}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {formatDateBR(loan.borrowedAt)}
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                  {formatDateBR(loan.returnedAt)}
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {loan.renewalCount}x
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    Devolvido
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
