# Documentación técnica del frontend Vue

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.2 | 1.0.0 | En revisión | 2026-10-26 | Equipo de desarrollo |

La versión del sistema corresponde a Nexus; el manifiesto npm del frontend conserva
su versión técnica propia. La aceptación técnica sigue pendiente de la función
responsable definida por gobernanza. Git conserva el historial; no acredita aprobación.

## Propósito, audiencia y alcance

Esta colección explica a desarrollo y revisión técnica cómo está implementado el
frontend de `front/src`, dónde cambiar una capacidad y qué contratos debe preservar.
Mantiene diseño, responsabilidades, decisiones y evidencia del cliente Vue. Su
mantenimiento corresponde al equipo de desarrollo; la revisión y aceptación siguen
el [gobierno documental](../../back/docs/governance/documentation-standards/06-responsibilities-and-change-control.md).
La colección permanece en revisión y Git conserva el historial de sus cambios.

Los requisitos y reglas de negocio normativas pertenecen a la
[SRS](../../back/docs/requirements/requirements-specification/index.md) y sus casos
de uso. El contrato HTTP procesable permanece en
[OpenAPI](../../back/docs/architecture/openapi/api-contract.md). Estas guías
documentan su realización en Vue; no sustituyen esas fuentes ni la validación de
Express. La [referencia EJS](../../back/docs/architecture/views/development/frontend-technical-documentation/index.md)
describe otra implementación del navegador, no una plantilla que Vue deba copiar.

## Criterios documentales adaptados a Vue

La tecnología cambia los elementos que describimos, no la necesidad de explicar
propósito, responsabilidad, contratos y evidencia. Se seleccionan conceptos del
[criterio documental del proyecto](../../back/docs/governance/documentation-standards/03-application-by-type-of-document.md);
no se traslada completa una plantilla de backend ni se exige cumplir una ISO para
crear un componente. La estructura Markdown de estas guías es una convención local.

| Referencia | Aplicación al frontend | Límite y diferencia técnica |
| --- | --- | --- |
| Documentación oficial de Vue y configuración local | Props/eventos, composables, slots, provide/inject, ciclo de vida y Composition API. | Son mecanismos del framework. TypeScript, ESLint y Prettier concretan las convenciones del código, no certifican arquitectura. |
| IEEE 1016-2009 | Describir responsabilidades, interfaces, relaciones y decisiones de componentes, composables, servicios y mappers. | Referencia histórica de diseño, en estado Inactive-Reserved según IEEE. Se adopta selectivamente; no prescribe carpetas Vue, clases ni una ficha por método. |
| ISO/IEC/IEEE 42010:2022 | Explicar preocupaciones de organización, estado, dependencias, transporte y despliegue con vistas útiles. | Se aplica al conjunto o colaboración relevante, no como plantilla obligatoria de cada función. Los diagramas distinguen modelo general y aplicación. |
| ISO/IEC/IEEE 15289:2019 | Conservar propósito, audiencia, fuentes, mantenimiento y relaciones entre guías. | Gobierna información del proyecto; no define cómo implementar reactividad o formularios. |
| ISO/IEC/IEEE 29148:2018 | Enlazar la realización Vue con requisitos y casos de uso existentes. | La SRS sigue siendo propietaria de las obligaciones. Estas guías no vuelven a especificar el comportamiento del negocio. |
| ISO/IEC/IEEE 29119-2, -3 y -4 | Diseñar condiciones y oráculos, separar caso y resultado, seleccionar técnicas según el riesgo. | Unitarias/composables y jsdom comprueban el cliente; Playwright comprueba navegador. API simulada no sustituye integraciones HTTP/Prisma del backend. |
| ISO/IEC 25010:2023 | Usar el vocabulario de calidad cuando se revisan mantenibilidad, interacción, seguridad o desempeño. | No se inventan tiempos, cobertura mínima ni conformidad sin requisitos y mediciones acordadas. |

No se declara conformidad integral ni certificación. Los enlaces de referencia y
la decisión de adopción permanecen en [gobernanza](../../back/docs/governance/documentation-standards/index.md).
Las [reglas de codificación](../../back/docs/architecture/coding-standards/index.md)
conservan el formato local; la documentación explica cómo aplicarlo a Vue.

## Diferencias que deben conservarse frente a EJS y Express

| Tema | Descripción apropiada para este cliente |
| --- | --- |
| Navegación y renderizado | SPA con Vue Router, componentes y rutas diferidas. No atribuir al cliente el renderizado EJS ni controladores HTTP. |
| Estado y responsabilidades | Páginas contenedoras, props/eventos y composables por instancia; sesión proporcionada desde el arranque. No crear repositories ni stores sólo para imitar capas del servidor. |
| Interacción y bibliotecas | Controles gestionados por Vue/Vuetify, slots y ciclo de vida. No trasladar listeners, Select2/MDB o manipulación del DOM de EJS como patrón de Vue. |
| Validación | Reglas públicas y adaptación a VeeValidate; momento de error y captura en el cliente. Credenciales, permisos y validación definitiva en Express. |
| Operaciones asíncronas | AbortSignal, invalidación de respuestas antiguas, estados de carga/error y desmontaje. Cancelar el cliente no revierte una transacción. |
| SOLID y patrones | Evaluar contratos y dependencias funcionales. No afirmar Abstract Factory, State o Liskov de clases donde sólo hay funciones y uniones de TypeScript. |
| Inicio y despliegue | Vite y Express son procesos distintos; `dist` contiene los archivos del cliente. Las guías y herramientas documentales permanecen fuera del contenedor de producción. |

El [catálogo de patrones](patterns/01-applicability-and-principles.md) distingue lo aplicado de mecanismos y
principios. La [guía de inicio](development/01-getting-started.md) mantiene el procedimiento para
preparar y arrancar esta copia, sin convertir requisitos de backend en código Vue.

## Estructura y fuentes propietarias

```text
front/docs/
├── index.md       # Entrada, alcance, criterios y correspondencias
├── architecture/  # Estructura, vistas web, interfaz/HTTP y entradas
├── patterns/      # Aplicabilidad, modelos generales y aplicaciones en código
├── modules/       # Realización de capacidades y contratos del cliente
├── development/   # Inicio local y herramientas
├── requirements/  # Aplicación de la SRS y casos de uso canónicos
└── testing/       # Diseños, fichas críticas, cobertura y brechas
```

Cada colección conserva un `index.md` y capítulos `01-`, `02-`, etc. Los títulos
numerados coinciden con su índice; los identificadores `DIA-*`, `DP-*`, `CP-*` y
`CU-*` no cambian al reubicar una guía. La numeración y las carpetas son una
convención de Nexus, no una estructura que ISO imponga a Vue.

| Colección | Pregunta y contenido propietario | Fuentes técnicas |
| --- | --- | --- |
| [Arquitectura](architecture/index.md) | ¿Cómo se organiza el cliente y qué fronteras preserva? Estructura, vistas, interfaz/transporte y tratamiento de datos. | [app](../src/app), [modules](../src/modules), [shared](../src/shared) y configuración. |
| [Patrones](patterns/index.md) | ¿Qué decisiones tienen consumidores reales y cómo colaboran? Aplicabilidad, principios, diagramas generales/específicos y responsabilidades de documentos. | Símbolos y archivos enlazados por cada capítulo. |
| [Módulos](modules/index.md) | ¿Cómo realiza Vue las capacidades existentes? Rutas, modos, permisos de interfaz, contratos y límites del cliente. | Módulo correspondiente, Router, API y pruebas. |
| [Desarrollo](development/index.md) | ¿Cómo preparar y arrancar la copia? Instalación, entorno y herramientas. | Manifiestos npm, archivos de ejemplo y configuraciones. |
| [Requisitos y casos de uso](requirements/index.md) | ¿Qué obligaciones y objetivos debe realizar el cliente? Aplicación y trazabilidad hacia las fuentes normativas. | SRS y fichas canónicas, sin duplicarlas. |
| [Pruebas](testing/index.md) | ¿Qué condiciones comprueba cada nivel y qué falta acreditar? Diseños, fichas selectivas y cobertura del cliente. | [tests](../tests), fixtures y evidencia de ejecución de cada revisión. |

El primer recorrido es [iniciar el proyecto](development/01-getting-started.md),
comprender la arquitectura y consultar el módulo que se va a cambiar. Los índices
de colección son la lista de capítulos; esta entrada no mantiene una segunda lista
exhaustiva de los mismos archivos. Las tablas de correspondencia responden otra
pregunta: cómo llegar a las obligaciones y a su evidencia.

## Contenido mínimo según el tipo de guía

Se exige contenido útil, no repetir encabezados vacíos ni dar a todas las guías la
forma de un caso de uso. Una sección se omite cuando no aplica y su ausencia no
oculta un contrato o una decisión pendiente.

| Tipo | Información que debe permitir localizar | Límite de su responsabilidad |
| --- | --- | --- |
| Arquitectura | Alcance/interesados, preocupación, elementos y responsabilidades, relaciones/interfaces, justificación, restricciones y fuente de la evidencia. | No sustituir la SRS, el inventario generado ni OpenAPI. |
| Patrón o mecanismo | Problema, motivo de elección, clasificación honesta, modelo general, aplicación en código, contrato, límites y pruebas representativas. | No inventar clases, herencia ni todos los patrones del backend; un diagrama no acredita cumplimiento de SOLID. |
| Módulo/página | Propósito, caso relacionado, contenedor/composable propietario, modos y permisos, captura/errores, solicitud/respuesta y evidencia del cliente. | Distinguir la regla normativa, su realización y la autorización definitiva de Express. |
| Inicio/operación local | Preparación, directorio de cada comando, archivos locales, secuencia, resultado esperado y recuperación de fallos. | No suponer credenciales, una cuenta inicial o un proveedor ya desplegado. |
| Diseño de pruebas | Requisito/riesgo, condición observable, nivel, técnica y resultado esperado; enlace a casos/fixtures y límites de simulación. | Las ejecuciones `EP-*` permanecen en CI o en la revisión; no se copian resultados de cada corrida a estas guías. |

Las figuras tienen ID, pregunta, alcance, fuente y leyenda. Los modelos generales
explican el mecanismo; las aplicaciones nombran el código. Se conservan junto a
su propietario y se enlazan desde las otras vistas, sin otra copia editable.

## Correspondencia con requisitos y casos de uso

La [aplicación de requisitos](requirements/01-applicability-and-traceability.md)
conserva el criterio para usar las fichas canónicas. La
[cobertura por caso de uso](testing/03-use-case-coverage.md) es propietaria de la
relación entre requisito, CU, diseño y evidencia del cliente, con sus límites y
brechas. Esta entrada no mantiene otra matriz de los mismos resultados.

Las [fichas selectivas](testing/02-test-cases.md) concretan precondiciones, datos,
pasos, oráculos y limpieza de los casos críticos. El diseño no es un resultado
aprobado; las ejecuciones `EP-*` permanecen en CI o en la revisión del cambio.

## Mantenimiento y publicación

El equipo de desarrollo prepara y sincroniza estas fuentes; la revisión técnica
contrasta código, contratos y evidencia. La aceptación corresponde al responsable
técnico por designar según gobernanza; hasta registrarla se conserva **En revisión**.
Un cambio editorial no eleva la versión del sistema. La versión documental sigue
[el criterio común](../../back/docs/governance/publication-and-versioning/05-versioning.md).

La solicitud de cambio identifica motivo, guías/IDs afectados, comprobaciones,
resultado y pendientes. No se mantiene un registro paralelo de cada commit.
Al cambiar una guía se comprueban propósito y audiencia, propiedad del contenido,
correspondencia con código/contrato, enlaces y anclas, jerarquía de títulos y
evidencia disponible. Las decisiones pendientes se presentan como propuestas;
mediciones y aprobaciones sólo se registran cuando existen. Un cambio de flujo
obliga a revisar su guía, requisitos afectados y diseño de pruebas.

`npm --prefix back run docs:check` valida inventarios generados y OpenAPI; no revisa
automáticamente toda la prosa ni acredita adopción de normas. Esta colección se
valida y publica desde la raíz del repositorio con:

```bash
npm --prefix back run docs:export -- arquitectura frontend-vue --check
npm --prefix back run docs:export -- arquitectura frontend-vue ambos
```

La entrada y la versión documental pertenecen a este índice. El paquete incluye
las seis colecciones mediante sus fuentes de `front/docs`, sin copiarlas a
`back/docs`. El DOCX/PDF se genera bajo `back/build/docs`, que no forma parte de
la imagen de producción. Los cambios de figuras
o exportador requieren además renderizado y revisión DOCX/PDF según la
[guía de publicación](../../back/docs/governance/document-export-guide/index.md).

Estas fuentes permanecen en Git, fuera de `front/public` y `front/dist`.
[Dockerfile.dockerignore](../Dockerfile.dockerignore) excluye `front/docs` del
contexto frontend; el [Dockerfile](../Dockerfile) sólo lleva `dist` a Nginx.
El Dockerfile del backend excluye `front/` mediante el `.dockerignore` de la raíz.
La exportación documental es una tarea de desarrollo/CI, no del contenedor de producción.
