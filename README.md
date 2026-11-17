# Nexus

Sistema de control operativo para inventario, compras, salidas y movimientos.
El backend Express y Prisma está en `back/`; el cliente Vue 3 y TypeScript está
en `front/`.

## Documentación

- **Desarrollar:** [guía para ejecutar y validar el sistema](front/docs/development/index.md)
  y [guía específica del backend](back/docs/development/index.md).
- **Entender la solución:** [arquitectura backend](back/docs/architecture/index.md)
  y [arquitectura Vue](front/docs/architecture/index.md).
- **Usar el sistema:** [manuales Vue](front/docs/user-manual/index.md).
- **Consultar requisitos:** [requisitos backend](back/docs/requirements/index.md)
  y [requisitos Vue](front/docs/requirements/index.md).

## Repositorio

```text
back/                 API Express, Prisma y documentación del backend
front/                Aplicación Vue y documentación del cliente
.github/workflows/    Integración continua
Dockerfile            Imagen del backend
docker-compose.yml    Backend local con Docker Compose
```

Los comandos de desarrollo, pruebas, documentación y despliegue están en las
guías de desarrollo de cada aplicación. Los manuales describen la operación para
usuarios.
