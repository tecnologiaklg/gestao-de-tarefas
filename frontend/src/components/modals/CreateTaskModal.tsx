import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { PriorityHelpModal } from './PriorityHelpModal';
import { ConfirmCreateModal } from './ConfirmCreateModal';
import { setorService }   from '../../services/setorService';
import { usuarioService } from '../../services/usuarioService';
import { tarefaService, CreateTarefaData } from '../../services/tarefaService';
import { Setor } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface Props { onClose: () => void; onCreated: () => void; }

export function CreateTaskModal({ onClose, onCreated }: Props) {
  const { user } = useAuth();
  const [setores, setSetores]       = useState<Setor[]>([]);
  const [usuarios, setUsuarios]     = useState<Array<{ id: number; nome: string; cargo: string }>>([]);
  const [showHelp, setShowHelp]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    titulo: '', descricao: '', setor_id: '', responsavel_id: '',
    prioridade: 'NORMAL', data: '', hora: '',
  });

  useEffect(() => {
    setorService.listar().then(setSetores).catch(() => {});
  }, []);

  const handleSetorChange = async (setorId: string) => {
    setForm(f => ({ ...f, setor_id: setorId, responsavel_id: '' }));
    if (!setorId) return setUsuarios([]);
    try {
      const data = await usuarioService.listarPorSetor(parseInt(setorId));
      setUsuarios(data as Array<{ id: number; nome: string; cargo: string }>);
    } catch { setUsuarios([]); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.descricao || !form.setor_id || !form.responsavel_id || !form.data || !form.hora)
      return setError('Todos os campos são obrigatórios.');
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const prazo = new Date(`${form.data}T${form.hora}`).toISOString();
      await tarefaService.criar({
        titulo: form.titulo, descricao: form.descricao,
        setor_id: parseInt(form.setor_id), responsavel_id: parseInt(form.responsavel_id),
        prioridade: form.prioridade, prazo,
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

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">✏️ Nova Tarefa</span>
            <button className="sidebar-panel-close" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Título <span className="required">*</span></label>
                <input id="task-titulo" className="form-input" value={form.titulo} onChange={set('titulo')} placeholder="Título da tarefa" maxLength={255} />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição <span className="required">*</span></label>
                <textarea id="task-descricao" className="form-textarea" value={form.descricao} onChange={set('descricao')} placeholder="Descreva a tarefa…" rows={3} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Setor <span className="required">*</span></label>
                  <select id="task-setor" className="form-select" value={form.setor_id} onChange={e => handleSetorChange(e.target.value)}>
                    <option value="">Selecione…</option>
                    {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Responsável <span className="required">*</span></label>
                  <select id="task-responsavel" className="form-select" value={form.responsavel_id} onChange={set('responsavel_id')} disabled={!form.setor_id}>
                    <option value="">Selecione…</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  Prioridade <span className="required">*</span>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '1px 6px', fontSize: 12 }} onClick={() => setShowHelp(true)}>?</button>
                </label>
                <select id="task-prioridade" className="form-select" value={form.prioridade} onChange={set('prioridade')}>
                  <option value="BAIXA">Baixa</option>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Data de Entrega <span className="required">*</span></label>
                  <input id="task-data" type="date" className="form-input" value={form.data} onChange={set('data')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora de Entrega <span className="required">*</span></label>
                  <input id="task-hora" type="time" className="form-input" value={form.hora} onChange={set('hora')} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="primary">Criar Tarefa</Button>
            </div>
          </form>
        </div>
      </div>

      {showHelp    && <PriorityHelpModal onClose={() => setShowHelp(false)} />}
      {showConfirm && <ConfirmCreateModal onConfirm={handleConfirm} onCancel={() => setShowConfirm(false)} loading={loading} />}
    </>
  );
}
