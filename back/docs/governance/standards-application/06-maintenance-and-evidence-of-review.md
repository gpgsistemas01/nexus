# 6. Mantenimiento y evidencia de revisión

Al cambiar la API, la persistencia o una colaboración del backend, actualice el
contrato y las vistas técnicas afectados. Regenere los inventarios cuando cambien
rutas, imports o Prisma, y ejecute `npm run docs:check`.

Las secuencias técnicas conservan los identificadores y nombres de los casos de
uso definidos en `front/docs/requirements/`. Los requisitos se mantienen allí;
las pruebas del backend verifican sus garantías HTTP y persistentes.

Conserve los resultados de comprobación y los límites de la revisión en CI o en la
solicitud de cambio. Los Markdown describen la versión vigente del sistema.
