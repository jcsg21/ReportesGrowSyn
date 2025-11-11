import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const noticias = [
    { title: 'Reportes de Ventas', text: 'Consulta tendencias y exporta tus datos fácilmente.', route: '/reportes/ventas', icon: 'fa-chart-line' },
    { title: 'Inventarios', text: 'Monitorea stock, valores y críticos por categoría.', route: '/reportes/inventarios', icon: 'fa-boxes' },
    { title: 'Históricos', text: 'Revisa exportaciones anteriores y su detalle.', route: '/reportes/historicos', icon: 'fa-history' },
  ];

  return (
    <>
      <section className="banner">Bienvenidos al módulo de Reportes 🌱</section>
      <section className="noticias">
        <h2><i className="fas fa-newspaper"></i> Accesos rápidos</h2>
        <div className="container">
          <div className="row justify-content-center" style={{ gap: 16 }}>
            {noticias.map(({ title, text, route, icon }, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="card-body">
                    <h5 className="card-title"><i className={`fas ${icon}`} style={{ marginRight: 8 }}></i>{title}</h5>
                    <p className="card-text">{text}</p>
                    <Link to={route} className="btn btn-success">Ir</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
