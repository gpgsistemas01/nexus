# Inventario de capturas del manual de usuario

## Criterio de identificación y orden

Cada captura tiene un identificador estable `CAP-<grupo>-<ámbito>-<paso>-<estado>`. El
identificador permite relacionarla con uno o más casos de uso sin depender del nombre del
archivo. Ese mismo identificador se publica como ancla junto a la imagen en los
[procedimientos del manual](procedures.md), de modo que puede citarse como, por ejemplo,
`cases/catalogs/04-cap-cat-mat-02-create.md#CAP-CAT-MAT-02-CREATE`. La ruta conserva el patrón
`build/docs/screenshots/areas/<área>/<módulo>/NN-description.png`: las pantallas sin sesión también
se duplican por área para que cada ejecución produzca un conjunto completo y autocontenido. Esta
ruta pertenece a los artefactos ignorados por Git y evita incluir PNG en el diff. `NN` expresa el orden
en que el lector recorre el módulo, desde el listado hacia la captura de datos, la edición, las
operaciones que modifican existencias y, al final, la exportación.

Una misma imagen sólo se reutiliza dentro del área cuando la interfaz es realmente la misma. Una
pantalla accesible desde Almacén y Sistemas tiene dos capturas aunque comparta ruta: cada una se
genera con las credenciales de su área y puede mostrar botones distintos. No se crean imágenes de
un archivo Excel descargado.
El ámbito de cada captura sigue al actor de su caso de uso. Las consultas y altas de **Clientes** y
**Proveedores** se generan para Almacén y Sistemas; la edición, el cambio de estado y la exportación
se conservan sólo en Sistemas. Los recorridos de compras, salidas y personas también se capturan con
ambas sesiones. Usuarios, catálogos auxiliares, ajustes absolutos e historiales de movimientos son
exclusivos del Administrador del sistema.
Cuando un listado dispone de un panel **Filtros**, su captura inicial lo muestra desplegado para
que el usuario pueda ubicar los campos y las acciones descritas en el procedimiento.
Cuando un procedimiento requiere sustituir un filtro predeterminado, se incluye además una captura
del valor nuevo ya aplicado y de los resultados que habilitan el paso siguiente.

## Inventario automatizado

La siguiente tabla refleja el arreglo `captures` de `scripts/captureManualScreenshots.js`. Para
comprobar el inventario sin iniciar Nexus ni Playwright se ejecuta
`node scripts/captureManualScreenshots.js --list`.

| Orden | Ámbito | ID | Ruta | Casos de uso |
|---:|---|---|---|---|
| 1 | almacen | `CAP-AUT-01-LOGIN` | `build/docs/screenshots/areas/almacen/access/01-login-session.png` | `CU-AUT-01` |
| 2 | sistemas | `CAP-AUT-01-SISTEMAS-LOGIN` | `build/docs/screenshots/areas/sistemas/access/01-login-session.png` | `CU-AUT-01` |
| 3 | almacen | `CAP-AUT-02-MENU` | `build/docs/screenshots/areas/almacen/access/02-menu-main.png` | `CU-AUT-02` |
| 4 | sistemas | `CAP-AUT-02-SISTEMAS-MENU` | `build/docs/screenshots/areas/sistemas/access/02-menu-main.png` | `CU-AUT-02` |
| 5 | almacen | `CAP-CAT-MAT-00-NAVIGATION` | `build/docs/screenshots/areas/almacen/materials/00-access-menu-main.png` | `CU-ALM-01` |
| 6 | sistemas | `CAP-CAT-MAT-00-NAVIGATION-SISTEMAS` | `build/docs/screenshots/areas/sistemas/materials/00-access-menu-main.png` | `CU-ALM-01` |
| 7 | almacen | `CAP-CAT-MAT-01-LIST` | `build/docs/screenshots/areas/almacen/materials/01-list-inventory.png` | `CU-ALM-01`, `CU-ALM-06` |
| 8 | sistemas | `CAP-CAT-MAT-01-LIST-SISTEMAS` | `build/docs/screenshots/areas/sistemas/materials/01-list-inventory.png` | `CU-ALM-01`, `CU-ALM-06` |
| 9 | almacen | `CAP-CAT-MAT-02-CREATE` | `build/docs/screenshots/areas/almacen/materials/02-form-creation.png` | `CU-ALM-02` |
| 10 | sistemas | `CAP-CAT-MAT-02-CREATE-SISTEMAS` | `build/docs/screenshots/areas/sistemas/materials/02-form-creation.png` | `CU-ALM-02` |
| 11 | almacen | `CAP-CAT-MAT-03-EDIT` | `build/docs/screenshots/areas/almacen/materials/03-form-edit.png` | `CU-ALM-03`, `CU-ALM-04` |
| 12 | sistemas | `CAP-CAT-MAT-03-EDIT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/materials/03-form-edit.png` | `CU-ALM-03`, `CU-ALM-04` |
| 13 | sistemas | `CAP-CAT-MAT-04-STOCK` | `build/docs/screenshots/areas/sistemas/materials/04-adjustment-stock.png` | `CU-ALM-05` |
| 14 | almacen | `CAP-REP-MAT-05-EXPORT` | `build/docs/screenshots/areas/almacen/materials/05-export-report.png` | `CU-ALM-06` |
| 15 | sistemas | `CAP-REP-MAT-05-EXPORT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/materials/05-export-report.png` | `CU-ALM-06` |
| 16 | almacen | `CAP-CAT-SUP-00-NAVIGATION` | `build/docs/screenshots/areas/almacen/suppliers/00-access-menu-main.png` | `CU-CAT-01` |
| 17 | sistemas | `CAP-CAT-SUP-00-NAVIGATION-SISTEMAS` | `build/docs/screenshots/areas/sistemas/suppliers/00-access-menu-main.png` | `CU-CAT-01` |
| 18 | almacen | `CAP-CAT-SUP-01-LIST` | `build/docs/screenshots/areas/almacen/suppliers/01-list.png` | `CU-CAT-01`, `CU-CAT-04` |
| 19 | sistemas | `CAP-CAT-SUP-01-LIST-SISTEMAS` | `build/docs/screenshots/areas/sistemas/suppliers/01-list.png` | `CU-CAT-01`, `CU-CAT-04` |
| 20 | almacen | `CAP-CAT-SUP-02-CREATE` | `build/docs/screenshots/areas/almacen/suppliers/02-form-creation.png` | `CU-CAT-02` |
| 21 | sistemas | `CAP-CAT-SUP-02-CREATE-SISTEMAS` | `build/docs/screenshots/areas/sistemas/suppliers/02-form-creation.png` | `CU-CAT-02` |
| 22 | sistemas | `CAP-CAT-SUP-03-EDIT` | `build/docs/screenshots/areas/sistemas/suppliers/03-form-edit-and-state.png` | `CU-CAT-03`, `CU-CAT-04` |
| 23 | sistemas | `CAP-CAT-SUP-04-EXPORT` | `build/docs/screenshots/areas/sistemas/suppliers/04-export-report.png` | `CU-CAT-04` |
| 24 | almacen | `CAP-CAT-CLI-00-NAVIGATION` | `build/docs/screenshots/areas/almacen/clients/00-access-menu-main.png` | `CU-CAT-05` |
| 25 | sistemas | `CAP-CAT-CLI-00-NAVIGATION-SISTEMAS` | `build/docs/screenshots/areas/sistemas/clients/00-access-menu-main.png` | `CU-CAT-05` |
| 26 | almacen | `CAP-CAT-CLI-01-LIST` | `build/docs/screenshots/areas/almacen/clients/01-list.png` | `CU-CAT-05`, `CU-CAT-08` |
| 27 | sistemas | `CAP-CAT-CLI-01-LIST-SISTEMAS` | `build/docs/screenshots/areas/sistemas/clients/01-list.png` | `CU-CAT-05`, `CU-CAT-08` |
| 28 | almacen | `CAP-CAT-CLI-02-CREATE` | `build/docs/screenshots/areas/almacen/clients/02-form-creation.png` | `CU-CAT-06` |
| 29 | sistemas | `CAP-CAT-CLI-02-CREATE-SISTEMAS` | `build/docs/screenshots/areas/sistemas/clients/02-form-creation.png` | `CU-CAT-06` |
| 30 | sistemas | `CAP-CAT-CLI-03-EDIT` | `build/docs/screenshots/areas/sistemas/clients/03-form-edit.png` | `CU-CAT-07` |
| 31 | sistemas | `CAP-CAT-CLI-04-EXPORT` | `build/docs/screenshots/areas/sistemas/clients/04-export-report.png` | `CU-CAT-08` |
| 32 | almacen | `CAP-CAT-WAS-00-NAVIGATION` | `build/docs/screenshots/areas/almacen/waste/00-access-menu-main.png` | `CU-ALM-09` |
| 33 | sistemas | `CAP-CAT-WAS-00-NAVIGATION-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste/00-access-menu-main.png` | `CU-ALM-09` |
| 34 | almacen | `CAP-CAT-WAS-01-LIST` | `build/docs/screenshots/areas/almacen/waste/01-list-inventory.png` | `CU-ALM-09`, `CU-ALM-14` |
| 35 | sistemas | `CAP-CAT-WAS-01-LIST-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste/01-list-inventory.png` | `CU-ALM-09`, `CU-ALM-14` |
| 36 | almacen | `CAP-CAT-WAS-02-CREATE` | `build/docs/screenshots/areas/almacen/waste/02-form-registration.png` | `CU-ALM-10` |
| 37 | sistemas | `CAP-CAT-WAS-02-CREATE-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste/02-form-registration.png` | `CU-ALM-10` |
| 38 | almacen | `CAP-CAT-WAS-03-EDIT` | `build/docs/screenshots/areas/almacen/waste/03-form-edit.png` | `CU-ALM-11` |
| 39 | sistemas | `CAP-CAT-WAS-03-EDIT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste/03-form-edit.png` | `CU-ALM-11` |
| 40 | sistemas | `CAP-CAT-WAS-04-STOCK` | `build/docs/screenshots/areas/sistemas/waste/04-adjustment-stock.png` | `CU-ALM-12` |
| 41 | almacen | `CAP-REP-WAS-05-EXPORT` | `build/docs/screenshots/areas/almacen/waste/05-export-report.png` | `CU-ALM-14` |
| 42 | sistemas | `CAP-REP-WAS-05-EXPORT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste/05-export-report.png` | `CU-ALM-14` |
| 43 | almacen | `CAP-CAT-WAS-06-ADD-STOCK` | `build/docs/screenshots/areas/almacen/waste/06-add-stock.png` | `CU-ALM-13` |
| 44 | sistemas | `CAP-CAT-WAS-06-ADD-STOCK-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste/06-add-stock.png` | `CU-ALM-13` |
| 45 | sistemas | `CAP-CAT-AREA-01-LIST` | `build/docs/screenshots/areas/sistemas/catalogs/areas/01-list.png` | `CU-CAT-09` |
| 46 | sistemas | `CAP-CAT-AREA-02-CREATE` | `build/docs/screenshots/areas/sistemas/catalogs/areas/02-form-creation.png` | `CU-CAT-10` |
| 47 | sistemas | `CAP-CAT-AREA-03-EDIT` | `build/docs/screenshots/areas/sistemas/catalogs/areas/03-form-edit.png` | `CU-CAT-11` |
| 48 | sistemas | `CAP-CAT-ROLE-01-LIST` | `build/docs/screenshots/areas/sistemas/catalogs/roles/01-list.png` | `CU-CAT-12` |
| 49 | sistemas | `CAP-CAT-ROLE-02-CREATE` | `build/docs/screenshots/areas/sistemas/catalogs/roles/02-form-creation.png` | `CU-CAT-13` |
| 50 | sistemas | `CAP-CAT-ROLE-03-EDIT` | `build/docs/screenshots/areas/sistemas/catalogs/roles/03-form-edit.png` | `CU-CAT-14` |
| 51 | sistemas | `CAP-CAT-PRE-01-LIST` | `build/docs/screenshots/areas/sistemas/catalogs/presentaciones/01-list.png` | `CU-CAT-15` |
| 52 | sistemas | `CAP-CAT-PRE-02-CREATE` | `build/docs/screenshots/areas/sistemas/catalogs/presentaciones/02-form-creation.png` | `CU-CAT-16` |
| 53 | sistemas | `CAP-CAT-PRE-03-EDIT` | `build/docs/screenshots/areas/sistemas/catalogs/presentaciones/03-form-edit.png` | `CU-CAT-17` |
| 54 | sistemas | `CAP-CAT-UNIT-01-LIST` | `build/docs/screenshots/areas/sistemas/catalogs/unidades-medida/01-list.png` | `CU-CAT-18` |
| 55 | sistemas | `CAP-CAT-UNIT-02-CREATE` | `build/docs/screenshots/areas/sistemas/catalogs/unidades-medida/02-form-creation.png` | `CU-CAT-19` |
| 56 | sistemas | `CAP-CAT-UNIT-03-EDIT` | `build/docs/screenshots/areas/sistemas/catalogs/unidades-medida/03-form-edit.png` | `CU-CAT-20` |
| 57 | sistemas | `CAP-CAT-REASON-01-LIST` | `build/docs/screenshots/areas/sistemas/catalogs/motivos-ajuste/01-list.png` | `CU-CAT-21` |
| 58 | sistemas | `CAP-CAT-REASON-02-CREATE` | `build/docs/screenshots/areas/sistemas/catalogs/motivos-ajuste/02-form-creation.png` | `CU-CAT-22` |
| 59 | sistemas | `CAP-CAT-REASON-03-EDIT` | `build/docs/screenshots/areas/sistemas/catalogs/motivos-ajuste/03-form-edit.png` | `CU-CAT-23` |
| 60 | sistemas | `CAP-CAT-STATUS-01-LIST` | `build/docs/screenshots/areas/sistemas/catalogs/estados-cumplimiento/01-list.png` | `CU-CAT-24` |
| 61 | sistemas | `CAP-CAT-STATUS-02-CREATE` | `build/docs/screenshots/areas/sistemas/catalogs/estados-cumplimiento/02-form-creation.png` | `CU-CAT-25` |
| 62 | sistemas | `CAP-CAT-STATUS-03-EDIT` | `build/docs/screenshots/areas/sistemas/catalogs/estados-cumplimiento/03-form-edit.png` | `CU-CAT-26` |
| 63 | almacen | `CAP-ENT-00-NAVIGATION` | `build/docs/screenshots/areas/almacen/purchases/00-access-menu-main.png` | `CU-ENT-01` |
| 64 | sistemas | `CAP-ENT-00-NAVIGATION-SISTEMAS` | `build/docs/screenshots/areas/sistemas/purchases/00-access-menu-main.png` | `CU-ENT-01` |
| 65 | almacen | `CAP-ENT-01-LIST` | `build/docs/screenshots/areas/almacen/purchases/01-list.png` | `CU-ENT-01` |
| 66 | sistemas | `CAP-ENT-01-LIST-SISTEMAS` | `build/docs/screenshots/areas/sistemas/purchases/01-list.png` | `CU-ENT-01` |
| 67 | almacen | `CAP-ENT-02-CREATE` | `build/docs/screenshots/areas/almacen/purchases/02-form-registration.png` | `CU-ENT-02` |
| 68 | sistemas | `CAP-ENT-02-CREATE-SISTEMAS` | `build/docs/screenshots/areas/sistemas/purchases/02-form-registration.png` | `CU-ENT-02` |
| 69 | almacen | `CAP-ENT-03-EDIT` | `build/docs/screenshots/areas/almacen/purchases/03-edit-purchase.png` | `CU-ENT-03`, `CU-ENT-05` |
| 70 | sistemas | `CAP-ENT-03-EDIT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/purchases/03-edit-purchase.png` | `CU-ENT-03`, `CU-ENT-05` |
| 71 | almacen | `CAP-ENT-04-CORRECT` | `build/docs/screenshots/areas/almacen/purchases/04-correction-detail.png` | `CU-ENT-04` |
| 72 | sistemas | `CAP-ENT-04-CORRECT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/purchases/04-correction-detail.png` | `CU-ENT-04` |
| 73 | almacen | `CAP-REP-ENT-05-EXPORT` | `build/docs/screenshots/areas/almacen/purchases/05-export-report.png` | `CU-ENT-06` |
| 74 | sistemas | `CAP-REP-ENT-05-EXPORT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/purchases/05-export-report.png` | `CU-ENT-06` |
| 75 | almacen | `CAP-ENT-06-VIEW` | `build/docs/screenshots/areas/almacen/purchases/06-query-cancelled.png` | `CU-ENT-03`, `CU-ENT-05` |
| 76 | sistemas | `CAP-ENT-06-VIEW-SISTEMAS` | `build/docs/screenshots/areas/sistemas/purchases/06-query-cancelled.png` | `CU-ENT-03`, `CU-ENT-05` |
| 77 | almacen | `CAP-SAL-MAT-00-NAVIGATION` | `build/docs/screenshots/areas/almacen/material-issues/00-access-menu-main.png` | `CU-SAL-01` |
| 78 | sistemas | `CAP-SAL-MAT-00-NAVIGATION-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/00-access-menu-main.png` | `CU-SAL-01` |
| 79 | almacen | `CAP-SAL-MAT-01-LIST` | `build/docs/screenshots/areas/almacen/material-issues/01-list.png` | `CU-SAL-01` |
| 80 | sistemas | `CAP-SAL-MAT-01-LIST-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/01-list.png` | `CU-SAL-01` |
| 81 | almacen | `CAP-SAL-MAT-02-CREATE` | `build/docs/screenshots/areas/almacen/material-issues/02-form-registration.png` | `CU-SAL-02` |
| 82 | sistemas | `CAP-SAL-MAT-02-CREATE-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/02-form-registration.png` | `CU-SAL-02` |
| 83 | almacen | `CAP-SAL-MAT-03-EDIT` | `build/docs/screenshots/areas/almacen/material-issues/03-edit-header.png` | `CU-SAL-03`, `CU-SAL-04` |
| 84 | sistemas | `CAP-SAL-MAT-03-EDIT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/03-edit-header.png` | `CU-SAL-03`, `CU-SAL-04` |
| 85 | almacen | `CAP-SAL-MAT-04-SUPPLY` | `build/docs/screenshots/areas/almacen/material-issues/04-supply-details.png` | `CU-SAL-05` |
| 86 | sistemas | `CAP-SAL-MAT-04-SUPPLY-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/04-supply-details.png` | `CU-SAL-05` |
| 87 | almacen | `CAP-SAL-MAT-05-RETURN` | `build/docs/screenshots/areas/almacen/material-issues/05-return-detail.png` | `CU-SAL-06` |
| 88 | sistemas | `CAP-SAL-MAT-05-RETURN-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/05-return-detail.png` | `CU-SAL-06` |
| 89 | almacen | `CAP-REP-SAL-MAT-06-EXPORT` | `build/docs/screenshots/areas/almacen/material-issues/06-export-report.png` | `CU-SAL-07` |
| 90 | sistemas | `CAP-REP-SAL-MAT-06-EXPORT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/06-export-report.png` | `CU-SAL-07` |
| 91 | almacen | `CAP-SAL-MAT-07-FILTER` | `build/docs/screenshots/areas/almacen/material-issues/07-filter-supplied.png` | `CU-SAL-01`, `CU-SAL-06` |
| 92 | sistemas | `CAP-SAL-MAT-07-FILTER-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/07-filter-supplied.png` | `CU-SAL-01`, `CU-SAL-06` |
| 93 | almacen | `CAP-SAL-MAT-08-VIEW` | `build/docs/screenshots/areas/almacen/material-issues/08-query-cancelled.png` | `CU-SAL-03`, `CU-SAL-04` |
| 94 | sistemas | `CAP-SAL-MAT-08-VIEW-SISTEMAS` | `build/docs/screenshots/areas/sistemas/material-issues/08-query-cancelled.png` | `CU-SAL-03`, `CU-SAL-04` |
| 95 | almacen | `CAP-SAL-WAS-00-NAVIGATION` | `build/docs/screenshots/areas/almacen/waste-issues/00-access-menu-main.png` | `CU-SAL-08` |
| 96 | sistemas | `CAP-SAL-WAS-00-NAVIGATION-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/00-access-menu-main.png` | `CU-SAL-08` |
| 97 | almacen | `CAP-SAL-WAS-01-LIST` | `build/docs/screenshots/areas/almacen/waste-issues/01-list.png` | `CU-SAL-08`, `CU-SAL-14` |
| 98 | sistemas | `CAP-SAL-WAS-01-LIST-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/01-list.png` | `CU-SAL-08`, `CU-SAL-14` |
| 99 | almacen | `CAP-SAL-WAS-02-CREATE` | `build/docs/screenshots/areas/almacen/waste-issues/02-form-registration.png` | `CU-SAL-09` |
| 100 | sistemas | `CAP-SAL-WAS-02-CREATE-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/02-form-registration.png` | `CU-SAL-09` |
| 101 | almacen | `CAP-SAL-WAS-03-EDIT` | `build/docs/screenshots/areas/almacen/waste-issues/03-edit-header.png` | `CU-SAL-10`, `CU-SAL-11` |
| 102 | sistemas | `CAP-SAL-WAS-03-EDIT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/03-edit-header.png` | `CU-SAL-10`, `CU-SAL-11` |
| 103 | almacen | `CAP-SAL-WAS-04-SUPPLY` | `build/docs/screenshots/areas/almacen/waste-issues/04-supply-details.png` | `CU-SAL-12` |
| 104 | sistemas | `CAP-SAL-WAS-04-SUPPLY-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/04-supply-details.png` | `CU-SAL-12` |
| 105 | almacen | `CAP-SAL-WAS-05-RETURN` | `build/docs/screenshots/areas/almacen/waste-issues/05-return-detail.png` | `CU-SAL-13` |
| 106 | sistemas | `CAP-SAL-WAS-05-RETURN-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/05-return-detail.png` | `CU-SAL-13` |
| 107 | almacen | `CAP-REP-SAL-WAS-06-EXPORT` | `build/docs/screenshots/areas/almacen/waste-issues/06-export-report.png` | `CU-SAL-14` |
| 108 | sistemas | `CAP-REP-SAL-WAS-06-EXPORT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/06-export-report.png` | `CU-SAL-14` |
| 109 | almacen | `CAP-SAL-WAS-07-FILTER` | `build/docs/screenshots/areas/almacen/waste-issues/07-filter-supplied.png` | `CU-SAL-08`, `CU-SAL-13` |
| 110 | sistemas | `CAP-SAL-WAS-07-FILTER-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/07-filter-supplied.png` | `CU-SAL-08`, `CU-SAL-13` |
| 111 | almacen | `CAP-SAL-WAS-08-VIEW` | `build/docs/screenshots/areas/almacen/waste-issues/08-query-cancelled.png` | `CU-SAL-10`, `CU-SAL-11` |
| 112 | sistemas | `CAP-SAL-WAS-08-VIEW-SISTEMAS` | `build/docs/screenshots/areas/sistemas/waste-issues/08-query-cancelled.png` | `CU-SAL-10`, `CU-SAL-11` |
| 113 | almacen | `CAP-IDA-PER-00-NAVIGATION` | `build/docs/screenshots/areas/almacen/people/00-access-menu-main.png` | `CU-IDA-01` |
| 114 | sistemas | `CAP-IDA-PER-00-NAVIGATION-SISTEMAS` | `build/docs/screenshots/areas/sistemas/people/00-access-menu-main.png` | `CU-IDA-01` |
| 115 | almacen | `CAP-IDA-PER-01-LIST` | `build/docs/screenshots/areas/almacen/people/01-list.png` | `CU-IDA-01`, `CU-IDA-04` |
| 116 | sistemas | `CAP-IDA-PER-01-LIST-SISTEMAS` | `build/docs/screenshots/areas/sistemas/people/01-list.png` | `CU-IDA-01`, `CU-IDA-04` |
| 117 | almacen | `CAP-IDA-PER-02-CREATE` | `build/docs/screenshots/areas/almacen/people/02-form-creation.png` | `CU-IDA-02` |
| 118 | sistemas | `CAP-IDA-PER-02-CREATE-SISTEMAS` | `build/docs/screenshots/areas/sistemas/people/02-form-creation.png` | `CU-IDA-02` |
| 119 | almacen | `CAP-IDA-PER-03-EDIT` | `build/docs/screenshots/areas/almacen/people/03-form-edit.png` | `CU-IDA-03` |
| 120 | sistemas | `CAP-IDA-PER-03-EDIT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/people/03-form-edit.png` | `CU-IDA-03` |
| 121 | almacen | `CAP-IDA-PER-04-EXPORT` | `build/docs/screenshots/areas/almacen/people/04-export-report.png` | `CU-IDA-04` |
| 122 | sistemas | `CAP-IDA-PER-04-EXPORT-SISTEMAS` | `build/docs/screenshots/areas/sistemas/people/04-export-report.png` | `CU-IDA-04` |
| 123 | sistemas | `CAP-IDA-USR-00-NAVIGATION` | `build/docs/screenshots/areas/sistemas/users/00-access-menu-main.png` | `CU-IDA-05` |
| 124 | sistemas | `CAP-IDA-USR-01-LIST` | `build/docs/screenshots/areas/sistemas/users/01-list.png` | `CU-IDA-05`, `CU-IDA-09` |
| 125 | sistemas | `CAP-IDA-USR-02-CREATE` | `build/docs/screenshots/areas/sistemas/users/02-form-creation.png` | `CU-IDA-06` |
| 126 | sistemas | `CAP-IDA-USR-03-EDIT` | `build/docs/screenshots/areas/sistemas/users/03-form-edit.png` | `CU-IDA-07` |
| 127 | sistemas | `CAP-IDA-USR-04-PASSWORD` | `build/docs/screenshots/areas/sistemas/users/04-change-password.png` | `CU-IDA-08` |
| 128 | sistemas | `CAP-IDA-USR-05-EXPORT` | `build/docs/screenshots/areas/sistemas/users/05-export-report.png` | `CU-IDA-09` |
| 129 | sistemas | `CAP-REP-MOV-MAT-00-NAVIGATION` | `build/docs/screenshots/areas/sistemas/material-movements/00-access-menu-main.png` | `CU-ALM-07` |
| 130 | sistemas | `CAP-REP-MOV-MAT-01-LIST` | `build/docs/screenshots/areas/sistemas/material-movements/01-history-and-filters.png` | `CU-ALM-07` |
| 131 | sistemas | `CAP-REP-MOV-MAT-02-EXPORT` | `build/docs/screenshots/areas/sistemas/material-movements/02-export-report.png` | `CU-ALM-08` |
| 132 | sistemas | `CAP-REP-MOV-WAS-00-NAVIGATION` | `build/docs/screenshots/areas/sistemas/waste-movements/00-access-menu-main.png` | `CU-ALM-15` |
| 133 | sistemas | `CAP-REP-MOV-WAS-01-LIST` | `build/docs/screenshots/areas/sistemas/waste-movements/01-history-and-filters.png` | `CU-ALM-15` |
| 134 | sistemas | `CAP-REP-MOV-WAS-02-EXPORT` | `build/docs/screenshots/areas/sistemas/waste-movements/02-export-report.png` | `CU-ALM-16` |
| 135 | almacen | `CAP-ERR-404-NOT-FOUND` | `build/docs/screenshots/areas/almacen/errors/01-page-not-found.png` | Transversal |
| 136 | sistemas | `CAP-ERR-404-SISTEMAS-NOT-FOUND` | `build/docs/screenshots/areas/sistemas/errors/01-page-not-found.png` | Transversal |

## Cobertura adicional necesaria

Además de las pantallas nombradas directamente por el recorrido principal, el inventario incluye
estados necesarios para explicar decisiones y consecuencias del proceso:

- formularios de **edición**, porque muestran qué información permanece modificable después del
  alta;
- pantallas de **ajuste de existencia**, **surtido**, **devolución**, **corrección** y
  **cancelación**, porque estas acciones afectan inventario o el estado de un documento;
- filtros y, sólo en los reportes que lo ofrecen, diálogos de alcance, porque determinan qué
  información se descarga;
- la navegación autenticada general y el acceso específico de cada módulo, que muestran dónde
  seleccionar cada opción y dónde cerrar sesión sin capturar ni publicar credenciales;
- los catálogos **Roles**, **Áreas**, **Presentaciones**, **Unidades de medida**, **Motivos de ajuste** y **Estados de cumplimiento** dentro de los formularios donde se consumen para documentar su disponibilidad como apoyo técnico, sin tratarlos como casos de uso; las capturas `CAP-CAT-AREA-*`, `CAP-CAT-ROLE-*`, `CAP-CAT-PRE-*`, `CAP-CAT-UNIT-*`, `CAP-CAT-REASON-*` y `CAP-CAT-STATUS-*` cubren además listado, alta y edición de cada pantalla del área Sistemas (`CU-CAT-09` a `CU-CAT-26`).

Los inventarios de materiales y mermas abren un diálogo específico de alcance: **Activos o con
existencia**, **Sólo activos** o **Sólo con existencia**. Se documentan mediante
`CAP-REP-MAT-05-EXPORT` y `CAP-REP-WAS-05-EXPORT`. Los reportes mensuales de compras, salidas y
movimientos conservan su diálogo de mes o filtros aplicados. Proveedores, clientes, personas y
usuarios continúan con descarga directa y reutilizan la captura del listado.

Una línea con el formato `CAP-* -> ruta.png [...]` confirma que esa captura ya fue escrita. Para
los inventarios, el modal debe aparecer antes de esa línea; así la captura representa la selección
del alcance y no un mensaje posterior a la descarga.

## Datos de prueba requeridos

La automatización no crea ni modifica registros. El estado de prueba debe incluir una cuenta
ficticia de **Almacén** con los permisos operativos documentados y otra de **Sistemas** con los
permisos administrativos. El script separa las capturas por área y nunca intenta obtener las de
almacén con la sesión administrativa. La base debe contener, como mínimo:

1. un material y una merma activos que admitan edición y ajuste;
2. una compra abierta con un detalle corregible y cancelable;
3. una salida aprobada y pendiente o parcial para mostrar el surtido de material, y **otra salida
   distinta**, aprobada y completamente surtida, con cantidad aún retornable para mostrar la
   devolución; abrir el modal de surtimiento durante la captura no modifica el primer registro;
4. los estados equivalentes para una salida de merma;
5. una compra cancelada y salidas canceladas de material y merma para comprobar el modo de consulta;
6. al menos una persona, un usuario, un proveedor y un cliente editables;
7. movimientos de material y merma para que los historiales no aparezcan vacíos.

El script recorre todas las páginas del listado filtrado para localizar cada acción visible; el
registro requerido no tiene que aparecer en la primera página y una copia oculta del control,
creada por la vista responsiva de la tabla, no impide seleccionar otra copia visible. Si no
encuentra la acción después de revisar la última página, falla inmediatamente con el identificador,
selector y prerrequisito que debe prepararse, sin esperar nuevamente el tiempo límite de
Playwright. Por ejemplo,
`.btn-return-detail` sólo aparece para una salida
aprobada y completamente surtida; una salida pendiente o parcialmente surtida muestra
`.btn-edit-detail` en su lugar. Este comportamiento es intencional: evita publicar una secuencia
incompleta o incoherente. Para las capturas de surtido, la automatización selecciona directamente
**Surtir detalle** después de acceder al módulo. Para las capturas de devolución, cambia el filtro
predeterminado **Pendiente** a **Surtido**, selecciona **Buscar / filtrar**, espera que terminen la
carga inicial y la actualización filtrada del listado, y sólo entonces busca `.btn-return-detail`,
tanto en salidas de material como de merma. Este recorrido reutiliza el mismo envío de filtros de
tabla usado en compras y los
demás listados. Para las vistas protegidas, el script abre contextos independientes e inicia sesión
con `DOCS_WAREHOUSE_LOGIN_NAME` y `DOCS_WAREHOUSE_LOGIN_PASSWORD` para Almacén, y con
`DOCS_ADMIN_LOGIN_NAME` y `DOCS_ADMIN_LOGIN_PASSWORD` para Sistemas. Como alternativa reutiliza
`DOCS_WAREHOUSE_STORAGE_STATE` o `DOCS_ADMIN_STORAGE_STATE`, respectivamente. La
automatización no obtiene ni guarda esas credenciales: Playwright las escribe directamente en el
formulario de acceso y conserva las cookies resultantes sólo en la memoria del contexto del área
mientras genera las imágenes. No crea archivos de sesión. Las variables `DOCS_*_STORAGE_STATE`
permiten leer archivos de sesión preparados previamente como mecanismo alternativo; nunca se
generan a partir del usuario y la
contraseña. Estos valores sólo se leen del entorno del proceso, no se agregan al archivo `.env`, y
deben retirarse de la terminal al terminar, como indica la
[guía de exportación](../governance/document-export-guide/index.md). La pantalla de inicio de sesión se
toma en un contexto separado y sin autenticación. Una selección compuesta únicamente por capturas
públicas tampoco abre un contexto autenticado ni necesita leer el archivo de sesión del área
correspondiente.

No hace falta ejecutar un comando previo para obtener una sesión cuando se dispone de una cuenta
ficticia: las credenciales pueden definirse en el mismo comando y el inicio de sesión se realiza en
ese momento:

```bash
DOCS_WAREHOUSE_LOGIN_NAME='usuario-almacen' DOCS_WAREHOUSE_LOGIN_PASSWORD='valor-temporal' \
DOCS_ADMIN_LOGIN_NAME='usuario-sistemas' DOCS_ADMIN_LOGIN_PASSWORD='otro-valor-temporal' \
npm run docs:screenshots
```

En PowerShell se definen ambas variables con `$env:` antes del comando y se eliminan al terminar.
Las variables `DOCS_*_STORAGE_STATE` sólo convienen cuando otro flujo controlado ya entrega los
archivos; el repositorio no extrae credenciales ni crea esos archivos, para evitar persistir
secretos.

🟥 **DATO SENSIBLE:** no escriba valores reales en este documento, `.env`, el historial de
shell o archivos versionados. Use secretos efímeros del entorno de desarrollo o CI.

Las líneas indentadas `Paso N/T de CAP-*` describen los filtros y clics necesarios para preparar
**una sola captura**; no indican que se haya escrito otro PNG. Sólo la línea sin sangría
`CAP-* -> ruta.png [...]` confirma la escritura. Después de corregir un prerrequisito puede
reintentarse únicamente la captura fallida, sin regenerar ni eliminar las que ya funcionaron:

```powershell
# PowerShell
$env:DOCS_ALMACEN_CAPTURE_IDS = 'CAP-SAL-WAS-05-RETURN'
npm run docs:screenshots -- --area almacen
Remove-Item Env:DOCS_ALMACEN_CAPTURE_IDS
```

```bash
# Bash; se aceptan varios identificadores separados por comas.
DOCS_ALMACEN_CAPTURE_IDS=CAP-SAL-WAS-05-RETURN npm run docs:screenshots -- --area almacen
```

Si una ejecución completa se interrumpe, `DOCS_ALMACEN_CAPTURE_FROM` permite continuar desde la captura
fallida y generar todas las siguientes sin eliminar las imágenes anteriores:

```powershell
# PowerShell
$env:DOCS_ALMACEN_CAPTURE_FROM = 'CAP-SAL-WAS-00-NAVIGATION'
npm run docs:screenshots -- --area almacen
Remove-Item Env:DOCS_ALMACEN_CAPTURE_FROM
```

```bash
# Bash
DOCS_ALMACEN_CAPTURE_FROM=CAP-SAL-WAS-00-NAVIGATION npm run docs:screenshots -- --area almacen
```

Use el prefijo del área seleccionada: `DOCS_ALMACEN_CAPTURE_IDS` y
`DOCS_ALMACEN_CAPTURE_FROM` para Almacén, o `DOCS_SISTEMAS_CAPTURE_IDS` y
`DOCS_SISTEMAS_CAPTURE_FROM` para Sistemas. No defina ambos mecanismos en la misma ejecución.

Si se recibieron las fuentes sin algunos PNG, el inventario no puede recuperar esos binarios desde
Git porque no se versionan. Sí puede **regenerar automáticamente sólo los archivos ausentes** desde
la interfaz preparada, sin borrar las capturas que ya existen:

```bash
npm run docs:screenshots -- --area almacen --missing
```

Este modo compara las rutas del arreglo `captures` con `build/docs/screenshots/`, reutiliza la
misma sesión, navegación y datos ficticios del flujo completo, y termina sin abrir el navegador si
el inventario ya está completo. No sustituye la revisión visual posterior ni puede reconstruir una
captura sin acceso a Nexus, credenciales y registros de prueba compatibles. No combine `--missing`
con `DOCS_ALMACEN_CAPTURE_IDS` o `DOCS_ALMACEN_CAPTURE_FROM`.

`npm run docs:screenshots -- --area <área>` también comprueba, inicia y detiene una instancia local
de Nexus. El flujo reutiliza una instancia que ya responda en `DOCS_BASE_URL` y sólo detiene la que
haya iniciado él mismo; la selección o reanudación mediante las variables del área permanece a
cargo del mismo inventario.

Cada captura que falla por tiempo de espera se recupera automáticamente en una página nueva desde
su ruta inicial, para descartar navegación, modales o solicitudes pendientes del intento anterior. El
valor predeterminado realiza hasta **dos reintentos** y conserva las capturas anteriores. Puede
ajustarse puntualmente con `DOCS_<AREA>_CAPTURE_RETRIES` (cero desactiva los reintentos) y
`DOCS_<AREA>_CAPTURE_TIMEOUT_MS` (30 000 ms de forma predeterminada), usando `ALMACEN`,
`SISTEMAS` según el comando. Los errores de permisos, selectores
o datos faltantes no se reintentan: requieren corregir el prerrequisito indicado. Si se agotan los
reintentos, use las variables `CAPTURE_IDS` o `CAPTURE_FROM` con el prefijo del área seleccionada.

## Revisión antes de publicar

La primera ejecución recorre el inventario en su orden narrativo. Si se interrumpe, la siguiente
ejecución sin opciones localiza la primera captura ausente, conserva las anteriores y reanuda desde
ese punto; el mensaje de error informa además la última captura terminada. Use `--fresh` cuando
necesite eliminar y regenerar deliberadamente el inventario del área seleccionada.
Una ejecución selectiva con `DOCS_<AREA>_CAPTURE_IDS` elimina y sustituye sólo los PNG solicitados;
una reanudación explícita con `DOCS_<AREA>_CAPTURE_FROM` hace lo mismo con la captura indicada y las
posteriores.
La opción `--list` es sólo de consulta y no elimina archivos.

Después de ejecutar `npm run docs:screenshots`, se debe comprobar que los datos sean ficticios,
que no aparezcan contraseñas, cookies ni datos personales, que los textos sean legibles y que el
estado visible coincida con los casos de uso asignados en la tabla. Cada imagen debe corresponder
al área visible de 1440 × 1000 píxeles, sin agregar el contenido que queda debajo de la pantalla.
En los pasos con modal se conserva el contexto visible que lo rodea; no se recorta sólo el modal.
Sólo entonces las imágenes revisadas se referencian desde el recorrido correspondiente del
manual. Al completar todo el
inventario, si se proporcionaron archivos mediante `DOCS_WAREHOUSE_STORAGE_STATE` o
`DOCS_ADMIN_STORAGE_STATE`, el script elimina automáticamente cada archivo utilizado;
si la ejecución falla, los conserva para permitir un reintento y deben eliminarse manualmente
cuando ya no se vayan a utilizar. Las credenciales automáticas sólo permanecen en las variables del
proceso y deben retirarse de la terminal después de generar las capturas.
