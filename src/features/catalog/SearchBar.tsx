import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar por título, autor, ISBN ou palavra-chave...',
  debounceMs = 350,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value if prop changes externally
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce notification to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full">
      <label htmlFor="catalog-search-input" className="sr-only">
        Buscar obras no acervo por título, autor, ISBN ou palavra-chave
      </label>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400" aria-hidden="true">
        <Search className="h-5 w-5" />
      </div>
      <input
        id="catalog-search-input"
        type="search"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 transition-all"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar termo de busca"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
