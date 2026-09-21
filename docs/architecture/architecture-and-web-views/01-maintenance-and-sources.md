# 1. Mantenimiento y fuentes

### ¿Qué se actualiza automáticamente?

| Artefacto | Pertenece a | Fuente | Actualización |
| --- | --- | --- | --- |
| `docs/generated/code-map.md` | Arquitectura y construcción | Routers e importaciones de `src` | Se regenera con `npm run docs:architecture`; CI ejecuta `npm run docs:check` y bloquea cambios desactualizados. |
| `docs/generated/database-schema.md` | Datos, acceso y operación | Modelos y relaciones de `prisma/schema.prisma` | Se regenera con el mismo comando; se valida en cada solicitud de cambio. |
| `docs/generated/data-dictionary.md` | Datos, acceso y operación | Campos, claves, tipos y relaciones propietarias de `prisma/schema.prisma` | Se regenera con el mismo comando; complementa el esquema sin duplicarlo manualmente. |
| Diagramas de contexto, contenedores, despliegue y secuencia de este documento | Arquitectura y construcción | Decisiones de arquitectura, configuración versionada y experiencia de usuario | Son curados y se revisan cuando cambia el diseño o la configuración de ejecución. |
| `docs/architecture/code-diagrams/index.md` | Arquitectura y construcción | Routers, capas, servicios y componentes reutilizables | Es curado; se revisa manualmente al cambiar estructura, colaboración, flujo o patrón aplicado. |
| `docs/architecture/web-navigation-and-screen-catalog/index.md` | Arquitectura y construcción | Rutas, permisos, controladores, EJS y comportamiento visible | Es curado porque el código no puede inferir propósito, navegación ni estado funcional. |

La separación es intencional: generar relaciones mecánicas evita trabajo repetitivo,
pero no se presenta como «automática» una explicación que requiere criterio humano. En
las solicitudes de cambio, CI no modifica la rama: exige revisar los artefactos derivados
junto con el código que los produjo. Como red de seguridad, un envío a
`main` regenera los tres artefactos (`code-map.md`, `database-schema.md` y
`data-dictionary.md`) y crea una confirmación únicamente si detecta diferencias.
