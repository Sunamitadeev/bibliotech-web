import React from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Notificações e avisos do sistema"
      className="fixed bottom-5 right-5 z-50 flex max-w-md w-full flex-col gap-2 pointer-events-none p-4"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
          warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
          info: <Info className="h-5 w-5 text-indigo-500 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white dark:bg-slate-900',
          warning: 'border-amber-200 bg-white dark:bg-slate-900',
          error: 'border-rose-200 bg-white dark:bg-slate-900',
          info: 'border-indigo-200 bg-white dark:bg-slate-900',
        };

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg shadow-slate-900/10 transition-all duration-300 animate-slide-up ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {toast.title}
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {toast.message}
              </p>
              {toast.actionUrl && toast.actionLabel && (
                <div className="mt-2">
                  <Link
                    to={toast.actionUrl}
                    onClick={() => dismissToast(toast.id)}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline underline-offset-2"
                  >
                    {toast.actionLabel} &rarr;
                  </Link>
                </div>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-md transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
