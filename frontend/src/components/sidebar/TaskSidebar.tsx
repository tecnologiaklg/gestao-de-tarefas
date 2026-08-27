import { useState } from 'react';
import { Tarefa } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useComentarios, useHistorico } from '../../hooks/useData';
import { useAuth } from '../../contexts/AuthContext';
import { comentarioService } from '../../services/comentarioService';

interface Props { tarefa: Tarefa; onClose: () => void; }

type Tab = 'detalhes' | 'historico' | 'comentarios';

function formatDT(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function TaskSidebar({ tarefa, onClose }: Props) {
  const { user } = useAuth();
  const [tab, setTab]     = useState<Tab>('detalhes');
  const [coment, setComent] = useState('');
  const [sending, setSending] = useState(false);
  const { comentarios, refetch } = useComentarios(tarefa.id);
  const { historico } = useHistorico(tarefa.id);

  const handleEnviarComentario = async () => {
    if (!coment.trim()) return;
    setSending(true);
    try {
      await comentarioService.criar(tarefa.id, coment.trim());
      setComent('');
      refetch();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      alert(msg ?? 'Erro ao enviar comentário.');
    } finally { setSending(false); }
  };

  const tipoLabel: Record<string, string> = {
    CRIACAO: 'Tarefa criada', MUDANCA_STATUS: 'Status alterado', AGUARDANDO: 'Movido para Aguardando',
    COMENTARIO: 'Comentário', EDICAO_TITULO: 'Título editado', EDICAO_DESCRICAO: 'Descrição editada',
    EDICAO_RESPONSAVEL_ID: 'Responsável alterado', EDICAO_PRIORIDADE: 'Prioridade alterada',
    EDICAO_PRAZO: 'Prazo alterado', EDICAO_SETOR_ID: 'Setor alterado',
  };

  return (
    <>
      <div className="task-sidebar-overlay" onClick={onClose} />
      <aside className="task-sidebar">
        {/* Header */}
        <div className="sidebar-panel-header">
          <div>
            <div className="sidebar-panel-title" style={{ fontSize: 'var(--font-base)', marginBottom: 4 }}>{tarefa.titulo}</div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Badge type="status" value={tarefa.status} />
              <Badge type="prioridade" value={tarefa.prioridade} />
              {tarefa.atrasada && <Badge type="atrasada" value={true} />}
            </div>
          </div>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="sidebar-panel-tabs">
          {(['detalhes', 'historico', 'comentarios'] as Tab[]).map(t => (
            <button key={t} className={`sidebar-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'detalhes' ? 'Detalhes' : t === 'historico' ? 'Histórico' : 'Comentários'}
            </button>
          ))}
        </div>

        <div className="sidebar-panel-body">
          {/* ── Detalhes ── */}
          {tab === 'detalhes' && (
            <>
              <div className="detail-field">
                <div className="detail-label">Descrição</div>
                <div className="detail-value" style={{ whiteSpace: 'pre-wrap', fontWeight: 400, color: 'var(--slate-700)' }}>{tarefa.descricao}</div>
              </div>
              <hr className="detail-separator" />
              {[
                ['Criador',     tarefa.criador_nome],
                ['Responsável', tarefa.responsavel_nome],
                ['Setor',       tarefa.setor_nome],
                ['Prazo',       formatDT(tarefa.prazo)],
                ['Criado em',   formatDT(tarefa.criado_em)],
                tarefa.concluido_em ? ['Concluído em', formatDT(tarefa.concluido_em)] : null,
              ].filter((x): x is [string, string] => Boolean(x)).map(([label, value]) => (
                <div className="detail-field" key={label}>
                  <div className="detail-label">{label}</div>
                  <div className="detail-value">{value}</div>
                </div>
              ))}
            </>
          )}

          {/* ── Histórico ── */}
          {tab === 'historico' && (
            <div className="historico-list">
              {historico.length === 0 && (
                <p style={{ color: 'var(--slate-400)', fontSize: 'var(--font-sm)' }}>Sem histórico registrado.</p>
              )}
              {historico.map(h => (
                <div key={h.id} className="historico-entry">
                  <div style={{ flex: 1 }}>
                    <div className="historico-author">{h.autor_nome}</div>
                    <div className="historico-type">{tipoLabel[h.tipo] ?? h.tipo}</div>
                    {h.valor_antes && h.valor_depois && (
                      <div className="historico-change">
                        <code>{h.valor_antes}</code> → <code>{h.valor_depois}</code>
                      </div>
                    )}
                    {h.descricao && !h.valor_antes && (
                      <div className="historico-change" style={{ fontStyle: 'italic' }}>"{h.descricao}"</div>
                    )}
                    <div className="historico-date">{formatDT(h.criado_em)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Comentários ── */}
          {tab === 'comentarios' && (
            <>
              <div className="comentario-list">
                {comentarios.length === 0 && (
                  <p style={{ color: 'var(--slate-400)', fontSize: 'var(--font-sm)' }}>Nenhum comentário ainda.</p>
                )}
                {comentarios.map(c => (
                  <div key={c.id} className="comentario-item">
                    <div className="comentario-header">
                      <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 11 }}>
                        {c.autor_nome.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="comentario-author">{c.autor_nome}</span>
                      <span className="comentario-date">{formatDT(c.criado_em)}</span>
                    </div>
                    <div className="comentario-text">{c.conteudo}</div>
                  </div>
                ))}
              </div>

              {tarefa.status !== 'CONCLUIDA' && (
                <div className="comentario-form">
                  <textarea
                    value={coment}
                    onChange={e => setComent(e.target.value)}
                    placeholder="Escreva um comentário…"
                    rows={3}
                  />
                  <Button variant="primary" size="sm" loading={sending} disabled={!coment.trim()} onClick={handleEnviarComentario}>
                    Enviar
                  </Button>
                </div>
              )}
              {tarefa.status === 'CONCLUIDA' && (
                <div className="alert alert-warning">Comentários bloqueados em tarefa concluída.</div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
