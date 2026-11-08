# 1. Repositorio y estructura de fuentes

`back/` implementa la API Express, Socket.IO y persistencia Prisma. `front/` contiene
la aplicación Vue 3 con TypeScript y Vite. Cada aplicación instala sus dependencias
y ejecuta sus propios comandos desde su carpeta.

| Área del backend | Responsabilidad |
| --- | --- |
| `src/app.js` | Construye Express, registra middlewares, API y rutas del proceso. |
| `src/routes/api`, `src/controllers/api` | Contratos HTTP y adaptación por dominio. |
| `src/routes/system` | Salud, documentación API de desarrollo y cierre de sesión. |
| `src/services`, `src/repository` | Reglas, transacciones y consultas reutilizables. |
| `src/shared` | Contratos y reglas públicas compilados por Vue. |
| `prisma` | Esquema, migraciones y generación del cliente. |

La presentación, navegación y captura pertenecen a [arquitectura de Vue](../../../../../../front/docs/architecture/index.md). Los módulos
compartidos se importan durante la compilación; la API no publica sus fuentes como
archivos estáticos. Las fórmulas privadas permanecen exclusivamente en el servidor.
