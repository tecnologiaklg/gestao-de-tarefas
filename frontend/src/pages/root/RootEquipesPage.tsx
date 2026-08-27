import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { useSetores } from '../../hooks/useData';
import { setorService } from '../../services/setorService';
import { Setor } from '../../types';

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
          <span className="modal-title">{setor ? '✏️ Editar Setor' : '🏢 Novo Setor'}</span>
          <button className="sidebar-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Nome <span className="required">*</span></label>
            <input id="setor-nome" className="form-input" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Tecnologia" autoFocus />
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
          <p className="page-subtitle">Setores cadastrados no sistema</p>
        </div>
        <Button id="btn-novo-setor" variant="primary" onClick={() => setModal({})}>
          ＋ Novo Setor
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--slate-400)' }}>Carregando setores…</div>
      ) : (
        <div className="sector-grid">
          {setores.map(s => (
            <div key={s.id} className="sector-card">
              <div className="sector-card-name">🏢 {s.nome}</div>
              <div className="sector-meta">
                <span>👥</span>
                <span>{s.total_membros ?? 0} membro(s)</span>
              </div>
              {s.coordenadores && s.coordenadores.length > 0 && (
                <div className="sector-meta">
                  <span>⭐</span>
                  <span>{s.coordenadores.map(c => c.nome).join(', ')}</span>
                </div>
              )}
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)' }}>
                <Button variant="secondary" size="sm" onClick={() => setModal({ setor: s })}>
                  Editar
                </Button>
              </div>
            </div>
          ))}
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
