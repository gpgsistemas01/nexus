import { describe, expect, it } from 'vitest';
import { getDiagramFileCoverageErrors, getSequenceLifelineErrors, getSequenceParticipantSources, getSequenceStructureErrors } from '../../../scripts/sequenceDiagramUtils.js';

describe('estructura de secuencias Mermaid', () => {
    it('acepta salidas anticipadas y resultados alternativos con participantes UML', () => {
        const source = `sequenceDiagram
    participant Route@{ "type": "boundary" } as Ruta
    participant Auth@{ "type": "control" } as Autorización
    Route->>Auth: verificar()
    activate Auth
    break Token inválido
        Auth-->>Route: HTTP 401
    end
    alt Permiso concedido
        Auth-->>Route: next()
    else Permiso denegado
        Auth-->>Route: HTTP 403
    end
    deactivate Auth`;

        expect(getSequenceStructureErrors(source)).toEqual([]);
    });

    it('acepta activación y retorno abreviados en los mensajes', () => {
        const source = `sequenceDiagram
    participant UI as Vista
    participant App as Aplicación
    UI->>+App: guardar()
    App-->>-UI: resultado`;

        expect(getSequenceStructureErrors(source)).toEqual([]);
    });

    it('rechaza participantes implícitos y declaraciones duplicadas', () => {
        const errors = getSequenceStructureErrors(`sequenceDiagram
    participant UI as Vista
    participant UI as Otra vista
    UI->>API: enviar()`);

        expect(errors).toContain('participante duplicado: UI');
        expect(errors).toContain('mensaje con participante no declarado: API');
    });

    it('rechaza ramas fuera del fragmento correspondiente y fragmentos sin cierre', () => {
        const errors = getSequenceStructureErrors(`sequenceDiagram
    else Error
    opt Validación
        else Otra rama`);

        expect(errors).toContain('else fuera de alt');
        expect(errors).toContain('fragmento sin cerrar: opt');
    });

    it('rechaza cierres y activaciones que no corresponden a una apertura', () => {
        const errors = getSequenceStructureErrors(`sequenceDiagram
    participant App as Aplicación
    end
    deactivate App
    activate App
    activate App`);

        expect(errors).toContain('end sin fragmento abierto');
        expect(errors).toContain('deactivate sin activate: App');
        expect(errors).toContain('activación sin cerrar: App');
    });
    it('rechaza fragmentos vacíos que producen coordenadas NaN al renderizar', () => {
        const source = `sequenceDiagram
    participant App as Aplicación
    loop Cada detalle pendiente
        %% La validación se desarrolla en otro nivel.
    end`;
        expect(getSequenceStructureErrors(source)).toContain('fragmento vacío: loop');
    });
    it('vincula nombres breves a archivos desde la tabla de participantes', () => {
        const sequence = `sequenceDiagram
    participant View@{ "type": "boundary" } as Formulario
    participant App@{ "type": "control" } as Application`;
        const body = `## Participantes y trazabilidad

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| \`View\` | boundary | \`src/public/js/pages/form.js\` |
| \`App\` | control | \`src/public/js/application/app.js\`<br/>\`src/public/js/application/core.js\` |
| \`Unknown\` | control | \`src/ghost.js\` |

## Secuencia de implementación
`;
        const sources = getSequenceParticipantSources(body, sequence);
        expect(sources.get('App')).toEqual([
            'src/public/js/application/app.js', 'src/public/js/application/core.js'
        ]);
        expect(sources.get('View')).toEqual(['src/public/js/pages/form.js']);
        expect(sources.has('Unknown')).toBe(false);
    });

    it('conserva trazabilidad dentro del diagrama sin tomar tablas ajenas', () => {
        const sequence = `sequenceDiagram
    participant Service as src/services/service.js`;
        const body = '| \`Service\` | control | \`src/other.js\` |';
        expect(getSequenceParticipantSources(body, sequence).get('Service'))
            .toEqual(['src/services/service.js']);
    });

});

describe('cobertura visual de los archivos y sus imports', () => {
    const body = `## Participantes y trazabilidad
| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| \`Config\` | control | \`src/config.js\` |
| \`Factory\` | control | \`src/factory.js\` |

## Composición de archivos
`;
    const sources = new Map([
        ['src/config.js', "import { create } from './factory.js';"],
        ['src/factory.js', 'export const create = () => {};']
    ]);
    const sequence = 'sequenceDiagram\n    participant Factory as factory.js';
    const composition = 'flowchart TB\n    Config["config.js"]\n    Factory["factory.js"]\n    Config -->|import| Factory';

    it('rechaza un configurador que se menciona sólo como contexto', () => {
        expect(getDiagramFileCoverageErrors(body, [sequence], sources))
            .toContain('archivo fuera de los diagramas: Config (src/config.js)');
    });

    it('acepta configurador y cuerpo generado en componentes separados y trazados', () => {
        expect(getDiagramFileCoverageErrors(body, [composition, sequence], sources)).toEqual([]);
    });

    it('rechaza una flecha de import que no existe en el código', () => {
        const reversed = composition.replace('Config -->|import| Factory', 'Factory -->|import| Config');
        expect(getDiagramFileCoverageErrors(body, [reversed, sequence], sources))
            .toContain('dependencia import inexistente: src/factory.js → src/config.js');
    });

    it('distingue un reexport real de un import o una llamada durante la petición', () => {
        const reexports = new Map(sources);
        reexports.set('src/config.js', "export { create } from './factory.js';");
        const graph = composition.replace('|import|', '|reexport|');
        expect(getDiagramFileCoverageErrors(body, [graph], reexports)).toEqual([]);
        expect(getDiagramFileCoverageErrors(body, [composition], reexports))
            .toContain('dependencia import inexistente: src/config.js → src/factory.js');
    });

    it('rechaza componentes sin archivo y extremos implícitos de una dependencia', () => {
        const graph = composition + '\n    Unknown["Otro archivo"]\n    Config -->|import| Missing';
        const errors = getDiagramFileCoverageErrors(body, [graph], sources);
        expect(errors).toContain('componente sin archivo: Unknown');
        expect(errors).toContain('dependencia con componente no declarado: Config → Missing');
    });

    it('rechaza referencias visuales a archivos eliminados', () => {
        const removed = new Map(sources);
        removed.delete('src/factory.js');
        expect(getDiagramFileCoverageErrors(body, [composition], removed))
            .toContain('archivo de componente inexistente: src/factory.js');
    });

    it('rechaza un componente compartido por dos archivos o dos componentes del mismo archivo', () => {
        const grouped = body.replace('`src/config.js`', '`src/config.js`<br/>`src/factory.js`');
        expect(getDiagramFileCoverageErrors(grouped, [composition], sources))
            .toContain('componente Config debe identificar un único archivo');
        const duplicated = body.replace('`src/factory.js`', '`src/config.js`');
        expect(getDiagramFileCoverageErrors(duplicated, [composition], sources))
            .toContain('archivo repetido en componentes Config y Factory: src/config.js');
    });
});

describe('un archivo por línea de vida', () => {
    const externals = new Set(['Navegador', 'Prisma / PostgreSQL']);
    const trace = (rows) => `## Participantes y trazabilidad\n\n${rows}\n\n## Secuencia de implementación\n`;

    it('acepta archivos distintos, actor y fronteras externas declaradas', () => {
        const source = `sequenceDiagram
    actor User as Usuario
    participant Browser as Navegador
    participant App as Aplicación
    participant Request as Request
    participant DB@{ "type": "database" } as Prisma / PostgreSQL`;
        const body = trace('| `App` | control | `src/app.js` |\n| `Request` | boundary | `src/request.js` |');
        expect(getSequenceLifelineErrors(body, source, externals)).toEqual([]);
    });

    it('rechaza la agrupación de configurador y cuerpo generado en una línea', () => {
        const body = trace('| `App` | control | `src/config.js`<br/>`src/factory.js` |');
        expect(getSequenceLifelineErrors(body, 'participant App as Aplicación', externals))
            .toContain('línea de vida App debe corresponder a un único archivo (encontrados: 2)');
    });

    it('rechaza dos líneas para el interceptor y su variable de estado del mismo archivo', () => {
        const body = trace('| `Api` | control | `src/api.js` |\n| `Refresh` | control | `src/api.js` |');
        const source = 'participant Api as Interceptor\nparticipant Refresh as Renovación';
        expect(getSequenceLifelineErrors(body, source, externals))
            .toContain('archivo repetido en líneas de vida Api y Refresh: src/api.js');
    });

    it('rechaza participantes sin archivo que no sean límites externos reconocidos', () => {
        expect(getSequenceLifelineErrors('', 'participant Service as Servicio', externals))
            .toContain('línea de vida Service debe corresponder a un único archivo (encontrados: 0)');
    });

    it('permite reutilizar el mismo archivo en dos niveles complementarios', () => {
        const body = trace('| `Core` | control | `src/core.js` |\n| `Helper` | control | `src/helper.js` |');
        expect(getSequenceLifelineErrors(body, 'participant Core as Núcleo', externals)).toEqual([]);
        expect(getSequenceLifelineErrors(body, 'participant Core as Núcleo\nparticipant Helper as Helper', externals)).toEqual([]);
    });

    it('detecta que un nombre heredado y la tabla apuntan a archivos diferentes', () => {
        const body = trace('| `App` | control | `src/other.js` |');
        expect(getSequenceLifelineErrors(body, 'participant App as src/app.js', externals))
            .toContain('línea de vida App debe corresponder a un único archivo (encontrados: 2)');
    });
});
