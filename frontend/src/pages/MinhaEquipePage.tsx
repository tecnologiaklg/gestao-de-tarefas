import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { KpiCards } from '../components/kpi/KpiCards';
import { FilterBar } from '../components/filters/FilterBar';
import { TaskSidebar } from '../components/sidebar/TaskSidebar';
import { Badge } from '../components/ui/Badge';
import { useTarefas } from '../hooks/useTarefas';
import { useKpis } from '../hooks/useKpis';
import { Tarefa } from '../types';

function formatDT(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function MinhaEquipePage() {
  const [filters, setFilters]   = useState({ search: '', prioridade: '', prazo: '' });
  const [selected, setSelected] = useState<Tarefa | null>(null);

  const params: Record<string, string> = {};
  if (filters.search)     params.search     = filters.search;
  if (filters.prioridade) params.prioridade = filters.prioridade;
  if (filters.prazo)      params.prazo      = filters.prazo;

  const { tarefas, loading } = useTarefas('equipe', params);
  const { kpis, loading: kpiLoading } = useKpis('equipe');

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Minha Equipe</h1>
          <p className="page-subtitle">Tarefas dos funcionários do seu setor</p>
        </div>
      </div>

      <KpiCards kpis={kpis} loading={kpiLoading} />
      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--slate-400)' }}>
          Carregando tarefas da equipe…
        </div>
      ) : (
        <>
          {/* Header da lista */}
          <div className="equipe-header">
            <span>Prioridade</span>
            <span>Tarefa</span>
            <span>Criador</span>
            <span>Responsável</span>
            <span>Status</span>
            <span>Prazo</span>
          </div>

          <div className="equipe-list">
            {tarefas.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--slate-400)' }}>
                Nenhuma tarefa encontrada para sua equipe.
              </div>
            )}
            {tarefas.map(t => (
              <div key={t.id} className="equipe-row" onClick={() => setSelected(t)}>
                <Badge type="prioridade" value={t.prioridade} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--slate-800)' }}>{t.titulo}</div>
                  {t.atrasada && <Badge type="atrasada" value={true} />}
                </div>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--slate-600)' }}>{t.criador_nome}</span>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--slate-600)' }}>{t.responsavel_nome}</span>
                <Badge type="status" value={t.status} />
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)' }}>{formatDT(t.prazo)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && <TaskSidebar tarefa={selected} onClose={() => setSelected(null)} />}
    </AppLayout>
  );
}
