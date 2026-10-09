# 5. Personas: estructura de código

**Identificador:** `DIA-BE-MOD-PER-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>personApiRoute.js"]
    C["controllers/api<br/>personController.js"]
    S["services<br/>personService.js<br/>personRules.js"]
    D["DTO<br/>personDTO.js"]
    V["Validadores<br/>personValidations.js"]
    P["baseRepository.js<br/>getDb(tx)"]
    C --> D
    C --> S
    R --> C
    R --> V
    S --> P
```

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · personApiRoute.js | `src/routes/api/admin/personApiRoute.js` |
| controllers/api · personController.js | `src/controllers/api/admin/`<br/>`personController.js` |
| services · personRules.js · personService.js | `src/services/admin/person/personRules.js`<br/>`src/services/admin/person/personService.js` |
| DTO · personDTO.js | `src/dtos/personDTO.js` |
| Validadores · personValidations.js | `src/validators/forms/personValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |


## Contratos de implementación

### Datos, resultados y efectos del módulo

| Capacidad | Entrada y retorno | Reglas, errores y persistencia |
| --- | --- | --- |
| Personas: `personController.js`, `personService.js`, `personRules.js` | Lista recibe consulta de tabla; alta/edición reciben DTO saneado y retornan persona. | Valida tipo y asesor interno, relaciones y unicidad antes de crear/actualizar `Person`; errores se centralizan. |


Los controllers de este módulo exponen estas operaciones. Un export construido por
un handler conserva su configuración local; no se supone un DTO ni una transacción
para todas las operaciones. Los datos, resultados y efectos están definidos en la tabla anterior.

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `controllers/api/admin/personController.js` | `getAllPersons`<br/>`registerPerson`<br/>`editPerson` |

### Normalización de datos

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `dtos/personDTO.js` | `createPersonDtoForRegister`<br/>`createPersonDtoForEdit` |

## Variantes y límites de reutilización

personController importa personDTO y personService; personRules es un colaborador de validación del dominio utilizado también desde salidas.

Los grupos del mapa representan imports seleccionados. Los permisos y middleware
se comprueban en cada router; los servicios conservan validaciones, errores y
persistencia propios. Compartir `getDb(tx)` no implica que toda operación abra una
transacción. La integración de [Prisma](../code-structure/06-prisma-and-persistence.md)
y los [mecanismos backend reutilizables](../reuse-and-refactoring/01-backend-handlers-and-services.md)
tienen una fuente de detalle común.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

