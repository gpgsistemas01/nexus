# 7. Salidas

## Propósito y fuentes

Referencia de responsabilidades y contratos del dominio `issues`. El [corte de componentes](../../logical/components/07-issues.md) muestra sus colaboradores; las secuencias siguientes explican el proceso y sus decisiones. Los objetivos están en el [catálogo de casos](../../../../requirements/use-cases/index.md).

## Responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `IssueWorkspace` | Alta auxiliar de cliente con retorno al documento. |
| `IssuePage` / `useIssueActions` | Listado, lectura vigente, permisos y resolución del modo. |
| `useIssueEditor` | Captura por modo y coordinación de guardar; sin devolución desde el guardado general. |
| `useIssueHeaderSelection` | Clientes/personas/áreas y limpieza dependiente. |
| `useIssueDepartments` | Consulta autorizada reutilizada por filtros y encabezado; asigna y bloquea una única área disponible sin confundir búsqueda o paginación con alcance. |
| `issueLookupService` | Solicita áreas con `context=issues`; el servidor filtra por asignaciones autorizadas. No deduce el alcance a partir del nombre del rol en Vue. |
| `useIssueLineEntry` / `issueDetails` | Borrador y selección de surtido sin mutar documento leído. |
| `useIssueReturn` | Cantidad/observaciones y frontera de saldo entregado. |
| Mappers y `issueService` | Request por modo, validación de respuesta y códigos de su recurso. |

## Datos y operaciones

| Modo | Contrato |
| --- | --- |
| create | Encabezado y detalles de Materiales, Consumibles o Mermas; sin descuento local de stock. |
| edit | Captura completa admitida antes del surtido; protege detalles originales no editables. |
| header | Sólo encabezado tras resolución por estado; PATCH /header. |
| supply | Selección de detalles y cantidad convertida de proyecto; PATCH /details. |
| view | Documento y detalles en consulta; no guarda. |
| return | Editor de devolución separado; positivo hasta saldo leído, PATCH /details/:id/returns. |
| Recurso | materials/consumables usan goods-issues; wastes usa waste-issues y sus códigos. |
| Estado vigente | La apertura relee; la API comprueba de nuevo permiso, pertenencia y saldo en escritura. |

| Contexto de área | Comportamiento |
| --- | --- |
| Auxiliar/Coordinador de Almacén | Consultan y registran para todas las áreas autorizadas. |
| Accesos operativos | Consultan, crean y editan sólo dentro de sus áreas; la API verifica consulta y escritura. |
| Alta con área única | Preselecciona una opción disponible si la captura está vacía y bloquea el campo. |
| Edición | Conserva área, solicitante y proyecto leídos; solicitantes dependen reactivamente del área. |
| Limpiar filtros | Conserva el área obligatoria y no la cuenta como filtro opcional activo. |

La [secuencia de alcance](../../processes/07-issues/04-department-scope.md) precisa
conteos, búsqueda, cancelación y bloqueo en los tres recursos.

## Diagramas del proceso

| Pregunta | Secuencia aplicada |
| --- | --- |
| Apertura y escritura | [Apertura y escritura](../../processes/07-issues/01-issue-open-save.md) |
| Surtido | [Surtido](../../processes/07-issues/02-issue-supply.md) |
| Devolución | [Devolución](../../processes/07-issues/03-issue-return.md) |
| Alta contextual | [Alta contextual](../../processes/02-shared-runtime/02-documents-and-contextual-creation.md) |
| Alcance del área | [Selección y bloqueo](../../processes/07-issues/04-department-scope.md) |
| Reportes | [Reportes](../../processes/08-movements-and-reports/02-reports.md) |

## Evidencia

issueTest.ts, issues.spec.ts y selectCreation.spec.ts en los tres recursos. La [matriz por CU](../../../../testing/04-use-case-coverage.md) precisa condiciones y límites; la API simulada no acredita stock, autorización o transacciones reales.
