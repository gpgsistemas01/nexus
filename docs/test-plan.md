# Plan de pruebas

## 1. Objetivo y alcance

Este plan define qué se comprobará para aceptar cambios de Nexus, con qué evidencia y
en qué ambiente. La [estrategia de pruebas](service-test-coverage.md) sigue siendo la
fuente para técnicas y ubicación de archivos; este documento agrega planificación,
criterios de entrada/salida, matriz de cobertura y responsabilidades.

El alcance vigente incluye autenticación, identidades, catálogos, clientes, entradas,
salidas de material y merma, inventario, movimientos, reportes y documentación
generada. Requisiciones, proyectos, ajustes completos y objetivos no funcionales se
prueban sólo hasta su estado implementado; no se consideran aceptados por estar
modelados en Prisma.

## 2. Fuentes y trazabilidad

Cada conjunto de pruebas debe enlazar o nombrar:

1. el requisito `RF`, `RN` o `RC` que justifica el comportamiento;
2. el caso de uso o ciclo CRUD relacionado;
3. la ruta/controller y persistencia afectadas;
4. la operación y estado declarados en la
   [matriz por módulo/contexto](requirements-operations-matrix.md);
5. la técnica aplicada y la evidencia esperada.

La cadena de revisión es
`caso de uso → requisito → código/datos → prueba → resultado`. Los estados funcionales
y criterios de aceptación se consultan en `requirements-specification.md`; los conceptos
y relaciones entre vistas, en `domain-and-use-cases.md`.

## 3. Niveles, ubicación y propósito

| Nivel o comprobación | Ubicación/comando | Propósito y criterio |
| --- | --- | --- |
| Unitarias de reglas/controllers | `tests/unit/controllers/<tipo>/<dominio>` | Límites, particiones, tablas de decisión, propagación de errores y ausencia de efectos inválidos; no repetir el camino feliz persistente. |
| Unitarias de módulos auxiliares | Carpeta paralela al área bajo `tests/unit` o ubicación existente del módulo | Contratos deterministas de utilidades, middleware, frontend o inventario. Se conserva el patrón de ubicación existente antes de abrir otra raíz. |
| Integración CRUD | `tests/integration/controllers` | Supertest atraviesa controller y servicios reales; Prisma confirma creación/actualización/efecto y la prueba limpia sólo sus datos. |
| Base de datos | Migraciones sobre `DATABASE_TEST_URL` | Restricciones, relaciones, rollback y efectos atómicos que no pueden demostrarse con mocks. |
| Documentación generada | `npm run docs:check` | ER, diccionario y mapa de código coinciden exactamente con sus fuentes. |
| Revisión visual curada | Vista previa Mermaid del pull request | Semántica, legibilidad, estado y relación con código/requisitos; no se aprueba sólo porque Mermaid compile. |

## 4. Matriz CRUD mínima

Para cada recurso nuevo o modificado se marca cada celda como cubierta, no aplicable
con justificación, o pendiente. La eliminación física no se presupone: puede
corresponder cambio de estado, cancelación o una acción terminal del dominio.
Las filas necesarias se derivan de las operaciones registradas o del cambio de estado
previsto en la matriz de requisitos; una capacidad parcial se prueba sólo hasta su
alcance real.

| Operación | Camino principal | Validación/permiso | Persistencia y lectura posterior | Conflicto o límite | Efecto relacionado/rollback |
| --- | --- | --- | --- | --- | --- |
| Listar/leer | HTTP, estado y estructura | filtros inválidos y acceso denegado | datos/filtros/paginación observables | vacío y límites de página | sin escrituras inesperadas |
| Crear | respuesta y representación creada | campos, autorización y dependencias | Prisma encuentra valores y relaciones | duplicado/regla de negocio | ninguna escritura parcial |
| Actualizar | respuesta y valores nuevos | ID, campos y autorización | Prisma muestra cambio y conserva lo no modificado | inexistente/conflicto/concurrencia aplicable | documento, stock y movimiento atómicos |
| Eliminar/estado/terminal | respuesta y transición permitida | autorización y estado previo | ausencia, nuevo estado o cancelación verificable | relaciones protegidas/transición inválida | referencias e inventario consistentes |

Los catálogos que reutilizan una fábrica pueden compartir preparación y casos tabulados,
pero cada contexto conserva al menos la integración que demuestra su router,
configuración, nombre de recurso y persistencia. Los documentos operativos agregan
pruebas de estado, detalles, movimiento, devolución y rollback según corresponda.
En la capa de aplicación, las unitarias tabuladas verifican también que el módulo
publique nombres de dominio y no exponga la instancia genérica de la fábrica; esto
protege el contrato consumido por páginas, formularios y datatables.
Las factories especializadas exportables se prueban en la carpeta paralela de su
contexto y deben demostrar que cada invocación crea una instancia independiente, que
conserva las operaciones CRUD y aplica las claves de respuesta inyectadas.
Los filtros CRUD se prueban junto a su plugin de datatable: un recurso remoto no debe
precargar opciones si Select2 ya mapea su listado, salvo que exista una selección
predeterminada explícita.
La coordinación Select2 del CRUD de entradas de compra verifica que preparar el
encabezado limpie una sola vez la selección dependiente de material, sin duplicar los
eventos de cambio ni sus efectos derivados.
La estructura de las pruebas refleja la del código propietario: las pruebas del núcleo
de DataTable viven en `tests/unit/public/js/plugins/datatable/core` y sus filtros en la
subcarpeta `filters`; una prueba específica de recurso debe replicar además dominio y
recurso. Reubicar un módulo no cambia la estrategia: las pruebas de UI protegen la
configuración y coordinación del CRUD, mientras la persistencia continúa validándose
por HTTP y Prisma en `tests/integration/controllers`. No se crea una prueba de traslado
que duplique el comportamiento CRUD ya cubierto.
Las utilidades de colección de detalles se prueban en
`tests/unit/public/js/utils/detailCollectionUtilsTest.js`: agregar, sustituir, eliminar
y no encontrar representan la coordinación local del detalle CRUD. Totales, inventario
y persistencia siguen correspondiendo a sus pruebas de contexto y no se simulan dentro
de la utilidad.

## 5. Cobertura planificada por capacidad

| Capacidad | Evidencia actual o planeada | Prioridad / siguiente paso |
| --- | --- | --- |
| Autenticación y autorización | Unitarias de middleware y casos negativos; flujos registrados. | Mantener casos de sesión ausente, permiso insuficiente y credencial inválida. |
| Catálogos, clientes y proveedores | Integraciones CRUD existentes para catálogos seleccionados, clientes y proveedores; unitarias de contrato para la factory de aplicación. | Aplicar la matriz y sus casos tabulados de contexto al modificar la factory o una configuración compartida. |
| Merma y salidas de merma | Unitarias de decisiones y límites; integración HTTP con persistencia, movimiento y rollback. | Mantener paridad CRUD al reutilizar patrones de salidas de material. |
| Salidas de material | Unitarias existentes; integración completa pendiente. | Agregar HTTP + Prisma para creación/actualización, stock, entrega/devolución y rollback. |
| Entradas de compra | Helpers/unitarias parciales; integración completa pendiente. | Cubrir creación, corrección, costo, movimiento y atomicidad. |
| Personas y usuarios | Flujos implementados y contrato CRUD de aplicación cubierto; integración de relaciones pendiente. | Cubrir asignaciones rol/departamento y rechazo sin escritura parcial. |
| Ajustes | Modelos/servicios parciales. | No declarar aceptación completa; integrar aprobación, movimiento y rollback al registrar rutas. |
| Requisiciones y proyectos | Modelados sin CRUD completo. | Crear pruebas sólo con el flujo real; no probar directamente un servicio como sustituto del controller. |
| Reportes y movimientos | Pruebas focalizadas pendientes. | Cubrir permisos, filtros, estructura y exportación sin duplicar cálculos unitarios. |
| Documentación | Generador determinista y `docs:check`. | Mantener mapa, ER y diccionario sincronizados; revisar manualmente dominio y casos de uso. |

## 6. Ambiente y datos

- Las unitarias no requieren base de datos y se ejecutan con `npm run test:unit`.
- Las integraciones usan exclusivamente `DATABASE_TEST_URL`; el verificador debe
  rechazar la URL de desarrollo antes de migrar o ejecutar pruebas.
- `npm run test:integration` despliega migraciones, genera Prisma y ejecuta los archivos
  de integración sin paralelismo.
- Cada prueba crea datos identificables y limpia sólo sus registros. El teardown global
  es una red de seguridad, no sustituye las aserciones con Prisma dentro del caso.
- No se usan datos personales o secretos reales. Las fechas, UUID y referencias deben
  ser deterministas o aisladas cuando afecten la aserción.

## 7. Criterios de entrada y salida

### Entrada

- requisito y estado definidos;
- impacto identificado en CRUD, reglas, datos, permisos y componentes reutilizados;
- migración disponible cuando cambia el esquema;
- ambiente de integración aislado y dependencias instaladas.

### Salida

- todas las pruebas relacionadas pasan en la ejecución correspondiente;
- la matriz CRUD afectada no tiene omisiones sin justificación;
- Prisma demuestra persistencia y rollback en integraciones que escriben;
- no quedan pruebas deshabilitadas para ocultar fallos;
- `npm run docs:check` pasa y las vistas curadas afectadas fueron revisadas;
- cualquier riesgo aceptado o prueba pendiente conserva requisito, responsable y
  seguimiento fuera del estado «Implementado».

## 8. Ejecución y evidencia

| Momento | Comprobación |
| --- | --- |
| Desarrollo local | Ejecutar unitarias del área y la integración CRUD afectada; después `npm run docs:check` si cambia código documentado, Prisma o diagramas. |
| Pull request | Ejecutar `npm run test:unit`, `npm run test:integration` con BD aislada y `npm run docs:check`; adjuntar resultados y limitaciones. |
| Rama principal | CI repite migraciones e integraciones y regenera documentos derivados cuando corresponde. |
| Liberación | Revisar resultados del commit liberado, migraciones, riesgos abiertos y pruebas manuales/no funcionales exigidas por el ambiente. |

La evidencia mínima es comando, resultado, commit y, ante fallo, referencia al defecto.
Capturas se reservan para comportamiento visual; no sustituyen aserciones HTTP o Prisma.

## 9. Responsabilidades y riesgos

| Rol | Responsabilidad |
| --- | --- |
| Autor del cambio | Identificar impacto, reutilizar harness/fábricas, implementar y ejecutar pruebas relacionadas. |
| Revisor | Confirmar técnicas, ubicación, matriz CRUD, ausencia de duplicación y correspondencia con requisitos/diagramas. |
| Responsable funcional | Validar criterios de aceptación, prioridades y riesgos de negocio. |
| Responsable de operación | Definir ambientes y objetivos medibles de rendimiento, disponibilidad, recuperación y seguridad cuando apliquen. |

Riesgos principales: cobertura de integración aún parcial, confundir modelo Prisma con
flujo disponible, duplicar pruebas felices, compartir accidentalmente la base de
desarrollo y documentar objetivos no medidos. Se mitigan con el verificador de URL,
estados explícitos, matriz CRUD, pruebas negativas y trazabilidad hasta la evidencia.

## 10. Pruebas no funcionales pendientes

Rendimiento, carga, disponibilidad, recuperación, accesibilidad y seguridad dinámica
requieren objetivos, ambiente y herramientas acordados. Hasta disponer de valores
medibles no se inventan umbrales ni se cambia su estado a implementado. Cuando se
aprueben, se agregará para cada objetivo carga de trabajo, datos, métrica, umbral,
duración, responsable y evidencia reproducible.
