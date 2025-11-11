// Utilidad para historial de reportes usando localStorage
const KEY = 'growsync_report_history_v1';

function readAll() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function writeAll(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {} }

export function addHistory({ nombre, formato, resumen, filtros = {}, metadata = {} }) {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const fecha = new Date();
  const entry = { id, nombre, formato, fecha_generacion: fecha.toISOString(), resumen, filtros, metadata, enlace: `/reportes/historicos/detalle?id=${id}` };
  const all = readAll(); all.unshift(entry); writeAll(all); return entry;
}
export function getHistoryList() { return readAll(); }
export function getHistoryById(id) { return readAll().find(e => e.id === id) || null; }
export function clearHistory() { writeAll([]); }
