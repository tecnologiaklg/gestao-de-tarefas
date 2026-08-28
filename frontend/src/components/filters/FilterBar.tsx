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

export function FilterBar({ filters, onChange }: Props) {
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [k]: e.target.value });

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

      <select id="filter-prioridade" className="filter-select" value={filters.prioridade} onChange={set('prioridade')}>
        <option value="">Todas as prioridades</option>
        <option value="BAIXA">Baixa</option>
        <option value="NORMAL">Normal</option>
        <option value="URGENTE">Urgente</option>
      </select>

      <input
        id="filter-prazo"
        type="date"
        className="filter-select"
        value={filters.prazo}
        onChange={set('prazo')}
        style={{ cursor: 'pointer' }}
      />

      {(filters.search || filters.prioridade || filters.prazo) && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange({ search: '', prioridade: '', prazo: '' })}
          title="Limpar filtros"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
