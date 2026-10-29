# 4. Revisión de cambios

## Preparar la revisión

Identificar el comportamiento afectado, sus consumidores y la evidencia necesaria.
Consultar el [mapa de estándares](../governance/09-standards-and-ownership.md) según
el alcance. Esta lista organiza la entrega; las reglas permanecen en sus documentos
propietarios.

| Cambio | Comprobación y fuente |
| --- | --- |
| Código, imports o responsabilidades | Diff sin cambios accidentales; nombres, dirección de dependencias y tipos conforme al [estándar de código](../architecture/coding-standards/index.md). |
| Campos, tabla, menú o modal | Estados, foco, filtros y pantallas estrechas conforme al [estándar de interfaz](../architecture/interface-standards.md). |
| Captura, sesión o datos públicos | Fronteras y salidas conforme al [estándar de seguridad](../architecture/security-standards.md). |
| Comportamiento observable | Actualizar requisito/CU, diseño DP, caso CP y matriz de cobertura que correspondan; ejecutar las pruebas pertinentes según el [plan](../testing/01-test-plan.md). |
| Colaboración o responsabilidad | Actualizar vistas, contratos y figuras afectadas, con nombres del código real. |
| Fuentes o contratos de `src` | Regenerar la referencia mediante `docs:generate`; comprobar la documentación con `docs:check`. |
| Documentación | Revisar enlaces y catálogo; comprobar figuras y exportación representativa según la [guía de publicación](../governance/02-generation-and-publication.md). |
| Pantalla de usuario | Revisar procedimiento y capturas del [manual](../governance/05-user-manual.md). |

## Entregar evidencia

Ejecutar el chequeo frontend exigido por el alcance. Los comandos se mantienen en
[herramientas](02-tooling.md) y [ejecución de pruebas](../testing/06-test-files-and-credentials.md).
Registrar revisión, ambiente, comando, resultado y bloqueos en CI o en la revisión
del cambio; no versionar los artefactos de ejecución.
