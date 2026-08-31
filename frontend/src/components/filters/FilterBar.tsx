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

function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [k]: e.target.value });

  const hasFilters = Boolean(filters.search || filters.prioridade || filters.prazo);

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <span className="search-icon">
          <SearchIcon />
        </span>
        <input
          id="filter-search"
          type="text"
          placeholder="Buscar tarefa…"
          value={filters.search}
          onChange={set('search')}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="filter-divider" />

      {/* Dropdown de Prioridade */}
      <div className="filter-control-wrap" data-active={filters.prioridade ? 'true' : 'false'}>
        <span className="filter-control-icon"><IconFlag /></span>
        <select
          id="filter-prioridade"
          className="filter-select"
          value={filters.prioridade}
          onChange={set('prioridade')}
        >
          <option value="">Todas prioridades</option>
          <option value="BAIXA">Baixa</option>
          <option value="NORMAL">Normal</option>
          <option value="URGENTE">Urgente</option>
        </select>
      </div>

      {/* Campo de Data */}
      <div className="filter-control-wrap" data-active={filters.prazo ? 'true' : 'false'}>
        <span className="filter-control-icon"><IconCalendar /></span>
        <input
          id="filter-prazo"
          type="date"
          className="filter-date-input"
          value={filters.prazo}
          onChange={set('prazo')}
          title="Filtrar por data limite"
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
