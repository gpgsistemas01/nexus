# 8. Alcance funcional por grupo

La visión no mantiene una segunda lista de enunciados `RF-*`: hacerlo produjo niveles de
detalle distintos entre acceso, catálogos y operación. La
[especificación normativa](../requirements-specification/04-unified-catalog-by-scope/index.md#4-catálogo-unificado-por-ámbito) es la
única fuente de cada obligación, criterio, estado y evidencia. Esta vista se limita a
mostrar el alcance y los rangos que deben revisarse juntos.

| Área de alcance | Requisitos normativos | Resultado incluido en la visión |
| --- | --- | --- |
| Autenticación | `RF-AUT-001` a `RF-AUT-003` | Iniciar, renovar y cerrar sesión como obligaciones independientes. |
| Identidades y acceso | `RF-IAM-001` a `RF-IAM-008` | Consultar, crear y actualizar usuarios o personas, cambiar contraseña y consultar catálogos de acceso. |
| Catálogos | `RF-CAT-001` a `RF-CAT-024` | Consultar, crear, actualizar, retirar o ajustar cada recurso según su política. |
| Entradas | `RF-REC-001` a `RF-REC-008` | Consultar, registrar, editar, corregir y cancelar entradas o detalles. |
| Salidas de material | `RF-ISS-001` a `RF-ISS-006` | Consultar, crear, editar encabezado, editar detalles, surtir y devolver. |
| Merma y sus salidas | `RF-WST-001` a `RF-WST-007`; `RF-MER-001` a `RF-MER-009` | Operar inventario y salidas de merma conservando snapshots y reglas dimensionales. |
| Ajustes | `RF-ADJ-001`, `RF-ADJ-002` | Registrar y aplicar inmediatamente ajustes autorizados con movimiento y trazabilidad. |
| Movimientos y reportes | `RF-REP-001` a `RF-REP-009` | Consultar y exportar información autorizada con reglas propias por reporte. |
| Capacidades no vigentes | `RF-REQ-001`, `RF-PRJ-001`, `RF-PRJ-002` | Requisiciones fuera de alcance y proyectos modelados sin CRUD registrado. |

La misma regla de granularidad aplica a todos los grupos: otra operación recibe otro
`RF-*` cuando cambia el resultado observable, permiso, validación principal o prueba de
cumplimiento. Los atributos de una misma identidad y las variantes del mismo resultado
permanecen como condiciones o criterios `CA-*`; no se crea un requisito por campo.
