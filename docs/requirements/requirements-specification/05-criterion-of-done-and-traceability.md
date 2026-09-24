# 5. Criterio de terminado y trazabilidad

Cualquier requisito o regla nuevo o modificado se considera listo para revisión cuando:

1. conserva un identificador estable y criterios observables en este documento;
2. usa la terminología canónica o actualiza el glosario con validación funcional;
3. enlaza su ruta, permiso, validadores, controller/DTO, servicio y persistencia;
4. reutiliza el proceso CRUD o componente aplicable antes de introducir otro flujo,
   consultando los [patrones aplicados](../../architecture/design-and-construction-patterns/index.md);
5. incluye pruebas relacionadas con el CRUD en la ubicación y con las estrategias de
   [pruebas](../../testing/service-test-coverage.md) correspondientes, y actualiza la matriz del
   [plan de pruebas](../../testing/test-plan.md) cuando cambia el alcance;
6. actualiza la matriz de operaciones y los diagramas curados afectados, y ejecuta el
   generador cuando cambia rutas o Prisma;
7. distingue explícitamente comportamiento implementado, parcial y pendiente.

La evidencia puede enlazarse desde una incidencia hacia el ID del requisito. No se
añade una matriz duplicada de cada endpoint: el mapa generado ya conserva ese
inventario y evita que dos listas manuales diverjan.

No todo requisito debe crear un caso de uso independiente. Los requisitos de soporte
para selectores operativos, unicidad de relaciones, validaciones compartidas, permisos
transversales o cálculos de reportes pueden estar relacionados con varias fichas o con
ninguna ficha exclusiva cuando describen una responsabilidad interna de Nexus. La
completitud se verifica en sentido inverso: cada caso vigente debe enlazar al menos un
`RF-*` o una regla `RN-*`, y cada requisito de soporte debe conservar evidencia técnica
o una relación explícita con los flujos que regula.

## Lectura de requisitos y reglas desde los casos de uso

La revisión de completitud comienza en cada ficha `CU-*`: su fila **Requisitos
relacionados** enlaza los requisitos funcionales que definen el objetivo y las reglas de
negocio que deciden sus variantes, rechazos o efectos. Una referencia no reemplaza el
paso observable; la ficha debe expresar también dónde valida Nexus la regla y qué
resultado conserva cuando se incumple.

Las reglas transversales siguientes no se repiten en las 73 fichas vigentes. Aplican por
la naturaleza de la interacción y se revisan junto con sus precondiciones y excepciones:

| Alcance de casos de uso | Requisitos y reglas aplicables |
| --- | --- |
| Todo `CU-*` que accede a una operación protegida | `RN-001` y `RN-009`: sesión y permiso comprobados en el servidor antes de exponer datos o ejecutar el objetivo. `CU-AUT-01` es la excepción de entrada y valida credenciales conforme a `RF-AUT-001`; `CU-AUT-02` exige una sesión vigente. |
| Todo `CU-*` que crea, edita, retira, ajusta, corrige, cancela, surte, devuelve o cambia credenciales | `RN-010`: validación de la entrada en el servidor antes de persistir. |
| Toda escritura crítica configurada para auditoría | `RN-008`: registro del actor, acción, recurso, resultado y datos admitidos; la configuración de auditoría determina el alcance, no la mera presencia de un botón en la ficha. |
| Altas, correcciones, cancelaciones, ajustes, surtimientos y devoluciones que generan movimientos | `RN-002`, `RN-011` y `RN-013` cuando cambian conjuntamente documento, detalle o stock: atomicidad, vínculo único con el origen y cantidad positiva. Cada ficha operativa agrega además las reglas específicas que cambian su recorrido. |

Los requisitos de soporte tampoco originan artificialmente otro caso de uso. Su relación
con los objetivos vigentes se interpreta así:

| Requisito de soporte | Casos de uso en los que se comprueba |
| --- | --- |
| `RF-AUT-002` | Renovación interna de una sesión durante cualquier caso protegido; no constituye un objetivo separado del actor. |
| `RF-IAM-003` | `CU-IDA-06` y `CU-IDA-07`, al cargar y validar roles y áreas para asignaciones de acceso. |
| `RF-CAT-005`, `RF-CAT-019` a `RF-CAT-021` | Altas y ediciones que consumen presentaciones, unidades, motivos o estados como selectores; su administración corresponde a `CU-CAT-09` a `CU-CAT-26`. |
| `RF-REC-006` | `CU-ALM-02` y `CU-ENT-02`: una marca que distingue físicamente el material se resuelve en el catálogo antes de recibirlo. |
| `RF-WST-001` y `RF-WST-007` | `CU-ALM-09` consulta existencias del catálogo de mermas; `CU-SAL-08` consulta documentos de salida de merma. Los identificadores no se intercambian aunque ambos recorridos sean consultas. |
| `RF-REP-003`, `RF-REP-006`, `RF-REP-007` y `RF-REP-009` | `CU-ALM-14`, reporte de mermas; complementan sus requisitos relacionados sin crear otra exportación. |
| `RF-MER-001` a `RF-MER-009` | `CU-ALM-10` a `CU-ALM-12` y, para cantidad convertida, `CU-SAL-12` y `CU-SAL-13`; las fichas enlazan cada restricción que modifica su flujo. |
| `RF-ADJ-001` y `RF-ADJ-002` | `CU-ALM-05` y `CU-ALM-12`, ajustes de material y merma respectivamente. |
| `RF-REQ-001`, `RF-PRJ-001` y `RF-PRJ-002` | No se asignan a un `CU-*` vigente mientras permanezcan fuera de alcance o modelados. |

Los requisitos de datos `RD-*` y de calidad `RC-*` se verifican sobre la solución y sus
evidencias técnicas; sólo se incorporan a una ficha si producen una decisión observable
del recorrido. Esta separación evita convertir despliegue, pruebas, logging o estructura
de persistencia en acciones ficticias del actor.
