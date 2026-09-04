# Arquitectura y construcción de Nexus

## Propósito

Este índice presenta la documentación arquitectónica por pregunta y nivel de detalle.
Es la entrada de la familia; no repite decisiones ni diagramas que tienen un documento
propietario. Nexus se describe como un **monolito modular por dominio con arquitectura
por capas** y una correspondencia de **MVC web extendido**.

## Orden de lectura recomendado

1. [Descripción de arquitectura y construcción](architecture-and-web-views.md): contexto,
   contenedores, despliegue, componentes, recorrido extremo a extremo y organización de
   las capas.
2. [Patrones de diseño y construcción](design-and-construction-patterns.md): definición,
   evidencia y reglas de aplicación de los patrones confirmados.
3. [Diagramas vigentes del código](code-diagrams.md): superficie HTTP, dominios,
   colaboraciones y reutilización observada.
4. [Navegación y catálogo de pantallas web](web-navigation-and-screen-catalog.md): estados
   de acceso, mapa del menú, pantallas y redirecciones.
5. [Mapa generado del código](../generated/code-map.md): rutas, dependencias reales entre
   áreas y exportaciones detectadas automáticamente.

## Vistas y responsabilidades

| Pregunta | Vista propietaria | Mantenimiento |
| --- | --- | --- |
| ¿Quién usa Nexus y de qué sistemas externos depende? | Contexto en la descripción de arquitectura. | Curado cuando cambia el límite del sistema. |
| ¿Dónde se ejecutan cliente, servidor y persistencia? | Contenedores y despliegue en la descripción de arquitectura. | Curado cuando cambia la topología. |
| ¿Cuál es el patrón arquitectónico y cómo se dividen las responsabilidades? | Componentes y organización por capas en la descripción; catálogo de patrones para la justificación. | Curado cuando cambia una decisión de diseño. |
| ¿Qué dependencias existen realmente en el código? | Mapa generado y diagramas vigentes del código. | `npm run docs:architecture` y revisión manual, respectivamente. |
| ¿Cómo se ejecuta un caso de uso concreto? | Secuencias de código de [backend](backend-code-sequences/index.md) y [frontend](frontend-code-sequences/index.md), divididas por grupo funcional. | Curado junto con el caso afectado. |
| ¿Por qué se eligió una alternativa arquitectónica transversal? | [Registros de decisiones](decisions/index.md). | Crear o reemplazar un ADR cuando cambie una decisión relevante. |
| ¿Cómo navega una persona por las pantallas? | Navegación y catálogo de pantallas web. | Curado junto con rutas, permisos y vistas. |
| ¿Qué diagramas existen y qué notación usan? | [Inventario](diagram-inventory.md) y [convenciones](diagram-conventions.md). | Actualizar al agregar, retirar o cambiar una vista. |

## Regla de división

Cada documento responde una clase de pregunta. Los diagramas de contexto, contenedores,
componentes y despliegue presentan arquitectura; las secuencias y actividades presentan
comportamiento; la navegación presenta experiencia web; el mapa generado presenta
hechos mecánicos del código. Cuando una vista existente responde la pregunta, se enlaza
en lugar de duplicarla.

La documentación curada explica intención y decisiones. Los inventarios generados sólo
presentan información inferible desde `src` o Prisma y se validan mediante
`npm run docs:check`.
