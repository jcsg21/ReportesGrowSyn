# Endpoints de Backend (Reportes)

Esta app consume, si se configura `config.json`, los siguientes endpoints opcionales.

- Ventas por día
  - Método: GET
  - Path: `/api/reportes/ventas`
  - Respuesta esperada (ejemplo):
    ```json
    [
      { "fecha": "2025-08-10", "total_vendido": 1600.75, "cantidad": 31 },
      { "fecha": "2025-08-11", "total_vendido": 1750.20, "cantidad": 33 }
    ]
    ```
  - Notas:
    - En el repo `Proyecto--GrowSync-Backend/backend/server/index.js` existe una ruta que consulta tabla `Pedidos`. El SQL actual suma `cantidad` pero la tabla `Pedidos` (según `0011-Create Database growsync.sql`) no tiene esa columna.
    - Sugerencias de ajuste:
      1) Si no hay tabla de detalle de pedidos, reemplazar `SUM(cantidad)` por `COUNT(id_pedido)` como aproximación:
         ```sql
         SELECT DATE(fecha) AS fecha,
                SUM(total) AS total_vendido,
                COUNT(id_pedido) AS cantidad
         FROM Pedidos
         GROUP BY DATE(fecha)
         ORDER BY fecha DESC
         LIMIT 30;
         ```
      2) Si existe tabla de detalle (recomendado), por ejemplo `PedidoDetalles(id_pedido, id_producto, cantidad, precio_unitario)`, usar:
         ```sql
         SELECT DATE(p.fecha) AS fecha,
                SUM(d.cantidad * d.precio_unitario) AS total_vendido,
                SUM(d.cantidad) AS cantidad
         FROM Pedidos p
         JOIN PedidoDetalles d ON d.id_pedido = p.id_pedido
         GROUP BY DATE(p.fecha)
         ORDER BY fecha DESC
         LIMIT 30;
         ```

- Otros reportes
  - Los componentes actuales usan datos de ejemplo. Para dinamizarlos, exponga endpoints equivalentes y mapee su `apiBase` en `config.json`.

## CORS
Asegure que el backend tenga CORS habilitado para el origen donde se publique GitHub Pages.
