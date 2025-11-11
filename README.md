# ReportesGrowSync

Proyecto extraído y aislado de la funcionalidad de **reportes** de GrowSync. Este repositorio contiene únicamente el frontend de reportes listo para ser publicado como sitio estático (GitHub Pages / cualquier hosting de archivos estáticos).

## Objetivo
Tener un módulo de reportes desacoplado que permita:
- Visualizar reportes de ventas, ventas por producto, inventarios, proveedor y reportes históricos.
- Exportar datos a PDF / CSV / Word (según el reporte).
- Registrar historial de exportaciones en `localStorage` (persistencia lado cliente).
- (Opcional) Consumir datos reales desde un backend existente configurando `config.json`.

## Estructura
```
ReportesGrowSync/
  README.md
  package.json
  vite.config.js
  config.json              # Configurable sin recompilar (apiBase)
  index.html
  src/
    main.jsx
    router.jsx
    components/
      ReportesBase.jsx
      ReporteVentas.jsx
      ReporteVentasProducto.jsx
      ReporteInventarios.jsx
      ReporteProveedor.jsx
      ReporteHistoricos.jsx
      ReporteHistoricoDetalle.jsx
    utils/reportHistory.js
    hooks/useConfig.js
    styles/global.css
  assets/
    ReportesBase.css
```

## Configuración de Backend
El archivo `config.json` se lee en tiempo de carga (fetch). Campo:
- `apiBase`: URL base del backend (ej: `"http://localhost:3001"`). Si se deja vacío se usarán datos de prueba.
- `reports.ventas`: path relativo para el endpoint de ventas.

Ejemplo:
```json
{
  "apiBase": "http://localhost:3001",
  "reports": { "ventas": "/api/reportes/ventas" }
}
```

## Uso local
```bash
npm install
npm run dev
```
Abrir `http://localhost:5173` (puerto por defecto de Vite). Ruta de inicio de reportes: `#/reportes` si se usa HashRouter.

## Build para producción
```bash
npm run build
```
Genera carpeta `dist/` lista para subir a GitHub Pages.

## Publicar en GitHub Pages
1. Crear repositorio GitHub y subir este código (rama `main`).
2. Ejecutar build local: `npm run build`.
3. Subir contenido de `dist/` a la rama `gh-pages`:
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```
   Ó manual:
   ```bash
   git checkout -b gh-pages
   git rm -rf .
   cp -R dist/* ./
   git add . && git commit -m "Deploy" && git push origin gh-pages
   ```
4. En GitHub: Settings > Pages > seleccionar rama `gh-pages` y carpeta raíz `/`.
5. Esperar a que se publique. La app usa `HashRouter` así que no hay problema de 404 en recarga.

## Personalizar datos dinámicos
Actualizar `config.json` y volver a construir sólo si se cambia paquete o código. Para cambiar sólo la URL del backend puede alojarse el archivo separado y editarlo antes de subir (`dist/config.json`).

## Tecnologías
- React + Vite
- React Router (`HashRouter` para hosting estático)
- Chart.js / react-chartjs-2
- jsPDF / autotable
- Bootstrap + FontAwesome

## Historial de reportes
Se guarda en `localStorage` bajo la clave `growsync_report_history_v1`. Para limpiar manualmente:
```js
localStorage.removeItem('growsync_report_history_v1');
```

## Licencia
Uso interno para la extracción del módulo de reportes. Revisa el repositorio original para condiciones adicionales.
