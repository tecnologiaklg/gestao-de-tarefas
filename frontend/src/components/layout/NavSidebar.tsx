import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const cargoLabel: Record<string, string> = {
  DIRETOR: 'Diretor', GERENTE: 'Gerente', COORDENADOR: 'Coordenador', FUNCIONARIO: 'Funcionário',
};

export function NavSidebar() {
  const { user, isRoot, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = (user?.nome ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">GT</div>
        <div>
          <div className="sidebar-logo-text">Gestão de Tarefas</div>
          <div className="sidebar-logo-sub">Portal Interno</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {!isRoot && (
          <>
            <div className="sidebar-section-label">Meu Trabalho</div>
            <NavLink to="/minhas-tarefas" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon">📋</span> Minhas Tarefas
            </NavLink>
            <NavLink to="/criadas-por-mim" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon">✏️</span> Criadas por Mim
            </NavLink>
            {user?.cargo === 'COORDENADOR' && (
              <>
                <div className="sidebar-section-label" style={{ marginTop: 'var(--space-4)' }}>Organização</div>
                <NavLink to="/minha-equipe" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
                  <span className="icon">👥</span> Minha Equipe
                </NavLink>
              </>
            )}
          </>
        )}

        {isRoot && (
          <>
            <div className="sidebar-section-label">Administração</div>
            <NavLink to="/root/equipes" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon">🏢</span> Equipes
            </NavLink>
            <NavLink to="/root/usuarios" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon">👤</span> Usuários
            </NavLink>
            <NavLink to="/root/logs" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon">📊</span> Logs
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer com usuário */}
      <div className="sidebar-footer">
        <div className="user-chip" onClick={handleLogout} title="Clique para sair">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name truncate">{user?.nome ?? 'Root'}</div>
            <div className="user-cargo">{isRoot ? 'Administrador' : cargoLabel[user?.cargo ?? ''] ?? ''} · Sair</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
