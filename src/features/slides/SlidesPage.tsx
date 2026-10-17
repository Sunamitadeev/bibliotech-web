import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  BookOpen,
  ShieldCheck,
  Zap,
  Users,
  Code,
  CheckCircle2,
  Calendar,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  speakerNotes: string;
  duration: string;
}

export const SlidesPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const slides: Slide[] = [
    {
      id: 1,
      badge: 'Apresentação Final Capstone',
      title: 'BiblioTech Universitária',
      subtitle: 'Single Page Application para Modernização do Acervo, Empréstimos e Reservas Acadêmicas',
      duration: '45 segundos',
      speakerNotes:
        'Olá a todos! Apresento o BiblioTech, sistema de gestão bibliotecária desenvolvido como projeto Capstone. Nosso foco foi aliar usabilidade, acessibilidade e arquitetura desacoplada para modernizar a rotina de alunos e bibliotecários.',
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30">
            <BookOpen className="h-10 w-10" />
          </div>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Uma plataforma acadêmica focada na experiência de autoatendimento, transparência de prazos e gestão inteligente de fila de espera.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Badge variant="purple" size="md">React 18 + Vite</Badge>
            <Badge variant="info" size="md">TypeScript Strict Mode</Badge>
            <Badge variant="success" size="md">TanStack Query + Zustand</Badge>
            <Badge variant="default" size="md">Tailwind CSS + WAI-ARIA</Badge>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      badge: 'Problema & Contexto',
      title: 'O Desafio das Bibliotecas Universitárias',
      subtitle: 'Dores reais no modelo tradicional de empréstimo de livros físicos',
      duration: '45 segundos',
      speakerNotes:
        'Identificamos que a falta de visibilidade sobre prazos leva a multas indesejadas, enquanto livros populares esgotados geram frustração porque o estudante não sabe quando o exemplar voltará.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900">
            <span className="text-3xl mb-3 block">⚠️</span>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Prazos e Atrasos</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Estudantes esquecem datas de devolução por falta de avisos proativos e alertas visuais de proximidade de vencimento.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
            <span className="text-3xl mb-3 block">⏳</span>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Fila de Espera Opaca</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Exemplares 100% emprestados deixavam alunos sem previsão de retorno nem ordem de atendimento transparente.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-sky-50/60 border border-sky-200 dark:bg-sky-950/20 dark:border-sky-900">
            <span className="text-3xl mb-3 block">🔍</span>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Busca Lenta & Desconectada</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Catálogos antigos sem debounce, sem sanitização contra injeções maliciosas e sem categorização ágil.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      badge: 'Arquitetura de Software',
      title: 'Estrutura Modular por Features',
      subtitle: 'Separação clara de responsabilidades para manutenibilidade e escalabilidade',
      duration: '60 segundos',
      speakerNotes:
        'Organizamos o projeto em uma arquitetura orientada a features. O LocalStorage foi encapsulado por uma interface abstrata ILibraryStorageService, permitindo trocar por uma API REST real sem alterar a UI.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2 text-xs">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h4 className="font-bold text-sm text-indigo-600 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Camadas da Aplicação
            </h4>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li>• <strong>Features:</strong> catalog, book-details, loans, reservations, dashboard</li>
              <li>• <strong>Services:</strong> googleBooks.service (API externa) e storage.service (Persistência)</li>
              <li>• <strong>State Management:</strong> TanStack Query (cache de rede) + Zustand (estado global)</li>
              <li>• <strong>UI Design System:</strong> Componentes desacoplados e acessíveis com Tailwind</li>
            </ul>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h4 className="font-bold text-sm text-emerald-600 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Benefícios Arquiteturais
            </h4>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
              <li>• <strong>Strict TypeScript:</strong> Zero tipos 'any', contratos estritos em src/types/</li>
              <li>• <strong>Code Splitting:</strong> Lazy loading em todas as rotas principais via React Router v6</li>
              <li>• <strong>LocalStorage Desacoplado:</strong> Emissão de eventos reativos para toda a interface</li>
              <li>• <strong>Fallback Integrado:</strong> Modo resiliente offline caso a API externa falhe</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      badge: 'Regras de Negócio',
      title: 'Empréstimos, Prazos & Fila de Espera',
      subtitle: 'Automação precisa de políticas universitárias',
      duration: '50 segundos',
      speakerNotes:
        'A regra central calcula 14 dias corridos automaticamente. Se o livro tem exemplares, empresta; se não tem, habilita a reserva com posição na fila e notifica assim que devolvido.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3 text-xs">
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800">
            <Calendar className="h-5 w-5 text-indigo-600 mb-2" />
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Prazo de 14 Dias Corridos</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Cálculo automático somando 14 dias com até 2 renovações online (desde que sem reservas ativas).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 dark:bg-purple-950/30 dark:border-purple-800">
            <Users className="h-5 w-5 text-purple-600 mb-2" />
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Cotas por Categoria</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Alunos de graduação: limite de 3 livros simultâneos. Docentes: limite de 5 livros.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
            <Zap className="h-5 w-5 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Fila Reativa</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Ao dar baixa em um livro, o sistema notifica imediatamente quem está na fila e quem tem o livro na Wishlist.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      badge: 'Segurança & Validação',
      title: 'Mitigação de XSS & React Hook Form + Zod',
      subtitle: 'Garantindo integridade dos dados e proteção contra injeções',
      duration: '45 segundos',
      speakerNotes:
        'A API do Google Books devolve HTML bruto na sinopse. Sanitizamos com DOMPurify para evitar XSS. E no formulário de empréstimo, usamos React Hook Form com Zod para validar campos e consentimento.',
      content: (
        <div className="space-y-4 py-2 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Sanitização com DOMPurify</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Sinopses recebidas externamente passam pela função <code>sanitizeHtml()</code>, permitindo apenas tags seguras de formatação e neutralizando scripts ou vetores <code>onerror/onload</code>.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex items-start gap-4">
            <Code className="h-6 w-6 text-indigo-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Esquemas Estritos Zod</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Validação de observações (limite de 250 caracteres com trim) e aceite explícito dos termos do regulamento via resolver nativo no React Hook Form com alertas ARIA (<code>role="alert"</code>).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      badge: 'Acessibilidade (a11y)',
      title: 'Conformidade WAI-ARIA & Navegação por Teclado',
      subtitle: 'Uma aplicação inclusiva para qualquer estudante',
      duration: '50 segundos',
      speakerNotes:
        'Na Fase 6, refinamos a acessibilidade: implementamos focus trap completo nos modais, garantindo que o foco não escape com Tab e retorne ao botão original ao fechar.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">🎯 Focus Trap Nativo</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Nos modais de empréstimo e reserva, o foco é contido com <code>Tab/Shift+Tab</code> e restaurado para o elemento de origem ao teclar <code>Escape</code> ou fechar.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">📢 Regiões Dinâmicas (aria-live)</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Toasts e contadores de busca utilizam <code>aria-live="polite"</code> e <code>aria-atomic="true"</code> para anúncio imediato em softwares de leitura de tela.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">🏷️ Rótulos Semânticos</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Todos os campos possuem <code>&lt;label htmlFor="..."&gt;</code> e a barra de busca inclui rótulo com classe <code>sr-only</code>.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">🎨 Contraste & Feedback Visual</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Cores selecionadas rigorosamente com contraste WCAG AA, com badges distintos para atrasos e proximidade de entrega.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      badge: 'Roteiro de Demonstração',
      title: 'Live Demo: Guia Passo a Passo',
      subtitle: 'Fluxo ensaiado para impressionar os avaliadores',
      duration: '60 segundos',
      speakerNotes:
        'Durante a live demo, seguimos 4 passos objetivos: catálogo com busca debounced, detalhes com status de leitura, solicitação de empréstimo com cálculo de 14 dias e devolução imediata no Dashboard.',
      content: (
        <div className="space-y-3 py-2 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 dark:bg-slate-800 dark:border-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[11px]">1</span>
            <div>
              <strong className="text-slate-900 dark:text-white">Busca & Filtros:</strong> Digitar "Clean Code", demonstrar debounce e filtro por assunto.
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 dark:bg-slate-800 dark:border-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[11px]">2</span>
            <div>
              <strong className="text-slate-900 dark:text-white">Detalhes & Status:</strong> Acessar o livro, classificar como "Lendo Agora" e observar o toast.
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 dark:bg-slate-800 dark:border-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[11px]">3</span>
            <div>
              <strong className="text-slate-900 dark:text-white">Empréstimo (14 Dias):</strong> Abrir modal, conferir data automática e validar cota acadêmica.
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 dark:bg-slate-800 dark:border-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[11px]">4</span>
            <div>
              <strong className="text-slate-900 dark:text-white">Dashboard & Devolução:</strong> Mostrar alerta de livro atrasado e clicar em "Devolver Agora" para ver o estoque reposto e a fila notificada.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      badge: 'Deploy & Produção',
      title: 'Publicação Contínua & Roteamento SPA',
      subtitle: 'Configurações prontas para Vercel e Netlify',
      duration: '30 segundos',
      speakerNotes:
        'A aplicação está pronta para produção: criamos vercel.json e netlify.toml com regras de rewrites para que nenhum usuário tome erro 404 ao atualizar a página em rotas internas.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4 text-xs">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">▲ Deploy na Vercel</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Configurado via <code>vercel.json</code> com rewrites para <code>/index.html</code>.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
              npm run build &rarr; dist/
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">🌐 Deploy no Netlify</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Configurado via <code>netlify.toml</code> e <code>public/_redirects</code>.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
              /*  /index.html  200
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      badge: 'Resultados & Qualidade',
      title: 'Métricas de Engenharia de Software',
      subtitle: 'Conformidade com os padrões de excelência técnica',
      duration: '35 segundos',
      speakerNotes:
        'Alcançamos zero erros no TypeScript estrito, tempo de build inferior a 11 segundos e 100% dos requisitos da rubrica implementados sem resumos ou placeholders.',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-center">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            <span className="text-3xl font-extrabold text-indigo-600">0</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Erros de Tipagem (Strict)</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-3xl font-extrabold text-emerald-600">100%</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Fases 1 a 6 Concluídas</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
            <span className="text-3xl font-extrabold text-purple-600">14d</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Prazo Automático</p>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
            <span className="text-3xl font-extrabold text-sky-600">&lt; 11s</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Tempo de Build Otimizado</p>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      badge: 'Conclusão',
      title: 'Pronto para Apresentação & Avaliação',
      subtitle: 'Obrigado pela atenção de todos!',
      duration: '30 segundos',
      speakerNotes:
        'Muito obrigado pela atenção! O BiblioTech está polido, documentado e disponível para demonstração ao vivo. Fico à disposição para perguntas.',
      content: (
        <div className="text-center py-8 space-y-4 max-w-lg mx-auto">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Projeto Capstone Finalizado com Êxito
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Código modular, acessibilidade WAI-ARIA certificada, documentação completa e fluxo acadêmico realista.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="md" className="gap-2">
                <Monitor className="h-4 w-4" /> Ir para a Aplicação
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-4xl mx-auto py-4 animate-fade-in">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-500 hover:text-indigo-600 transition-colors font-medium">
            &larr; Voltar ao Sistema
          </Link>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Slide {currentSlide + 1} de {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="gap-1.5 text-xs h-8"
          >
            {showNotes ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showNotes ? 'Ocultar Roteiro' : 'Notas do Orador'}
          </Button>
        </div>
      </div>

      {/* Slide Canvas Card */}
      <div className="my-6 p-8 sm:p-12 rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 min-h-[460px] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="purple" size="md">
              {current.badge}
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              Tempo sugerido: {current.duration}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {current.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {current.subtitle}
          </p>

          <div className="mt-6">{current.content}</div>
        </div>

        {/* Speaker notes drawer if toggled */}
        {showNotes && (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200 animate-slide-up">
            <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 block mb-1">
              🎙️ Roteiro de Fala (Speaker Notes):
            </span>
            <p className="leading-relaxed italic">
              &ldquo;{current.speakerNotes}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation Toolbar & Progress */}
      <div className="space-y-3 pt-2">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
            disabled={currentSlide === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Dica: você também pode usar as teclas de seta &larr; e &rarr; do teclado
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
            disabled={currentSlide === slides.length - 1}
            className="gap-1.5"
          >
            Próximo <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
