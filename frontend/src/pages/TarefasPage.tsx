import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { KpiCards } from '../components/kpi/KpiCards';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskSidebar } from '../components/sidebar/TaskSidebar';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { Button } from '../components/ui/Button';
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

function IconFlag() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
  const { kpis, loading: kpiLoading, refetch: refetchKpis } = useKpis('usuario');

  // Atualização em tempo real na tela aberta sem necessidade de F5
  useEffect(() => {
    const handleTarefaAlterada = () => {
      refetch();
      refetchKpis();
    };

    window.addEventListener('tarefa_alterada', handleTarefaAlterada);
    return () => window.removeEventListener('tarefa_alterada', handleTarefaAlterada);
  }, [refetch, refetchKpis]);

  const uid = user?.id != null ? Number(user.id) : null;

  // Filtra por perspectiva no client com coerção segura de tipo
  const tarefasFiltradas = tarefas.filter(t => {
    if (uid === null) return true;
    const respId = Number(t.responsavel_id);
    const criadorId = Number(t.criador_id);
    // Minhas tarefas → tudo que está sob minha responsabilidade (recebidas de outros + criadas para mim mesmo)
    if (perspectiva === 'minhas_tarefas')  return respId === uid;
    // Criadas por mim → apenas tarefas delegadas para outras pessoas
    if (perspectiva === 'criadas_por_mim') return criadorId === uid && respId !== uid;
    return true;
  });

  const countByPersp: Record<Perspectiva, number> = {
    minhas_tarefas:  tarefas.filter(t => uid !== null ? Number(t.responsavel_id) === uid : true).length,
    criadas_por_mim: tarefas.filter(t => uid !== null ? (Number(t.criador_id) === uid && Number(t.responsavel_id) !== uid) : true).length,
  };

  // Define perspectiva de cada tarefa para coloração
  const getPerspectiva = (t: Tarefa): 'para_mim' | 'eu_para_mim' | 'eu_para_outros' => {
    if (uid === null) return 'para_mim';
    const respId = Number(t.responsavel_id);
    const criadorId = Number(t.criador_id);
    if (criadorId === uid && respId === uid) return 'eu_para_mim';
    if (criadorId === uid) return 'eu_para_outros';
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

      {/* Barra de busca/filtros */}
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

        {/* Prioridade */}
        <div className="filter-control-wrap" data-active={prioridade ? 'true' : 'false'}>
          <span className="filter-control-icon"><IconFlag /></span>
          <select
            id="filter-prioridade"
            className="filter-select"
            value={prioridade}
            onChange={e => setPrioridade(e.target.value)}
          >
            <option value="">Todas prioridades</option>
            <option value="BAIXA">🟢 Baixa</option>
            <option value="NORMAL">🔵 Normal</option>
            <option value="URGENTE">🔴 Urgente</option>
          </select>
        </div>

        {/* Data / Prazo */}
        <div className="filter-control-wrap" data-active={prazo ? 'true' : 'false'} style={{ minWidth: 176 }}>
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
