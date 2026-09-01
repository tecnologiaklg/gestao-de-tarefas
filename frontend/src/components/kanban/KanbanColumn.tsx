import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tarefa, Status } from '../../types';
import { TaskCard } from './TaskCard';

type Perspectiva = 'para_mim' | 'eu_para_mim' | 'eu_para_outros';

interface ColConfig {
  label: string;
  accent: string;
  dot: string;
  emptyMsg: string;
}

const COL_CONFIG: Record<Status, ColConfig> = {
  PENDENTE:     { label: 'Pendente',     accent: 'var(--color-pendente)',   dot: 'var(--color-pendente)',   emptyMsg: 'Nenhuma tarefa pendente' },
  EM_ANDAMENTO: { label: 'Em Andamento', accent: 'var(--color-andamento)',  dot: 'var(--color-andamento)',  emptyMsg: 'Nenhuma tarefa em andamento' },
  AGUARDANDO:   { label: 'Aguardando',   accent: 'var(--color-aguardando)', dot: 'var(--color-aguardando)', emptyMsg: 'Nenhuma tarefa aguardando' },
  CONCLUIDA:    { label: 'Concluída',    accent: 'var(--color-concluida)',  dot: 'var(--color-concluida)',  emptyMsg: 'Nenhuma tarefa concluída recentemente' },
};

function EmptyStateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function SortableCard({ tarefa, perspectiva, onOpen }: {
  tarefa: Tarefa;
  perspectiva?: Perspectiva;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tarefa.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard tarefa={tarefa} perspectiva={perspectiva} onClick={onOpen} isDragging={isDragging} />
    </div>
  );
}

interface Props {
  status: Status;
  tarefas: Tarefa[];
  onCardClick: (t: Tarefa) => void;
  getPerspectiva?: (t: Tarefa) => Perspectiva;
}

export function KanbanColumn({ status, tarefas, onCardClick, getPerspectiva }: Props) {
  const cfg = COL_CONFIG[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="kanban-column"
      style={{ '--col-accent': cfg.accent } as React.CSSProperties}
    >
      <div className="kanban-col-header">
        <div className="kanban-col-title">
          <span className="kanban-col-dot" style={{ background: cfg.dot }} />
          {cfg.label}
        </div>
        <span className="kanban-col-count">{tarefas.length}</span>
      </div>

      <SortableContext items={tarefas.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div
          className="kanban-col-body"
          style={isOver ? { background: 'var(--color-primary-light)' } : undefined}
        >
          {tarefas.length === 0 ? (
            <div className="kanban-empty">
              <div className="empty-icon"><EmptyStateIcon /></div>
              <p>{cfg.emptyMsg}</p>
            </div>
          ) : (
            tarefas.map(t => (
              <SortableCard
                key={t.id}
                tarefa={t}
                perspectiva={getPerspectiva?.(t)}
                onOpen={() => onCardClick(t)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
