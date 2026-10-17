import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { StatCards } from './StatCards';
import { ActiveLoansList } from './ActiveLoansList';
import { LoanHistoryTable } from './LoanHistoryTable';
import { ReservationsList } from './ReservationsList';
import { WishlistTab } from './WishlistTab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, History, Heart, Users, User } from 'lucide-react';

type DashboardTab = 'active' | 'reservations' | 'wishlist' | 'history';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as DashboardTab) || 'active';
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  const { user, availableUsers, switchUser } = useAuthStore();
  const { activeLoans, loanHistory, reservations, readingStatuses } = useLibraryStore();

  const wishlistItems = readingStatuses.filter((s) => s.status === 'WISHLIST');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as DashboardTab;
    if (tabParam && ['active', 'reservations', 'wishlist', 'history'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center animate-fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <User className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Acesso Restrito ao Aluno
        </h2>
        <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto">
          Faça login com seu perfil institucional para gerenciar seus empréstimos ativos, histórico e reservas acadêmicas.
        </p>
        <div className="mt-6">
          <Button
            variant="primary"
            size="md"
            onClick={() => switchUser(availableUsers[0])}
            className="w-full"
          >
            Entrar como {availableUsers[0].name}
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'active', label: 'Empréstimos Ativos', icon: BookOpen, count: activeLoans.length },
    { id: 'reservations', label: 'Minhas Reservas', icon: Users, count: reservations.filter((r) => r.status === 'PENDING' || r.status === 'NOTIFIED').length },
    { id: 'wishlist', label: 'Lista de Desejos', icon: Heart, count: wishlistItems.length },
    { id: 'history', label: 'Histórico de Devoluções', icon: History, count: loanHistory.length },
  ];

  return (
    <div className="space-y-8 animate-fade-in py-2">
      {/* Student Profile Card Header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md dark:border-slate-700"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="purple" size="md">
                  {user.role === 'STUDENT' ? 'Graduação Acadêmica' : 'Corpo Docente'}
                </Badge>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {user.studentId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {user.course} • {user.email}
              </p>
            </div>
          </div>

          {/* Quick status box */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto">
            <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacidade</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {activeLoans.length}/{user.maxActiveLoans}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Prazo Padrão</span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                14 dias
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats */}
      <StatCards
        activeLoans={activeLoans}
        reservations={reservations}
        wishlist={wishlistItems}
      />

      {/* Tabs Navigation */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto pb-px scrollbar-none" aria-label="Abas do Painel">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as DashboardTab)}
                  className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Panels */}
        <div className="transition-all duration-300">
          {activeTab === 'active' && <ActiveLoansList loans={activeLoans} />}
          {activeTab === 'reservations' && <ReservationsList reservations={reservations} />}
          {activeTab === 'wishlist' && <WishlistTab items={wishlistItems} />}
          {activeTab === 'history' && <LoanHistoryTable loans={loanHistory} />}
        </div>
      </section>
    </div>
  );
};
