import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const cargoLabel: Record<string, string> = {
  DIRETOR: 'Diretor', GERENTE: 'Gerente', COORDENADOR: 'Coordenador', FUNCIONARIO: 'Funcionário',
};

/* ── SVG Icons ────────────────────────────────────────────── */
function IconTasks() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5" />
      <rect x="9" y="2" width="5" height="5" rx="1.5" fill="currentColor" />
      <rect x="2" y="9" width="5" height="5" rx="1.5" fill="currentColor" />
      <rect x="9" y="9" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconTeam() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLogs() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ── Component ────────────────────────────────────────────── */
export function NavSidebar() {
  const { user, isRoot, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = (user?.nome ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/logoklg.png" alt="KLG" className="sidebar-logo-img" />
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
              <span className="icon"><IconTasks /></span>
              Minhas Tarefas
            </NavLink>
            <NavLink to="/criadas-por-mim" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon"><IconEdit /></span>
              Criadas por Mim
            </NavLink>
            {user?.cargo === 'COORDENADOR' && (
              <>
                <div className="sidebar-section-label" style={{ marginTop: 'var(--space-3)' }}>Organização</div>
                <NavLink to="/minha-equipe" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
                  <span className="icon"><IconTeam /></span>
                  Minha Equipe
                </NavLink>
              </>
            )}
          </>
        )}

        {isRoot && (
          <>
            <div className="sidebar-section-label">Administração</div>
            <NavLink to="/root/equipes" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon"><IconBuilding /></span>
              Equipes
            </NavLink>
            <NavLink to="/root/usuarios" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon"><IconUser /></span>
              Usuários
            </NavLink>
            <NavLink to="/root/logs" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="icon"><IconLogs /></span>
              Logs
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name truncate">{user?.nome ?? 'Root'}</div>
            <div className="user-cargo">{isRoot ? 'Administrador' : cargoLabel[user?.cargo ?? ''] ?? ''}</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <IconLogout />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
