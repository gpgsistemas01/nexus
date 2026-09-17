# 8. Criterios para actualizar documentación y sistema

La necesidad de mantenimiento se decide por la **fuente que dejó de representar la
realidad**, no por el archivo donde se detectó la diferencia. Antes de editar, se debe
clasificar el hallazgo en uno de estos tres resultados:

1. **Sólo documentación:** el sistema vigente ya cumple el comportamiento aprobado y la
   fuente documental está incompleta, ambigua, desactualizada o enlaza evidencia incorrecta.
2. **Sólo sistema:** una corrección interna conserva contratos, reglas, permisos, datos y
   recorrido observable; se actualizan código y pruebas, pero no se reescribe documentación
   funcional para describir una implementación equivalente.
3. **Sistema y documentación:** cambia una obligación, comportamiento observable, contrato,
   modelo persistente, permiso, operación, pantalla, procedimiento o condición operativa.
   Ambos lados se actualizan en la misma solicitud de cambio; no se documenta como vigente
   una capacidad que todavía no está implementada.

### Matriz de disparadores y artefactos afectados

| Condición detectada | Mantener en el sistema | Mantener en documentación | Comprobación mínima |
| --- | --- | --- | --- |
| Error ortográfico, enlace roto, título, ejemplo o explicación que no cambia el significado. | No. | Fuente Markdown propietaria, enlaces o manifiesto afectado. | `npm run docs:check`, `docs:export -- <paquete> --check` y revisión del diff. |
| El manual difiere de controles, mensajes, permisos o estados que el sistema ya presenta correctamente. | No, salvo que la revisión funcional determine que el sistema incumple el requisito. | Procedimiento, captura/inventario, matriz de validación y referencia al `CU-*` correspondiente. | Comparación con vista, ruta, validador y prueba; después validación del paquete del manual. |
| Nueva capacidad, cambio de regla, actor, permiso, validación, estado, cálculo o efecto de inventario. | Ruta/interfaz, controller, servicio, repository, DTO o validator que sean propietarios; pruebas del comportamiento y persistencia. | Requisito y criterios, ficha `CU-*`, matriz de operaciones, diagramas/secuencias, manual y mensajes afectados. | Prueba específica, `test:unit`, integración aislada si hay HTTP o persistencia, y `docs:check`. |
| Cambio de request, response, código HTTP, filtro, descarga o ruta registrada. | Router, validación, DTO/controller/servicio y pruebas contractuales. | OpenAPI como contrato procesable, contexto curado de API y secuencias; manual sólo si cambia el recorrido visible. | Comprobación OpenAPI, prueba HTTP y regeneración arquitectónica al cambiar routers o imports. |
| Cambio de modelo, relación, restricción, precisión, índice o dato persistido. | `prisma/schema.prisma`, migración incremental, acceso a datos y pruebas con `DATABASE_TEST_URL`. | Requisito de datos/regla, mapa curado si cambia la decisión y evidencia generada. | Migración en base aislada, integración/rollback y `npm run docs:architecture`. |
| Cambio visual, selector, modo editable, estado responsivo o texto accionable. | EJS/JavaScript compartido y prueba aplicable. | Procedimiento, matriz de modos, inventario y captura únicamente cuando la pantalla cambió. | Prueba específica, revisión responsiva/permisos y `npm run docs:screenshots` antes de exportar. |
| Refactor interno sin cambio observable ni de contrato. | Código, imports/exports y pruebas que demuestren equivalencia. | Diagramas o referencia técnica sólo si cambian componentes, dependencias, responsabilidades o secuencia real. | Pruebas afectadas; `docs:architecture` si cambian imports y `docs:check`. |
| Corrección de seguridad, dependencia, runtime, despliegue o configuración operativa. | Configuración/código, manejo de secretos y pruebas o comprobaciones de operación. | Requisitos de calidad, arquitectura/despliegue, instalación u operación cuando cambien prerrequisitos, riesgos o comandos. | Análisis de impacto, prueba o escaneo aplicable y verificación de instalación/despliegue. |
| Se cierra o aparece una brecha de pruebas, riesgo o decisión pendiente sin cambiar comportamiento. | Prueba o mitigación si corresponde. | Matriz de trazabilidad, plan/resultados de pruebas o registro de decisión/riesgo propietario. | Ejecución de la evidencia y actualización del estado sin afirmar cobertura no ejecutada. |

### Condiciones de revisión periódica

Aunque no exista una funcionalidad nueva, se revisan los documentos propietarios y el
sistema cuando ocurra cualquiera de estas condiciones:

- una dependencia, versión de Node.js, motor de base de datos o herramienta de publicación
  deja de estar soportada;
- una vulnerabilidad, incidente, fallo repetitivo o dato de soporte contradice una garantía
  de seguridad, fiabilidad o recuperación;
- una auditoría, contrato o regulación introduce una obligación o cambia su edición aplicable;
- una prueba deja de representar el flujo, aparece una brecha de cobertura o una captura ya no
  coincide con la interfaz;
- cambian actores, permisos, volumen de datos, rendimiento esperado, infraestructura o proceso
  operativo;
- un enlace, comando, ruta, diagrama, ejemplo o versión publicada deja de poder reproducirse.

Una revisión periódica no obliga a modificar archivos si la evidencia sigue vigente. El
resultado puede ser **sin cambio**, pero debe quedar registrado en la incidencia o solicitud
que originó la revisión cuando exista una aprobación, excepción, riesgo aceptado o criterio no
aplicable.
