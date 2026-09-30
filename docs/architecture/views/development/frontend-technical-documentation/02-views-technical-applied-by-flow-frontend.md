# 2. Diagramas técnicos complementarios del frontend

### Relación con la colección canónica

La columna **Diagrama aplicable** del catálogo de componentes orienta hacia los 73
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
| `DIA-FE-TEC-EST-CU-IDA-08` | ¿Cómo alterna el formulario entre consulta, edición y contraseña? | `DIA-FE-CU-IDA-08`; no crea otro caso ni otra API. |
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

```mermaid
flowchart TB
    open["Abrir wasteModal en modo crear"] --> supplier["Seleccionar proveedor"]
    supplier --> clear["Limpiar plantilla de material anterior"]
    clear --> load["wasteMaterialService consulta materiales del proveedor"]
    load --> choose{"¿Se seleccionó una plantilla?"}
    choose -->|No| blocked["Mantener material y envío sin completar"]
    choose -->|Sí| map["wasteMaterialTemplate adapta nombre, medidas y costo propuesto"]
    map --> editable["Usuario completa campos editables"]
    editable --> validate{"¿Validación del navegador correcta?"}
    validate -->|No| errors["Mostrar errores sin llamar la API"]
    validate -->|Sí| register["registerWaste → POST /api/warehouse/wastes"]
```

### Estados técnicos complementarios

Estos diagramas permanecen aquí porque añaden ciclos técnicos que no repite la colección
de secuencias por caso.

**Estado técnico complementario:** `DIA-FE-TEC-EST-CU-IDA-08`. Expone los modos
que gobiernan los campos y la mutación del formulario de usuario.

```mermaid
stateDiagram-v2
    [*] --> Consulta
    Consulta --> Edicion: abrir cuenta existente
    Consulta --> CambioPassword: seleccionar acción de contraseña
    Edicion --> Enviando: editUser
    CambioPassword --> Enviando: editUserPassword
    Enviando --> Consulta: respuesta exitosa
    Enviando --> Edicion: error al editar
    Enviando --> CambioPassword: error de contraseña
```

**Estado técnico complementario:** `DIA-FE-TEC-EST-CU-ALM-05`. Representa el ciclo
del modo de ajuste sin atribuir al navegador la validación definitiva del stock.

```mermaid
stateDiagram-v2
    [*] --> Consulta
    Consulta --> Ajuste: abrir material en modo stock
    Ajuste --> Invalido: validación visual fallida
    Invalido --> Ajuste: corregir formulario
    Ajuste --> Enviando: confirmar ajuste
    Enviando --> Consulta: PATCH exitoso y onSave
    Enviando --> Ajuste: error normalizado
```
