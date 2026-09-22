# 11. Pruebas

Las pruebas demuestran comportamiento y reglas del CRUD; no fijan formato, orden de
imports, nombres privados ni estructura incidental sólo para comprobar este estándar.

- Unitarias replican la ruta del módulo bajo `tests/unit`.
- Controllers unitarios viven en `tests/unit/controllers/<tipo>/<dominio>`.
- Rutas unitarias viven en `tests/unit/routes/<tipo>/<dominio>`.
- Integraciones HTTP con Prisma viven en `tests/integration/controllers` y terminan en
  `ControllerDbTest.js`.
- Helpers compartidos viven en `tests/helpers` y tienen prueba propia cuando contienen
  lógica.
- Los nombres de `describe` identifican la unidad o flujo; los de `it` expresan regla,
  condición y resultado observable.
- Una prueba sigue preparación, ejecución y aserción, separadas por líneas vacías cuando
  haga más claro el recorrido. No se introducen comentarios AAA repetitivos.
- Cada escritura integrada se verifica mediante lectura posterior con Prisma. Un fallo
  compuesto demuestra ausencia de escrituras parciales.
- Se reutilizan harness, factories y fixtures; cada contexto conserva la integración que
  demuestra su router, configuración, persistencia y efectos propios.
- No se agregan pruebas de HTML, selectores o implementación interna cuando el plan de
  pruebas declara que ese nivel no aporta evidencia CRUD.

### 11.1 Ejemplos de ubicación y evidencia CRUD

La ruta de la prueba reproduce la del módulo, sin crear una carpeta alternativa por
funcionalidad:

```text
src/services/warehouse/materials/materialService.js
tests/unit/services/warehouse/materials/materialServiceTest.js

src/controllers/api/warehouse/materialController.js
tests/unit/controllers/api/warehouse/materialControllerTest.js
tests/integration/controllers/materialControllerDbTest.js
```

Una integración de actualización no termina al comprobar el código HTTP. Persiste,
consulta nuevamente y afirma el resultado observable:

```js
it('actualiza el material y conserva sus relaciones', async () => {
  const response = await request(app)
    .put(`/api/warehouse/materials/${ material.id }`)
    .send({ name: 'Material actualizado' });

  const persistedMaterial = await prisma.material.findUnique({
    where: { id: material.id },
    include: { suppliers: true }
  });

  expect(response.status).toBe(200);
  expect(persistedMaterial.name).toBe('Material actualizado');
  expect(persistedMaterial.suppliers).toHaveLength(1);
});
```

Para crear, consultar, actualizar y desactivar se reutiliza el mismo harness de la
suite. Los casos negativos verifican rechazo y ausencia de escritura parcial, no la
cantidad de llamadas internas a helpers o el orden de imports.
