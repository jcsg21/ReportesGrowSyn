import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addHistory } from '../utils/reportHistory';

const inventarioBase = [
  { nombre: 'Semillas A', categoria: 'Semillas', cantidad: 120, minimo: 50, precio: 12.5, estado_stock: 'Disponible', fecha_actualizacion: '2025-08-12' },
  { nombre: 'Fertilizante B', categoria: 'Insumos', cantidad: 35, minimo: 40, precio: 25.0, estado_stock: 'Bajo stock', fecha_actualizacion: '2025-08-11' },
  { nombre: 'Herramienta C', categoria: 'Herramientas', cantidad: 8, minimo: 10, precio: 180.0, estado_stock: 'Bajo stock', fecha_actualizacion: '2025-08-09' },
  { nombre: 'Insumo D', categoria: 'Insumos', cantidad: 0, minimo: 15, precio: 9.0, estado_stock: 'Agotado', fecha_actualizacion: '2025-08-10' },
  { nombre: 'Semillas E', categoria: 'Semillas', cantidad: 200, minimo: 60, precio: 8.0, estado_stock: 'Disponible', fecha_actualizacion: '2025-08-08' },
  { nombre: 'Sustrato F', categoria: 'Insumos', cantidad: 75, minimo: 30, precio: 14.0, estado_stock: 'Disponible', fecha_actualizacion: '2025-08-13' },
  { nombre: 'Guantes G', categoria: 'Equipos', cantidad: 15, minimo: 20, precio: 6.5, estado_stock: 'Bajo stock', fecha_actualizacion: '2025-08-12' },
  { nombre: 'Bomba H', categoria: 'Herramientas', cantidad: 3, minimo: 5, precio: 320.0, estado_stock: 'Bajo stock', fecha_actualizacion: '2025-08-07' },
  { nombre: 'Macetas I', categoria: 'Equipos', cantidad: 260, minimo: 100, precio: 2.2, estado_stock: 'Disponible', fecha_actualizacion: '2025-08-11' },
  { nombre: 'Manguera J', categoria: 'Herramientas', cantidad: 0, minimo: 8, precio: 45.0, estado_stock: 'Agotado', fecha_actualizacion: '2025-08-10' },
];

export default function ReporteInventarios() {
  const [inventario, setInventario] = useState(inventarioBase);
  const [filteredInventario, setFilteredInventario] = useState(inventarioBase);
  const [estado, setEstado] = useState('Todos');
  const [categoria, setCategoria] = useState('Todas');
  const [metrica, setMetrica] = useState('cantidad');
  const [topN, setTopN] = useState(10);
  const [notification, setNotification] = useState('Reporte de inventarios listo para revisar.');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(()=>{ const t=setTimeout(()=> setNotification(''),5000); return ()=> clearTimeout(t);},[]);
  useEffect(()=>{ let arr=[...inventario]; if(estado!=='Todos') arr=arr.filter(i=> i.estado_stock===estado); if(categoria!=='Todas') arr=arr.filter(i=> i.categoria===categoria); setFilteredInventario(arr); },[estado,categoria,inventario]);

  const categorias = Array.from(new Set(inventario.map(i=> i.categoria)));
  const totalItems = filteredInventario.length;
  const totalCantidad = filteredInventario.reduce((a,i)=> a+i.cantidad,0);
  const totalValor = filteredInventario.reduce((a,i)=> a+i.cantidad*i.precio,0);
  const criticos = filteredInventario.filter(i=> i.cantidad<=i.minimo).length;

  const rank = filteredInventario.map(i=> ({ nombre:i.nombre, valor: metrica==='cantidad'? i.cantidad : i.cantidad*i.precio, cantidad:i.cantidad, minimo:i.minimo })).sort((a,b)=> b.valor-a.valor).slice(0, topN);
  const dataBar = { labels: rank.map(r=> r.nombre), datasets:[{ label: metrica==='cantidad'? 'Cantidad en stock':'Valor en stock ($)', data: rank.map(r=> r.valor), backgroundColor: rank.map(r=> r.cantidad<=r.minimo? 'rgba(220,53,69,0.85)':'rgba(40,167,69,0.85)'), borderColor: rank.map(r=> r.cantidad<=r.minimo? '#bd2130':'#1e7e34'), borderWidth:1.5, borderRadius:6 }] };

  const porCategoria = filteredInventario.reduce((acc,i)=> { acc[i.categoria] = (acc[i.categoria]||0) + (metrica==='cantidad'? i.cantidad : i.cantidad*i.precio); return acc; },{});
  const catLabels = Object.keys(porCategoria); const catData = Object.values(porCategoria);
  const palette = ['#2C5F2D','#28a745','#8BC34A','#FFC107','#03A9F4','#9C27B0','#FF5722'];
  const dataDoughnut = { labels: catLabels, datasets:[{ data: catData, backgroundColor: catLabels.map((_,i)=> palette[i%palette.length]), hoverBackgroundColor: catLabels.map((_,i)=> palette[i%palette.length]), borderWidth:1, borderColor:'#fff' }] };

  const optionsBar = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } }, indexAxis:'y', scales:{ x:{ beginAtZero:true, ticks:{ callback:(v)=> metrica==='cantidad'? Number(v) : '$'+Number(v).toLocaleString() } } } };
  const optionsDoughnut = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } } };

  const exportCSV = () => { const headers=['Producto','Categoría','Cantidad','Mínimo','Precio','Valor','Estado','Actualización']; const rows=filteredInventario.map(i=>[i.nombre,i.categoria,i.cantidad,i.minimo,i.precio.toFixed(2),(i.cantidad*i.precio).toFixed(2),i.estado_stock,new Date(i.fecha_actualizacion).toLocaleDateString()]); let csv = headers.join(',')+'\n'; rows.forEach(r=>{ csv += r.join(',')+'\n'; }); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='reporte_inventarios.csv'; a.click(); URL.revokeObjectURL(url); addHistory({ nombre:'Reporte de Inventarios', formato:'CSV', resumen:`Items: ${totalItems} | Total valor: $${totalValor.toFixed(2)}`, filtros:{ estado, categoria, metrica, topN }, metadata:{ totalItems, totalCantidad, totalValor, criticos } }); };
  const exportPDF = () => { const doc=new jsPDF(); doc.text('Reporte de Inventarios',14,16); const head=[["Producto","Categoría","Cant.","Mín.","Precio","Valor","Estado","Actualización"]]; const body=filteredInventario.map(i=>[i.nombre,i.categoria,i.cantidad,i.minimo,'$'+i.precio.toFixed(2),'$'+(i.cantidad*i.precio).toFixed(2),i.estado_stock,new Date(i.fecha_actualizacion).toLocaleDateString()]); autoTable(doc,{ head, body, startY:20 }); doc.text(`Items: ${totalItems}`,14, doc.lastAutoTable.finalY+10); doc.text(`Total cantidad: ${totalCantidad}`,14, doc.lastAutoTable.finalY+18); doc.text(`Total valor: $${totalValor.toFixed(2)}`,14, doc.lastAutoTable.finalY+26); doc.text(`Críticos (<= mínimo): ${criticos}`,14, doc.lastAutoTable.finalY+34); doc.save('reporte_inventarios.pdf'); addHistory({ nombre:'Reporte de Inventarios', formato:'PDF', resumen:`Items: ${totalItems} | Total valor: $${totalValor.toFixed(2)}`, filtros:{ estado, categoria, metrica, topN }, metadata:{ totalItems, totalCantidad, totalValor, criticos } }); };

  return (
    <div style={{ maxWidth:'100%', padding:20, fontFamily:'Segoe UI, sans-serif' }}>
      <button onClick={()=> navigate('/reportes')} style={{ marginBottom:20, border:'2px solid #28a745', background:'none', color:'#28a745', padding:'8px 16px', borderRadius:6 }}>← Regresar a Reportes</button>
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:16 }}>
        <div><label style={{ fontWeight:600, marginRight:8 }}>Estado:</label><select value={estado} onChange={e=> setEstado(e.target.value)}><option>Todos</option><option>Disponible</option><option>Bajo stock</option><option>Agotado</option></select></div>
        <div><label style={{ fontWeight:600, marginRight:8 }}>Categoría:</label><select value={categoria} onChange={e=> setCategoria(e.target.value)}><option>Todas</option>{categorias.map(c=> <option key={c}>{c}</option>)}</select></div>
        <div><label style={{ fontWeight:600, marginRight:8 }}>Métrica:</label><select value={metrica} onChange={e=> setMetrica(e.target.value)}><option value="cantidad">Cantidad</option><option value="valor">Valor ($)</option></select></div>
        <div><label style={{ fontWeight:600, marginRight:8 }}>Top:</label><select value={topN} onChange={e=> setTopN(Number(e.target.value))}>{[5,10,15,20].map(n=> <option key={n} value={n}>{n}</option>)}</select></div>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={exportPDF} className="btn btn-success" style={{ marginRight:8 }}>PDF</button>
          <button onClick={exportCSV} className="btn btn-primary">CSV</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <KPI title="Items" value={totalItems} />
        <KPI title="Total cantidad" value={totalCantidad.toLocaleString()} />
        <KPI title="Total valor" value={'$ '+ totalValor.toLocaleString(undefined,{ minimumFractionDigits:2 })} />
        <KPI title="Críticos (≤ mínimo)" value={criticos} color={criticos>0? '#dc3545' : '#28a745'} />
      </div>

      <div style={{ width:'100%', height:'50vh', marginBottom:40, background:'#fff', boxShadow:'0 4px 8px rgba(0,0,0,0.1)', borderRadius:8, padding:10 }}>
        <Bar data={dataBar} options={optionsBar} />
      </div>

      <div style={{ width:'50%', minWidth:360, height:'40vh', margin:'0 auto 40px', background:'#fff', boxShadow:'0 4px 8px rgba(0,0,0,0.1)', borderRadius:12, padding:10 }}>
        <Doughnut data={dataDoughnut} options={optionsDoughnut} />
      </div>

      <div style={{ width:'100%', overflowX:'auto', marginTop:20, background:'#fff', boxShadow:'0 4px 8px rgba(0,0,0,0.1)', borderRadius:8, padding:10 }}>
        <table className="table table-striped" style={{ minWidth:700 }}>
          <thead><tr><th>Producto</th><th>Categoría</th><th style={{textAlign:'right'}}>Cantidad</th><th style={{textAlign:'right'}}>Mínimo</th><th style={{textAlign:'right'}}>Precio</th><th style={{textAlign:'right'}}>Valor</th><th>Estado</th><th>Última actualización</th></tr></thead>
          <tbody>
            {filteredInventario.slice().sort((a,b)=> metrica==='cantidad'? b.cantidad-a.cantidad : b.cantidad*b.precio - a.cantidad*a.precio).map((i,idx)=> (
              <tr key={idx}>
                <td>{i.nombre}</td><td>{i.categoria}</td>
                <td style={{textAlign:'right'}}>{i.cantidad.toLocaleString()}</td>
                <td style={{textAlign:'right', color: i.cantidad<=i.minimo? '#dc3545':'#555'}}>{i.minimo}</td>
                <td style={{textAlign:'right'}}>$ {i.precio.toFixed(2)}</td>
                <td style={{textAlign:'right'}}>$ {(i.cantidad*i.precio).toLocaleString(undefined,{ minimumFractionDigits:2 })}</td>
                <td><span style={{ padding:'2px 8px', borderRadius:12, backgroundColor: i.estado_stock==='Disponible'? '#d4edda': i.estado_stock==='Bajo stock'? '#fff3cd':'#f8d7da', color: i.estado_stock==='Disponible'? '#155724': i.estado_stock==='Bajo stock'? '#856404':'#721c24', fontWeight:600 }}>{i.estado_stock}</span></td>
                <td>{new Date(i.fecha_actualizacion).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notification && <div style={{ background:'#d4edda', color:'#155724', padding:10, borderRadius:5, marginTop:10 }}>{notification}</div>}
    </div>
  );
}

function KPI({ title, value, color='#333' }) {
  return (
    <div style={{ background:'#fff', borderRadius:8, padding:12, boxShadow:'0 2px 6px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize:12, color:'#666' }}>{title}</div>
      <div style={{ fontSize:20, fontWeight:700, color }}>{value}</div>
    </div>
  );
}
