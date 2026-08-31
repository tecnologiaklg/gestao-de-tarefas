import { useState, useMemo } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { useLogs } from '../../hooks/useData';
import { useUsuarios } from '../../hooks/useData';
import { Log } from '../../types';

// ROOT_SQL fica separado — não aparece nos tipos normais
const TIPOS = [
  'LOGIN', 'LOGIN_ROOT', 'CRIACAO_TAREFA', 'EDICAO_TAREFA', 'MUDANCA_STATUS',
  'COMENTARIO_ADICIONADO', 'CRIACAO_USUARIO', 'ATIVACAO_USUARIO', 'DESATIVACAO_USUARIO',
  'CRIACAO_SETOR', 'EDICAO_SETOR', 'DISCORD_VINCULO',
  'LOGIN_BLOQUEADO_DISCORD', 'LOGIN_AGUARDANDO_DISCORD',
];

const PAGE_SIZE = 50;

function formatDT(d: string) {
  const dt = new Date(d);
  return (
    dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' +
    dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
}

function tipoLabel(t: string) {
  const map: Record<string, string> = {
    LOGIN:                    'Login',
    LOGIN_ROOT:               'Login Root',
    CRIACAO_TAREFA:           'Nova Tarefa',
    EDICAO_TAREFA:            'Edição',
    MUDANCA_STATUS:           'Status',
    COMENTARIO_ADICIONADO:    'Comentário',
    CRIACAO_USUARIO:          'Novo Usuário',
    ATIVACAO_USUARIO:         'Ativação',
    DESATIVACAO_USUARIO:      'Desativação',
    CRIACAO_SETOR:            'Novo Setor',
    EDICAO_SETOR:             'Edição Setor',
    DISCORD_VINCULO:          'Discord',
    LOGIN_BLOQUEADO_DISCORD:  'Bloqueio Discord',
    LOGIN_AGUARDANDO_DISCORD: 'Aguardando Discord',
  };
  return map[t] ?? t;
}

function tipoBadgeClass(t: string) {
  if (t === 'LOGIN')               return 'badge badge-log-login';
  if (t === 'LOGIN_ROOT')          return 'badge badge-log-login-root';
  if (t === 'CRIACAO_TAREFA' || t === 'CRIACAO_SETOR') return 'badge badge-log-criacao';
  if (t === 'EDICAO_TAREFA'  || t === 'EDICAO_SETOR')  return 'badge badge-log-edicao';
  if (t === 'MUDANCA_STATUS')      return 'badge badge-log-status';
  if (t === 'COMENTARIO_ADICIONADO') return 'badge badge-log-comentario';
  if (t.includes('USUARIO'))       return 'badge badge-log-usuario';
  if (t === 'DISCORD_VINCULO' || t.includes('DISCORD')) return 'badge badge-log-discord';
  return 'badge badge-log-default';
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconChevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />
      }
    </svg>
  );
}

function formatJsonExpanded(val: string | null | undefined): string | null {
  if (!val) return null;
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed === 'object' && parsed !== null) return JSON.stringify(parsed, null, 2);
  } catch { /* string simples */ }
  return val;
}

function LogDetailModal({ log, onClose }: { log: Log; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="modal-title">Detalhes da Alteração</span>
            <span className={tipoBadgeClass(log.tipo_evento)} style={{ marginLeft: 4 }}>
              {tipoLabel(log.tipo_evento)}
            </span>
          </div>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)', fontWeight: 600, textTransform: 'uppercase' }}>Data / Hora</div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--stone-800)', fontWeight: 500, marginTop: 2 }}>{formatDT(log.criado_em)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)', fontWeight: 600, textTransform: 'uppercase' }}>Usuário</div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--stone-800)', fontWeight: 600, marginTop: 2 }}>{log.usuario_nome || 'Root'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Descrição do Evento</div>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--stone-800)', background: 'var(--bg-surface)', border: '1px solid var(--stone-200)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {log.descricao || 'Sem descrição adicional.'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--stone-500)', textTransform: 'uppercase', marginBottom: 6 }}>Estado Anterior</span>
              <div style={{ flex: 1, background: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', minHeight: 120, maxHeight: 280, overflowY: 'auto' }}>
                {log.valor_antes
                  ? <pre style={{ margin: 0, fontSize: 12, fontFamily: "'SF Mono', 'Fira Code', monospace", color: 'var(--stone-700)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45 }}>{formatJsonExpanded(log.valor_antes)}</pre>
                  : <span style={{ color: 'var(--stone-400)', fontSize: 'var(--font-xs)', fontStyle: 'italic' }}>Nenhum valor anterior.</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', marginBottom: 6 }}>Novo Estado</span>
              <div style={{ flex: 1, background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', minHeight: 120, maxHeight: 280, overflowY: 'auto' }}>
                {log.valor_depois
                  ? <pre style={{ margin: 0, fontSize: 12, fontFamily: "'SF Mono', 'Fira Code', monospace", color: 'var(--color-success)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45 }}>{formatJsonExpanded(log.valor_depois)}</pre>
                  : <span style={{ color: 'var(--stone-400)', fontSize: 'var(--font-xs)', fontStyle: 'italic' }}>Nenhum valor posterior.</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Aba SQL ─────────────────────────────────────────────────────── */
function SqlLogsTab({ logs, loading }: { logs: Log[]; loading: boolean }) {
  const [page, setPage] = useState(1);
  const sqlLogs = useMemo(() => logs.filter(l => l.tipo_evento === 'ROOT_SQL'), [logs]);
  const totalPages = Math.max(1, Math.ceil(sqlLogs.length / PAGE_SIZE));
  const paginated  = useMemo(() => sqlLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sqlLogs, page]);

  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--stone-400)' }}>
      <div className="spinner spinner-dark spinner-lg" style={{ margin: '0 auto var(--space-3)' }} />
      <p style={{ fontSize: 'var(--font-sm)' }}>Carregando…</p>
    </div>
  );

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 155 }}>Data / Hora</th>
            <th>Query Executada</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 && (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', color: 'var(--stone-400)', padding: 'var(--space-12)' }}>
                Nenhuma query executada ainda.
              </td>
            </tr>
          )}
          {paginated.map(log => (
            <tr key={log.id}>
              <td>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-xs)', color: 'var(--stone-500)', whiteSpace: 'nowrap' }}>
                  {formatDT(log.criado_em)}
                </span>
              </td>
              <td>
                <pre style={{
                  margin: 0,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                  fontSize: 12,
                  color: 'var(--stone-700)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  lineHeight: 1.55,
                  background: 'var(--stone-50)',
                  border: '1px solid var(--stone-150)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                }}>
                  {log.descricao || '—'}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-bar">
          <span className="pagination-info">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sqlLogs.length)} de {sqlLogs.length}
          </span>
          <div className="pagination-controls">
            <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Anterior">
              <IconChevron dir="left" />
            </button>
            {pageNumbers.map((p, i) =>
              p === '...'
                ? <span key={`el-${i}`} style={{ padding: '0 4px', color: 'var(--stone-400)', fontSize: 'var(--font-xs)' }}>…</span>
                : <button key={p} className={`pagination-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            )}
            <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Próxima">
              <IconChevron dir="right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Aba Sistema ──────────────────────────────────────────────────── */
function SistemaLogsTab({ logs, loading, usuarios }: { logs: Log[]; loading: boolean; usuarios: { id: number; nome: string }[] }) {
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroTipo,    setFiltroTipo]    = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog]    = useState<Log | null>(null);

  // Exclui ROOT_SQL desta aba
  const sistemLogs = useMemo(
    () => logs.filter(l => l.tipo_evento !== 'ROOT_SQL'),
    [logs]
  );

  const filtered = useMemo(() => sistemLogs.filter(l => {
    if (filtroUsuario && String(l.usuario_id) !== filtroUsuario) return false;
    if (filtroTipo    && l.tipo_evento !== filtroTipo)           return false;
    return true;
  }), [sistemLogs, filtroUsuario, filtroTipo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const handleFilter = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => { setFiltroUsuario(''); setFiltroTipo(''); setPage(1); };
  const hasFilter    = filtroUsuario || filtroTipo;

  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--stone-400)' }}>
      <div className="spinner spinner-dark spinner-lg" style={{ margin: '0 auto var(--space-3)' }} />
      <p style={{ fontSize: 'var(--font-sm)' }}>Carregando logs…</p>
    </div>
  );

  return (
    <>
      {/* Filtros */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-3)' }}>
        <div className="filter-search" style={{ maxWidth: 260 }}>
          <span className="search-icon"><IconSearch /></span>
          <select
            id="log-filter-usuario"
            className="filter-select"
            style={{ paddingLeft: 32, width: '100%' }}
            value={filtroUsuario}
            onChange={handleFilter(setFiltroUsuario)}
          >
            <option value="">Todos os usuários</option>
            {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>

        <div className="filter-divider" />

        <select
          id="log-filter-tipo"
          className="filter-select"
          value={filtroTipo}
          onChange={handleFilter(setFiltroTipo)}
        >
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{tipoLabel(t)}</option>)}
        </select>

        {hasFilter && (
          <>
            <div className="filter-divider" />
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Limpar filtros</button>
          </>
        )}
      </div>

      {/* Tabela */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Data / Hora</th>
              <th style={{ width: 160 }}>Usuário</th>
              <th style={{ width: 160 }}>Tipo de Evento</th>
              <th>Descrição</th>
              <th style={{ width: 150, textAlign: 'center' }}>Antes / Depois</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--stone-400)', padding: 'var(--space-12)' }}>
                  Nenhum log encontrado.
                </td>
              </tr>
            )}
            {paginated.map(log => {
              const hasChanges = Boolean(log.valor_antes || log.valor_depois);
              return (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-xs)', color: 'var(--stone-500)', whiteSpace: 'nowrap' }}>
                      {formatDT(log.criado_em)}
                    </span>
                  </td>
                  <td>
                    {log.usuario_nome
                      ? <span style={{ fontWeight: 600, color: 'var(--stone-800)' }}>{log.usuario_nome}</span>
                      : <span style={{ color: 'var(--stone-400)', fontStyle: 'italic', fontSize: 'var(--font-xs)' }}>Root</span>}
                  </td>
                  <td>
                    <span className={tipoBadgeClass(log.tipo_evento)}>{tipoLabel(log.tipo_evento)}</span>
                  </td>
                  <td>
                    <span style={{ display: 'block', fontSize: 'var(--font-sm)', color: 'var(--stone-800)', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {log.descricao || <span style={{ color: 'var(--stone-300)' }}>—</span>}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {hasChanges
                      ? <Button variant="secondary" size="sm" onClick={() => setSelectedLog(log)} style={{ fontSize: 11, padding: '3px 10px', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}>Ver Detalhes</Button>
                      : <span style={{ color: 'var(--stone-300)' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Anterior">
                <IconChevron dir="left" />
              </button>
              {pageNumbers.map((p, i) =>
                p === '...'
                  ? <span key={`el-${i}`} style={{ padding: '0 4px', color: 'var(--stone-400)', fontSize: 'var(--font-xs)' }}>…</span>
                  : <button key={p} className={`pagination-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )}
              <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Próxima">
                <IconChevron dir="right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </>
  );
}

/* ─── Página Principal ─────────────────────────────────────────────── */
type Aba = 'sistema' | 'sql';

export function RootLogsPage() {
  const [aba, setAba] = useState<Aba>('sistema');

  const { logs, loading } = useLogs({});
  const { usuarios }      = useUsuarios();

  const sqlCount     = useMemo(() => logs.filter(l => l.tipo_evento === 'ROOT_SQL').length, [logs]);
  const sistemaCount = useMemo(() => logs.filter(l => l.tipo_evento !== 'ROOT_SQL').length, [logs]);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Logs do Sistema</h1>
          <p className="page-subtitle">
            {loading ? 'Carregando…' : `${logs.length} evento${logs.length !== 1 ? 's' : ''} registrado${logs.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Abas Sistema / SQL */}
      <div className="perspectiva-tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button
          className={`perspectiva-tab${aba === 'sistema' ? ' active' : ''}`}
          onClick={() => setAba('sistema')}
        >
          Sistema
          {!loading && <span className="perspectiva-count">{sistemaCount}</span>}
        </button>
        <button
          className={`perspectiva-tab${aba === 'sql' ? ' active' : ''}`}
          onClick={() => setAba('sql')}
        >
          Console SQL
          {!loading && sqlCount > 0 && <span className="perspectiva-count">{sqlCount}</span>}
        </button>
      </div>

      {aba === 'sistema'
        ? <SistemaLogsTab logs={logs} loading={loading} usuarios={usuarios} />
        : <SqlLogsTab     logs={logs} loading={loading} />
      }
    </AppLayout>
  );
}
