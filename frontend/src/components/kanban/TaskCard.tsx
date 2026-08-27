import { Tarefa } from '../../types';
import { Badge } from '../ui/Badge';

interface Props {
  tarefa: Tarefa;
  variant: 'minhas' | 'criadas';
  onClick: () => void;
  isDragging?: boolean;
}

const prioColor: Record<string, string> = {
  BAIXA:   'var(--color-baixa)',
  NORMAL:  'var(--color-normal)',
  URGENTE: 'var(--color-urgente)',
};

function formatDate(d: string) {
  const date = new Date(d);
  const now   = new Date();
  const isToday  = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' (hoje)';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' · ' +
         date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function IconPerson() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function TaskCard({ tarefa, variant, onClick, isDragging }: Props) {
  const isAtrasada = tarefa.atrasada;

  return (
    <div
      className={`task-card${isDragging ? ' dragging' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Barra de prioridade */}
      <div
        className="task-card-prioridade"
        style={{ background: prioColor[tarefa.prioridade] }}
      />

      <div className="task-card-title">{tarefa.titulo}</div>

      <div className="task-card-meta">
        {variant === 'minhas' ? (
          <div className="task-card-meta-row">
            <IconPerson />
            <span>De: {tarefa.criador_nome}</span>
          </div>
        ) : (
          <div className="task-card-meta-row">
            <IconPerson />
            <span>Para: {tarefa.responsavel_nome}</span>
          </div>
        )}

        <div className="task-card-meta-row">
          <IconBuilding />
          <span>{tarefa.setor_nome}</span>
        </div>

        <div className="task-card-meta-row" style={{ color: isAtrasada ? 'var(--color-danger)' : undefined }}>
          <IconClock />
          <span>{formatDate(tarefa.prazo)}</span>
        </div>
      </div>

      <div className="task-card-badges">
        <Badge type="prioridade" value={tarefa.prioridade} />
        {tarefa.atrasada && <Badge type="atrasada" value={true} />}
      </div>
    </div>
  );
}
