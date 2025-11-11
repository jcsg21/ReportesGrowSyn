import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/ReportesBase.css';

// Nota: Garantizamos uso de íconos Free de FontAwesome 6 (fa-solid) para evitar que no carguen versiones Pro.
const reportes = [
  { key: 'reporte_proveedor', title: 'Reporte Proveedor', description: 'Analiza el stock por proveedor', icon: 'fa-solid fa-truck', color: '#6c757d', route: '/reportes/proveedor' },
  { key: 'reporte_ventas', title: 'Reporte de Ventas', description: 'Reportes detallados de ventas con estadísticas y gráficos', icon: 'fa-solid fa-chart-line', color: '#007bff', route: '/reportes/ventas' },
  { key: 'reporte_ventas_producto', title: 'Ventas por Producto', description: 'Productos más vendidos y su rendimiento', icon: 'fa-solid fa-cart-shopping', color: '#17a2b8', route: '/reportes/ventas-producto' },
  { key: 'reportes_historicos', title: 'Reportes Históricos', description: 'Consulta reportes generados', icon: 'fa-solid fa-clock', color: '#ffc107', route: '/reportes/historicos' },
  { key: 'reportes_inventarios', title: 'Reporte de Inventarios', description: 'Reportes de inventarios por categoría', icon: 'fa-solid fa-boxes', color: '#28a745', route: '/reportes/inventarios' }
];

export default function ReportesBase() {
  const navigate = useNavigate();
  return (
    <div className="reportes-container">
      <h2 className="reportes-title">Sistema de Reportes</h2>
      <div className="reportes-grid">
        {reportes.map(({ key, title, description, icon, color, route }) => (
          <div key={key} className="report-card" style={{ borderColor: color, cursor: 'pointer' }} onClick={() => navigate(route)}>
            <i className={`${icon} report-icon`} style={{ color }}></i>
            <h3 className="report-title">{title}</h3>
            <p className="report-description">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
