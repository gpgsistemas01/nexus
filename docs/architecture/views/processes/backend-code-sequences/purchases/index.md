# Secuencias del código backend: Compras y entradas

Este capítulo forma parte del [catálogo de secuencias del código backend](../index.md) y conserva los recorridos aplicados del grupo `ENT`. Las reglas comunes de lectura, trazabilidad y mantenimiento se declaran en el índice de la colección.


## Secuencias por caso de uso

- [`CU-ENT-01` — Consultar compras de material](cu-ent-01.md)
- [`CU-ENT-02` — Crear compra de material](cu-ent-02.md)
- [`CU-ENT-03` — Editar compra de material](cu-ent-03.md)
- [`CU-ENT-04` — Corregir material de una compra](cu-ent-04.md)
- [`CU-ENT-05` — Cancelar material de una compra](cu-ent-05.md)
- [`CU-ENT-06` — Generar reporte de compras de material](cu-ent-06.md)

- [`CU-ENT-07` — Consultar compras de consumible](cu-ent-07.md)
- [`CU-ENT-08` — Crear compra de consumible](cu-ent-08.md)
- [`CU-ENT-09` — Editar compra de consumible](cu-ent-09.md)
- [`CU-ENT-10` — Corregir consumible de una compra](cu-ent-10.md)
- [`CU-ENT-11` — Cancelar consumible de una compra](cu-ent-11.md)
- [`CU-ENT-12` — Generar reporte de compras de consumible](cu-ent-12.md)

Cada caso conserva una ficha de secuencia para mantener trazabilidad uno a uno y mostrar
su endpoint, controller y fachada específicos. No son diseños independientes: aplican
los mismos patrones `BE-P*` declarados en cada ficha y conservan los participantes del
nucleo compartido. Esta forma sigue la convención de la colección —una ficha por `CU-*`—
sin inventar un segundo flujo técnico para consumibles.
