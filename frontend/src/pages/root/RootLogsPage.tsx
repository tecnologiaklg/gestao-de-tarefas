import { useState, useMemo } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { useLogs } from '../../hooks/useData';
import { useUsuarios } from '../../hooks/useData';
import { Log } from '../../types';

const TIPOS = [
  'LOGIN', 'LOGIN_ROOT', 'CRIACAO_TAREFA', 'EDICAO_TAREFA', 'MUDANCA_STATUS',
  'COMENTARIO_ADICIONADO', 'CRIACAO_USUARIO', 'ATIVACAO_USUARIO', 'DESATIVACAO_USUARIO',
  'CRIACAO_SETOR', 'EDICAO_SETOR', 'DISCORD_VINCULO',
];

const PAGE_SIZE = 50;

function formatDT(d: string) {
  const dt = new Date(d);
  return (
    dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' +
    dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

function tipoLabel(t: string) {
  const map: Record<string, string> = {
    LOGIN:                'Login',
    LOGIN_ROOT:           'Login Root',
    CRIACAO_TAREFA:       'Nova Tarefa',
    EDICAO_TAREFA:        'Edição',
    MUDANCA_STATUS:       'Status',
    COMENTARIO_ADICIONADO:'Comentário',
    CRIACAO_USUARIO:      'Novo Usuário',
    ATIVACAO_USUARIO:     'Ativação',
    DESATIVACAO_USUARIO:  'Desativação',
    CRIACAO_SETOR:        'Novo Setor',
    EDICAO_SETOR:         'Edição Setor',
    DISCORD_VINCULO:      'Discord',
  };
  return map[t] ?? t;
}

function tipoBadgeClass(t: string) {
  if (t === 'LOGIN')               return 'badge badge-log-login';
  if (t === 'LOGIN_ROOT')          return 'badge badge-log-login-root';
  if (t === 'CRIACAO_TAREFA' || t === 'CRIACAO_SETOR') return 'badge badge-log-criacao';
  if (t === 'EDICAO_TAREFA' || t === 'EDICAO_SETOR')   return 'badge badge-log-edicao';
  if (t === 'MUDANCA_STATUS')      return 'badge badge-log-status';
  if (t === 'COMENTARIO_ADICIONADO') return 'badge badge-log-comentario';
  if (t.includes('USUARIO'))       return 'badge badge-log-usuario';
  if (t === 'DISCORD_VINCULO')     return 'badge badge-log-discord';
  return 'badge badge-log-default';
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
    if (typeof parsed === 'object' && parsed !== null) {
      return JSON.stringify(parsed, null, 2);
    }
  } catch {
    // string simples
  }
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
          {/* Metadados rápidos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
            background: 'var(--stone-50)',
            border: '1px solid var(--stone-200)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)'
          }}>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)', fontWeight: 600, textTransform: 'uppercase' }}>Data / Hora</div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--stone-800)', fontWeight: 500, marginTop: 2 }}>{formatDT(log.criado_em)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)', fontWeight: 600, textTransform: 'uppercase' }}>Usuário</div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--stone-800)', fontWeight: 600, marginTop: 2 }}>{log.usuario_nome || 'Root'}</div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              Descrição do Evento
            </div>
            <div style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--stone-800)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--stone-200)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}>
              {log.descricao || 'Sem descrição adicional.'}
            </div>
          </div>

          {/* Comparativo Antes e Depois */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {/* Antes */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6
              }}>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--stone-500)', textTransform: 'uppercase' }}>
                  Estado Anterior (Antes)
                </span>
              </div>
              <div style={{
                flex: 1,
                background: 'var(--stone-50)',
                border: '1px solid var(--stone-200)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                minHeight: 120,
                maxHeight: 280,
                overflowY: 'auto'
              }}>
                {log.valor_antes ? (
                  <pre style={{
                    margin: 0,
                    fontSize: 12,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    color: 'var(--stone-700)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.45
                  }}>
                    {formatJsonExpanded(log.valor_antes)}
                  </pre>
                ) : (
                  <span style={{ color: 'var(--stone-400)', fontSize: 'var(--font-xs)', fontStyle: 'italic' }}>
                    Nenhum valor anterior registrado.
                  </span>
                )}
              </div>
            </div>

            {/* Depois */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6
              }}>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                  Novo Estado (Depois)
                </span>
              </div>
              <div style={{
                flex: 1,
                background: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                minHeight: 120,
                maxHeight: 280,
                overflowY: 'auto'
              }}>
                {log.valor_depois ? (
                  <pre style={{
                    margin: 0,
                    fontSize: 12,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    color: 'var(--color-success)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.45
                  }}>
                    {formatJsonExpanded(log.valor_depois)}
                  </pre>
                ) : (
                  <span style={{ color: 'var(--stone-400)', fontSize: 'var(--font-xs)', fontStyle: 'italic' }}>
                    Nenhum valor posterior registrado.
                  </span>
                )}
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

export function RootLogsPage() {
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroTipo,    setFiltroTipo]    = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const { logs, loading } = useLogs({
    usuario_id:  filtroUsuario ? parseInt(filtroUsuario) : undefined,
    tipo_evento: filtroTipo    || undefined,
  });
  const { usuarios } = useUsuarios();

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const paginated  = useMemo(
    () => logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [logs, page],
  );

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setFiltroUsuario('');
    setFiltroTipo('');
    setPage(1);
  };

  const hasFilter = filtroUsuario || filtroTipo;

  /* Paginação: até 7 botões visíveis */
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);

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

      {/* Barra de filtros */}
      <div className="filter-bar">
        <div className="filter-search" style={{ maxWidth: 260 }}>
          <span className="search-icon"><IconSearch /></span>
          <select
            id="log-filter-usuario"
            className="filter-select"
            style={{ paddingLeft: 32, width: '100%' }}
            value={filtroUsuario}
            onChange={handleFilterChange(setFiltroUsuario)}
            data-active={filtroUsuario ? 'true' : 'false'}
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
          onChange={handleFilterChange(setFiltroTipo)}
          data-active={filtroTipo ? 'true' : 'false'}
        >
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{tipoLabel(t)}</option>)}
        </select>

        {hasFilter && (
          <>
            <div className="filter-divider" />
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              ✕ Limpar filtros
            </button>
          </>
        )}
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--stone-400)' }}>
          <div className="spinner spinner-dark spinner-lg" style={{ margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: 'var(--font-sm)' }}>Carregando logs…</p>
        </div>
      ) : (
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
                        : <span style={{ color: 'var(--stone-400)', fontStyle: 'italic', fontSize: 'var(--font-xs)' }}>Root</span>
                      }
                    </td>
                    <td>
                      <span className={tipoBadgeClass(log.tipo_evento)}>
                        {tipoLabel(log.tipo_evento)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'block',
                        fontSize: 'var(--font-sm)',
                        color: 'var(--stone-800)',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {log.descricao || <span style={{ color: 'var(--stone-300)' }}>—</span>}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {hasChanges ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          style={{
                            fontSize: 11,
                            padding: '3px 10px',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          Ver Detalhes
                        </Button>
                      ) : (
                        <span style={{ color: 'var(--stone-300)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, logs.length)} de {logs.length}
              </span>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Página anterior"
                >
                  <IconChevron dir="left" />
                </button>
                {pageNumbers.map((p, i) =>
                  p === '...'
                    ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--stone-400)', fontSize: 'var(--font-xs)' }}>…</span>
                    : <button
                        key={p}
                        className={`pagination-btn${page === p ? ' active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                )}
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Próxima página"
                >
                  <IconChevron dir="right" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </AppLayout>
  );
}
