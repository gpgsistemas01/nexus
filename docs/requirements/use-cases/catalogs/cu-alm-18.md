# `CU-ALM-18` — Crear consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-18` |
| Nombre | Crear consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Nuevo consumible** desde `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. Cuenta con `materials:write`.<br>3. Existen proveedor, presentación y unidad disponibles. |
| Flujo principal | 1. **Actor:** selecciona **Nuevo consumible** desde la consulta **(ver E1)**.<br>2. **Nexus:** muestra proveedor, nombre, presentación, unidad, stock mínimo, costo máximo, estado, existencia inicial, motivo y observaciones; omite base y altura.<br>3. **Actor:** captura una unidad explícita y los demás datos obligatorios y confirma **(ver A1)**.<br>4. **Nexus:** normaliza la identidad, fuerza `type = CONSUMABLE` y dimensiones nulas, valida relaciones e inexistencia de la oferta y crea en una transacción la identidad, la oferta y el ajuste inicial trazable **(ver A2)** **(ver EBD)**.<br>5. **Nexus:** confirma el alta, cierra el formulario y refresca `CU-ALM-17`. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala cada campo inválido y conserva los valores capturados.<br>2. **Actor:** corrige los datos o cancela; no existe escritura parcial.<br>**A2 — Identidad existente (durante el paso 4):**<br>1. **Nexus:** reutiliza la identidad `CONSUMABLE` si sólo falta la oferta del proveedor.<br>2. Si la misma oferta ya existe, Nexus rechaza el duplicado y no registra oferta, existencia ni ajuste adicionales. |
| Excepciones | **E1 — Acceso rechazado:** Nexus no muestra ni procesa el alta.<br>**EBD — Error de base de datos:** la transacción revierte identidad, oferta y ajuste inicial. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** el consumible queda sin dimensiones, con unidad explícita y existencia inicial trazable.<br>2. **Fallo:** el inventario permanece sin cambios parciales. |
| Requisitos relacionados | `RF-CAT-026`, `RN-023` a `RN-026`, `RN-030`, `RN-032`, `RN-034`. |
