# 8. Contratos públicos y frontend Vue

Los contratos y validaciones públicas reutilizados por la captura pertenecen a
`src/shared`. Vite los compila con el cliente; no contienen secretos ni políticas
internas. El servidor valida siempre las entradas y calcula lo que persiste.

## Propiedad de las constantes

La ubicación se decide por responsabilidad y consumidores, no por una regla de
concentrar todas las constantes en el backend.

| Propietario | Ubicación | Ejemplos |
| --- | --- | --- |
| Servidor | `back/src/constants` o el módulo privado que las utiliza | Códigos Prisma, políticas de acceso, lotes de consultas, columnas que generan los reportes y configuración del procesador XLSX. |
| Contrato público compartido | `back/src/shared/constants` | Identificadores de permisos, estados de documentos/partidas, modos de importación y límites de captura usados por Express y Vue. |
| Presentación y comportamiento del navegador | `front/src/app`, `front/src/modules` o `front/src/shared` según sus consumidores | Navegación, iconos, configuración de pantallas, orden de columnas, etiquetas exclusivas de la interfaz y reintentos del transporte cliente. |

`back/src/shared` es la ubicación física de las fuentes públicas del checkout;
Vite las incorpora al cliente. No significa que se ejecuten sólo en el servidor.
No importa módulos privados de `back/src`, Prisma, transporte ni configuración de
infraestructura. Las claves públicas de permisos no conceden acceso por sí mismas:
las políticas que los asignan y la autorización definitiva permanecen en Express.

Las etiquetas de modos de Excel se comparten porque también se escriben en el
archivo generado por el servidor. Los límites de descompresión, entradas ZIP,
catálogos y tiempo del worker pertenecen a `back/src/constants/inventoryImport.js`;
los límites que comunica y utiliza la captura permanecen compartidos.

Los estados de almacén y los valores de captura del encabezado de Salidas tienen
una sola definición pública. `back/src/constants/warehouseStatuses.js` y
`back/src/constants/issueHeaderRules.js` reexportan esas definiciones para conservar
los imports del servidor; no mantienen copias de sus valores.

La presentación pertenece a `front/src`. Reutiliza componentes y composables del
cliente y conserva autorización, transacciones y acceso a datos en Express. Las
reglas de formato, props, eventos, estado y pruebas se mantienen en el
[estándar Vue](../../../../front/docs/architecture/coding-standards/index.md).

Al cambiar un contrato, revisa consumidores de Express y Vue, payload, tratamiento
de errores, documentación y cobertura independiente de servidor y cliente.
