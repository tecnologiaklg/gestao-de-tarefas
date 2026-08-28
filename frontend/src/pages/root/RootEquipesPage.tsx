import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { useSetores } from '../../hooks/useData';
import { setorService } from '../../services/setorService';
import { Setor } from '../../types';

function IconUsers() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCoordinator() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function SetorModal({ setor, onClose, onSaved }: { setor?: Setor | null; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome]   = useState(setor?.nome ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!nome.trim()) return setError('Nome do setor é obrigatório.');
    setLoading(true);
    setError('');
    try {
      if (setor) await setorService.atualizar(setor.id, nome.trim());
      else       await setorService.criar(nome.trim());
      onSaved();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? 'Erro ao salvar setor.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{setor ? 'Editar Setor' : 'Novo Setor'}</span>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Nome <span className="required">*</span></label>
            <input id="setor-nome" className="form-input" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Tecnologia" autoComplete="off" spellCheck={false} autoFocus />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSave}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

export function RootEquipesPage() {
  const { setores, loading, refetch } = useSetores();
  const [modal, setModal] = useState<{ setor?: Setor } | null>(null);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipes</h1>
          <p className="page-subtitle">Setores e estruturas cadastrados no sistema</p>
        </div>
        <Button id="btn-novo-setor" variant="primary" onClick={() => setModal({})}>
          ＋ Novo Setor
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--stone-400)' }}>Carregando setores…</div>
      ) : (
        <div className="sector-grid">
          {setores.map(s => {
            const coords = s.coordenadores && s.coordenadores.length > 0
              ? s.coordenadores.map(c => c.nome).join(', ')
              : null;
            const initial = s.nome.charAt(0).toUpperCase();

            return (
              <div key={s.id} className="sector-card">
                <div className="sector-card-top">
                  <div className="sector-card-header">
                    <div className="sector-icon-badge">{initial}</div>
                    <div className="sector-info-header">
                      <h3 className="sector-card-name">{s.nome}</h3>
                      <span className="sector-members-pill">
                        <IconUsers />
                        <span>{s.total_membros ?? 0} {s.total_membros === 1 ? 'colaborador' : 'colaboradores'}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="sector-edit-btn"
                    onClick={() => setModal({ setor: s })}
                    title="Editar setor"
                  >
                    <IconEdit />
                    <span>Editar</span>
                  </button>
                </div>

                <div className="sector-card-body">
                  <div className="sector-coord-block">
                    <span className="sector-coord-label">Liderança / Coordenação</span>
                    <div className="sector-coord-value">
                      <IconCoordinator />
                      <span className={coords ? 'has-coord' : 'no-coord'}>
                        {coords || 'Sem coordenador'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== null && (
        <SetorModal
          setor={modal.setor}
          onClose={() => setModal(null)}
          onSaved={refetch}
        />
      )}
    </AppLayout>
  );
}
