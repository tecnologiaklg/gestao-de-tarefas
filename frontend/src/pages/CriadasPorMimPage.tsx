import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { KpiCards } from '../components/kpi/KpiCards';
import { FilterBar } from '../components/filters/FilterBar';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskSidebar } from '../components/sidebar/TaskSidebar';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { useTarefas } from '../hooks/useTarefas';
import { useKpis } from '../hooks/useKpis';
import { Tarefa } from '../types';

export function CriadasPorMimPage() {
  const [filters, setFilters]     = useState({ search: '', prioridade: '', prazo: '' });
  const [selected, setSelected]   = useState<Tarefa | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const params: Record<string, string> = {};
  if (filters.search)     params.search     = filters.search;
  if (filters.prioridade) params.prioridade = filters.prioridade;
  if (filters.prazo)      params.prazo      = filters.prazo;

  const { tarefas, setTarefas, loading, refetch } = useTarefas('criadas', params);
  const { kpis, loading: kpiLoading } = useKpis('usuario');

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Criadas por Mim</h1>
          <p className="page-subtitle">Tarefas que você criou para outros</p>
        </div>
        {/* Botão NOVA TAREFA — apenas nesta tela */}
        <Button id="btn-nova-tarefa" variant="primary" onClick={() => setShowCreate(true)}>
          ＋ Nova Tarefa
        </Button>
      </div>

      <KpiCards kpis={kpis} loading={kpiLoading} />
      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--slate-400)' }}>
          Carregando tarefas…
        </div>
      ) : (
        <KanbanBoard
          tarefas={tarefas}
          setTarefas={setTarefas}
          variant="criadas"
          onCardClick={setSelected}
          isResponsavel={false} // criador não pode mover
        />
      )}

      {selected && <TaskSidebar tarefa={selected} onClose={() => setSelected(null)} />}
      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={refetch} />}
    </AppLayout>
  );
}
