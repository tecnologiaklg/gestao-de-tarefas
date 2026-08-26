import { KpiData } from '../../types';

interface Props { kpis: KpiData; loading?: boolean; }

const CARDS = [
  { key: 'abertas',      label: 'Abertas',          icon: '📋', accent: 'var(--color-primary)',  bg: 'var(--color-primary-light)' },
  { key: 'atrasadas',    label: 'Atrasadas',         icon: '⚠️', accent: 'var(--color-danger)',   bg: 'var(--color-danger-bg)' },
  { key: 'concluidas7d', label: 'Concluídas (7d)',   icon: '✅', accent: 'var(--color-success)',  bg: 'var(--color-success-bg)' },
  { key: 'emAndamento',  label: 'Em Andamento',      icon: '⚡', accent: 'var(--color-info)',     bg: 'var(--color-info-bg)' },
] as const;

export function KpiCards({ kpis, loading }: Props) {
  return (
    <div className="kpi-grid">
      {CARDS.map(({ key, label, icon, accent, bg }) => (
        <div
          key={key}
          className="kpi-card"
          style={{ '--kpi-accent': accent, '--kpi-bg': bg } as React.CSSProperties}
        >
          <div className="icon-wrap">{icon}</div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{loading ? '—' : kpis[key]}</div>
        </div>
      ))}
    </div>
  );
}
