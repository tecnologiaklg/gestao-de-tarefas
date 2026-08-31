import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ConfirmCreateModal } from './ConfirmCreateModal';
import { PriorityHelpModal } from './PriorityHelpModal';
import { useSetores } from '../../hooks/useData';
import { useAuth } from '../../contexts/AuthContext';
import { usuarioService } from '../../services/usuarioService';
import { tarefaService } from '../../services/tarefaService';
import { Usuario } from '../../types';

interface Props { onClose: () => void; onCreated: () => void; }

type Destino = 'eu' | 'outro' | null;

/* ── Icons ─────────────────────────────────────────────────── */
function IconHelp() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconSelf() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconOther() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

/* ── Step 0 — Seleção de destinatário ─────────────────────── */
function DestinoStep({ onSelect, onClose }: { onSelect: (d: Destino) => void; onClose: () => void }) {
  const [hovered, setHovered] = useState<Destino>(null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 460 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header" style={{ padding: '12px 20px' }}>
          <span className="modal-title" style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>
            Nova Tarefa
          </span>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '24px 24px 28px' }}>
          <p style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--stone-600)',
            marginBottom: 20,
            textAlign: 'center',
            fontWeight: 500,
          }}>
            Essa tarefa é para quem?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Para mim */}
            <button
              className="destino-card"
              data-hovered={hovered === 'eu'}
              onMouseEnter={() => setHovered('eu')}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect('eu')}
              type="button"
            >
              <div className="destino-icon destino-icon-eu">
                <IconSelf />
              </div>
              <div className="destino-label">Para mim</div>
              <div className="destino-desc">Você será o responsável por essa tarefa</div>
            </button>

            {/* Para outra pessoa */}
            <button
              className="destino-card"
              data-hovered={hovered === 'outro'}
              onMouseEnter={() => setHovered('outro')}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect('outro')}
              type="button"
            >
              <div className="destino-icon destino-icon-outro">
                <IconOther />
              </div>
              <div className="destino-label">Para outra pessoa</div>
              <div className="destino-desc">Atribua a tarefa a um colega</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 1 — Formulário ────────────────────────────────────── */
export function CreateTaskModal({ onClose, onCreated }: Props) {
  const { user } = useAuth();
  const { setores } = useSetores();

  const [destino, setDestino]       = useState<Destino>(null);
  const [usuarios, setUsuarios]     = useState<Partial<Usuario>[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showHelp, setShowHelp]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    titulo: '', descricao: '', setor_id: '', responsavel_id: '',
    prioridade: 'NORMAL', data: '', hora: '18:00',
  });

  // Quando "Para mim" é selecionado: preenche setor e responsável automaticamente
  useEffect(() => {
    if (destino !== 'eu' || !user) return;
    const setorId = String(user.setor_id ?? '');
    setForm(f => ({ ...f, setor_id: setorId, responsavel_id: String(user.id) }));

    if (user.setor_id) {
      usuarioService.listarPorSetor(user.setor_id).then(setUsuarios).catch(() => setUsuarios([]));
    }
  }, [destino, user]);

  const handleSetorChange = async (setorIdStr: string) => {
    setForm(f => ({ ...f, setor_id: setorIdStr, responsavel_id: '' }));
    if (setorIdStr) {
      try {
        const users = await usuarioService.listarPorSetor(parseInt(setorIdStr, 10));
        setUsuarios(users);
      } catch {
        setUsuarios([]);
      }
    } else {
      setUsuarios([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return setError('Título é obrigatório.');
    if (!form.setor_id)       return setError('Selecione um setor.');
    if (!form.responsavel_id) return setError('Selecione um responsável.');
    if (!form.data)           return setError('Data de entrega é obrigatória.');

    const prazo = new Date(`${form.data}T${form.hora || '18:00'}:00`);
    if (isNaN(prazo.getTime())) return setError('Data/hora de entrega inválida.');
    if (prazo <= new Date())    return setError('O prazo deve ser uma data/hora futura.');

    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true); setError('');
    try {
      const prazo = new Date(`${form.data}T${form.hora || '18:00'}:00`).toISOString();
      await tarefaService.criar({
        titulo:         form.titulo.trim(),
        descricao:      form.descricao.trim() || undefined,
        responsavel_id: parseInt(form.responsavel_id, 10),
        setor_id:       parseInt(form.setor_id, 10),
        prioridade:     form.prioridade,
        prazo,
      });
      onCreated();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? 'Erro ao criar tarefa.');
      setShowConfirm(false);
    } finally { setLoading(false); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  // Step 0 — escolha de destinatário
  if (!destino) {
    return (
      <>
        <DestinoStep onSelect={setDestino} onClose={onClose} />
        {showHelp && <PriorityHelpModal onClose={() => setShowHelp(false)} />}
      </>
    );
  }

  // Step 1 — formulário
  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>

          {/* Header com breadcrumb */}
          <div className="modal-header" style={{ padding: '10px 16px 10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ padding: '3px 6px', color: 'var(--stone-500)', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { setDestino(null); setError(''); }}
              >
                <IconArrowLeft />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="modal-title" style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>
                  Nova Tarefa
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: destino === 'eu'
                    ? 'var(--color-primary-light)'
                    : 'var(--color-info-bg)',
                  color: destino === 'eu'
                    ? 'var(--color-primary)'
                    : 'var(--color-info)',
                  border: destino === 'eu'
                    ? '1px solid var(--color-primary-soft)'
                    : '1px solid var(--color-info-border)',
                }}>
                  {destino === 'eu' ? '👤 Para mim' : '👥 Para outra pessoa'}
                </span>
              </div>
            </div>
            <button className="sidebar-panel-close" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="modal-body" style={{ padding: '14px 20px', gap: '10px' }}>
              {error && <div className="alert alert-error" style={{ padding: '6px 10px', fontSize: 'var(--font-xs)' }}>{error}</div>}

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 'var(--font-xs)' }}>
                  Título <span className="required">*</span>
                </label>
                <input
                  id="task-titulo"
                  className="form-input"
                  value={form.titulo}
                  onChange={set('titulo')}
                  placeholder="Título da tarefa"
                  maxLength={255}
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                  style={{ padding: '6px 10px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 'var(--font-xs)' }}>Descrição</label>
                <textarea
                  id="task-descricao"
                  className="form-textarea"
                  value={form.descricao}
                  onChange={set('descricao')}
                  placeholder="Descreva o que precisa ser feito…"
                  rows={2}
                  autoComplete="off"
                  spellCheck={false}
                  style={{ padding: '6px 10px', minHeight: 48 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-xs)' }}>
                    Setor <span className="required">*</span>
                  </label>
                  <select
                    id="task-setor"
                    className="form-select"
                    value={form.setor_id}
                    onChange={e => handleSetorChange(e.target.value)}
                    // "Para mim" bloqueia setor (já preenchido)
                    disabled={destino === 'eu'}
                    style={{ padding: '6px 10px' }}
                  >
                    <option value="">Selecione…</option>
                    {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-xs)' }}>
                    Responsável <span className="required">*</span>
                  </label>
                  <select
                    id="task-responsavel"
                    className="form-select"
                    value={form.responsavel_id}
                    onChange={set('responsavel_id')}
                    // "Para mim" bloqueia responsável (já preenchido com o próprio usuário)
                    disabled={destino === 'eu' || !form.setor_id}
                    style={{ padding: '6px 10px' }}
                  >
                    <option value="">Selecione…</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <label className="form-label" style={{ fontSize: 'var(--font-xs)' }}>
                      Prioridade <span className="required">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '1px 5px', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2, lineHeight: 1 }}
                      onClick={() => setShowHelp(true)}
                    >
                      <IconHelp /><span>Guia</span>
                    </button>
                  </div>
                  <select
                    id="task-prioridade"
                    className="form-select"
                    value={form.prioridade}
                    onChange={set('prioridade')}
                    style={{ padding: '6px 10px' }}
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-xs)' }}>
                    Prazo de Entrega <span className="required">*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 6 }}>
                    <input
                      id="task-data"
                      type="date"
                      className="form-input"
                      value={form.data}
                      onChange={set('data')}
                      style={{ padding: '6px 8px', fontSize: 'var(--font-xs)' }}
                    />
                    <input
                      id="task-hora"
                      type="time"
                      className="form-input"
                      value={form.hora}
                      onChange={set('hora')}
                      style={{ padding: '6px 6px', fontSize: 'var(--font-xs)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '10px 20px' }}>
              <Button size="sm" type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button size="sm" type="submit" variant="primary">Criar Tarefa</Button>
            </div>
          </form>
        </div>
      </div>

      {showConfirm && (
        <ConfirmCreateModal
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}

      {showHelp && <PriorityHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
