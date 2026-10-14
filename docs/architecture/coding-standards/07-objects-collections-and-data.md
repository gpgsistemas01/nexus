# 7. Objetos, colecciones y datos

- Se usa destructuring cuando nombra con claridad los campos consumidos; no se destruye
  un objeto completo para volver a reconstruirlo sin propósito.
- Los objetos multilínea tienen una propiedad por línea y coma final sólo si ésa es la
  convención predominante del archivo.
- `map` transforma, `filter` selecciona, `find` obtiene un elemento y `some`/`every`
  responden condiciones. No se usa `map` sólo por sus efectos secundarios.
- Las búsquedas repetidas en una colección grande se preparan como `Map` o `Set` cuando
  mejora de forma relevante la intención y el costo; no se optimiza sin una necesidad
  observable.
- Fechas, decimales y cantidades atraviesan DTOs y utilidades existentes. No se confía
  en coerción implícita ni se convierte un decimal de dominio a un entero.
- `null`, `undefined` y string vacío no son intercambiables. Cada frontera aplica la
  normalización declarada por su contrato.
- Los datos recibidos del cliente se tratan como no confiables aunque ya exista
  validación en el navegador.

## Persistencia y migraciones

- Reutilizar el cliente compartido de `src/lib/prisma.js` y los repositories existentes;
  no crear otro cliente Prisma por módulo. Propagar `tx` dentro de una escritura compuesta.
- Un cambio persistente actualiza `prisma/schema.prisma`, añade una migración incremental
  y verifica el comportamiento afectado. No modificar una migración ya aplicada.
- Antes de retirar una tabla o columna, revisar consumidores, FK y datos históricos.
  Definir cómo conservar o conciliar esos datos; una tabla sin CRUD puede tener referencias legadas.
- Mantener cantidades y costos con la precisión y conversión definidas por el dominio.
  Comprobar valores finitos y límites antes de operar; no redondear ni truncar arbitrariamente.
- Los contextos de inventario se fijan en el servidor y se validan en los detalles;
  no confiar en un tipo, propietario o permiso enviado por el navegador.
