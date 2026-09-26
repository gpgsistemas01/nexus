# 2. Orden de publicación

Cada entrega exportable conserva este orden:

1. portada: producto, título del documento, versión del sistema, versión documental, fecha,
   estado y responsable;
2. tabla **Datos generales del documento**;
3. control de cambios y aprobaciones;
4. tabla de contenido generada;
5. propósito, audiencia, alcance y exclusiones;
6. contenido principal;
7. trazabilidad, glosario, referencias y anexos.

La tabla **Datos generales del documento** pertenece únicamente al archivo de entrada de
cada paquete exportable y se ubica inmediatamente después de su título. Registra versión
documental, versión del sistema, estado, fecha y responsable. El exportador inserta la
tabla de contenido después de estos datos generales; los capítulos, anexos y artefactos
generados no repiten la tabla porque forman parte del mismo documento publicado.

Los paquetes recomendados son **Requisitos**, **Datos, acceso y operación**, **Diseño y
arquitectura**, **Plan y evidencia de pruebas** y **Manual de usuario**. Cada paquete tiene su
propio archivo de entrada y carpeta de imágenes; no se exporta toda la carpeta `docs` como un
único documento. El paquete de datos incorpora tanto los documentos curados de `docs/data/`
como el esquema y el diccionario de `docs/generated/`; estos últimos se regeneran desde Prisma
antes de exportar y no se editan manualmente. El contrato API pertenece al paquete de arquitectura
porque describe la interfaz HTTP y el transporte JSON; no se incluye en datos por el solo hecho de
que sus cuerpos transporten información.

Los manuales por actor conservan su propia entrada y reutilizan `overview.md` y
`procedures.md`; así comparten las indicaciones generales y las convenciones de los casos sin
duplicarlas ni sustituir la portada del actor. Sus documentos siguen los módulos y destinos
visibles de `src/views/layout/ui/navList.ejs` y filtran los procedimientos según los permisos del
área; la carpeta técnica donde vive un caso no determina el nombre ni el alcance del entregable.
Las exportaciones y sus secuencias pertenecen al módulo que inicia la consulta, por lo que no se
publica un documento independiente de reportes sin recorrido propio en la navegación.

Las colecciones extensas de requisitos se mantienen en Markdown por grupo funcional bajo
`requirements/use-cases/` y `requirements/diagrams/`, con un archivo por cada `CU-*`. Los
diagramas transversales viven en su propia colección y cada procedimiento del manual se separa
bajo `user-manual/cases/<área>/`. Esta división permite revisar y navegar un caso sin cargar
las demás fichas, figuras o instrucciones, mientras el manifiesto `requisitos` conserva la
entrega completa requerida para auditoría como una carpeta de documentos por sección y grupo
funcional, en lugar de ensamblar un único archivo difícil de revisar. Arquitectura sigue el mismo
criterio: separa vistas, documentación técnica, contrato, trazabilidad, convenciones y las
secuencias por perspectiva y grupo. Dividir la fuente o la salida no crea copias normativas ni cambia
los identificadores `CU-*` y `DIA-*`.
