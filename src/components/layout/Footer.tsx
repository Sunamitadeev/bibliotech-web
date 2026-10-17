import React from 'react';
import { BookOpen, ShieldCheck, Clock, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                BiblioTech Universitária
              </span>
            </div>
            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Plataforma digital integrada de gerenciamento de acervo, catálogo em tempo real, empréstimos com prazo automático de 14 dias corridos e fila de espera inteligente.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-500" /> Seg - Sex: 07h às 22h | Sáb: 08h às 14h
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Regras do Acervo
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>• Prazo padrão: 14 dias corridos</li>
              <li>• Até 2 renovações sem fila de espera</li>
              <li>• Fila de reservas prioritária</li>
              <li>• Notificação imediata de disponibilidade</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Atendimento ao Aluno
            </h4>
            <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-indigo-500" /> biblioteca@universidade.edu.br
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-indigo-500" /> (11) 3456-7890 • Ramal 204
              </p>
              <p className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" /> Terminal Seguro de Autoatendimento
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Sistema de Biblioteca Universitária - Capstone Project.</p>
          <p className="mt-2 sm:mt-0">Desenvolvido com React + Vite + TypeScript + Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};
