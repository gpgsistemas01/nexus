# 4. Imports, exports y dependencias

## Sintaxis y resolución

Los módulos TypeScript se importan con extensión `.js`, resuelta por TypeScript/Vite
al archivo fuente `.ts`. Los SFC usan `.vue`; herramientas Node, `.mjs`. Los tipos se
pueden importar con `import type`; su uso no debe introducir una dependencia de ejecución.
Mantener imports al inicio y agrupación estable de externos, colaboradores y tipos.
No envolver imports en `try/catch`; la recuperación del arranque rodea su operación
asíncrona, como en `main.ts`.

## Dirección admisible

| Consumidor | Puede depender de | Dependencia que debe evitar |
| --- | --- | --- |
| `app` | Contratos públicos de módulos y `shared`. | Duplicar reglas de captura en el router/layout. |
| Página de módulo | Sus composables, presentación, contratos y acceso de aplicación. | Páginas privadas de otro módulo. |
| Componente de presentación | Vue, controles visuales, tipos y presentación reutilizable. | Axios, sesión, stores, servicios, VeeValidate o validadores. |
| Composable de dominio | Servicios, reglas, contratos y composables transversales. | Otro formulario oculto o un registro global por pantalla. |
| Servicio/mapper | HTTP, tipos y funciones puras permitidas. | Vue, Router, Vuetify, páginas, composables y sesión. |
| `shared` | Librerías y contratos transversales. | `app` o módulos de negocio. |

ESLint comprueba las fronteras de `shared`, servicios/mappers y componentes. La revisión
comprueba también dependencias indirectas y el motivo de cambio de cada archivo.

## Alias públicos

Los alias `@nexus/*` se resuelven en `vite.config.ts` y los `paths` de TypeScript.
Su fuente es código público compatible con navegador: reglas de captura, constantes,
mensajes o cálculos de vista previa. La compilación necesita esos archivos del checkout;
el resultado se incorpora al bundle, sin una lectura del filesystem del servidor.
No importar Prisma, variables secretas, middleware, fórmulas privadas o políticas internas.
Cambiar un alias exige revisar Vite, TypeScript, pruebas y contexto de build.

## Carga diferida y ciclos

Las páginas de rutas y el proveedor visual se cargan dinámicamente. Esa elección
reduce el trabajo inicial; no sirve para ocultar un ciclo de dependencias. La composición
entre módulos se eleva a un Workspace que recibe eventos y callbacks tipados.
Los servicios conservan interfaces explícitas en lugar de localizar páginas mediante
cadenas o mantener registros globales mutables.

## Dependencias npm

Modificar manifiesto y lockfile juntos, revisar engines y compatibilidad del contrato,
e instalar desde `front/`. `npm ci --include=dev` reproduce la instalación; no se
versiona `node_modules`. Una dependencia de desarrollo sólo puede usarse en tooling
si no es requerida por el bundle en ejecución.
