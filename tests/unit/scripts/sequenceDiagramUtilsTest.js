import { describe, expect, it } from 'vitest';
import { getSequenceLifelineErrors, getSequenceParticipantSources, getSequenceStructureErrors } from '../../../scripts/sequenceDiagramUtils.js';

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
