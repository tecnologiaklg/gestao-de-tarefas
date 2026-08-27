import { Button } from '../ui/Button';

interface Props { onClose: () => void; }

export function PriorityHelpModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📖 Manual de Prioridade</span>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {[
            { prio: 'Baixa', color: 'var(--color-baixa)', quando: 'Pode esperar sem prejuízo ou atraso',
              exemplos: 'Organizar arquivos, ajuste visual, tarefa sem data crítica' },
            { prio: 'Normal', color: 'var(--color-normal)', quando: 'Fluxo normal, sem interrupção',
              exemplos: 'Relatório da semana, cotação com prazo de dias' },
            { prio: 'Urgente', color: 'var(--color-urgente)', quando: 'Prazo imediato, bloqueio ou risco real',
              exemplos: 'Sistema parado, documento vencendo hoje' },
          ].map(({ prio, color, quando, exemplos }) => (
            <div key={prio} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', padding: 'var(--space-3)', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${color}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color, marginBottom: 4 }}>{prio}</div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--slate-700)', marginBottom: 4 }}><strong>Quando usar:</strong> {quando}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)' }}><strong>Exemplos:</strong> {exemplos}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <Button variant="primary" onClick={onClose}>Entendido</Button>
        </div>
      </div>
    </div>
  );
}
