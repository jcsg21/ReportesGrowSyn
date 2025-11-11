import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import Router from './router.jsx';
import './styles/global.css';
import AppShell from './AppShell.jsx';

// Cargar config.json antes de montar app
async function bootstrap() {
  let config = { apiBase: '', reports: { ventas: '/api/reportes/ventas' } };
  try {
    const resp = await fetch('./config.json', { cache: 'no-store' });
    if (resp.ok) config = await resp.json();
  } catch {}
  window.APP_CONFIG = config;

  const mount = () => {
    const root = createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <HashRouter>
          <AppShell>
            <Router />
          </AppShell>
        </HashRouter>
      </React.StrictMode>
    );
  };

  // Si se entra sin hash (GitHub Pages primera carga), redirige a #/inicio antes de montar
  if (!window.location.hash || window.location.hash === '#/' ) {
    window.location.replace(window.location.href.replace(/(#.*)?$/, '#/inicio'));
    // Montar después de asegurar el hash
    setTimeout(mount, 0);
  } else {
    mount();
  }
}

bootstrap();
