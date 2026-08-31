import { useState, useRef, useEffect, useCallback } from 'react';
import { sqlService, SqlResult } from '../../services/sqlService';

interface Props { onClose: () => void; }

interface HistoryEntry {
  sql: string;
  result?: SqlResult;
  error?: string;
  ts: Date;
}

const SHORTCUTS = [
  { label: 'Tabelas',       sql: "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" },
  { label: 'Usuários',      sql: 'SELECT id, nome, cargo, ativo, discord_vinculado FROM usuarios ORDER BY id;' },
  { label: 'Tarefas',       sql: 'SELECT id, titulo, status, prioridade, criador_id, responsavel_id FROM tarefas ORDER BY id DESC LIMIT 50;' },
  { label: 'Setores',       sql: 'SELECT * FROM setores ORDER BY id;' },
  { label: 'Logs (últimos)',sql: "SELECT id, tipo_evento, descricao, criado_em FROM logs ORDER BY id DESC LIMIT 30;" },
];

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconRun() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function ResultTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return <div className="sql-empty-result">0 linhas retornadas</div>;
  const cols = Object.keys(rows[0]);
  return (
    <div className="sql-result-table-wrap">
      <table className="sql-result-table">
        <thead>
          <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map(c => (
                <td key={c}>{row[c] === null ? <span className="sql-null">NULL</span> : String(row[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SqlConsoleModal({ onClose }: Props) {
  const [sql, setSql]                 = useState('');
  const [running, setRunning]         = useState(false);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);
  const [histIdx, setHistIdx]         = useState(-1);
  const [copied, setCopied]           = useState(false);
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);
  const historyEndRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);
  useEffect(() => { historyEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const run = useCallback(async () => {
    const trimmed = sql.trim();
    if (!trimmed || running) return;
    setRunning(true);
    try {
      const result = await sqlService.exec(trimmed);
      setHistory(h => [...h, { sql: trimmed, result, ts: new Date() }]);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Erro ao executar';
      setHistory(h => [...h, { sql: trimmed, error: msg, ts: new Date() }]);
    } finally {
      setRunning(false);
      setSql('');
      setHistIdx(-1);
    }
  }, [sql, running]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter ou Cmd+Enter executa
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); return; }
    // Navegar histórico com Alt+Setas
    if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      const cmds = history.map(h => h.sql).reverse();
      const next = Math.min(histIdx + 1, cmds.length - 1);
      setHistIdx(next);
      setSql(cmds[next] ?? '');
    }
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      const cmds = history.map(h => h.sql).reverse();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setSql(next === -1 ? '' : cmds[next] ?? '');
    }
  };

  const copyResult = (rows: Record<string, unknown>[]) => {
    if (!rows.length) return;
    const cols = Object.keys(rows[0]);
    const tsv = [cols.join('\t'), ...rows.map(r => cols.map(c => r[c] ?? '').join('\t'))].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="sql-console-modal">
        {/* Header */}
        <div className="sql-console-header">
          <div className="sql-console-title">
            <span className="sql-console-dot red" />
            <span className="sql-console-dot yellow" />
            <span className="sql-console-dot green" />
            <span>Console SQL — Root</span>
          </div>
          <button className="sql-console-close" onClick={onClose}><IconClose /></button>
        </div>

        {/* Atalhos rápidos */}
        <div className="sql-shortcuts">
          {SHORTCUTS.map(s => (
            <button key={s.label} className="sql-shortcut-btn" onClick={() => setSql(s.sql)}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Histórico de execuções */}
        <div className="sql-history">
          {history.length === 0 && (
            <div className="sql-history-empty">
              Nenhuma query executada ainda.<br />
              <span>Dica: <kbd>Ctrl+Enter</kbd> executa · <kbd>Alt+↑↓</kbd> navega histórico</span>
            </div>
          )}
          {history.map((entry, i) => (
            <div key={i} className="sql-history-entry">
              {/* Query */}
              <div className="sql-hist-query">
                <span className="sql-hist-prompt">▸</span>
                <pre className="sql-hist-sql">{entry.sql}</pre>
                <span className="sql-hist-time">{formatTime(entry.ts)}</span>
              </div>
              {/* Resultado */}
              {entry.error ? (
                <div className="sql-hist-error">✖ {entry.error}</div>
              ) : entry.result ? (
                <div className="sql-hist-result">
                  <div className="sql-hist-meta">
                    <span>{entry.result.command} · {entry.result.rowCount ?? 0} linhas · {entry.result.elapsed_ms}ms</span>
                    {entry.result.rows.length > 0 && (
                      <button className="sql-copy-btn" onClick={() => copyResult(entry.result!.rows)}>
                        <IconCopy /> {copied ? 'Copiado!' : 'Copiar TSV'}
                      </button>
                    )}
                  </div>
                  <ResultTable rows={entry.result.rows} />
                </div>
              ) : null}
            </div>
          ))}
          <div ref={historyEndRef} />
        </div>

        {/* Input area */}
        <div className="sql-input-area">
          <span className="sql-prompt-symbol">{'>'}</span>
          <textarea
            ref={textareaRef}
            className="sql-textarea"
            value={sql}
            onChange={e => setSql(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="SELECT * FROM usuarios LIMIT 10;"
            rows={3}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />
          <button
            className={`sql-run-btn${running ? ' running' : ''}`}
            onClick={run}
            disabled={!sql.trim() || running}
            title="Executar (Ctrl+Enter)"
          >
            {running ? <span className="sql-spinner" /> : <IconRun />}
          </button>
        </div>
      </div>
    </>
  );
}
