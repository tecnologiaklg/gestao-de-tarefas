import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { useUsuarios, useSetores } from '../../hooks/useData';
import { usuarioService } from '../../services/usuarioService';
import { Usuario } from '../../types';

const CARGOS = ['DIRETOR','GERENTE','COORDENADOR','FUNCIONARIO'];

function CreateUserModal({ setores, onClose, onSaved }: { setores: Array<{ id: number; nome: string }>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ nome: '', pin: '', cargo: 'FUNCIONARIO', setor_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.nome || !form.pin || form.pin.length !== 6) return setError('Nome e PIN de 6 dígitos são obrigatórios.');
    if (!/^\d{6}$/.test(form.pin)) return setError('PIN deve conter exatamente 6 dígitos numéricos.');
    if (form.pin === '000000') return setError('PIN 000000 é reservado para o Root.');
    setLoading(true); setError('');
    try {
      await usuarioService.criar({ nome: form.nome, pin: form.pin, cargo: form.cargo, setor_id: form.setor_id ? parseInt(form.setor_id) : null });
      onSaved(); onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? 'Erro ao criar usuário.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">👤 Novo Usuário</span>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Nome <span className="required">*</span></label>
            <input id="user-nome" className="form-input" value={form.nome} onChange={set('nome')} placeholder="Nome completo" />
          </div>
          <div className="form-group">
            <label className="form-label">PIN (6 dígitos) <span className="required">*</span></label>
            <input id="user-pin" className="form-input" value={form.pin} onChange={set('pin')} placeholder="______" maxLength={6} inputMode="numeric" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Cargo <span className="required">*</span></label>
              <select id="user-cargo" className="form-select" value={form.cargo} onChange={set('cargo')}>
                {CARGOS.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Setor</label>
              <select id="user-setor" className="form-select" value={form.setor_id} onChange={set('setor_id')}>
                <option value="">Sem setor</option>
                {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSave}>Criar Usuário</Button>
        </div>
      </div>
    </div>
  );
}

const cargoLabel: Record<string, string> = {
  DIRETOR: 'Diretor', GERENTE: 'Gerente', COORDENADOR: 'Coordenador', FUNCIONARIO: 'Funcionário',
};

export function RootUsuariosPage() {
  const { usuarios, loading, refetch } = useUsuarios();
  const { setores } = useSetores();
  const [showCreate, setShowCreate] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleToggle = async (u: Usuario) => {
    if (!confirm(`${u.ativo ? 'Desativar' : 'Ativar'} usuário "${u.nome}"?`)) return;
    setTogglingId(u.id);
    try {
      await usuarioService.alterarStatus(u.id, !u.ativo);
      refetch();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      alert(msg ?? 'Erro ao alterar status.');
    } finally { setTogglingId(null); }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Gerenciar colaboradores do sistema</p>
        </div>
        <Button id="btn-novo-usuario" variant="primary" onClick={() => setShowCreate(true)}>
          ＋ Novo Usuário
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--slate-400)' }}>Carregando usuários…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Setor</th>
              <th>Situação</th>
              <th>Discord</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: 'var(--space-8)' }}>Nenhum usuário cadastrado.</td></tr>
            )}
            {usuarios.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.nome}</td>
                <td>{cargoLabel[u.cargo] ?? u.cargo}</td>
                <td>{(u as Usuario & { setor_nome?: string }).setor_nome ?? <em style={{ color: 'var(--slate-400)' }}>Sem setor</em>}</td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 'var(--font-xs)', fontWeight: 700, padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: u.ativo ? 'var(--color-success-bg)' : 'var(--slate-100)',
                    color: u.ativo ? 'var(--color-success)' : 'var(--slate-500)',
                  }}>
                    {u.ativo ? '● Ativo' : '○ Inativo'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 'var(--font-xs)', color: u.discord_vinculado ? 'var(--color-primary)' : 'var(--slate-400)' }}>
                    {u.discord_vinculado ? '✓ Vinculado' : '— Não vinculado'}
                  </span>
                </td>
                <td>
                  <Button
                    variant={u.ativo ? 'danger' : 'secondary'}
                    size="sm"
                    loading={togglingId === u.id}
                    onClick={() => handleToggle(u)}
                  >
                    {u.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <CreateUserModal
          setores={setores}
          onClose={() => setShowCreate(false)}
          onSaved={refetch}
        />
      )}
    </AppLayout>
  );
}
