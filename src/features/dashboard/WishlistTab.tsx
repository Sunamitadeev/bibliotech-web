import React from 'react';
import { UserBookStatus } from '@/types';
import { useLibraryStore } from '@/store/useLibraryStore';
import { storageService } from '@/services/storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WishlistTabProps {
  items: UserBookStatus[];
  onOpenLoanModal?: (bookId: string) => void;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({ items }) => {
  const { toggleWishlist } = useLibraryStore();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <Heart className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Sua lista de desejos está vazia
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Ao navegar pelo catálogo, clique no ícone de coração para salvar títulos de interesse e receber notificações de disponibilidade física.
        </p>
        <Link to="/" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Explorar Acervo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const inventory = storageService.getBookInventory(item.bookId);
        const isAvailable = inventory.availableCopies > 0;

        return (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex gap-3">
              <img
                src={item.bookThumbnail || '/placeholder-cover.svg'}
                alt={item.bookTitle}
                className="w-14 h-20 object-cover rounded-xl shadow-sm shrink-0 bg-slate-100"
              />
              <div className="min-w-0">
                <div className="mb-1">
                  {isAvailable ? (
                    <Badge variant="success" size="sm">
                      Disponível ({inventory.availableCopies} un.)
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      Todos Emprestados
                    </Badge>
                  )}
                </div>

                <Link
                  to={`/books/${item.bookId}`}
                  className="text-xs font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-2 transition-colors"
                >
                  {item.bookTitle}
                </Link>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {item.bookAuthors.join(', ')}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <Link to={`/books/${item.bookId}`} className="text-xs text-indigo-600 font-semibold hover:underline">
                Ver Detalhes &rarr;
              </Link>

              <button
                onClick={() =>
                  toggleWishlist({
                    id: item.bookId,
                    title: item.bookTitle,
                    thumbnail: item.bookThumbnail,
                    authors: item.bookAuthors,
                  } as any)
                }
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Remover da lista de desejos"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remover</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
