import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { KpiCards } from '../components/kpi/KpiCards';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskSidebar } from '../components/sidebar/TaskSidebar';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { CustomSelect } from '../components/ui/CustomSelect';
import { DatePicker } from '../components/ui/DatePicker';
import { useTarefas } from '../hooks/useTarefas';
import { useKpis } from '../hooks/useKpis';
import { useAuth } from '../contexts/AuthContext';
import { Tarefa } from '../types';

type Perspectiva = 'minhas_tarefas' | 'criadas_por_mim';

const PERSPECTIVAS: { value: Perspectiva; label: string }[] = [
  { value: 'minhas_tarefas',  label: 'Minhas tarefas' },
  { value: 'criadas_por_mim', label: 'Criadas por mim' },
];

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function TarefasPage() {
  const { user } = useAuth();
  const [perspectiva, setPerspectiva] = useState<Perspectiva>('minhas_tarefas');
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
    // Minhas tarefas → tudo que está atribuído a mim (eu sou o responsável, inclusive tarefas próprias)
    if (perspectiva === 'minhas_tarefas')  return t.responsavel_id === uid;
    // Criadas por mim → tudo que eu criei (para mim ou para outros)
    if (perspectiva === 'criadas_por_mim') return t.criador_id === uid;
    return true;
  });

  const countByPersp: Record<Perspectiva, number> = {
    minhas_tarefas:  tarefas.filter(t => t.responsavel_id === user?.id).length,
    criadas_por_mim: tarefas.filter(t => t.criador_id === user?.id).length,
  };

  // Define perspectiva de cada tarefa para coloração
  const getPerspectiva = (t: Tarefa): 'para_mim' | 'eu_para_mim' | 'eu_para_outros' => {
    const uid = user?.id;
    if (t.criador_id === uid && t.responsavel_id === uid) return 'eu_para_mim';
    if (t.criador_id === uid) return 'eu_para_outros';
    return 'para_mim';
  };

  const isResponsavel = true;
  const hasFilters = Boolean(search || prioridade || prazo);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tarefas</h1>
          <p className="page-subtitle">Visão geral de suas tarefas e atribuições</p>
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
            {!loading && (
              <span className="perspectiva-count">{countByPersp[p.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Barra de busca/filtros moderna */}
      <div className="filter-bar">
        <div className="filter-search">
          <span className="search-icon"><SearchIcon /></span>
          <input
            id="filter-search"
            type="text"
            placeholder="Buscar por título…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="filter-divider" />

        {/* Prioridade — CustomSelect */}
        <div className="filter-control-wrap filter-select-wrap" data-active={prioridade ? 'true' : 'false'}>
          <CustomSelect
            id="filter-prioridade"
            value={prioridade}
            onChange={setPrioridade}
            options={[
              { value: '', label: 'Todas prioridades' },
              { value: 'BAIXA', label: '🟢 Baixa' },
              { value: 'NORMAL', label: '🔵 Normal' },
              { value: 'URGENTE', label: '🔴 Urgente' },
            ]}
          />
        </div>

        {/* Data — DatePicker customizado */}
        <div className="filter-control-wrap filter-date-wrap" data-active={prazo ? 'true' : 'false'}>
          <DatePicker
            id="filter-prazo"
            value={prazo}
            onChange={setPrazo}
            placeholder="Filtrar por prazo"
          />
        </div>

        {hasFilters && (
          <>
            <div className="filter-divider" />
            <button
              className="filter-clear-btn"
              onClick={() => { setSearch(''); setPrioridade(''); setPrazo(''); }}
              title="Limpar todos os filtros"
            >
              <IconClose />
              <span>Limpar</span>
            </button>
          </>
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
