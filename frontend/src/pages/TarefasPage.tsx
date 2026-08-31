import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { KpiCards } from '../components/kpi/KpiCards';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskSidebar } from '../components/sidebar/TaskSidebar';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { useTarefas } from '../hooks/useTarefas';
import { useKpis } from '../hooks/useKpis';
import { useAuth } from '../contexts/AuthContext';
import { Tarefa } from '../types';

type Perspectiva = 'todas' | 'para_mim' | 'criadas_por_mim';

const PERSPECTIVAS: { value: Perspectiva; label: string }[] = [
  { value: 'todas',          label: 'Todas' },
  { value: 'para_mim',       label: 'Para mim' },
  { value: 'criadas_por_mim',label: 'Criadas por mim' },
];

const PRIORIDADES = ['', 'BAIXA', 'NORMAL', 'URGENTE'] as const;

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function TarefasPage() {
  const { user } = useAuth();
  const [perspectiva, setPerspectiva] = useState<Perspectiva>('todas');
  const [search, setSearch]           = useState('');
  const [prioridade, setPrioridade]   = useState('');
  const [prazo, setPrazo]             = useState('');
  const [selected, setSelected]       = useState<Tarefa | null>(null);
  const [showCreate, setShowCreate]   = useState(false);

  const params: Record<string, string> = {};
  if (search)     params.search     = search;
  if (prioridade) params.prioridade = prioridade;
  if (prazo)      params.prazo      = prazo;

  const { tarefas, setTarefas, loading, refetch } = useTarefas('todas', params);
  const { kpis, loading: kpiLoading }             = useKpis('usuario');

  // Filtra por perspectiva no client
  const tarefasFiltradas = tarefas.filter(t => {
    const uid = user?.id;
    // Para mim → outros criaram pra mim (eu sou responsável mas não criador)
    if (perspectiva === 'para_mim')        return t.responsavel_id === uid && t.criador_id !== uid;
    // Criadas por mim → eu criei (pra mim mesmo OU pra outros — juntos)
    if (perspectiva === 'criadas_por_mim') return t.criador_id === uid;
    return true; // 'todas'
  });

  // Define perspectiva de cada tarefa para coloração
  const getPerspectiva = (t: Tarefa): 'para_mim' | 'eu_para_mim' | 'eu_para_outros' => {
    const uid = user?.id;
    if (t.criador_id === uid && t.responsavel_id === uid) return 'eu_para_mim';
    if (t.criador_id === uid) return 'eu_para_outros';
    return 'para_mim';
  };

  // Pode mover status apenas quando é o responsável pela tarefa
  const isResponsavel = perspectiva !== 'criadas_por_mim';
  const hasFilters = search || prioridade || prazo;

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tarefas</h1>
          <p className="page-subtitle">Visão geral de todas as suas tarefas</p>
        </div>
        <Button id="btn-nova-tarefa" variant="primary" onClick={() => setShowCreate(true)}>
          + Nova Tarefa
        </Button>
      </div>

      <KpiCards kpis={kpis} loading={kpiLoading} />

      {/* Filtros de perspectiva */}
      <div className="perspectiva-tabs">
        {PERSPECTIVAS.map(p => (
          <button
            key={p.value}
            className={`perspectiva-tab${perspectiva === p.value ? ' active' : ''}`}
            onClick={() => setPerspectiva(p.value)}
          >
            {p.label}
            {perspectiva === p.value && tarefas.length > 0 && (
              <span className="perspectiva-count">{tarefasFiltradas.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Barra de busca/filtros */}
      <div className="filter-bar">
        <div className="filter-search">
          <span className="search-icon"><SearchIcon /></span>
          <input
            id="filter-search"
            type="text"
            placeholder="Buscar tarefa…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <select id="filter-prioridade" className="filter-select" value={prioridade} onChange={e => setPrioridade(e.target.value)}>
          <option value="">Todas as prioridades</option>
          <option value="BAIXA">Baixa</option>
          <option value="NORMAL">Normal</option>
          <option value="URGENTE">Urgente</option>
        </select>
        <input
          id="filter-prazo"
          type="date"
          className="filter-select"
          value={prazo}
          onChange={e => setPrazo(e.target.value)}
        />
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setPrioridade(''); setPrazo(''); }}>
            Limpar filtros
          </button>
        )}
      </div>

      {/* Legenda de cores */}
      <div className="perspectiva-legend">
        <span className="legend-item legend-para-mim">Recebida (De outros)</span>
        <span className="legend-item legend-eu-para-mim">Minha Tarefa (Pessoal)</span>
        <span className="legend-item legend-eu-para-outros">Delegada (Para outros)</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--stone-400)' }}>
          Carregando tarefas…
        </div>
      ) : (
        <KanbanBoard
          tarefas={tarefasFiltradas}
          setTarefas={setTarefas}
          onCardClick={setSelected}
          isResponsavel={isResponsavel}
          getPerspectiva={getPerspectiva}
        />
      )}

      {selected && <TaskSidebar tarefa={selected} onClose={() => setSelected(null)} />}
      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={refetch} />}
    </AppLayout>
  );
}
