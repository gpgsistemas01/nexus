import { describe, expect, it } from 'vitest';
import { getSequenceStructureErrors } from '../../../scripts/sequenceDiagramUtils.js';

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
});
