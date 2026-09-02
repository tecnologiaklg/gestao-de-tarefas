import { Button } from '../ui/Button';

interface Props { onClose: () => void; }

export function PriorityHelpModal({ onClose }: Props) {
  const PRIORIDADES = [
    {
      prio: 'Baixa',
      color: 'var(--color-baixa)',
      bg: 'var(--color-success-bg)',
      border: 'var(--color-success-border)',
      quando: 'Pode aguardar sem gerar atrasos ou prejuízos na operação.',
      exemplos: 'Organizar arquivos e cadastros, pequenos ajustes visuais, tarefas de melhoria sem prazo definido.',
    },
    {
      prio: 'Normal',
      color: 'var(--color-normal)',
      bg: 'var(--color-info-bg)',
      border: 'var(--color-info-border)',
      quando: 'Atividades rotineiras com prazos regulares do fluxo de trabalho.',
      exemplos: 'Relatórios periódicos, cotações e follow-up com fornecedores, conferência de documentos, agendamentos de rotina.',
    },
    {
      prio: 'Urgente',
      color: 'var(--color-urgente)',
      bg: 'var(--color-danger-bg)',
      border: 'var(--color-danger-border)',
      quando: 'Bloqueios que travam outros colaboradores ou prazo para o mesmo dia.',
      exemplos: 'Sistema fora do ar, cliente ou entrega parada aguardando resposta, pendência que trava o time no mesmo dia.',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 300 }}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ padding: '12px 18px' }}>
          <span className="modal-title" style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>
            Guia Rápido de Prioridades
          </span>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ padding: '12px 18px', gap: '8px' }}>
          {PRIORIDADES.map(({ prio, color, bg, border, quando, exemplos }) => (
            <div
              key={prio}
              style={{
                padding: '8px 12px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--stone-200)',
                borderLeft: `3px solid ${color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--font-xs)', color }}>
                  {prio}
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-xs)',
                  background: bg,
                  color: color,
                  border: `1px solid ${border}`
                }}>
                  {prio}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--stone-700)', lineHeight: 1.35 }}>
                <strong>Quando usar:</strong> {quando}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--stone-500)', lineHeight: 1.35 }}>
                <strong style={{ color: 'var(--stone-600)' }}>Exemplos:</strong> {exemplos}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ padding: '8px 18px' }}>
          <Button size="sm" variant="primary" onClick={onClose}>Entendido</Button>
        </div>
      </div>
    </div>
  );
}
