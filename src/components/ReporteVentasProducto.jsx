import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addHistory } from '../utils/reportHistory';

// Datos quemados
const datosProductoTodos = [
  { fecha: '2025-07-01', producto: 'Semillas A', total_vendido: 320.50, cantidad: 8 },
  { fecha: '2025-07-02', producto: 'Fertilizante B', total_vendido: 450.00, cantidad: 10 },
  { fecha: '2025-07-03', producto: 'Herramienta C', total_vendido: 680.75, cantidad: 4 },
  { fecha: '2025-07-04', producto: 'Semillas A', total_vendido: 210.20, cantidad: 5 },
  { fecha: '2025-07-05', producto: 'Fertilizante B', total_vendido: 520.00, cantidad: 11 },
  { fecha: '2025-07-06', producto: 'Herramienta C', total_vendido: 300.00, cantidad: 2 },
  { fecha: '2025-07-07', producto: 'Insumo D', total_vendido: 190.00, cantidad: 7 },
];
const datosProductoSemana = [
  { fecha: '2025-08-07', producto: 'Semillas A', total_vendido: 220.00, cantidad: 6 },
  { fecha: '2025-08-08', producto: 'Fertilizante B', total_vendido: 350.50, cantidad: 8 },
  { fecha: '2025-08-09', producto: 'Herramienta C', total_vendido: 480.00, cantidad: 3 },
  { fecha: '2025-08-10', producto: 'Semillas A', total_vendido: 260.75, cantidad: 7 },
  { fecha: '2025-08-11', producto: 'Insumo D', total_vendido: 310.20, cantidad: 9 },
  { fecha: '2025-08-12', producto: 'Fertilizante B', total_vendido: 299.90, cantidad: 7 },
  { fecha: '2025-08-13', producto: 'Herramienta C', total_vendido: 590.00, cantidad: 4 },
];
const datosProductoMes = [
  { fecha: '2025-08-01', producto: 'Semillas A', total_vendido: 200.00, cantidad: 5 },
  { fecha: '2025-08-02', producto: 'Fertilizante B', total_vendido: 180.40, cantidad: 4 },
  { fecha: '2025-08-03', producto: 'Herramienta C', total_vendido: 570.60, cantidad: 3 },
  { fecha: '2025-08-04', producto: 'Semillas A', total_vendido: 230.10, cantidad: 6 },
  { fecha: '2025-08-05', producto: 'Insumo D', total_vendido: 220.00, cantidad: 8 },
  { fecha: '2025-08-06', producto: 'Fertilizante B', total_vendido: 380.00, cantidad: 9 },
  ...datosProductoSemana,
];

export default function ReporteVentasProducto() {
  const [ventasProducto, setVentasProducto] = useState(datosProductoTodos);
  const [filtro, setFiltro] = useState('todos');
  const [metrica, setMetrica] = useState('total');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notification, setNotification] = useState('Reporte de ventas por producto listo para revisar.');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(()=>{ const t=setTimeout(()=> setNotification(''),5000); return ()=> clearTimeout(t);},[notification]);
  useEffect(()=> { const h=(e)=>{ if(dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);}; document.addEventListener('mousedown',h); return ()=> document.removeEventListener('mousedown',h);},[]);

  useEffect(()=> {
    if (filtro==='todos') setVentasProducto(datosProductoTodos);
    else if (filtro==='semana') setVentasProducto(datosProductoSemana);
    else if (filtro==='mes') setVentasProducto(datosProductoMes);
    else if (filtro==='anio') {
      const anio = new Date().getFullYear();
      const map = new Map();
      [...datosProductoTodos, ...datosProductoMes].forEach(v => { if (new Date(v.fecha).getFullYear()===anio) map.set(v.fecha+'|'+v.producto, v); });
      setVentasProducto([...map.values()]);
    } else setVentasProducto(datosProductoTodos);
  }, [filtro]);

  const totalVendido = ventasProducto.reduce((a,v)=> a+ Number(v.total_vendido),0);
  const totalCantidad = ventasProducto.reduce((a,v)=> a+ Number(v.cantidad),0);
  const promedioVenta = ventasProducto.length? totalVendido/ventasProducto.length:0;

  const agregados = ventasProducto.reduce((acc,v)=> { if(!acc[v.producto]) acc[v.producto]={ total:0, cantidad:0 }; acc[v.producto].total += Number(v.total_vendido); acc[v.producto].cantidad += Number(v.cantidad); return acc; },{});
  const entries = Object.entries(agregados).map(([producto,vals])=> ({ producto, ...vals })).sort((a,b)=> metrica==='total'? b.total - a.total : b.cantidad - a.cantidad);

  const data = { labels: entries.map(e=> e.producto), datasets:[ { label: metrica==='total'? 'Total vendido ($)' : 'Cantidad vendida', data: entries.map(e=> metrica==='total'? e.total : e.cantidad), backgroundColor:'rgba(44,95,45,0.8)', borderColor:'rgba(30,62,31,1)', borderWidth:1.5, borderRadius:6 } ] };
  const options = { responsive:true, maintainAspectRatio:false, indexAxis:'y', plugins:{ legend:{ position:'top' } }, scales:{ x:{ beginAtZero:true, ticks:{ callback:(v)=> metrica==='total'? '$'+Number(v).toLocaleString(): Number(v) } }, y:{} } };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Ventas por Producto',14,16);
    autoTable(doc,{ head:[['Fecha','Producto','Total Vendido','Cantidad']], body: ventasProducto.map(v=>[v.fecha,v.producto,'$'+Number(v.total_vendido).toFixed(2), v.cantidad]) });
    doc.text(`Total Vendido: $${totalVendido.toFixed(2)}`,14, doc.lastAutoTable.finalY+10);
    doc.text(`Total Cantidad: ${totalCantidad}`,14, doc.lastAutoTable.finalY+18);
    doc.text(`Promedio Venta: $${promedioVenta.toFixed(2)}`,14, doc.lastAutoTable.finalY+26);
    doc.save('reporte_ventas_producto.pdf');
    addHistory({ nombre:'Reporte de Ventas por Producto', formato:'PDF', resumen:`Filas: ${ventasProducto.length} | Total: $${totalVendido.toFixed(2)}`, filtros:{ tipo:filtro, metrica }, metadata:{ totalVendido, totalCantidad, promedioVenta } });
  };
  const exportCSV = () => { let csv='Fecha,Producto,Total Vendido,Cantidad\n'; ventasProducto.forEach(v=> { csv += `${v.fecha},${v.producto},${Number(v.total_vendido).toFixed(2)},${v.cantidad}\n`; }); csv += `Total Vendido,${totalVendido.toFixed(2)}\nTotal Cantidad,${totalCantidad}\nPromedio Venta,${promedioVenta.toFixed(2)}\n`; const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='reporte_ventas_producto.csv'; a.click(); URL.revokeObjectURL(url); addHistory({ nombre:'Reporte de Ventas por Producto', formato:'CSV', resumen:`Filas: ${ventasProducto.length} | Total: $${totalVendido.toFixed(2)}`, filtros:{ tipo:filtro, metrica }, metadata:{ totalVendido, totalCantidad, promedioVenta } }); };
  const exportWord = () => { let html='<h1>Reporte de Ventas por Producto</h1><table border="1" style="border-collapse:collapse"><tr><th>Fecha</th><th>Producto</th><th>Total</th><th>Cantidad</th></tr>'; ventasProducto.forEach(v=> { html += `<tr><td>${v.fecha}</td><td>${v.producto}</td><td>$${Number(v.total_vendido).toFixed(2)}</td><td>${v.cantidad}</td></tr>`; }); html+='</table>'; html += `<p><strong>Total Vendido:</strong> $${totalVendido.toFixed(2)}</p>`; html += `<p><strong>Total Cantidad:</strong> ${totalCantidad}</p>`; html += `<p><strong>Promedio Venta:</strong> $${promedioVenta.toFixed(2)}</p>`; const blob=new Blob(['\ufeff'+html],{type:'application/msword'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='reporte_ventas_producto.doc'; a.click(); URL.revokeObjectURL(url); addHistory({ nombre:'Reporte de Ventas por Producto', formato:'Word', resumen:`Filas: ${ventasProducto.length} | Total: $${totalVendido.toFixed(2)}`, filtros:{ tipo:filtro, metrica }, metadata:{ totalVendido, totalCantidad, promedioVenta } }); };

  return (
    <div style={{ maxWidth:'100%', padding:20 }}>
      <button onClick={()=> navigate('/reportes')} style={{ marginBottom:10, background:'none', border:'none', color:'#28a745' }}>← Regresar a Reportes</button>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:12 }}>
        <div><label style={{ fontWeight:600, marginRight:8 }}>Filtro:</label><select value={filtro} onChange={e=> setFiltro(e.target.value)}><option value="todos">Todos</option><option value="semana">Semana</option><option value="mes">Mes</option><option value="anio">Año</option></select></div>
        <div><label style={{ fontWeight:600, marginRight:8 }}>Métrica:</label><select value={metrica} onChange={e=> setMetrica(e.target.value)}><option value="total">Total ($)</option><option value="cantidad">Cantidad</option></select></div>
      </div>
      <div style={{ width:'100%', height:'60vh', marginBottom:20 }}><Bar data={data} options={options} /></div>
      <div style={{ marginBottom:20, position:'relative', display:'inline-block' }} ref={dropdownRef}>
        <button onClick={()=> setShowDropdown(!showDropdown)} style={{ background:'#28a745', color:'#fff', padding:'8px 16px', border:'none', borderRadius:5 }}>Exportar ▼</button>
        {showDropdown && <div style={{ position:'absolute', background:'#f9f9f9', minWidth:160, boxShadow:'0 8px 16px rgba(0,0,0,0.2)', borderRadius:4 }}>
          <button onClick={exportPDF} style={menuBtn}>Descargar PDF</button>
          <button onClick={exportCSV} style={menuBtn}>Descargar CSV</button>
          <button onClick={exportWord} style={menuBtn}>Descargar Word</button>
        </div>}
      </div>
      <div style={{ width:'100%', overflowX:'auto' }}>
        <table className="table table-striped" style={{ minWidth:500 }}>
          <thead><tr><th>Fecha</th><th>Producto</th><th>Total Vendido</th><th>Cantidad</th></tr></thead>
          <tbody>{ventasProducto.map((v,i)=>(<tr key={i}><td>{v.fecha}</td><td>{v.producto}</td><td>${Number(v.total_vendido).toFixed(2)}</td><td>{v.cantidad}</td></tr>))}</tbody>
        </table>
      </div>
      {notification && <div style={{ background:'#d4edda', color:'#155724', padding:10, borderRadius:5, marginTop:10 }}>{notification}</div>}
    </div>
  );
}

const menuBtn = { display:'block', width:'100%', padding:'8px 16px', border:'none', background:'none', textAlign:'left', cursor:'pointer' };
