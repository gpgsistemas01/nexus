# Personas y responsabilidades

**Casos relacionados:** CU-IDA-02/03.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-005`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as Person<br/>Form.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as PersonEditor<br/>Page.vue
    participant Editor@{ "type": "control" } as usePerson<br/>Editor.ts
    participant Org@{ "type": "control" } as use<br/>Organization<br/>Options.ts
    end
    box Reglas y datos
    participant Rules as personAccess<br/>Validation
    end
    Page->>Editor: nowrap: usePersonEditor({ target, permissions,<br/>onSaved, onDenied })
    Editor->>Org: nowrap: useOrganizationOptions(<br/>options.permissions)
    Org-->>Editor: nowrap: { departments, roles, state }
    Editor-->>Page: nowrap: organization
    U->>Form: nowrap: add
    Form->>Page: nowrap: emit('add')
    Page->>Editor: nowrap: editor.addAccess()
    opt nowrap: !isDisabled()
        Editor->>Rules: nowrap: personAccessValidation.departmentId(<br/>departmentId.value, { accesses:<br/>form.values.accesses }) ||<br/>personAccessValidation.roleId(<br/>roleId.value) || ''
        Rules-->>Editor: nowrap: accessError.value
        alt nowrap: accessError.value
            Editor-->>Page: nowrap: accessError
        else
            Editor->>Editor: nowrap: department = selectedDepartment.value,<br/>role = selectedRole.value
            alt nowrap: !department || !role
                Editor->>Editor: nowrap: accessError.value = 'Selecciona un área y<br/>un rol de las opciones disponibles.'
                Editor-->>Page: nowrap: accessError
            else
                Editor->>Editor: nowrap: form.setFieldValue('accesses',<br/>[...form.values.accesses, { departmentId:<br/>department.id, roleId: role.id, ... }],<br/>false)
                Editor->>Editor: nowrap: departmentId.value = ''
                Editor->>Editor: nowrap: roleId.value = ''
                Editor->>Editor: nowrap: save.message.value = ''
                Editor->>Editor: nowrap: form.validateField('accesses')
                Editor-->>Page: nowrap: values.accesses
            end
        end
    end
```

## Fuentes de los participantes

[PersonForm.vue](../../../../../src/modules/identity/components/PersonForm.vue),
[PersonEditorPage.vue](../../../../../src/modules/identity/pages/PersonEditorPage.vue),
[usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts),
[useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts),
[personAccessValidation](../../../../../../back/src/public/js/utils/validations/validators.js).

## Secuencias relacionadas

[DIA-VUE-SEQ-039](04-person-save.md#coordinación-del-guardado).
