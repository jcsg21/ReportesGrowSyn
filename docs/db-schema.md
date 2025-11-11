# Esquema de Base de Datos (relevante a Reportes)

Extraído de `Proyecto--GrowSync-Backend/0011-Create Database growsync.sql`.

Tablas clave:

- `Pedidos`
  - `id_pedido` INT PK
  - `id_usuario` INT
  - `fecha` DATETIME
  - `id_estado` INT
  - `total` DECIMAL(10,2)

- `Usuarios` (para referencia de `Pedidos`)
- `EstadoPedidos` (catálogo de estados)
- `Productos` (para catálogos)

Observaciones:
- No existe columna `cantidad` en `Pedidos` dentro del script encontrado.
- Para reportes de ventas por día con "cantidad" de ítems vendidos se recomienda modelar `PedidoDetalles`:

```sql
CREATE TABLE PedidoDetalles (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
```

Consulta sugerida (ventas por día):
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

Si no se implementa `PedidoDetalles`, la "cantidad" puede aproximarse como número de pedidos del día:
```sql
SELECT DATE(fecha) AS fecha,
       SUM(total) AS total_vendido,
       COUNT(id_pedido) AS cantidad
FROM Pedidos
GROUP BY DATE(fecha)
ORDER BY fecha DESC
LIMIT 30;
```
