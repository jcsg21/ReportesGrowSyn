import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistoryList } from '../utils/reportHistory';

export default function ReporteHistoricos() {
  const [reportes, setReportes] = useState([]);
  const navigate = useNavigate();

  useEffect(()=> { setReportes(getHistoryList()); },[]);
  const verDetalle = (id) => navigate(`/reportes/historicos/detalle?id=${id}`);

  return (
    <div style={{ padding:20 }}>
      <button onClick={()=> navigate('/reportes')} style={{ marginBottom:10, background:'none', border:'none', color:'green' }}>← Regresar a Reportes</button>
      <h2>Reportes Históricos</h2>
      <table className="table table-striped" style={{ width:'100%' }}>
        <thead><tr><th>Nombre</th><th>Fecha</th><th>Resumen</th><th>Acciones</th></tr></thead>
        <tbody>
          {reportes.map(r=> (
            <tr key={r.id}>
              <td>{r.nombre} ({r.formato})</td>
              <td>{new Date(r.fecha_generacion).toLocaleString()}</td>
              <td>{r.resumen}</td>
              <td><button onClick={()=> verDetalle(r.id)} className="btn btn-primary">Ver Detalle</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
