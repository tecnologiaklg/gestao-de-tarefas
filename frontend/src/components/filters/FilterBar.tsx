
import { DatePicker } from '../ui/DatePicker';

interface Filters { search: string; prioridade: string; prazo: string; }
interface Props { filters: Filters; onChange: (f: Filters) => void; }

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconFlag() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function FilterBar({ filters, onChange }: Props) {
  const hasFilters = Boolean(filters.search || filters.prioridade || filters.prazo);

  return (
    <div className="filter-bar">
      {/* Busca */}
      <div className="filter-search">
        <span className="search-icon"><SearchIcon /></span>
        <input
          id="filter-search"
          type="text"
          placeholder="Buscar tarefa…"
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="filter-divider" />

      {/* Prioridade — select customizado inline */}
      <div className="filter-control-wrap filter-select-wrap" data-active={filters.prioridade ? 'true' : 'false'}>
        <span className="filter-control-icon"><IconFlag /></span>
        <select
          id="filter-prioridade"
          className="filter-select"
          value={filters.prioridade}
          onChange={e => onChange({ ...filters, prioridade: e.target.value })}
        >
          <option value="">Todas prioridades</option>
          <option value="BAIXA">🟢 Baixa</option>
          <option value="NORMAL">🔵 Normal</option>
          <option value="URGENTE">🔴 Urgente</option>
        </select>
        <span className="filter-select-chevron"><IconChevron /></span>
      </div>

      {/* Data */}
      <div className="filter-control-wrap filter-date-wrap" data-active={filters.prazo ? 'true' : 'false'} style={{ minWidth: 176 }}>
        <DatePicker
          id="filter-prazo"
          value={filters.prazo}
          onChange={v => onChange({ ...filters, prazo: v })}
          placeholder="Filtrar por prazo"
        />
      </div>

      {hasFilters && (
        <>
          <div className="filter-divider" />
          <button
            className="filter-clear-btn"
            onClick={() => onChange({ search: '', prioridade: '', prazo: '' })}
            title="Limpar filtros"
          >
            <IconClose />
            <span>Limpar</span>
          </button>
        </>
      )}
    </div>
  );
}
