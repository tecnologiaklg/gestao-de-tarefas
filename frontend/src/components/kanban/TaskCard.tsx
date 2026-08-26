import { Tarefa } from '../../types';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  tarefa: Tarefa;
  variant: 'minhas' | 'criadas';
  onClick: () => void;
  isDragging?: boolean;
}

const prioColor: Record<string, string> = {
  BAIXA: 'var(--color-baixa)', NORMAL: 'var(--color-normal)', URGENTE: 'var(--color-urgente)',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function TaskCard({ tarefa, variant, onClick, isDragging }: Props) {
  return (
    <div
      className={`task-card${isDragging ? ' dragging' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Barra lateral de prioridade */}
      <div className="task-card-prioridade" style={{ background: prioColor[tarefa.prioridade] }} />

      <div className="task-card-title">{tarefa.titulo}</div>

      <div className="task-card-meta">
        {variant === 'minhas' ? (
          <div className="task-card-meta-row">
            <span className="icon">👤</span>
            <span>De: {tarefa.criador_nome}</span>
          </div>
        ) : (
          <div className="task-card-meta-row">
            <span className="icon">👤</span>
            <span>Para: {tarefa.responsavel_nome}</span>
          </div>
        )}
        <div className="task-card-meta-row">
          <span className="icon">🏢</span>
          <span>{tarefa.setor_nome}</span>
        </div>
        <div className="task-card-meta-row">
          <span className="icon">⏰</span>
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
