import { Button } from '../ui/Button';

interface Props {
  targetStatus: 'EM_ANDAMENTO' | 'CONCLUIDA';
  tarefaTitulo: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIG = {
  EM_ANDAMENTO: {
    emoji: '🚀',
    label: 'Em Andamento',
    msg: 'Confirma que esta tarefa foi iniciada e está sendo trabalhada?',
    btnLabel: 'Sim, iniciar',
    color: 'var(--color-andamento)',
  },
  CONCLUIDA: {
    emoji: '✅',
    label: 'Concluída',
    msg: 'Confirma que esta tarefa foi concluída? Essa ação não pode ser desfeita.',
    btnLabel: 'Sim, concluir',
    color: 'var(--color-concluida)',
  },
};

export function ConfirmStatusModal({ targetStatus, tarefaTitulo, onConfirm, onCancel }: Props) {
  const cfg = CONFIG[targetStatus];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title">
            {cfg.emoji} Mover para {cfg.label}
          </span>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--stone-600)', marginBottom: 12 }}>
            {cfg.msg}
          </p>
          <p style={{
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            color: 'var(--stone-800)',
            background: 'var(--stone-50)',
            border: '1px solid var(--stone-200)',
            borderLeft: `3px solid ${cfg.color}`,
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
          }}>
            {tarefaTitulo}
          </p>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" onClick={onConfirm}>{cfg.btnLabel}</Button>
        </div>
      </div>
    </div>
  );
}
