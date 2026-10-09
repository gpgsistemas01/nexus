import { describe, expect, it } from 'vitest';
import { getSequenceParticipantSources, getSequenceStructureErrors } from '../../../scripts/sequenceDiagramUtils.js';

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
