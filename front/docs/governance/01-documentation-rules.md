# 1. Reglas, responsabilidades y mantenimiento

## Propósito y audiencia

La documentación permite preparar, entender, modificar y comprobar la aplicación
Vue sin reconstruir su funcionamiento a partir de enlaces al servidor. La redactan
desarrollo y pruebas; la revisan quienes mantienen el módulo y sus consumidores.
El contenido corresponde al código versionado, no al estado supuesto de un despliegue.

## Responsables y aceptación

| Función | Responsabilidad |
| --- | --- |
| Desarrollo del frontend | Mantener componentes, contratos, comandos, diagramas y documentación junto al cambio. |
| Revisión técnica | Contrastar la descripción con imports, props/eventos, composables, servicios, configuración y pruebas. |
| Pruebas | Identificar riesgo, datos, oráculo, nivel y límites; conservar el resultado de la ejecución fuera de las fichas permanentes. |
| Responsable funcional/técnico | Aceptar requisitos y recorridos cuando exista una designación y evidencia suficientes. Hasta registrarlo, el estado es En revisión. |

Un commit, compilación o prueba aprobada no acredita aceptación funcional ni una
certificación. No se solicita autorización por cada edición reversible de una guía.

## Colecciones y contenido

| Colección | Contenido que debe explicar por sí misma |
| --- | --- |
| `requirements` | Alcance del cliente, obligaciones observables, datos, restricciones, actores y fichas de interacción. |
| `architecture` | Responsabilidades, estado, dependencias, transporte, entradas y despliegue; inventario técnico generado separado de las decisiones. |
| `patterns` | Problema, decisión, modelo general, aplicación con nombres reales, límites y evidencia. |
| `modules` | Rutas, campos, modos, permisos, efectos, errores y propietarios de cada capacidad Vue. |
| `development` | Instalación, archivos locales, comandos, herramientas, estándar de código, compilación y publicación. |
| `testing` | Plan propio, condiciones, casos, datos, oráculos, cobertura y preparación de ambientes. |
| `governance` | Reglas editoriales, mantenimiento, generación y publicación. |

Los conceptos compartidos con el servidor pueden explicarse también aquí cuando
sean necesarios para comprender el cliente. Se adapta la explicación a Vue:
captura, props/eventos, reactividad, cancelación, navegación y respuesta visible.
La documentación no traslada al navegador la autorización ni las transacciones.
Las referencias externas complementan el contenido local; no sustituyen sus pasos
o condiciones necesarias. Una diferencia contractual se corrige en código y guías,
sin ocultarla mediante una redirección al documento de otra aplicación.

## Convenciones editoriales

- Carpetas y nombres de archivos técnicos en inglés; títulos y explicación en español.
- Cada colección tiene `index.md` y capítulos numerados consecutivamente. El índice
  conserva el orden de lectura. La referencia generada también tiene un propietario explícito.
- Un `h1` por archivo y niveles de títulos sin saltos. Una tabla compara elementos;
  una secuencia expresa pasos; la prosa explica propósito, decisiones y límites.
- Rutas relativas al documento para enlaces. Los comandos indican si se ejecutan
  en la raíz, en `front/` o en `back/`; la raíz no contiene un manifiesto npm.
- Nombres de archivos, campos y comandos exactos. Ejemplos identificados como tales,
  con valores de demostración y sin secretos o datos personales reales.
- No se mantienen secciones vacías para imitar una norma. Tampoco se describen
  herramientas aplazadas como si ya estuvieran instaladas.
- Los requisitos locales `RF-VUE-*`, `RC-VUE-*`, `RD-VUE-*` y `RN-VUE-*` describen
  el cliente. `CU-VUE-*` identifica su ficha de interacción; los IDs de producto
  existentes se conservan como correspondencia, sin renombrarlos.
- `DP-*` expresa diseño de prueba; `CP-*`, un caso; `EP-*`, una ejecución. No se
  copian conteos de una corrida a un requisito como aprobación permanente.

## Figuras y fuentes

Se usa Mermaid. Cada figura indica identificador, pregunta, alcance, fuente y
significado de sus flechas. El modelo general explica el mecanismo; la aplicación
nombra componentes, composables, servicios o contratos que existen en Vue.
Los diagramas de flujo no se presentan como UML de clases. Actores, mensajes y
límites se usan cuando corresponde, sin inventar relaciones ni concurrencia.
Los diagramas curados explican decisiones; el generador sólo inventaría elementos
declarados en las fuentes. Ninguno demuestra por sí mismo calidad o SOLID.

## Referencias adoptadas

| Referencia | Uso selectivo en esta colección |
| --- | --- |
| Documentación oficial de Vue | SFC, Composition API, props/eventos, composables, slots, provide/inject y ciclo de vida. |
| ISO/IEC/IEEE 42010:2022 | Preocupaciones, interesados, vistas, decisiones y relaciones de arquitectura. |
| IEEE 1016-2009 | Vocabulario histórico de descripción de diseño; no prescribe carpetas ni una ficha por método. |
| ISO/IEC/IEEE 15289:2019 | Propósito, audiencia, mantenimiento y relaciones entre documentos. |
| ISO/IEC/IEEE 29148:2018 | Obligaciones identificables, verificables y trazables. |
| ISO/IEC/IEEE 29119-2/-3/-4 | Proceso, artefactos y técnicas de diseño de pruebas. |
| ISO/IEC 25010:2023 | Criterios de interacción, seguridad, mantenibilidad y desempeño; sin inventar umbrales o resultados. |

Esta es una adaptación local, sin declaración de conformidad integral. La norma
no prescribe estas tablas, Markdown o un patrón Vue particular.

## Cambio y versionado

Una modificación identifica motivo, código afectado, documentos, requisitos/casos,
comprobaciones y pendientes. Desarrollo actualiza la guía propietaria y los
consumidores que describan el mismo contrato. Una corrección editorial cambia la
versión documental cuando se publique la revisión, no la versión de Nexus.
El índice general conserva ambos números, fecha, responsable y estado.
Git conserva el historial; no se duplica en una tabla por commit.

Para cerrar la revisión se contrasta contenido con código, se revisan enlaces,
fuentes generadas, diagramas modificados y la exportación representativa. Los
comandos y resultados esperados están en [publicación](02-generation-and-publication.md).
