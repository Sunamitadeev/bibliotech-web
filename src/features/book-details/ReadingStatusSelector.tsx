import React from 'react';
import { Book, ReadingStatus } from '@/types';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Bookmark, BookOpen, CheckCircle, Heart } from 'lucide-react';

interface ReadingStatusSelectorProps {
  book: Book;
}

export const ReadingStatusSelector: React.FC<ReadingStatusSelectorProps> = ({ book }) => {
  const { getReadingStatusForBook, setReadingStatus } = useLibraryStore();
  const currentStatus = getReadingStatusForBook(book.id);

  const statusConfigs: Array<{
    id: ReadingStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    activeBg: string;
  }> = [
    {
      id: 'WANT_TO_READ',
      label: 'Quero Ler',
      icon: Bookmark,
      color: 'text-indigo-600',
      activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    {
      id: 'READING',
      label: 'Lendo Agora',
      icon: BookOpen,
      color: 'text-sky-600',
      activeBg: 'bg-sky-50 border-sky-400 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    },
    {
      id: 'COMPLETED',
      label: 'Concluído',
      icon: CheckCircle,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      id: 'WISHLIST',
      label: 'Lista de Desejos',
      icon: Heart,
      color: 'text-rose-600',
      activeBg: 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
  ];

  const handleSelect = (status: ReadingStatus) => {
    setReadingStatus(book, status);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Meu Status de Leitura
        </h3>
        {currentStatus && (
          <span className="text-[11px] font-medium text-slate-400">
            Atualizado no perfil
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statusConfigs.map((cfg) => {
          const Icon = cfg.icon;
          const isActive = currentStatus === cfg.id;

          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => handleSelect(cfg.id)}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? `${cfg.activeBg} shadow-sm ring-1 ring-inset ring-indigo-500/20`
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'fill-current' : cfg.color}`} />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
