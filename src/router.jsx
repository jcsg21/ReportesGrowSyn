import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ReportesBase from './components/ReportesBase.jsx';
import ReporteVentas from './components/ReporteVentas.jsx';
import ReporteVentasProducto from './components/ReporteVentasProducto.jsx';
import ReporteInventarios from './components/ReporteInventarios.jsx';
import ReporteProveedor from './components/ReporteProveedor.jsx';
import ReporteHistoricos from './components/ReporteHistoricos.jsx';
import ReporteHistoricoDetalle from './components/ReporteHistoricoDetalle.jsx';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<ReportesBase />} />
      <Route path="/reportes" element={<ReportesBase />} />
      <Route path="/reportes/ventas" element={<ReporteVentas />} />
      <Route path="/reportes/ventas-producto" element={<ReporteVentasProducto />} />
      <Route path="/reportes/inventarios" element={<ReporteInventarios />} />
      <Route path="/reportes/proveedor" element={<ReporteProveedor />} />
      <Route path="/reportes/historicos" element={<ReporteHistoricos />} />
      <Route path="/reportes/historicos/detalle" element={<ReporteHistoricoDetalle />} />
      <Route path="*" element={<div style={{padding:40}}>404 - Página no encontrada</div>} />
    </Routes>
  );
}
