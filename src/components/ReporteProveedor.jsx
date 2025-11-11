import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const datosPrueba = [
  { nombre: 'Fertilizante Orgánico', cantidad: 120, estado_stock: 'Disponible', fecha_actualizacion: '2024-04-01' },
  { nombre: 'Maceta Plástica', cantidad: 80, estado_stock: 'Disponible', fecha_actualizacion: '2024-04-02' },
  { nombre: 'Tierra para Plantas', cantidad: 50, estado_stock: 'Bajo', fecha_actualizacion: '2024-03-30' },
  { nombre: 'Semillas de Tomate', cantidad: 200, estado_stock: 'Disponible', fecha_actualizacion: '2024-04-03' },
  { nombre: 'Herramientas de Jardinería', cantidad: 15, estado_stock: 'Agotado', fecha_actualizacion: '2024-03-28' },
];

export default function ReporteProveedor() {
  const [inventario, setInventario] = useState(datosPrueba);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notification, setNotification] = useState('Reporte de inventarios por proveedor listo para revisar.');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(()=>{ setInventario(datosPrueba); const t=setTimeout(()=> setNotification(''),5000); return ()=> clearTimeout(t); },[]);
  useEffect(()=> { const h=(e)=>{ if(dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); }; document.addEventListener('mousedown',h); return ()=> document.removeEventListener('mousedown',h); },[]);

  const data = { labels: inventario.map(i=> i.nombre), datasets:[{ label:'Cantidad en stock', data: inventario.map(i=> i.cantidad), backgroundColor:'#2C5F2D', borderColor:'#1e3e1f', borderWidth:1 }] };

  const exportPDF = () => { const doc=new jsPDF(); doc.text('Reporte de Inventario (Proveedor)',14,16); autoTable(doc,{ head:[['Producto','Cantidad','Estado','Última actualización']], body: inventario.map(i=>[i.nombre,i.cantidad,i.estado_stock, new Date(i.fecha_actualizacion).toLocaleDateString()]) }); doc.save('reporte_inventario_proveedor.pdf'); };
  const exportCSV = () => { const headers=['Producto','Cantidad','Estado','Última actualización']; const rows=inventario.map(i=>[i.nombre,i.cantidad,i.estado_stock,new Date(i.fecha_actualizacion).toLocaleDateString()]); let csv=headers.join(',')+'\n'; rows.forEach(r=> { csv += r.join(',')+'\n'; }); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='reporte_inventario_proveedor.csv'; a.click(); URL.revokeObjectURL(url); };
  const exportWord = () => { let html='<h1>Reporte de Inventario (Proveedor)</h1><table border="1" style="border-collapse:collapse"><tr><th>Producto</th><th>Cantidad</th><th>Estado</th><th>Última actualización</th></tr>' + inventario.map(i=>`<tr><td>${i.nombre}</td><td>${i.cantidad}</td><td>${i.estado_stock}</td><td>${new Date(i.fecha_actualizacion).toLocaleDateString()}</td></tr>`).join('') + '</table>'; const blob=new Blob(['\ufeff'+html],{type:'application/msword'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='reporte_inventario_proveedor.doc'; a.click(); URL.revokeObjectURL(url); };

  return (
    <div style={{ maxWidth:'100%', padding:20 }}>
      <button onClick={()=> navigate('/reportes')} style={{ marginBottom:10, background:'none', border:'none', color:'green' }}>← Regresar a Reportes</button>
      <div style={{ width:'100%', height:'60vh', marginBottom:20 }}><Bar data={data} options={{ responsive:true, maintainAspectRatio:false }} /></div>
      <div style={{ marginBottom:20, position:'relative', display:'inline-block' }} ref={dropdownRef}>
        <button onClick={()=> setShowDropdown(!showDropdown)}>Exportar ▼</button>
        {showDropdown && <div style={{ position:'absolute', background:'#f9f9f9', minWidth:160, boxShadow:'0 8px 16px rgba(0,0,0,0.2)', borderRadius:4, padding:'5px 0' }}>
          <button onClick={exportPDF} style={btn}>Descargar PDF</button>
          <button onClick={exportCSV} style={btn}>Descargar CSV</button>
          <button onClick={exportWord} style={btn}>Descargar Word</button>
        </div>}
      </div>
      <div style={{ width:'100%', overflowX:'auto' }}>
        <table className="table table-striped" style={{ minWidth:400 }}>
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Estado</th><th>Última actualización</th></tr></thead>
          <tbody>{inventario.map((i,idx)=> (<tr key={idx}><td>{i.nombre}</td><td>{i.cantidad}</td><td>{i.estado_stock}</td><td>{new Date(i.fecha_actualizacion).toLocaleDateString()}</td></tr>))}</tbody>
        </table>
      </div>
      {notification && <div style={{ background:'#d4edda', color:'#155724', padding:10, borderRadius:5, marginTop:10 }}>{notification}</div>}
    </div>
  );
}

const btn = { display:'block', width:'100%', padding:'8px 16px', border:'none', background:'none', textAlign:'left' };
