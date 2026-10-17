import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Lazy loaded routes for optimal bundle chunking and performance
const CatalogPage = lazy(() =>
  import('@/features/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage }))
);
const BookDetailsPage = lazy(() =>
  import('@/features/book-details/BookDetailsPage').then((m) => ({ default: m.BookDetailsPage }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const SlidesPage = lazy(() =>
  import('@/features/slides/SlidesPage').then((m) => ({ default: m.SlidesPage }))
);

const PageLoader: React.FC = () => (
  <div className="py-20 flex flex-col items-center justify-center space-y-4">
    <div className="relative flex h-12 w-12 items-center justify-center">
      <div className="absolute h-12 w-12 animate-ping rounded-full bg-indigo-400 opacity-20" />
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
    <p className="text-xs font-semibold text-slate-500 animate-pulse">
      Carregando sistema bibliotecário...
    </p>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="max-w-md mx-auto py-20 text-center animate-fade-in">
    <BookOpen className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
      Página Não Encontrada (404)
    </h2>
    <p className="mt-2 text-xs text-slate-500">
      O endereço acessado não existe ou foi remanejado no acervo universitário.
    </p>
    <div className="mt-6">
      <Link to="/">
        <Button variant="primary" size="md">
          Retornar ao Catálogo
        </Button>
      </Link>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="books/:id" element={<BookDetailsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="slides" element={<SlidesPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
