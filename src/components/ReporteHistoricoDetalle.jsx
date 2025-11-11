import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHistoryById } from '../utils/reportHistory';

export default function ReporteHistoricoDetalle() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const reporte = id ? getHistoryById(id) : null;

  if (!reporte) {
    return (
      <div style={{ padding:20 }}>
        <h2>Detalle del Reporte Histórico</h2>
        <p>No se encontró información del reporte.</p>
        <button onClick={()=> navigate('/reportes/historicos')} className="btn btn-secondary">Volver a Reportes Históricos</button>
      </div>
    );
  }
  return (
    <div style={{ padding:20 }}>
      <h2>{reporte.nombre} ({reporte.formato})</h2>
      <p><strong>Fecha de Generación:</strong> {new Date(reporte.fecha_generacion).toLocaleString()}</p>
      <p><strong>Resumen:</strong> {reporte.resumen}</p>
      <p><strong>Filtros:</strong> <code>{JSON.stringify(reporte.filtros)}</code></p>
      <p><strong>Metadata:</strong> <code>{JSON.stringify(reporte.metadata)}</code></p>
      <button onClick={()=> navigate('/reportes/historicos')} className="btn btn-secondary">Volver a Reportes Históricos</button>
    </div>
  );
}
