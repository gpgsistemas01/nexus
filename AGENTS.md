# Reglas generales del proyecto

La aplicación existente vive en `back/`; el frontend Vue 3 con Vite vive en `front/`.
Los comandos npm del frontend se ejecutan desde `front/`. Las rutas `src/`, `prisma/`, `scripts/`,
`tests/`, `docs/` y los comandos npm de esta guía se interpretan desde `back/`.
La automatización `.github/workflows/ci.yml`, Dockerfile y Docker Compose viven
en la raíz del repositorio.

- Antes de implementar un cambio, revisa el código relacionado y las implementaciones similares existentes.
- Prioriza reutilizar componentes, *helpers*, servicios y flujos existentes. No dupliques reglas de negocio.
- No realices refactorizaciones ni cambios fuera del alcance solicitado.
- Usa Node.js 22–24 y módulos ES. Conserva imports relativos con extensión `.js` y el estilo local del archivo.

## Fuentes de verdad

- Consulta `docs/architecture/coding-standards/index.md` para formato, nombres, capas, imports, errores y convenciones de frontend y pruebas.
- Consulta `docs/README.md` para identificar el documento propietario de arquitectura, requisitos, datos, pruebas o gobierno antes de editar documentación.
- Trata `prisma/schema.prisma` como fuente técnica del modelo de datos y `src/routes` como fuente de las rutas registradas.
- No edites manualmente `docs/architecture/views/development/code-map.md` ni `docs/architecture/views/logical/data-and-persistence/generated/`; regenera esos archivos con `npm run docs:architecture`.

## Arquitectura y responsabilidades

- Mantén las rutas agrupadas por dominio en `src/routes/web` y `src/routes/api`; registra routers nuevos en el `index.js` correspondiente, no directamente en `src/app.js`.
- Los controllers traducen HTTP y delegan; los servicios concentran reglas de negocio y transacciones; los repositories encapsulan consultas reutilizables; los DTOs normalizan contratos y los validators validan entradas.
- Los validadores del formulario comprueban los campos y metadatos enviados en `body`, y pasan por `validate` antes del controller. Los identificadores de ruta se pasan al servicio, que resuelve el registro, su pertenencia y su estado; no se mezclan `param()` ni comprobaciones de existencia en los validadores del formulario. Eliminaciones y cancelaciones sin datos de captura no requieren un validador vacío. Reutiliza la traducción compartida de errores de base de datos para un UUID mal formado.
- Reutiliza `AppError`, los errores de dominio, los mensajes y las constantes existentes. No inventes formatos de respuesta o manejo de errores por endpoint.
- En escrituras compuestas, usa una sola transacción y propaga `tx` a todas las operaciones relacionadas; no mezcles el cliente Prisma global con el transaccional.
- Mantén autenticación y autorización en el servidor, evita registrar secretos o datos sensibles y usa el logger del proyecto en lugar de `console.log` en código de aplicación.
- Trata `src/public` y `src/shared` servido en `/shared` como código público. Antes de compartir una regla, distingue su confidencialidad de su compatibilidad técnica: ser una función pura no permite publicar fórmulas propietarias, secretos ni políticas internas que deban permanecer privadas. Conserva esas reglas exclusivamente en el backend.
- Los cálculos del navegador son una vista previa. El backend valida las entradas, resuelve identidad, permisos y estado desde fuentes confiables, y calcula los valores derivados que persiste; no confía en totales, saldos, roles ni resultados calculados enviados por el cliente. Sigue el contrato del recurso para descartar o rechazar esos campos.

## Base de datos y migraciones

- Usa el cliente Prisma compartido de `src/lib/prisma.js`; no crees clientes adicionales por módulo.
- Todo cambio persistente requiere actualizar `prisma/schema.prisma`, agregar una migración en `prisma/migrations` y cubrir el comportamiento afectado con pruebas.
- Nunca uses la base de desarrollo para pruebas. Las pruebas con persistencia requieren `DATABASE_TEST_URL`, diferente de `DATABASE_URL`; usa `DIRECT_TEST_URL` sólo cuando corresponda al flujo existente de migraciones.
- Para ajustes que reemplazan un saldo y ediciones de recursos versionados, conserva `expectedVersion` desde la lectura hasta la escritura condicionada; no uses una versión consultada de nuevo para aceptar una captura vieja. Los triggers de versión también cubren los UPDATE SQL.
- Las altas y entradas HTTP de merma conservan `operationId` en los reintentos; recibo, stock y documentos se confirman en una sola transacción. Deshabilitar submit no sustituye esa garantía.
- No modifiques migraciones ya aplicadas para representar un cambio nuevo; agrega una migración incremental.

## EJS

- No elimines, muevas ni vuelvas a agregar innecesariamente la última línea de un archivo EJS.
- Conserva exactamente el estado del fin de archivo de cada EJS: si originalmente no termina con salto de línea, no lo agregues; si lo tiene, no lo elimines. Compruébalo en el diff para evitar que la última línea aparezca eliminada y agregada sin un cambio real.
- Conserva los cierres y llamadas a `contentFor`, salvo que la tarea requiera cambiarlos.
- Modifica sólo la sección necesaria y revisa el inicio y el final de cada EJS modificado.
- Reutiliza parciales de `src/views/shared` y módulos compartidos de `src/public/js` antes de duplicar markup, validaciones, requests o manipulación del DOM.
- Al cambiar una interfaz visible, revisa también permisos, estados responsivos, selectores compartidos y la documentación o capturas del manual que describan ese flujo.

## Pruebas

- Antes de agregar, cambiar o retirar pruebas, consulta `docs/testing/test-plan.md` y el registro selectivo de casos. Identifica requisito o riesgo, condición observable, nivel, técnica de diseño y resultado esperado.
- Antes de crear una prueba, identifica una equivalente y conserva su ubicación, *setup* y convenciones.
- Separa pruebas unitarias, de integración y de base de datos conforme a `docs/testing/`.
- Aplica particiones, fronteras, decisiones o transiciones según el riesgo. `it.each`, mocks, concurrencia y rollback no son por sí mismos técnicas de diseño.
- Conserva cobertura independiente cuando cambie el contrato observado, como cálculo puro, payload del formulario y persistencia. Concentra matrices extensas en unitarias y usa representantes en integración sin perder rechazos ni ausencia de efectos parciales.
- Justifica retiros por regla obsoleta, duplicidad demostrada o bajo riesgo sin evidencia adicional; registra qué cobertura permanece y qué limitación se acepta. No retires migraciones históricas sólo porque el alta actual cambió.
- Documenta selectivamente integraciones y reglas críticas con los formatos `DP-*` y `CP-*` del plan; actualiza la matriz funcional afectada. Guarda resultados `EP-*` en CI o en la revisión del cambio, sin duplicar cada `it` ni versionar resultados de corridas.
- Prueba estados y datos relevantes del formulario; evita fijar HTML, clases CSS, llamadas privadas o delegaciones triviales. Los dobles de Select2/MDB no demuestran un recorrido de navegador.
- En CRUD, valida el comportamiento CRUD correspondiente y reutiliza *factories*, *fixtures*, *helpers* y *mocks* existentes.
- Usa `npm run test:unit` para la suite sin base de datos y `npm run test:integration` para integración HTTP/Prisma; no uses `test:watch` en validaciones no interactivas.
- Mide cobertura con `npm run test:coverage` y `npm run test:coverage:integration` cuando se necesite identificar brechas; conserva sus reportes separados y no deduzcas suficiencia de pruebas de un porcentaje. Los reportes se guardan como evidencia, no se versionan.
- En pruebas de integración, comprueba tanto la respuesta HTTP como el estado persistido mediante Prisma, incluidos rollback y ausencia de efectos parciales cuando apliquen.
- Cuando cambien cálculos o controles de acceso, comprueba solicitudes directas con resultados derivados o atributos de autorización manipulados; verificar sólo el formulario no demuestra el control del servidor. Reutiliza los casos existentes de ese contrato antes de agregar otros.

## Reutilización y estándar

- Antes de crear un componente, *helper*, servicio, flujo, función o validación, busca una implementación equivalente.
- Respeta nombres, estructura, errores, validaciones, acceso a datos, respuestas HTTP y organización de pruebas vigentes.
- No introduzcas otro patrón cuando el proyecto ya tenga una convención establecida.
- Los catálogos auxiliares administrables reutilizan `admin/catalogs`: agrega cada
  recurso a su lista blanca y conserva separadas las lecturas operativas existentes.
  La vista y toda escritura requieren `catalogs:manage` en el servidor.

## Documentación

- Revisa la documentación relacionada con cada cambio funcional: comportamiento, reglas, endpoints, flujos, validaciones, estructura y pruebas.
- No modifiques documentación ajena al cambio.
- Si cambian routers, imports entre áreas o Prisma, ejecuta `npm run docs:architecture` y versiona los archivos generados resultantes.
- Si cambia comportamiento, reglas, endpoints, permisos o flujos, actualiza el artefacto curado propietario además de comprobar los documentos generados.

## Diagramas y exportación

- Usa Mermaid para los diagramas; no introduzcas PlantUML. Consulta los documentos propietarios y contrasta participantes, mensajes, permisos y relaciones con el código o los requisitos correspondientes.
- Usa notación UML cuando corresponda: actores y límites del sistema en casos de uso, roles de participantes y mensajes numerados en secuencias, y relaciones y multiplicidades en clases. No inventes relaciones `include`/`extend`, composición, concurrencia o transiciones sólo para enriquecer la presentación.
- Conserva la semántica propia de los diagramas ER y de flujo. Identifica como aproximaciones los diagramas que Mermaid no representa con notación UML completa, como despliegue.
- Los casos de uso `usecase-beta` requieren un visor compatible con Mermaid 12. No elimines metadatos UML de participantes para adaptar el contenido a un renderizador anterior.
- Mantén las versiones y la configuración del renderizador centralizadas en `scripts/mermaidExportUtils.js`; `scripts/prepareMermaidCli.js` comprueba su compatibilidad. Si cambian versiones o configuración, conserva su participación en la clave de caché de imágenes.
- Al cambiar diagramas o el exportador, valida el renderizado de los diagramas afectados y una exportación representativa con `npm run docs:export -- <familia> <seccion> ambos`. Comprueba legibilidad y ausencia de recortes en DOCX/PDF; `docs:check` no sustituye esa verificación. Consulta `docs/governance/document-export-guide/03-prepare-the-tools.md` para herramientas y configuración.

## Capturas del manual

- La automatización de capturas no crea ni modifica registros. Las capturas de edición requieren datos existentes y permisos adecuados en una sesión del entorno de prueba; un listado vacío no demuestra por sí solo una función pendiente de implementar.
- Ante una captura pendiente, revisa su preparación y el selector antes de cambiar código. Conserva la reanudación automática con `npm run docs:screenshots -- --area <area>` y no omitas silenciosamente una captura requerida.

## Integración continua

- Conserva la ejecución de unitarias e integración como comprobaciones distintas y sus reportes de ejecución; una no sustituye a la otra.
- Consulta `.github/workflows/ci.yml` como fuente de los disparadores y comprobaciones. Conserva la ejecución en los pushes a `features` y en los pull requests al modificar CI.
- La comprobación de documentación fuera de `main` debe validar los archivos versionados; conserva la regeneración y el commit automáticos restringidos al push a `main`.

## Imports y exports

- Después de agregar, eliminar, mover o renombrar código, revisa imports, exports y referencias.
- Elimina imports sin uso y no cambies el mecanismo de módulos sin necesidad.
- Nunca envuelvas imports en bloques `try/catch`.

## Validación final

1. Revisa el diff y descarta cambios accidentales.
2. Comprueba imports, exports y referencias.
3. Revisa las últimas líneas de los EJS modificados.
4. Ejecuta primero las pruebas específicas y después `npm run test:unit`; para cambios de persistencia o HTTP ejecuta también `npm run test:integration` con una base aislada.
5. Ejecuta `npm run docs:check`; si falla por cambios intencionales en rutas, imports o Prisma, regenera con `npm run docs:architecture` y vuelve a comprobar.
6. Confirma que documentación y patrones existentes permanecen sincronizados.
