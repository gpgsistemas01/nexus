# 2. Diagramas técnicos complementarios del frontend

### Relación con la colección canónica

La columna **Representación y frontera de detalle** del catálogo de componentes orienta hacia los 92
recorridos `DIA-FE-CU-*` de `frontend-code-sequences/index.md`. Esa colección es propietaria del orden
interacción → UI → aplicación → request → endpoint → resultado visible. Este documento
conserva sólo diagramas que responden una pregunta adicional sobre los límites del
navegador. Ningún diagrama complementario extiende la seguridad hacia el servidor ni
sustituye la secuencia enlazada.

```mermaid
flowchart LR
    interaction["Interacción del actor"] --> canonical["DIA-FE-CU-*<br/>recorrido canónico"]
    canonical -. decisión o modo adicional .-> complement["Actividad o estado<br/>complementario"]
    canonical --> endpoint["UI · application · request · endpoint"]
    complement -. no sustituye .-> canonical
```

| Diagrama conservado | Pregunta adicional | Complementa |
| --- | --- | --- |
| `DIA-FE-ACT-001` · `CU-ALM-10` | ¿Cómo condicionan proveedor y plantilla la habilitación y el envío? | `DIA-FE-CU-ALM-10`; muestra decisiones de UI y termina en el mismo `POST`. |
| `DIA-FE-TEC-EST-CU-IDA-08` | ¿Cómo se conserva el modo contraseña ante envío, éxito o rechazo? | `DIA-FE-CU-IDA-08`; no crea otro caso ni otra API. |
| `DIA-FE-TEC-EST-CU-ALM-05` | ¿Cómo evoluciona el modo de ajuste ante validación, envío y error? | `DIA-FE-CU-ALM-05`; no representa estado persistido ni validación definitiva. |

Las antiguas secuencias selectivas de login, ajuste, corrección y devoluciones no se
mantienen aquí: repetían la pregunta ya contestada por sus `DIA-FE-CU-*`. Su detalle se
consolidó en la colección canónica. La reutilización de factories o UI compartida se
conecta mediante el código de patrón y los diagramas estructurales; no exige duplicar la
secuencia de cada consumidor.

### Alta de merma desde una plantilla de material

**Identificador:** `DIA-FE-ACT-001`. **Caso:** `CU-ALM-10`. Esta actividad hace visible
la dependencia proveedor → material y la preparación de snapshots; no representa las
decisiones de persistencia del servicio.

La figura usa la [convención de actividades](../../processes/index.md#notación-de-actividades)
como aproximación a UML mediante Mermaid.

```mermaid
flowchart TB
    initial@{ shape: f-circ } --> open("Abrir wasteModal en modo crear")
    open --> supplier("Seleccionar proveedor")
    supplier --> clear("Limpiar plantilla anterior")
    clear --> load("Consultar materiales del proveedor")
    load --> mergeTemplate{" "}
    mergeTemplate --> choose{"¿Se seleccionó una plantilla?"}
    choose -->|"[no]"| blocked("Mantener el envío sin habilitar y esperar selección")
    blocked --> mergeTemplate
    choose -->|"[sí]"| map("Adaptar nombre, medidas y costo propuesto")
    map --> mergeEdit{" "}
    mergeEdit --> editable("Completar o corregir campos editables")
    editable --> validate{"¿Validación del navegador correcta?"}
    validate -->|"[no]"| errors("Mostrar errores sin llamar la API")
    errors --> mergeEdit
    validate -->|"[sí]"| register("Enviar POST /api/warehouse/wastes")
    register --> final@{ shape: fr-circ }
```

El final corresponde al envío de la petición, que es el límite de esta actividad de
preparación; la respuesta y los errores HTTP continúan en la secuencia `DIA-FE-CU-ALM-10`.

### Estados técnicos complementarios

Estos diagramas describen los estados del formulario durante la interacción, como
complemento de las secuencias por caso de uso.

**Estado técnico complementario:** `DIA-FE-TEC-EST-CU-IDA-08`. El objeto modelado es
el modal en modo contraseña (`FORM_MODES.EDIT_PASSWORD`), abierto desde la consulta.
El formulario conserva ese modo ante un error que permite reintentar el envío; no cambia al modo de edición de
datos ni modela el estado persistido del usuario.

```mermaid
stateDiagram-v2
    state "Consulta (modal cerrado)" as Consulta
    state "Contraseña abierta (edit-password)" as Password
    state "Enviando contraseña" as Enviando
    state "Formulario bloqueado tras error" as Bloqueado
    state "Fuera de la página" as Fuera
    [*] --> Consulta: abrir usuarios
    Consulta --> Password: abrir contraseña / deshabilitar campos de identidad
    Password --> Password: validar [datos inválidos] / mostrar errores
    Password --> Enviando: enviar [password válido] / editUserPassword()
    Enviando --> Consulta: resolver [éxito] / cerrar y recargar
    Enviando --> Password: rechazar [HTTP recuperable] / habilitar reintento
    Enviando --> Bloqueado: rechazar [otro error sin redirección] / notificar
    Enviando --> Fuera: sesión perdida / redirigir a raíz
    Password --> Consulta: cerrar modal
    Bloqueado --> Consulta: cerrar modal
    Fuera --> [*]
```

La elección del modo ocurre en `userModal.js`; la validación y la mutación se seleccionan
en `userForm.js`. `handleSubmit` cierra el modal y recarga la tabla sólo tras el éxito.
`handleApiError` permite reintentar HTTP 400, 403, 404 y 409; la figura los agrupa
como «HTTP recuperable». Para los demás fallos, la implementación actual notifica sin restablecer `submitting`: cerrar y volver
a abrir el modal inicializa el formulario. El cliente HTTP intenta renovar una sesión
ante 401 antes de abandonar la página.

**Estado técnico complementario:** `DIA-FE-TEC-EST-CU-ALM-05`. Modela el modal de ajuste
abierto desde Materiales. El servidor comprueba el permiso y la existencia disponible antes de aplicar el ajuste;
la validación local del formulario no sustituye esas comprobaciones.

```mermaid
stateDiagram-v2
    state "Consulta de materiales (modal cerrado)" as Consulta
    state "Ajuste abierto (edit-stock)" as Ajuste
    state "Enviando ajuste (submitting=true)" as Enviando
    state "Formulario bloqueado tras error" as Bloqueado
    state "Fuera de la página de materiales" as Fuera
    [*] --> Consulta: abrir la página
    Consulta --> Ajuste: abrir ajuste / openMaterialModal(edit-stock)
    Ajuste --> Ajuste: validar [datos inválidos] / mostrar errores
    Ajuste --> Enviando: enviar [datos válidos] / editMaterialStock()
    Enviando --> Consulta: resolver [éxito] / cerrar, recargar y onSave
    Enviando --> Ajuste: rechazar [HTTP recuperable] / habilitar reintento
    Enviando --> Bloqueado: rechazar [otro error sin redirección] / notificar
    Enviando --> Fuera: sesión perdida / redirigir a raíz
    Bloqueado --> Consulta: cerrar modal
    Ajuste --> Consulta: cerrar el modal
    Fuera --> [*]
    note right of Enviando
        Un segundo submit no crea otra petición.
        No hay un estado persistido llamado Ajuste o Inválido.
    end note
```

La evidencia está en `materialModal.js`, `materialForm.js`, `formUI.js`, `formUtils.js`
y `api/errorHandler.js`. Ante HTTP 400, 403, 404 y 409, el manejador de errores restablece el estado de envío y
permite reintentar. Los demás errores de red o servidor siguen el comportamiento
descrito para el formulario de contraseña.

### Renovación coordinada del transporte HTTP

**Identificador:** `DIA-FE-TEC-SES-001`. **Pregunta:** ¿cómo comparten dos peticiones
con 401 una renovación de sesión sin crear un refresh por componente?
**Fuente:** `src/public/js/services/axiosInstanceApi.js`. **Alcance:** ejemplo con dos
solicitudes cuya renovación coincide en el tiempo; no representa concurrencia de negocio.

```mermaid
sequenceDiagram
    autonumber
    participant A as Request A del recurso
    participant B as Request B del recurso
    participant Api as Interceptor axiosInstanceApi.js
    participant Refresh as refreshRequest compartida
    participant Server as API auth/refresh
    A->>Api: respuesta 401 con original._retry ausente
    Api->>Api: marcar original A con _retry
    Api->>Refresh: crear promise si no existe
    Refresh->>Server: POST /api/auth/refresh
    B->>Api: respuesta 401 durante renovación pendiente
    Api->>Api: marcar original B con _retry
    Api->>Refresh: esperar promise existente
    alt renovación exitosa
        Server-->>Refresh: resolver renovación
        Refresh-->>Api: completar espera de A y B
        Api->>A: reintentar api(original A)
        Api->>B: reintentar api(original B)
    else renovación fallida
        Server-->>Refresh: rechazar renovación
        Refresh-->>Api: propagar rechazo
        Api->>Api: redirigir window.location.href a /
        Api-->>A: rechazar request
        Api-->>B: rechazar request
    end
    Note over Api,Refresh: finally limpia refreshRequest para una renovación posterior
```

La coordinación pertenece al transporte común, no al formulario ni al plugin Select2.
`_retry` impide otra renovación para la misma petición reintentada; `refreshRequest`
comparte sólo la renovación pendiente y se limpia en `finally`. El error de una nueva
respuesta 401 del reintento no abre indefinidamente más renovaciones.
