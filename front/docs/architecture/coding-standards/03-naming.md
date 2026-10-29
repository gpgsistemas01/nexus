# 3. Nombres y ubicación

## Convenciones

| Elemento | Regla | Ejemplo del código |
| --- | --- | --- |
| Página/contenedor | PascalCase; `Page` expresa coordinación de pantalla. | `InventoryEditorPage.vue`. |
| Composición entre módulos | PascalCase con `Workspace`; pertenece a `app/pages`. | `PurchaseWorkspace.vue`. |
| Presentación | PascalCase con responsabilidad visual concreta. | `RemoteSelect.vue`, `ServerTable.vue`. |
| Composable | `use` + comportamiento, archivo con el mismo nombre. | `useSelectedOption.ts`. |
| Función pura | Verbo y objeto/resultado; no prefijo `use` sin reactividad. | `mapPurchaseFormToRequest`. |
| Tipo/interfaz | PascalCase y objeto del contrato. | `SessionUser`, `ApiRequestConfig`. |
| Valores | camelCase; plural para colecciones. | `editedFields`, `projectConvertedQuantity`. |
| Predicados | Condición afirmativa reconocible. | `isSubmitting`, `canCreateSupplier`, `hasMore`. |
| Constantes de catálogo | Convención estable del propietario. | `ISSUE_CONFIG`, `PERMISSIONS`. |

## Significado y dominio

Distinguir `resource` (familia fija del módulo), modo de operación, identidad del
registro, versión leída y contexto de alta. No usar una variable `data` para representar
indistintamente formulario, DTO y resultado confirmado. `initialQuantity`, `newStock`
y cantidad de devolución expresan operaciones distintas y conservan nombres distintos.

Los eventos expresan intenciones (`submit`, `close`, `create`) y los callbacks su efecto
(`onSaved`, `onDenied`). Una función `load` no debe escribir. Una función `confirm`
no puede anunciar éxito antes de comprobar la respuesta esperada.

## Ubicación

Mantener el elemento junto al dominio que conoce. Extraer a `shared` sólo contratos y
comportamientos transversales con consumidores reales. Las piezas de presentación se
ubican en `components`; estado de interacción en `composables`; traducción de datos en
`mappers` o servicios; contratos de dominio en sus archivos de tipos. Evitar carpetas
vacías, archivos `utils` con responsabilidades ajenas y barriles que oculten dependencias.

### Ejemplo de nombres y ubicación

Corte de [Directorio](../../../src/modules/directory):

```text
src/modules/directory/
├── directory.ts
├── pages/DirectoryEditorPage.vue
├── components/DirectoryForm.vue
├── composables/useDirectoryEditor.ts
└── services/directoryService.ts
```

`DirectoryEditorPage` coordina la captura, `DirectoryForm` la presenta y
`useDirectoryEditor` mantiene su interacción. `directoryPayload`, en `directory.ts`,
es una transformación pura: su nombre no lleva `use`. El sufijo y la carpeta permiten
distinguir responsabilidades antes de abrir el archivo.

## Renombrado

Al renombrar un símbolo o archivo, revisar imports, rutas diferidas, eventos, tipos,
pruebas, enlaces y diagramas. Regenerar la referencia de código. No mantener dos nombres
para el mismo concepto sólo para evitar actualizar sus consumidores.
