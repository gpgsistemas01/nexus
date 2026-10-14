# 7. Clientes: estructura de código

**Identificador:** `DIA-BE-MOD-CLI-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>clientApiRoute.js"]
    C["controllers/api<br/>clientController.js"]
    S["services<br/>clientService.js"]
    D["DTO<br/>clientDTO.js"]
    V["Validadores<br/>clientValidations.js"]
    P["baseRepository.js<br/>getDb(tx)"]
    C --> D
    C --> S
    R --> C
    R --> V
    S --> P
```

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · clientApiRoute.js | `src/routes/api/sales/clientApiRoute.js` |
| controllers/api · clientController.js | `src/controllers/api/sales/`<br/>`clientController.js` |
| services · clientService.js | `src/services/sales/clientService.js` |
| DTO · clientDTO.js | `src/dtos/clientDTO.js` |
| Validadores · clientValidations.js | `src/validators/forms/clientValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |


## Contratos de implementación

### Datos, resultados y efectos del módulo

| Capacidad | Entrada y retorno | Reglas, errores y persistencia |
| --- | --- | --- |
| Clientes: `sales/clientController.js`, `clientService.js` | Lista, alta y edición (`GET`, `POST`, `PUT`) adaptan DTO y retornan cliente. | Lee y escribe `Client` mediante `getDb(tx)` y traduce ausencia o fallos de persistencia a errores del dominio. |


| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `controllers/api/sales/clientController.js` | `getAllClients`<br/>`registerClient`<br/>`editClient` |

### Normalización de datos

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `dtos/clientDTO.js` | `createClientDtoForRegister`<br/>`createClientDtoForEdit` |

## Variantes y límites de reutilización

clientController depende de clientDTO y clientService. El servicio se reutiliza desde encabezados de salidas; el reporte del cliente conserva un controller separado.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

