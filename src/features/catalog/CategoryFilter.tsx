import React from 'react';
import { BOOK_CATEGORIES, BookCategory } from '@/types';
import { Laptop, Atom, BookOpen, Clock, Lightbulb, Briefcase, Layers } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: BookCategory;
  onSelectCategory: (category: BookCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const getIcon = (id: BookCategory) => {
    switch (id) {
      case 'Computers':
        return Laptop;
      case 'Science':
        return Atom;
      case 'Fiction':
        return BookOpen;
      case 'History':
        return Clock;
      case 'Philosophy':
        return Lightbulb;
      case 'Business':
        return Briefcase;
      default:
        return Layers;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filtro por categorias">
      {BOOK_CATEGORIES.map((cat) => {
        const Icon = getIcon(cat.id);
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectCategory(cat.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/25'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
