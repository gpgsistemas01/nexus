# 1. Propósito, alcance y prioridad

## Alcance

Las reglas se aplican a SFC, TypeScript, funciones, módulos, estilos y configuración
escritos para el cliente. Regulan cómo expresar y separar el código; los requisitos
establecen el comportamiento y las vistas de arquitectura explican su realización.
Las herramientas y versiones se consultan en [Herramientas](../../development/02-tooling.md).

## Aplicación

1. Identificar el contrato funcional y el módulo propietario.
2. Consultar `AGENTS.md`, el capítulo correspondiente y una implementación equivalente.
3. Contrastar la regla con la configuración versionada y reutilizar los contratos existentes.
4. Si prosa, configuración y código difieren, corregir las fuentes afectadas dentro
   del alcance del cambio.

Pasar lint no demuestra separación de responsabilidades. La revisión comprueba
consumidores, efectos y dirección de dependencias, además del formato automatizado.
Los ejemplos ilustran la convención; las fuentes operativas siguen siendo el código
y su configuración.

### Ejemplo de aplicación

Al incorporar una acción a la tabla de Directorio, el componente presenta la acción
y emite la intención; la página decide abrir el editor:

| Archivo | Aplicación de la regla |
| --- | --- |
| [DirectoryTable.vue](../../../src/modules/directory/components/DirectoryTable.vue) | `emit('edit', item)` entrega la fila seleccionada sin llamar al servicio. |
| [DirectoryPage.vue](../../../src/modules/directory/pages/DirectoryPage.vue) | `@edit="openEditor({ action: 'edit', row: $event })"` conecta la intención con el editor. |

La revisión comprueba esa separación además del formato: que ambos archivos pasen
lint no autoriza a trasladar una petición HTTP al componente de presentación.

## Obligaciones y alternativas

La [clasificación de reglas](../../governance/04-conventions-and-criteria.md) define
obligaciones, recomendaciones y excepciones. Una extracción se evalúa por su
responsabilidad y consumidores; no existe un límite de líneas que determine por sí
solo la necesidad de otro archivo o composable.
