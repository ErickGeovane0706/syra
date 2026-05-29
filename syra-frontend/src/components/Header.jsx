import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Início' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/agendar', label: 'Agenda' },
  { to: '/contato', label: 'Contato' },
];

export default function Header({ session, isAdmin, authBusy, onGoogleLogin, onOpenAuth, onLogout }) {
  return (
    <header className="site-header">
      <div className="site-shell nav-shell">
        <NavLink className="brand" to="/">
          <span className="brand-mark">S</span>
          <div>
            <strong>Syra Estética</strong>
            <small>Monteiro · Paraíba</small>
          </div>
        </NavLink>

        <nav className="main-nav" aria-label="Principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
          {session ? (
            <NavLink
              to="/meus-agendamentos"
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              Meus Agendamentos
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="header-actions">
          {session ? (
            <div className="user-chip">
              {session.fotoPerfilUrl ? (
                <img src={session.fotoPerfilUrl} alt={session.nome} className="user-avatar" />
              ) : (
                <span className="user-avatar user-avatar-fallback">
                  {session.nome?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              )}
              <div>
                <strong>{session.nome}</strong>
                <small>{isAdmin ? 'Administradora' : 'Cliente'}</small>
              </div>
            </div>
          ) : null}

          {session ? (
            <button type="button" className="ghost-button" onClick={onLogout}>
              Sair
            </button>
          ) : (
            <button
              type="button"
              className="header-cta"
              onClick={onGoogleLogin}
              disabled={authBusy}
            >
              {authBusy ? 'Aguarde...' : 'Entrar com Google'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
