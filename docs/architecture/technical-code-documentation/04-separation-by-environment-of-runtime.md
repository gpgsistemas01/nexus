# 4. Separación por entorno de ejecución

La documentación técnica se divide por responsabilidad para evitar mezclar contratos
HTTP y reglas de servidor con interacción del navegador:

- [Backend: controladores y servicios](../backend-technical-documentation/index.md) documenta
  rutas internas, adaptación HTTP, DTO, reglas de dominio, errores, transacciones y
  persistencia.
- [Frontend: navegador e interfaz](../frontend-technical-documentation/index.md) documenta
  servicios HTTP del cliente, aplicaciones, páginas, formularios, UI compartida,
  plugins y composición EJS.

Ambas referencias incluyen una matriz de aplicación al código con una fila para cada
`CU-*`. Esa matriz es la cobertura completa; los diagramas dinámicos se reservan para
los casos cuya coordinación necesita una secuencia o actividad y no sustituyen la
documentación de los casos directos.
Las colecciones completas están en los [diagramas frontend aplicados al
código](../frontend-code-sequences/index.md) y los [diagramas backend aplicados al
código](../backend-code-sequences/index.md); ambas conservan una vista independiente para
cada uno de los 73 casos, incluso cuando la forma de la colaboración se repite.
Cada vista específica declara únicamente los códigos de los patrones aplicados y deja
su explicación en el catálogo canónico; el bloque Mermaid muestra directamente el
recorrido particular. Las secuencias y actividades que necesitan mayor profundidad se
mantienen en **Vistas técnicas aplicadas** del backend y **Vistas técnicas aplicadas por
flujo frontend**, sin convertir la infraestructura compartida en otro salto de lectura.
Esta cobertura no es opcional ni se limita a los casos con coordinación compleja: cada
fila vigente del catálogo debe existir en ambas matrices y debe tener exactamente un
bloque Mermaid identificado en cada colección. `npm run docs:check` compara esos cuatro
artefactos con el catálogo para impedir que un caso nuevo quede documentado sólo en
frontend o sólo en backend.

Un flujo completo enlaza ambos documentos mediante la ruta API; no repite en frontend
las reglas propietarias del servidor ni describe en backend detalles visuales del DOM.
