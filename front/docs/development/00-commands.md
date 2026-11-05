# Comandos para desarrollo

Consulta rápida para Vue, API, pruebas y documentación. Todos los comandos de esta
página se ejecutan desde la **raíz del repositorio**. Los manifiestos de
[Vue](../../package.json) y [Express](../../../back/package.json) son la fuente de los scripts.

## Iniciar el sistema y acceder desde la red local

| Acción | Comando |
| --- | --- |
| Instalar API | `npm --prefix back ci --include=dev` |
| Instalar Vue | `npm --prefix front ci --include=dev` |
| Aplicar migraciones de desarrollo y generar Prisma | `npm --prefix back run db:migrate` |
| Generar sólo Prisma | `npm --prefix back run db:generate` |
| Iniciar API, primera terminal | `npm --prefix back run dev` |
| Iniciar Vue, segunda terminal | `npm --prefix front run dev` |
| Iniciar API sin recarga | `npm --prefix back start` |

Prepara la conexión y los secretos locales según la [guía de inicio](01-getting-started.md).
Comprueba la base seleccionada antes de migrar.

En el equipo servidor abre `http://localhost:5173/inicio-sesion`. Desde un móvil
en la misma red abre `http://<IP_LOCAL_DEL_EQUIPO>:5173/inicio-sesion`. Vite ya
escucha en todas las interfaces; permite el puerto 5173 en el firewall local.
El proxy de Vite conecta con la API en ese mismo equipo, normalmente por
`http://127.0.0.1:3000`. No cambies su destino por la IP del móvil. Conserva el mismo
host durante la sesión.

La API usa [nodemon.json](../../../back/nodemon.json) para vigilar `src/` y `.env`.
Las dependencias de `node_modules/` y el cliente generado no provocan reinicios
durante el primer acceso a Prisma. Después de regenerar Prisma, reinicia la API.

## Comprobar y compilar Vue

| Acción | Comando |
| --- | --- |
| Formato, lint, unitarias y build con tipos | `npm --prefix front run check` |
| Comprobar tipos | `npm --prefix front run type-check` |
| Vigilar tipos | `npm --prefix front run type-check:watch` |
| Comprobar formato / lint | `npm --prefix front run format:check` / `npm --prefix front run lint` |
| Corregir formato y lint | `npm --prefix front run format` |
| Corregir sólo lint | `npm --prefix front run lint:fix` |
| Compilar con tipos | `npm --prefix front run build` |
| Compilar sin comprobar tipos | `npm --prefix front run build-only` |
| Revisar `front/dist/` | `npm --prefix front run preview` |

## Pruebas

| Acción | Comando |
| --- | --- |
| Unitarias Vue | `npm --prefix front run test:unit` |
| Unitarias API | `npm --prefix back run test:unit` |
| Unitarias interactivas | `npm --prefix front run test:watch` / `npm --prefix back run test:watch` |
| Instalar Chromium | `npm exec --prefix front -- playwright install chromium` |
| Navegador con API simulada | `npm --prefix front run test:e2e` |
| Sistema Vue + API + PostgreSQL | `npm --prefix front run test:e2e:system` |
| Verificar base aislada | `npm --prefix back run test:db:verify` |
| Migrar base aislada y generar Prisma | `npm --prefix back run test:db:migrate` |
| Integración API con PostgreSQL | `npm --prefix back run test:integration` |
| Cobertura unitaria / integración API | `npm --prefix back run test:coverage` / `npm --prefix back run test:coverage:integration` |
| Rendimiento API / carga mixta | `npm --prefix back run test:performance` / `npm --prefix back run test:performance:mixed` |

`test` es alias de `test:unit` en ambas aplicaciones; `test:db` es alias de
`test:integration` en la API. Las pruebas con persistencia requieren
`DATABASE_TEST_URL`, distinta de la base habitual. Consulta la
[preparación de sistema](../testing/05-system-tests.md) y los
[archivos de pruebas](../testing/06-test-files-and-credentials.md).

## Documentación y contratos

| Acción | Comando |
| --- | --- |
| Regenerar referencias Vue y TypeScript | `npm --prefix front run docs:generate` |
| Validar fuentes Vue, enlaces y referencias del manual | `npm --prefix front run docs:check` |
| Regenerar arquitectura API | `npm --prefix back run docs:architecture` |
| Validar arquitectura y contrato API | `npm --prefix back run docs:check` |
| Revisar / agrupar OpenAPI | `npm --prefix back run docs:api:lint` / `npm --prefix back run docs:api:bundle` |
| Exportar toda la documentación técnica Vue | `npm --prefix front run docs:export -- ambos` |
| Exportar un tema Vue | `npm --prefix front run docs:export -- inicio ambos` |
| Exportar un tema API | `npm --prefix back run docs:export -- arquitectura backend ambos` |

Vue admite `docs:export -- [seccion] [docx|pdf|ambos]`. Los temas y requisitos de
Pandoc, LibreOffice y Mermaid están en [publicación](../governance/02-generation-and-publication.md).
La [guía del exportador común](../../../back/docs/governance/document-export-guide/04-commands.md)
describe las selecciones de API y sus opciones de comprobación.

## Capturas y manuales por cuenta

Configura las cuentas locales con la [guía por cuenta](../governance/07-manual-accounts-and-files.md).
La API debe estar activa; la herramienta prepara Vue. El recorrido sólo consulta registros.

| Acción | Comando |
| --- | --- |
| Capturas de todas las cuentas | `npm --prefix front run docs:screenshots -- --all` |
| Capturas de una cuenta | `npm --prefix front run docs:screenshots -- --profile cuenta-01` |
| Capturas y Word/PDF de todas las cuentas | `npm --prefix front run docs:manuals -- --all` |
| Rehacer las capturas de una cuenta | `npm --prefix front run docs:screenshots -- --profile cuenta-01 --fresh` |
| Ver opciones | `npm --prefix front run docs:manuals -- --help` |
| Capturas generales con datos ficticios | `npm --prefix front run docs:screenshots:reference` |
| Word/PDF del manual general | `npm --prefix front run docs:manual:reference -- ambos` |

En el primer uso se generan todas las capturas requeridas. Al repetir el mismo
comando, cada cuenta conserva las completas de su revisión vigente y genera sólo
las faltantes o pendientes. `--missing` conserva este comportamiento; no es
necesario agregarlo. `--fresh` rehace el conjunto seleccionado.
`docs:manual` es alias de `docs:manuals`.

Las imágenes se generan y revisan por separado; los PNG nuevos y las ediciones
por cuenta están ignorados por Git. `docs:check` comprueba las referencias del
manual sin exigir los archivos generados. La exportación exige todas las imágenes
necesarias para la publicación elegida.

## Docker

| Acción | Comando |
| --- | --- |
| Construir Vue | `docker build -f front/Dockerfile -t nexus-front .` |
| Construir e iniciar API | `docker compose up --build` |
| Consultar logs API | `docker compose logs app` |

Consulta [proxy y alojamiento](03-build-and-deployment.md) para conectar los contenedores.
