import { Button } from '../ui/Button';

interface Props { onConfirm: () => void; onCancel: () => void; loading?: boolean; }

export function ConfirmCreateModal({ onConfirm, onCancel, loading }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title">Confirmar Criação</span>
        </div>
        <div className="modal-body">
          <div className="alert alert-warning">
            <span>
              <strong>Atenção:</strong> Após criada, a tarefa <strong>não poderá ser excluída</strong>.
              Certifique-se de que todas as informações estão corretas antes de confirmar.
            </span>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Revisar</Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>Criar Tarefa</Button>
        </div>
      </div>
    </div>
  );
}
