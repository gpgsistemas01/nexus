# Desarrollo backend

Esta sección reúne los pasos para preparar, iniciar y validar la API en un entorno
local. Las variables de entorno, base de datos, migraciones y comandos se documentan
en una sola guía; arquitectura explica el diseño del sistema.

## Guías

| Necesidad | Documento |
| --- | --- |
| Preparar dependencias y entorno, ejecutar API, migrar datos y validar cambios | [Desarrollo local](local-development.md) |
| Entender capas, módulos, persistencia y contratos | [Arquitectura](../architecture/index.md) |
| Consultar rutas, permisos, cuerpos y respuestas HTTP | [OpenAPI](../architecture/openapi/index.md) |
| Ejecutar o interpretar las pruebas | [Plan de pruebas](../testing/test-plan.md) |
| Construir o mantener imágenes y servicios | [Vista física](../architecture/views/physical/index.md) |
| Generar y comprobar documentos | [Comandos de exportación](documentation.md) |

Los comandos de backend se ejecutan desde `back/`, salvo que se indique `npm --prefix back`
para ejecutarlos desde la raíz del repositorio.
