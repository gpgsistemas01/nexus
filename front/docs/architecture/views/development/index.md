# Vista de desarrollo: organización del código

Esta vista de la arquitectura 4+1 describe las unidades de código y cómo se componen:
`app` integra la aplicación, `modules` agrupa las capacidades del negocio y `shared`
reúne colaboradores transversales. Permite localizar una responsabilidad y entender
los mecanismos que reutilizan sus consumidores.

| Consulta | Documento |
| --- | --- |
| Ubicación de archivos y composición entre dominios | [Estructura del código](code-structure.md). |
| Funcionamiento de un mecanismo reutilizado | [Patrones generales y aplicaciones concretas](design-and-construction-patterns/index.md). |
| Integración de validadores, utilidades y datos públicos en Vue | [Reglas públicas y presentación de datos](input-handling.md). |
| Archivos, exports e imports declarados | [Referencia generada de código](code-reference.md). |

Para una primera lectura, la [guía de incorporación](developer-onboarding.md) sigue
una edición desde la ruta hasta sus pruebas. La [vista lógica](../logical/index.md)
representa colaboradores, datos y estados; los patrones de esta vista explican
cómo se construyen esas colaboraciones con componentes, funciones y contratos.

La instalación y los comandos se consultan en [Entorno y flujo de trabajo](../../../development/index.md).
