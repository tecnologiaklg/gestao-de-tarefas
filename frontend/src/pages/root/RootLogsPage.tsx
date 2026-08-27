import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLogs } from '../../hooks/useData';
import { useUsuarios } from '../../hooks/useData';

const TIPOS = ['LOGIN','LOGIN_ROOT','CRIACAO_TAREFA','EDICAO_TAREFA','MUDANCA_STATUS',
               'COMENTARIO_ADICIONADO','CRIACAO_USUARIO','ATIVACAO_USUARIO','DESATIVACAO_USUARIO',
               'CRIACAO_SETOR','EDICAO_SETOR','DISCORD_VINCULO'];

function formatDT(d: string) {
  return new Date(d).toLocaleString('pt-BR');
}

export function RootLogsPage() {
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroTipo,    setFiltroTipo]    = useState('');

  const { logs, loading }     = useLogs({
    usuario_id: filtroUsuario ? parseInt(filtroUsuario) : undefined,
    tipo_evento: filtroTipo   || undefined,
  });
  const { usuarios } = useUsuarios();

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Logs do Sistema</h1>
          <p className="page-subtitle">Histórico completo de eventos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
        <select
          id="log-filter-usuario"
          className="filter-select"
          value={filtroUsuario}
          onChange={e => setFiltroUsuario(e.target.value)}
        >
          <option value="">Todos os usuários</option>
          {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>

        <select
          id="log-filter-tipo"
          className="filter-select"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {(filtroUsuario || filtroTipo) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroUsuario(''); setFiltroTipo(''); }}>
            ✕ Limpar
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--slate-400)' }}>Carregando logs…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Tipo de Evento</th>
              <th>Descrição</th>
              <th>Antes</th>
              <th>Depois</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: 'var(--space-8)' }}>Nenhum log encontrado.</td></tr>
            )}
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--slate-500)', fontSize: 'var(--font-xs)' }}>{formatDT(log.criado_em)}</td>
                <td>{log.usuario_nome ?? <em style={{ color: 'var(--slate-400)' }}>Root</em>}</td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)', background: 'var(--slate-100)', padding: '2px 6px', borderRadius: 4 }}>{log.tipo_evento}</span></td>
                <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.descricao}</td>
                <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 'var(--font-xs)', color: 'var(--slate-500)' }}>{log.valor_antes ?? '—'}</td>
                <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 'var(--font-xs)', color: 'var(--slate-500)' }}>{log.valor_depois ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AppLayout>
  );
}
