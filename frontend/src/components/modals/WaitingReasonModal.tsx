import { useState } from 'react';
import { Button } from '../ui/Button';

interface Props { onConfirm: (motivo: string) => void; onCancel: () => void; }

export function WaitingReasonModal({ onConfirm, onCancel }: Props) {
  const [motivo, setMotivo] = useState('');

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title">Motivo do Aguardo</span>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--stone-600)' }}>
            Informe o motivo pelo qual esta tarefa está aguardando.
            Sem motivo preenchido, a movimentação será cancelada.
          </p>
          <div className="form-group">
            <label className="form-label">Motivo <span className="required">*</span></label>
            <textarea
              className="form-textarea"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Descreva o motivo..."
              autoFocus
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" disabled={!motivo.trim()} onClick={() => onConfirm(motivo.trim())}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
