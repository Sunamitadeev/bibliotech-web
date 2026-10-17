import React from 'react';
import { SORT_OPTIONS, SortOption } from '@/types';
import { ArrowUpDown, Check } from 'lucide-react';

interface SortDropdownProps {
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onlyAvailable: boolean;
  onToggleOnlyAvailable: (value: boolean) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  selectedSort,
  onSelectSort,
  onlyAvailable,
  onToggleOnlyAvailable,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Availability Filter Toggle */}
      <button
        type="button"
        onClick={() => onToggleOnlyAvailable(!onlyAvailable)}
        aria-pressed={onlyAvailable}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
          onlyAvailable
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
        }`}
      >
        <span
          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
            onlyAvailable
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
          }`}
        >
          {onlyAvailable && <Check className="h-3 w-3 stroke-[3]" />}
        </span>
        Apenas Disponíveis
      </button>

      {/* Sort Select */}
      <div className="relative inline-flex items-center">
        <div className="absolute left-3 pointer-events-none text-slate-400">
          <ArrowUpDown className="h-3.5 w-3.5" />
        </div>
        <select
          value={selectedSort}
          onChange={(e) => onSelectSort(e.target.value as SortOption)}
          aria-label="Ordenar livros por"
          className="appearance-none pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>
    </div>
  );
};
