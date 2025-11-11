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
}

bootstrap();
