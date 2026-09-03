import { useState } from 'react';
import { Tarefa } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useComentarios, useHistorico } from '../../hooks/useData';
import { useAuth } from '../../contexts/AuthContext';
import { comentarioService } from '../../services/comentarioService';
import { tarefaService } from '../../services/tarefaService';

interface Props { tarefa: Tarefa; onClose: () => void; }

type Tab = 'principal' | 'historico';

function formatDT(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const tipoLabel: Record<string, string> = {
  CRIACAO: 'Tarefa criada', MUDANCA_STATUS: 'Status alterado', AGUARDANDO: 'Movido para Aguardando',
  COMENTARIO: 'Comentário', EDICAO_TITULO: 'Título editado', EDICAO_DESCRICAO: 'Descrição editada',
  EDICAO_RESPONSAVEL_ID: 'Responsável alterado', EDICAO_PRIORIDADE: 'Prioridade alterada',
  EDICAO_PRAZO: 'Prazo alterado', EDICAO_SETOR_ID: 'Setor alterado',
};

function isAtrasadaMais15min(prazo: string, atrasada: boolean): boolean {
  if (!atrasada) return false;
  return Date.now() - new Date(prazo).getTime() >= 15 * 60 * 1000;
}

export function TaskSidebar({ tarefa, onClose }: Props) {
  const { user } = useAuth();
  const [tab, setTab]           = useState<Tab>('principal');
  const [coment, setComent]     = useState('');
  const [sending, setSending]   = useState(false);
  const [reclamando, setReclamando] = useState(false);
  const { comentarios, refetch } = useComentarios(tarefa.id);
  const { historico } = useHistorico(tarefa.id);

  const reclamacaoKey = `reclamacao_enviada_${tarefa.id}`;
  const jaReclamou = typeof window !== 'undefined' && !!localStorage.getItem(reclamacaoKey);

  const uid = user?.id != null ? Number(user.id) : null;
  const [reclamadoLocal, setReclamadoLocal] = useState(false);
  const jaReclamou = Boolean(tarefa.reclamacao_enviada) || reclamadoLocal || (typeof window !== 'undefined' && !!localStorage.getItem(reclamacaoKey));
  const temPermissao = uid !== null && (Number(tarefa.responsavel_id) === uid || Number(tarefa.criador_id) === uid);
  const podeReclamar = temPermissao && isAtrasadaMais15min(tarefa.prazo, tarefa.atrasada) && !jaReclamou && tarefa.status !== 'CONCLUIDA';

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

  const handleReclamar = async () => {
    setReclamando(true);
    try {
      await tarefaService.reclamar(tarefa.id);
      localStorage.setItem(reclamacaoKey, '1');
      setReclamadoLocal(true);
      refetch();
      alert('✅ Lembrete de atraso registrado e enviado com sucesso via Discord!');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      alert(msg ?? 'Não foi possível registrar a reclamação.');
    } finally { setReclamando(false); }
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
          {(['principal', 'historico'] as Tab[]).map(t => (
            <button
              key={t}
              className={`sidebar-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'principal' ? 'Detalhes & Comentários' : 'Histórico'}
              {t === 'principal' && comentarios.length > 0 && (
                <span className="sidebar-tab-badge">{comentarios.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-panel-body">
          {/* ── Aba Principal: Detalhes + Comentários ── */}
          {tab === 'principal' && (
            <>
              {/* Botão de reclamação — aparece somente se elegível */}
              {podeReclamar && (
                <div className="reclamacao-banner">
                  <div className="reclamacao-text">
                    <span className="reclamacao-icon">🚨</span>
                    <div>
                      <div className="reclamacao-titulo">Tarefa atrasada há mais de 15 minutos</div>
                      <div className="reclamacao-desc">Você pode notificar o criador desta tarefa uma única vez sobre o atraso.</div>
                    </div>
                  </div>
                  <button
                    id={`btn-reclamar-${tarefa.id}`}
                    className="btn-reclamar"
                    onClick={handleReclamar}
                    disabled={reclamando}
                  >
                    {reclamando ? 'Enviando…' : '📣 Notificar criador'}
                  </button>
                </div>
              )}

              {/* Descrição */}
              <div className="detail-field">
                <div className="detail-label">Descrição</div>
                <div className="detail-value" style={{ whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                  {tarefa.descricao || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>Sem descrição</span>}
                </div>
              </div>
              <hr className="detail-separator" />

              {/* Campos de metadados */}
              <div className="detail-grid">
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
              </div>

              {/* Divisor de comentários */}
              <div className="sidebar-section-divider">
                <span>Comentários</span>
              </div>

              {/* Lista de comentários */}
              <div className="comentario-list">
                {comentarios.length === 0 && (
                  <p className="sidebar-empty-hint">Nenhum comentário ainda.</p>
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

              {/* Form de comentário */}
              {tarefa.status !== 'CONCLUIDA' ? (
                <div className="comentario-form">
                  <textarea
                    value={coment}
                    onChange={e => setComent(e.target.value)}
                    placeholder="Escreva um comentário…"
                    rows={3}
                    autoComplete="off"
                    spellCheck={false}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleEnviarComentario();
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)' }}>Ctrl+Enter para enviar</span>
                    <Button variant="primary" size="sm" loading={sending} disabled={!coment.trim()} onClick={handleEnviarComentario}>
                      Enviar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">Comentários bloqueados em tarefa concluída.</div>
              )}
            </>
          )}

          {/* ── Histórico ── */}
          {tab === 'historico' && (
            <div className="historico-list">
              {historico.length === 0 && (
                <p className="sidebar-empty-hint">Sem histórico registrado.</p>
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
        </div>
      </aside>
    </>
  );
}
