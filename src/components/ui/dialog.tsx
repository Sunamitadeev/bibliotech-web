import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore focus when closing modal
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside dialog after render
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // WAI-ARIA Focus Trap on Tab / Shift+Tab
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
        ).filter((el) => el.offsetParent !== null); // ensure visible

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          // Shift + Tab -> if on first, cycle to last
          if (document.activeElement === firstElement || document.activeElement === dialogRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab -> if on last, cycle to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previous element
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const descriptionId = description ? 'dialog-description' : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-slide-up focus:outline-none',
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            {description && (
              <p id={descriptionId} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label="Fechar janela modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
