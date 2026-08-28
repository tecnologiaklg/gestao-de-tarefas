import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { useUsuarios, useSetores } from '../../hooks/useData';
import { usuarioService } from '../../services/usuarioService';
import { Usuario } from '../../types';

const CARGOS = ['DIRETOR','GERENTE','COORDENADOR','FUNCIONARIO'];

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function CreateUserModal({ setores, onClose, onSaved }: { setores: Array<{ id: number; nome: string }>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ nome: '', pin: '', cargo: 'FUNCIONARIO', setor_id: '' });
  const [loading, setLoading] = useState(false);
  const [generatingPin, setGeneratingPin] = useState(false);
  const [error, setError]     = useState('');

  const handleGerarPin = async () => {
    setGeneratingPin(true);
    try {
      const pin = await usuarioService.gerarPin();
      setForm(f => ({ ...f, pin }));
    } catch {
      // Fallback
    } finally {
      setGeneratingPin(false);
    }
  };

  useEffect(() => {
    handleGerarPin();
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.nome.trim()) return setError('Nome é obrigatório.');
    if (!form.pin || form.pin.length !== 6) return setError('PIN de 6 dígitos é obrigatório.');
    if (!/^\d{6}$/.test(form.pin)) return setError('PIN deve conter exatamente 6 dígitos numéricos.');
    if (form.pin === '000000') return setError('PIN 000000 é reservado para o Root.');
    setLoading(true); setError('');
    try {
      await usuarioService.criar({
        nome: form.nome.trim(),
        pin: form.pin,
        cargo: form.cargo,
        setor_id: form.setor_id ? parseInt(form.setor_id) : null
      });
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
          <span className="modal-title">Novo Usuário</span>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Primeiro e último nome <span className="required">*</span></label>
            <input
              id="user-nome"
              className="form-input"
              value={form.nome}
              onChange={set('nome')}
              placeholder="Ex: João Zanin"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)', marginTop: 2 }}>
              Informe o primeiro e último nome (ou nome completo/diferenciador caso existam homônimos na empresa).
            </span>
          </div>
          <div className="form-group">
            <label className="form-label">PIN (6 dígitos) <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="user-pin"
                className="form-input"
                value={form.pin}
                onChange={set('pin')}
                placeholder="______"
                maxLength={6}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 'var(--font-md)',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGerarPin}
                loading={generatingPin}
                title="Gerar outro PIN aleatório único"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', whiteSpace: 'nowrap' }}
              >
                <IconRefresh />
                <span>Gerar outro</span>
              </Button>
            </div>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)', marginTop: 2 }}>
              PIN gerado aleatoriamente e validado contra o banco de dados.
            </span>
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
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--stone-400)' }}>
          <div className="spinner spinner-dark spinner-lg" style={{ margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: 'var(--font-sm)' }}>Carregando usuários…</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Nome</th>
                <th style={{ width: '18%' }}>Cargo</th>
                <th style={{ width: '20%' }}>Setor</th>
                <th style={{ width: '14%' }}>Situação</th>
                <th style={{ width: '12%' }}>Discord</th>
                <th style={{ width: '8%', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--stone-400)', padding: 'var(--space-12)' }}>Nenhum usuário cadastrado.</td></tr>
              )}
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--stone-900)' }}>{u.nome}</span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      fontSize: 'var(--font-xs)', fontWeight: 600, padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--stone-100)', color: 'var(--stone-600)',
                      border: '1px solid var(--stone-200)',
                    }}>
                      {cargoLabel[u.cargo] ?? u.cargo}
                    </span>
                  </td>
                  <td style={{ color: 'var(--stone-600)' }}>
                    {(u as Usuario & { setor_nome?: string }).setor_nome ?? (
                      <em style={{ color: 'var(--stone-400)', fontStyle: 'normal', fontSize: 'var(--font-xs)' }}>Sem setor</em>
                    )}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 'var(--font-xs)', fontWeight: 700, padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      background: u.ativo ? 'var(--color-success-bg)' : 'var(--stone-100)',
                      color: u.ativo ? 'var(--color-success)' : 'var(--stone-500)',
                      border: `1px solid ${u.ativo ? 'var(--color-success-border)' : 'var(--stone-200)'}`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    {u.discord_vinculado ? (
                      <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Vinculado
                      </span>
                    ) : (
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)' }}>Não vinculado</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
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
        </div>
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
