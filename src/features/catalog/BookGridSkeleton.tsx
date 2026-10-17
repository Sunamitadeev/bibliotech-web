import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface BookGridSkeletonProps {
  count?: number;
}

export const BookGridSkeleton: React.FC<BookGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Cover skeleton */}
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />

          {/* Metadata skeleton */}
          <div className="pt-4 space-y-2.5">
            <Skeleton className="h-3 w-1/3 rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
            <div className="pt-2 flex justify-between">
              <Skeleton className="h-3 w-1/4 rounded" />
              <Skeleton className="h-3 w-1/6 rounded" />
            </div>
            <div className="pt-3 grid grid-cols-2 gap-2">
              <Skeleton className="h-8 rounded-lg" />
              <Skeleton className="h-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
