import { KpiData } from '../../types';

interface Props { kpis: KpiData; loading?: boolean; }

function IconAbertas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function IconAtrasadas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconConcluidas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconAndamento() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

const CARDS = [
  { key: 'abertas',      label: 'Abertas',          Icon: IconAbertas,    accent: 'var(--color-primary)',  bg: 'var(--color-primary-light)' },
  { key: 'atrasadas',    label: 'Atrasadas',         Icon: IconAtrasadas,  accent: 'var(--color-danger)',   bg: 'var(--color-danger-bg)' },
  { key: 'concluidas7d', label: 'Concluídas (7d)',   Icon: IconConcluidas, accent: 'var(--color-success)',  bg: 'var(--color-success-bg)' },
  { key: 'emAndamento',  label: 'Em Andamento',      Icon: IconAndamento,  accent: 'var(--color-info)',     bg: 'var(--color-info-bg)' },
] as const;

export function KpiCards({ kpis, loading }: Props) {
  return (
    <div className="kpi-grid">
      {CARDS.map(({ key, label, Icon, accent, bg }) => (
        <div
          key={key}
          className="kpi-card"
          style={{ '--kpi-accent': accent, '--kpi-bg': bg } as React.CSSProperties}
        >
          <div className="kpi-card-header">
            <span className="kpi-label">{label}</span>
            <div className="icon-wrap">
              <Icon />
            </div>
          </div>
          <div className="kpi-value">{loading ? '—' : kpis[key]}</div>
        </div>
      ))}
    </div>
  );
}
