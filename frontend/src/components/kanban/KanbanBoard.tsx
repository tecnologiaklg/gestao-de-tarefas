import { useState } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners, DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Tarefa, Status } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { tarefaService } from '../../services/tarefaService';
import { WaitingReasonModal } from '../modals/WaitingReasonModal';

const STATUSES: Status[] = ['PENDENTE', 'EM_ANDAMENTO', 'AGUARDANDO', 'CONCLUIDA'];

const ALLOWED: Record<Status, Status[]> = {
  PENDENTE:     ['EM_ANDAMENTO', 'AGUARDANDO'],
  EM_ANDAMENTO: ['AGUARDANDO',   'CONCLUIDA'],
  AGUARDANDO:   ['EM_ANDAMENTO', 'CONCLUIDA'],
  CONCLUIDA:    [],
};

interface Props {
  tarefas: Tarefa[];
  setTarefas: (t: Tarefa[]) => void;
  variant: 'minhas' | 'criadas';
  onCardClick: (t: Tarefa) => void;
  isResponsavel: boolean; // só responsável pode mover
}

export function KanbanBoard({ tarefas, setTarefas, variant, onCardClick, isResponsavel }: Props) {
  const [activeId, setActiveId]           = useState<number | null>(null);
  const [waitingModal, setWaitingModal]   = useState<{ tarefaId: number; targetStatus: Status } | null>(null);
  const [pendingDrop, setPendingDrop]     = useState<{ tarefaId: number; from: Status; to: Status } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const byStatus = (s: Status) => tarefas.filter(t => t.status === s);
  const active   = tarefas.find(t => t.id === activeId);

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(active.id as number);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || !isResponsavel) return;

    const tarefa    = tarefas.find(t => t.id === active.id)!;
    const newStatus = over.id as Status;

    if (!STATUSES.includes(newStatus) || newStatus === tarefa.status) return;
    if (!ALLOWED[tarefa.status]?.includes(newStatus)) return;

    if (newStatus === 'AGUARDANDO') {
      setPendingDrop({ tarefaId: tarefa.id, from: tarefa.status, to: newStatus });
      setWaitingModal({ tarefaId: tarefa.id, targetStatus: newStatus });
      return;
    }

    await applyStatusChange(tarefa.id, tarefa.status, newStatus);
  };

  const applyStatusChange = async (id: number, from: Status, to: Status, motivo?: string) => {
    // Optimistic update
    setTarefas(tarefas.map(t => t.id === id ? { ...t, status: to } : t));
    try {
      await tarefaService.alterarStatus(id, to, motivo);
    } catch {
      // Reverte em caso de erro
      setTarefas(tarefas.map(t => t.id === id ? { ...t, status: from } : t));
      alert('Não foi possível alterar o status. Verifique as permissões.');
    }
  };

  const handleWaitingConfirm = async (motivo: string) => {
    if (!pendingDrop) return;
    setWaitingModal(null);
    await applyStatusChange(pendingDrop.tarefaId, pendingDrop.from, pendingDrop.to, motivo);
    setPendingDrop(null);
  };

  const handleWaitingCancel = () => {
    setWaitingModal(null);
    setPendingDrop(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {STATUSES.map(s => (
            <KanbanColumn
              key={s}
              status={s}
              tarefas={byStatus(s)}
              variant={variant}
              onCardClick={onCardClick}
            />
          ))}
        </div>
        <DragOverlay>
          {active && <TaskCard tarefa={active} variant={variant} onClick={() => {}} isDragging />}
        </DragOverlay>
      </DndContext>

      {waitingModal && (
        <WaitingReasonModal
          onConfirm={handleWaitingConfirm}
          onCancel={handleWaitingCancel}
        />
      )}
    </>
  );
}
