/**
 * Date utility functions for library management system
 * Default loan period: 14 calendar days (dias corridos)
 */

export const LOAN_DURATION_DAYS = 14;

/**
 * Calculates due date adding default loan days
 */
export function calculateDueDate(borrowedAt: string | Date = new Date(), durationDays = LOAN_DURATION_DAYS): string {
  const date = new Date(borrowedAt);
  date.setDate(date.getDate() + durationDays);
  return date.toISOString();
}

/**
 * Formats ISO date string to Brazilian locale format (DD/MM/YYYY)
 */
export function formatDateBR(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Formats ISO date string to Brazilian datetime (DD/MM/YYYY às HH:mm)
 */
export function formatDateTimeBR(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return `${date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} às ${date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return '-';
  }
}

/**
 * Calculates the number of calendar days remaining until due date
 * Positive: days remaining
 * 0: due today
 * Negative: days overdue
 */
export function getDaysRemaining(dueDateIso: string): number {
  const now = new Date();
  // Strip time component to compare full calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const due = new Date(dueDateIso);
  const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  
  const diffTime = dueDateOnly.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks whether a loan is overdue
 */
export function isOverdue(dueDateIso: string): boolean {
  return getDaysRemaining(dueDateIso) < 0;
}

/**
 * Checks whether a loan is due soon (e.g. within 3 days and not yet overdue)
 */
export function isDueSoon(dueDateIso: string, thresholdDays = 3): boolean {
  const remaining = getDaysRemaining(dueDateIso);
  return remaining >= 0 && remaining <= thresholdDays;
}

/**
 * Returns human-readable label and status severity for due dates
 */
export function getDueDateStatus(dueDateIso: string): {
  label: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  daysRemaining: number;
  badgeClass: string;
} {
  const days = getDaysRemaining(dueDateIso);
  
  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      label: `Atrasado há ${absDays} ${absDays === 1 ? 'dia' : 'dias'}`,
      isOverdue: true,
      isDueSoon: false,
      daysRemaining: days,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    };
  }
  
  if (days === 0) {
    return {
      label: 'Vence hoje!',
      isOverdue: false,
      isDueSoon: true,
      daysRemaining: 0,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    };
  }
  
  if (days <= 3) {
    return {
      label: `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`,
      isOverdue: false,
      isDueSoon: true,
      daysRemaining: days,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    };
  }
  
  return {
    label: `Prazo regular (${days} dias)`,
    isOverdue: false,
    isDueSoon: false,
    daysRemaining: days,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
  };
}
