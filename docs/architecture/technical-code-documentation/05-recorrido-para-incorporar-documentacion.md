# 5. Recorrido para incorporar documentación

El siguiente diagrama decide el destino de una explicación nueva. No representa el
flujo de ejecución de Nexus; representa el mantenimiento documental de un cambio de
código.

```mermaid
flowchart TB
    change["Cambio de código"] --> existing{"¿Existe una vista o artefacto<br/>propietario para la pregunta?"}
    existing -->|Sí| update["Actualizar o enlazar<br/>la fuente existente"]
    existing -->|No| scope{"¿La explicación es local<br/>a un contrato complejo?"}
    scope -->|Sí| inline["Agregar comentario o JSDoc<br/>junto al código"]
    scope -->|No| view{"¿Una relación o secuencia<br/>se comprende mejor visualmente?"}
    view -->|Sí| diagram["Agregar vista Mermaid curada<br/>en la familia correspondiente"]
    view -->|No| prose["Agregar sección Markdown<br/>en el artefacto propietario"]
    update --> derived{"¿Cambió router, import<br/>entre áreas o Prisma?"}
    inline --> derived
    diagram --> derived
    prose --> derived
    derived -->|Sí| generate["Ejecutar docs:architecture"]
    derived -->|No| validate["Revisar enlaces y alcance"]
    generate --> validate
    validate --> check["Ejecutar docs:check"]
```

Las reglas de notación, nivel de detalle y mantenimiento de una vista nueva permanecen
en las [convenciones de diagramas](../diagram-conventions/03-patron-minimo-de-cada-diagrama.md#3-patrón-mínimo-de-cada-diagrama).
En particular, primero se reutiliza la progresión existente de contexto, contenedores,
estructura, dinámica, reutilización y detalle generado.
