# 9. Orden de métodos por comportamiento

Los módulos que representan el mismo tipo de recurso conservan un orden de lectura
común aunque cambien los nombres del dominio. Para un CRUD, el orden es: **consulta,
creación, actualización general, actualizaciones especializadas y eliminación**. Las
actualizaciones especializadas se ordenan desde el alcance más general al más específico;
en salidas esto significa **encabezado, detalles y devolución de detalle**. Helpers y
constantes privadas se declaran antes de la primera operación pública que los necesita.

El orden se conserva de extremo a extremo en controller, ruta, servicio de dominio,
adaptador HTTP del navegador y aplicación. No cambia la prioridad de las rutas ni el
contrato público: hace predecible la ubicación de una operación y permite comparar dos
contextos equivalentes sin depender de que usen exactamente el mismo sustantivo. Al
agregar una operación se actualizan juntos sus imports, exports y la prueba estructural
del flujo relacionado.

Las salidas de material y de merma son la referencia comprobable: ambas exponen listado,
registro, edición, edición de encabezado, edición de detalles y devolución en ese orden.
Sus módulos de formulario conservan la normalización, validación, configuración de
`useIssueForm` y operaciones de captura como `addGoodsIssueMaterial` o `addWaste`. En módulos
hermanos distintos, los modales conservan la construcción e
inicialización de componentes, apertura, alta y búsqueda de detalles, y registro de
eventos. El entry point crea el DataTable e inyecta las acciones que abren el modal, sin
concentrar nuevamente ninguno de los dos flujos. El nombre concreto puede cambiar entre material y merma; su posición la
determina la responsabilidad equivalente, no el sustantivo del contexto.

La prueba ubicada junto a las unitarias de sus controllers verifica esta secuencia entre
las capas y en las páginas; las pruebas de comportamiento y la persistencia CRUD
permanecen en las ubicaciones definidas por la estrategia de pruebas.
