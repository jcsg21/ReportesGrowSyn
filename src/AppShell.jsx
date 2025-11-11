import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AppShell({ children }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const logout = () => {
    try { localStorage.removeItem('user'); } catch {}
    try { localStorage.removeItem('token'); } catch {}
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
        <h1 style={{ margin: 0 }}>🌿 GrowSync</h1>
      </div>
      <nav>
        <ul className="nav-links">
          <li><Link to="/reportes">Reportes</Link></li>
          <li>
            <button onClick={logout} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      &copy; 2025 Vivero La Reina | Todos los derechos reservados
    </footer>
  );
}
