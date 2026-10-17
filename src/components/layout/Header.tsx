import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Bell, User as UserIcon, LogOut, ChevronDown, Check, Calendar, Library, Presentation } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, availableUsers, switchUser, logout } = useAuthStore();
  const { notifications, markAllAsRead } = useNotificationStore();
  const { activeLoans } = useLibraryStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { to: '/', label: 'Catálogo do Acervo', icon: Library },
    { to: '/dashboard', label: 'Meu Painel', icon: Calendar, badge: activeLoans.length > 0 ? activeLoans.length : undefined },
    { to: '/slides', label: 'Slides do Projeto', icon: Presentation },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Biblio<span className="text-indigo-600">Tech</span>
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  SISTEMA UNIVERSITÁRIO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Biblioteca Central Integrada
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Navegação Principal">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {link.badge !== undefined && (
                    <span className="ml-1 rounded-full bg-indigo-600 text-[10px] text-white px-1.5 py-0.2 font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls & User Switcher */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-button"
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={`Notificações do Sistema ${unreadNotifs > 0 ? `(${unreadNotifs} não lidas)` : ''}`}
              aria-expanded={isNotifOpen}
              aria-haspopup="true"
              aria-controls="notifications-panel"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse" aria-hidden="true">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                id="notifications-panel"
                role="region"
                aria-labelledby="notifications-button"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-slide-up"
                onMouseLeave={() => setIsNotifOpen(false)}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Notificações do Sistema
                  </h4>
                  {unreadNotifs > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                    >
                      Marcar lidas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 mt-2" tabIndex={0} aria-label="Lista de mensagens de notificações">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500">
                      Nenhuma notificação no momento.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Profile Switcher */}
          {user ? (
            <div className="relative">
              <button
                id="user-menu-button"
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Menu do usuário: ${user.name}`}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-controls="user-menu-dropdown"
              >
                <img
                  src={user.avatarUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-8 w-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 truncate max-w-[130px]">
                    {user.studentId}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </button>

              {isUserMenuOpen && (
                <div
                  id="user-menu-dropdown"
                  role="menu"
                  aria-labelledby="user-menu-button"
                  className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-slide-up"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="purple" size="sm">
                        {user.role === 'STUDENT' ? 'Graduação' : 'Docente'}
                      </Badge>
                      <span className="text-[11px] text-slate-500">
                        Limite: {user.maxActiveLoans} livros
                      </span>
                    </div>
                  </div>

                  {/* Switch user selector (mock academic identity switcher) */}
                  <div className="py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Alternar Perfil Acadêmico
                    </p>
                    <div className="space-y-1" role="none">
                      {availableUsers.map((u) => {
                        const isCurrent = u.id === user.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              switchUser(u);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                              isCurrent
                                ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'hover:bg-slate-50 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            <div className="truncate">
                              <p className="font-medium">{u.name}</p>
                              <span className="text-[10px] text-slate-400">{u.studentId} • {u.course}</span>
                            </div>
                            {isCurrent && <Check className="h-4 w-4 text-indigo-600 shrink-0 ml-1" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Encerrar Sessão
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => switchUser(availableUsers[0])}
              className="gap-2"
            >
              <UserIcon className="h-4 w-4" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
