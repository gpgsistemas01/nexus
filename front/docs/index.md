# Documentación técnica del frontend Vue

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.3 | 1.0.0 | En revisión | 2026-10-26 | Equipo de desarrollo |

La versión del sistema corresponde a Nexus; el manifiesto npm del frontend conserva
su versión técnica propia. La aceptación técnica sigue pendiente de la función
responsable definida por gobernanza. Git conserva el historial; no acredita aprobación.

## Propósito, audiencia y alcance

Esta colección documenta la aplicación Vue de `front/src` para desarrollo, revisión
y pruebas. Contiene explicación propia de requisitos, casos de uso, arquitectura,
patrones, módulos, código, pruebas, instalación y publicación. El lector puede
comprender esos temas sin abrir documentos de Express. Se repiten conceptos del
producto cuando son necesarios y se explican conforme a los contratos del cliente.

El equipo de desarrollo mantiene las guías y la revisión técnica contrasta su
contenido con fuentes y evidencia. El [gobierno local](governance/index.md) define
responsables, criterios y publicación; la aceptación permanece En revisión.
La [especificación Vue](requirements/02-client-specification.md) y sus fichas
`CU-VUE-*` contienen comportamientos y resultados propios. Los IDs del producto
se conservan como correspondencia, sin confundir una interacción Vue con una
transacción o una autorización definitiva de Express.

Las fuentes públicas compartidas pueden residir en `back/src` y el motor común
de exportación en `back/scripts`; esto no convierte sus documentos en el contenido
de esta colección. Los enlaces al servidor sirven como referencia complementaria.
Las decisiones de interfaz, reactividad, responsabilidades y pruebas se describen aquí.

## Criterios documentales adaptados a Vue

La [revisión específica de estándares](governance/03-standard-applicability.md)
distingue referencias que se conservan, adaptaciones por artefacto y convenciones
propias de Vue, con fuentes primarias de ISO, IEEE y el framework.

La tecnología cambia los elementos que describimos, no la necesidad de explicar
propósito, responsabilidad, contratos y evidencia. Se seleccionan conceptos del
[criterio documental del proyecto](governance/01-documentation-rules.md);
no se traslada completa una plantilla de backend ni se exige cumplir una ISO para
crear un componente. La estructura Markdown de estas guías es una convención local.

| Referencia | Aplicación al frontend | Límite y diferencia técnica |
| --- | --- | --- |
| Documentación oficial de Vue y configuración local | Props/eventos, composables, slots, provide/inject, ciclo de vida y Composition API. | Son mecanismos del framework. TypeScript, ESLint y Prettier concretan las convenciones del código, no certifican arquitectura. |
| IEEE 1016-2009 | Describir responsabilidades, interfaces, relaciones y decisiones de componentes, composables, servicios y mappers. | Referencia histórica de diseño, en estado Inactive-Reserved según IEEE. Se adopta selectivamente; no prescribe carpetas Vue, clases ni una ficha por método. |
| ISO/IEC/IEEE 42010:2022 | Explicar preocupaciones de organización, estado, dependencias, transporte y despliegue con vistas útiles. | Se aplica al conjunto o colaboración relevante, no como plantilla obligatoria de cada función. Los diagramas distinguen modelo general y aplicación. |
| ISO/IEC/IEEE 15289:2019 | Conservar propósito, audiencia, fuentes, mantenimiento y relaciones entre guías. | Gobierna información del proyecto; no define cómo implementar reactividad o formularios. |
| ISO/IEC/IEEE 29148:2018 | Especificar obligaciones del cliente, fichas de interacción y correspondencia con el producto. | La especificación local explica el contrato del cliente; no atribuye a Vue transacciones o autorizaciones del servidor. |
| ISO/IEC/IEEE 29119-2, -3 y -4 | Diseñar condiciones y oráculos, separar caso y resultado, seleccionar técnicas según el riesgo. | Unitarias/composables y jsdom comprueban el cliente; Playwright comprueba navegador. API simulada no sustituye integraciones HTTP/Prisma del backend. |
| ISO/IEC 25010:2023 | Usar el vocabulario de calidad cuando se revisan mantenibilidad, interacción, seguridad o desempeño. | No se inventan tiempos, cobertura mínima ni conformidad sin requisitos y mediciones acordadas. |

No se declara conformidad integral ni certificación. Los enlaces de referencia y
la decisión de adopción permanecen en [gobernanza](governance/01-documentation-rules.md).
Las [reglas de codificación](development/03-coding-standards.md)
conservan el formato local; la documentación explica cómo aplicarlo a Vue.

## Criterios de la implementación Vue

| Tema | Descripción apropiada para este cliente |
| --- | --- |
| Navegación y renderizado | SPA con Vue Router, componentes y rutas diferidas; Express proporciona la API. |
| Estado y responsabilidades | Páginas contenedoras, props/eventos y composables por instancia; sesión proporcionada desde el arranque. No crear repositories ni stores sólo para imitar capas del servidor. |
| Interacción y bibliotecas | Controles gestionados por Vue/Vuetify, slots y ciclo de vida; el estado reactivo gobierna el DOM de los componentes. |
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
├── requirements/  # Especificación y fichas de interacción Vue
├── testing/       # Plan, diseños, fichas, cobertura y brechas
└── governance/    # Reglas y publicación propias del cliente
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
| [Requisitos y casos de uso](requirements/index.md) | ¿Qué obligaciones y objetivos debe realizar el cliente? Especificación, flujos completos y trazabilidad. | Contratos observables del cliente, fichas CU-VUE y correspondencias del producto. |
| [Gobierno](governance/index.md) | ¿Cómo redactar, mantener y publicar esta colección? | Reglas locales, índices, scripts y motor de publicación compartido. |
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
define las fichas locales y la relación con los identificadores del producto. La
[cobertura por caso de uso](testing/03-use-case-coverage.md) es propietaria de la
relación entre requisito, CU, diseño y evidencia del cliente, con sus límites y
brechas. Esta entrada no mantiene otra matriz de los mismos resultados.

Las [fichas selectivas](testing/02-test-cases.md) concretan precondiciones, datos,
pasos, oráculos y limpieza de los casos críticos. El diseño no es un resultado
aprobado; las ejecuciones `EP-*` permanecen en CI o en la revisión del cambio.

## Mantenimiento y publicación

El [procedimiento propio](governance/02-generation-and-publication.md) distingue
fuentes curadas, referencia generada y artefactos. La versión del documento y su
estado se mantienen en este índice; Git conserva historial, sin acreditar aceptación.
El estándar de código está en [Desarrollo](development/03-coding-standards.md) y el
plan de pruebas en [Pruebas](testing/05-test-plan.md), con contenido local completo.

Desde la raíz del repositorio:

```bash
npm --prefix front run docs:generate
npm --prefix front run docs:check
npm --prefix front run docs:export -- ambos
```

`docs:generate` actualiza la referencia técnica desde SFC/TypeScript. `docs:check`
comprueba que corresponda al código y valida las fuentes/enlaces del paquete.
No certifica la prosa, los patrones o todos los requisitos; requiere revisión.
`docs:export` publica DOCX y PDF dentro de `front/build/docs`, con fuentes completas
de las siete colecciones. La herramienta de renderizado se comparte, sin copiar
los documentos backend como una publicación Vue ni modificar su documentación.

Los cambios de figuras requieren renderizado y revisión representativa DOCX/PDF.
Las fuentes están en Git fuera de `public` y `dist`; los artefactos `build/` son
locales/CI. [Dockerfile.dockerignore](../Dockerfile.dockerignore) excluye guías,
herramientas documentales y resultados del contexto frontend. El [Dockerfile](../Dockerfile)
lleva sólo los assets compilados a Nginx. Ningún proceso de documentación se ejecuta
al servir la aplicación en producción.
