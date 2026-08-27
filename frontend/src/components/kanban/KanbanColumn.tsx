import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tarefa, Status } from '../../types';
import { TaskCard } from './TaskCard';

interface ColConfig {
  label: string;
  accent: string;
  dot: string;
  emptyMsg: string;
  emptyIcon: string;
}

const COL_CONFIG: Record<Status, ColConfig> = {
  PENDENTE:     { label: 'Pendente',     accent: 'var(--color-pendente)',  dot: 'var(--color-pendente)',  emptyMsg: 'Nenhuma tarefa pendente',    emptyIcon: '📭' },
  EM_ANDAMENTO: { label: 'Em Andamento', accent: 'var(--color-andamento)', dot: 'var(--color-andamento)', emptyMsg: 'Nenhuma tarefa em andamento', emptyIcon: '⚡' },
  AGUARDANDO:   { label: 'Aguardando',   accent: 'var(--color-aguardando)',dot: 'var(--color-aguardando)',emptyMsg: 'Nenhuma tarefa aguardando',   emptyIcon: '⏸️' },
  CONCLUIDA:    { label: 'Concluída',    accent: 'var(--color-concluida)', dot: 'var(--color-concluida)', emptyMsg: 'Nenhuma tarefa concluída (7d)',emptyIcon: '✅' },
};

function SortableCard({ tarefa, variant, onOpen }: { tarefa: Tarefa; variant: 'minhas' | 'criadas'; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tarefa.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard tarefa={tarefa} variant={variant} onClick={onOpen} isDragging={isDragging} />
    </div>
  );
}

interface Props {
  status: Status;
  tarefas: Tarefa[];
  variant: 'minhas' | 'criadas';
  onCardClick: (t: Tarefa) => void;
}

export function KanbanColumn({ status, tarefas, variant, onCardClick }: Props) {
  const cfg = COL_CONFIG[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
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
          ref={setNodeRef}
          className="kanban-col-body"
          style={isOver ? { background: 'var(--color-primary-light)' } : undefined}
        >
          {tarefas.length === 0 ? (
            <div className="kanban-empty">
              <div className="empty-icon">{cfg.emptyIcon}</div>
              <p>{cfg.emptyMsg}</p>
            </div>
          ) : (
            tarefas.map(t => (
              <SortableCard key={t.id} tarefa={t} variant={variant} onOpen={() => onCardClick(t)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
