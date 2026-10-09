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

personController importa personDTO y personService; personRules es un colaborador de validación del dominio utilizado también desde salidas.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · personApiRoute.js | `src/routes/api/admin/personApiRoute.js` |
| controllers/api · personController.js | `src/controllers/api/admin/`<br/>`personController.js` |
| services · personRules.js · personService.js | `src/services/admin/person/personRules.js`<br/>`src/services/admin/person/personService.js` |
| DTO · personDTO.js | `src/dtos/personDTO.js` |
| Validadores · personValidations.js | `src/validators/forms/personValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

