# Nexus · Frontend Vue

Cliente web construido con Vue 3, TypeScript, Composition API y Vite. Presenta los
flujos de inventario, compras, salidas, movimientos, catálogos, personas, usuarios,
clientes y proveedores según los permisos de la cuenta.

## Desarrollo

La [sección para desarrolladores](docs/development/index.md) reúne instalación,
inicio local, comandos, comprobaciones, generación de capturas y despliegue.
El [inicio rápido](docs/development/01-getting-started.md) explica las dependencias,
variables locales, conexión a la API y diagnóstico.

## Cómo está construido

El [índice de documentación](docs/index.md) responde dónde encontrar reglas del
producto, arquitectura y contratos, pruebas y manuales. La
[arquitectura Vue](docs/architecture/index.md) describe navegación, componentes,
procesos, estado y comunicación con la API.

Las fuentes Markdown están en `docs/`. Los contratos TypeScript compartidos se
originan en `back/src/shared/`; Vite los incorpora durante la compilación. Los
comandos para validar y exportar documentación están en la sección de desarrollo.
