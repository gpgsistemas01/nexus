# Documentación de la API Nexus

El backend Express y Prisma de `back/` conserva los contratos HTTP, reglas de negocio,
transacciones y operación de PostgreSQL. La interfaz de usuario se implementa en
`front/` con Vue 3 y tiene [documentación propia](../../front/docs/index.md).

Los comandos y rutas técnicas de esta colección se interpretan desde `back/`.
Docker y Docker Compose se ejecutan desde la raíz del repositorio.

## Fuentes de verdad

| Familia | Documento propietario | Mantenimiento |
| --- | --- | --- |
| API HTTP | [OpenAPI y contrato HTTP](architecture/openapi/index.md) | Rutas registradas, permisos, JSON, multipart y archivos. |
| Backend y datos | [Arquitectura](architecture/index.md) | Código Express, servicios, repositories y Prisma. |
| Modelo persistente | [Datos y persistencia](architecture/views/logical/data-and-persistence/index.md) | Prisma y migraciones incrementales. |
| Dominio | [Requisitos](requirements/index.md) y [casos de uso](requirements/use-cases/index.md) | Reglas y resultados observables. |
| Pruebas del backend | [Plan](testing/test-plan.md) y [registro selectivo](testing/automated-test-case-index.md) | Unitarias, HTTP/Prisma y migraciones. |
| Gobierno | [Gobernanza](governance/index.md) | Propietarios, revisión y publicación. |
| Interfaz Vue | [arquitectura de Vue](../../front/docs/architecture/index.md) | Componentes, navegación, formularios y transporte del cliente. |
| Uso del sistema | [Manuales Vue](../../front/docs/user-manual/index.md) | Procedimientos y capturas por cuenta. |

## Validación y publicación

`npm run docs:architecture` regenera el mapa de código, esquema y diccionario de datos.
Esos archivos generados no se editan manualmente. `npm run docs:check` comprueba sus
fuentes y el contrato OpenAPI. Un cambio funcional actualiza también su documento
curado propietario.

`npm run docs:export -- <familia> <seccion> ambos` exporta la documentación técnica.
Los manuales y las capturas se preparan desde `front/`, con sus
[comandos](../../front/docs/development/00-commands.md). La generación y
publicación conservan las reglas de la [guía de exportación](governance/document-export-guide/index.md).

## Responsabilidades

Requisitos explica qué resultado necesita el actor; arquitectura explica cómo lo
realizan los componentes. Los casos de uso pertenecen a requisitos. Las secuencias
backend describen adaptadores HTTP y servicios; las colaboraciones Vue permanecen
en la colección del cliente. Cada documento conserva una sola responsabilidad.
