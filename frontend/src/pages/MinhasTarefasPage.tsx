import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { KpiCards } from '../components/kpi/KpiCards';
import { FilterBar } from '../components/filters/FilterBar';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskSidebar } from '../components/sidebar/TaskSidebar';
import { useTarefas } from '../hooks/useTarefas';
import { useKpis } from '../hooks/useKpis';
import { useAuth } from '../contexts/AuthContext';
import { Tarefa } from '../types';

export function MinhasTarefasPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: '', prioridade: '', prazo: '' });
  const [selected, setSelected] = useState<Tarefa | null>(null);

  const params: Record<string, string> = {};
  if (filters.search)     params.search     = filters.search;
  if (filters.prioridade) params.prioridade = filters.prioridade;
  if (filters.prazo)      params.prazo      = filters.prazo;

  const { tarefas, setTarefas, loading } = useTarefas('minhas', params);
  const { kpis, loading: kpiLoading }    = useKpis('usuario');

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Minhas Tarefas</h1>
          <p className="page-subtitle">Tarefas atribuídas a você</p>
        </div>
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
          variant="minhas"
          onCardClick={setSelected}
          isResponsavel={true}
        />
      )}

      {selected && (
        <TaskSidebar
          tarefa={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </AppLayout>
  );
}
