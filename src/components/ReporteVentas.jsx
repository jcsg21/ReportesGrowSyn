import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addHistory } from '../utils/reportHistory';

// Fallback datos quemados
const datosPruebaJulio = [
  { fecha: '2025-07-01', total_vendido: 1500.50, cantidad: 30 },
  { fecha: '2025-07-02', total_vendido: 1200.00, cantidad: 25 },
  { fecha: '2025-07-03', total_vendido: 1800.75, cantidad: 40 },
  { fecha: '2025-07-04', total_vendido: 1600.20, cantidad: 35 },
  { fecha: '2025-07-05', total_vendido: 2000.00, cantidad: 50 },
  { fecha: '2025-07-06', total_vendido: 2100.00, cantidad: 45 },
  { fecha: '2025-07-07', total_vendido: 1900.00, cantidad: 38 },
];
const datosPruebaSemana = [
  { fecha: '2025-08-07', total_vendido: 1100.00, cantidad: 22 },
  { fecha: '2025-08-08', total_vendido: 1350.50, cantidad: 27 },
  { fecha: '2025-08-09', total_vendido: 980.00, cantidad: 19 },
  { fecha: '2025-08-10', total_vendido: 1600.75, cantidad: 31 },
  { fecha: '2025-08-11', total_vendido: 1750.20, cantidad: 33 },
  { fecha: '2025-08-12', total_vendido: 1499.90, cantidad: 28 },
  { fecha: '2025-08-13', total_vendido: 1890.00, cantidad: 36 },
];
const datosPruebaMes = [
  { fecha: '2025-08-01', total_vendido: 1200.00, cantidad: 24 },
  { fecha: '2025-08-02', total_vendido: 980.40, cantidad: 18 },
  { fecha: '2025-08-03', total_vendido: 1570.60, cantidad: 29 },
  { fecha: '2025-08-04', total_vendido: 1430.10, cantidad: 26 },
  { fecha: '2025-08-05', total_vendido: 1320.00, cantidad: 25 },
  { fecha: '2025-08-06', total_vendido: 1680.00, cantidad: 30 },
  ...datosPruebaSemana
];

export default function ReporteVentas() {
  const [ventas, setVentas] = useState(datosPruebaJulio);
  const [filtro, setFiltro] = useState('todos');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notification, setNotification] = useState('Reporte de ventas listo para revisar.');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Intentar obtener datos reales si config apiBase disponible
  useEffect(() => {
    async function fetchReal() {
      const cfg = window.APP_CONFIG || {}; 
      if (!cfg.apiBase) return; // sin backend, usar mock
      try {
        const url = cfg.apiBase.replace(/\/$/, '') + (cfg.reports?.ventas || '/api/reportes/ventas');
        const resp = await fetch(url);
        if (resp.ok) {
          const data = await resp.json();
          // Normalizar campos esperados
          const normal = data.map(r => ({
            fecha: r.fecha || r.date || r.day || '',
            total_vendido: Number(r.total_vendido ?? r.total ?? 0),
            cantidad: Number(r.cantidad ?? r.qty ?? 0)
          })).sort((a,b)=> new Date(a.fecha) - new Date(b.fecha));
          if (normal.length) {
            setVentas(normal);
            setFiltro('todos');
            setNotification('Datos reales cargados desde backend.');
          }
        }
      } catch (e) {
        console.warn('No se pudieron cargar datos reales, usando mock.', e);
      }
    }
    fetchReal();
  }, []);

  useEffect(() => {
    const t = setTimeout(()=> setNotification(''), 5000);
    return () => clearTimeout(t);
  }, [notification]);

  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtrarVentas = (tipo) => {
    if (tipo === 'todos') return datosPruebaJulio;
    if (tipo === 'semana') return datosPruebaSemana;
    if (tipo === 'mes') return datosPruebaMes;
    if (tipo === 'anio') {
      const año = new Date().getFullYear();
      const map = new Map();
      [...datosPruebaJulio, ...datosPruebaMes].forEach(v => { if (new Date(v.fecha).getFullYear() === año) map.set(v.fecha, v); });
      return [...map.values()];
    }
    return datosPruebaJulio;
  };

  useEffect(() => {
    if (!window.APP_CONFIG?.apiBase) {
      // Solo cambiar datos mock si no hay backend real
      setVentas(filtrarVentas(filtro));
    }
  }, [filtro]);

  const totalVendido = ventas.reduce((a,v)=> a + Number(v.total_vendido),0);
  const totalCantidad = ventas.reduce((a,v)=> a + Number(v.cantidad),0);
  const promedioVenta = ventas.length ? totalVendido / ventas.length : 0;

  const data = {
    labels: ventas.map(v=> v.fecha),
    datasets: [
      { type:'bar', label:'Total vendido', data: ventas.map(v=> Number(v.total_vendido)), backgroundColor:'rgba(44,95,45,0.7)', borderColor:'rgba(30,62,31,1)', borderWidth:1.5, borderRadius:6, yAxisID:'y' },
      { type:'line', label:'Cantidad', data: ventas.map(v=> Number(v.cantidad)), borderColor:'#ff8c00', backgroundColor:'rgba(255,165,0,0.15)', borderWidth:2, tension:0.3, pointRadius:3, yAxisID:'y1' }
    ]
  };

  const options = {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{
      legend:{ position:'top' },
      tooltip:{ mode:'index', intersect:false }
    },
    scales:{
      y:{ beginAtZero:true, ticks:{ callback:(v)=> '$'+Number(v).toLocaleString()} },
      y1:{ position:'right', beginAtZero:true }
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Ventas',14,16);
    autoTable(doc,{ head:[['Fecha','Total Vendido','Cantidad']], body: ventas.map(v=>[v.fecha,'$'+Number(v.total_vendido).toFixed(2), v.cantidad]) });
    doc.text(`Total Vendido: $${totalVendido.toFixed(2)}`,14, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Cantidad: ${totalCantidad}` ,14, doc.lastAutoTable.finalY + 18);
    doc.text(`Promedio Venta: $${promedioVenta.toFixed(2)}`,14, doc.lastAutoTable.finalY + 26);
    doc.save('reporte_ventas.pdf');
    addHistory({ nombre:'Reporte de Ventas', formato:'PDF', resumen:`Filas: ${ventas.length} | Total: $${totalVendido.toFixed(2)}`, filtros:{ tipo:filtro }, metadata:{ totalVendido, totalCantidad, promedioVenta } });
  };
  const exportCSV = () => {
    let csv = 'Fecha,Total Vendido,Cantidad\n';
    ventas.forEach(v=> { csv += `${v.fecha},${Number(v.total_vendido).toFixed(2)},${v.cantidad}\n`; });
    csv += `Total Vendido,${totalVendido.toFixed(2)}\nTotal Cantidad,${totalCantidad}\nPromedio Venta,${promedioVenta.toFixed(2)}\n`;
    const blob = new Blob([csv],{type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='reporte_ventas.csv'; a.click(); URL.revokeObjectURL(url);
    addHistory({ nombre:'Reporte de Ventas', formato:'CSV', resumen:`Filas: ${ventas.length} | Total: $${totalVendido.toFixed(2)}`, filtros:{ tipo:filtro }, metadata:{ totalVendido, totalCantidad, promedioVenta } });
  };
  const exportWord = () => {
    let html = '<h1>Reporte de Ventas</h1><table border="1" style="border-collapse:collapse"><tr><th>Fecha</th><th>Total</th><th>Cantidad</th></tr>';
    ventas.forEach(v=> { html += `<tr><td>${v.fecha}</td><td>$${Number(v.total_vendido).toFixed(2)}</td><td>${v.cantidad}</td></tr>`; });
    html += '</table>';
    html += `<p><strong>Total Vendido:</strong> $${totalVendido.toFixed(2)}</p>`;
    html += `<p><strong>Total Cantidad:</strong> ${totalCantidad}</p>`;
    html += `<p><strong>Promedio Venta:</strong> $${promedioVenta.toFixed(2)}</p>`;
    const blob = new Blob(['\ufeff'+html],{type:'application/msword'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='reporte_ventas.doc'; a.click(); URL.revokeObjectURL(url);
    addHistory({ nombre:'Reporte de Ventas', formato:'Word', resumen:`Filas: ${ventas.length} | Total: $${totalVendido.toFixed(2)}`, filtros:{ tipo:filtro }, metadata:{ totalVendido, totalCantidad, promedioVenta } });
  };

  return (
    <div style={{ maxWidth:'100%', padding:'20px', fontFamily:'Segoe UI, sans-serif' }}>
      <button onClick={()=> navigate('/reportes')} style={{ marginBottom:20, border:'2px solid #2C5F2D', background:'none', color:'#2C5F2D', padding:'8px 16px', borderRadius:6 }}>← Regresar a Reportes</button>
      <div style={{ marginBottom:20 }}>
        <label htmlFor="filtro" style={{ marginRight:10, fontWeight:600 }}>Filtrar por:</label>
        <select id="filtro" value={filtro} onChange={e=> setFiltro(e.target.value)} style={{ padding:'5px 10px', borderRadius:4 }}>
          <option value="todos">Todos</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
          <option value="anio">Año</option>
        </select>
      </div>
      <div style={{ width:'100%', height:'60vh', marginBottom:20, background:'#fff', boxShadow:'0 4px 8px rgba(0,0,0,0.1)', borderRadius:8, padding:10 }}>
        <Bar data={data} options={options} />
      </div>
      <div style={{ marginBottom:20, position:'relative', display:'inline-block' }} ref={dropdownRef}>
        <button onClick={()=> setShowDropdown(!showDropdown)} style={{ background:'#2C5F2D', color:'#fff', padding:'8px 16px', border:'none', borderRadius:5 }}>Exportar ▼</button>
        {showDropdown && (
          <div style={{ position:'absolute', background:'#f9f9f9', minWidth:160, boxShadow:'0 8px 16px rgba(0,0,0,0.2)', zIndex:10, borderRadius:4 }}>
            <button onClick={exportPDF} style={btnMenuStyle}>Descargar PDF</button>
            <button onClick={exportCSV} style={btnMenuStyle}>Descargar CSV</button>
            <button onClick={exportWord} style={btnMenuStyle}>Descargar Word</button>
          </div>
        )}
      </div>
      <div style={{ width:'100%', overflowX:'auto', background:'#fff', boxShadow:'0 4px 8px rgba(0,0,0,0.1)', borderRadius:8, padding:10 }}>
        <table className="table table-striped" style={{ minWidth:400 }}>
          <thead><tr><th>Fecha</th><th>Total Vendido</th><th>Cantidad</th></tr></thead>
          <tbody>
            {ventas.map((v,i)=>(<tr key={i}><td>{v.fecha}</td><td>${Number(v.total_vendido).toFixed(2)}</td><td>{v.cantidad}</td></tr>))}
          </tbody>
        </table>
      </div>
      {notification && <div style={{ background:'#d4edda', color:'#155724', padding:10, borderRadius:5, marginTop:10 }}>{notification}</div>}
    </div>
  );
}

const btnMenuStyle = { display:'block', width:'100%', padding:'8px 16px', border:'none', background:'none', textAlign:'left', cursor:'pointer' };
