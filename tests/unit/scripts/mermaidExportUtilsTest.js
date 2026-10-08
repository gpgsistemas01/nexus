import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
    hasInvalidSvgGeometry,
  getMermaidImageId,
    normalizeMermaidSource
} from '../../../scripts/mermaidExportUtils.js';

describe('mermaidExportUtils', () => {
    it('normaliza saltos serializados sin perder la notación UML', () => {
        expect(normalizeMermaidSource(
            'sequenceDiagram\\n    participant Api@{ "type": "boundary" } as API\\n    Api-->>Api: ok'
        )).toBe('sequenceDiagram\n    participant Api@{ "type": "boundary" } as API\n    Api-->>Api: ok\n');
    });

    it('conserva el Mermaid estable sin cambios', () => {
        const source = 'flowchart LR\n    start --> finish\n';

        expect(normalizeMermaidSource(source)).toBe(source);
    });

    it('detecta coordenadas no finitas reportadas por Chromium', () => {
        expect(hasInvalidSvgGeometry('Error: <rect> attribute y: Expected length, "NaN".')).toBe(true);
        expect(hasInvalidSvgGeometry('Error: <line> attribute y2: Expected length, "-Infinity".')).toBe(true);
        expect(hasInvalidSvgGeometry('Generating single mermaid chart')).toBe(false);
    });

    it('separa la caché UML de las imágenes anteriores basadas sólo en la fuente', () => {
        const source = 'sequenceDiagram\n    participant Api@{ "type": "control" } as API\n';
        const oldId = createHash('sha256').update(source).digest('hex').slice(0, 16);

        expect(getMermaidImageId(source)).not.toBe(oldId);
        expect(getMermaidImageId(source)).toBe(getMermaidImageId(source));
        expect(getMermaidImageId(source + '    Api->>Api: call()\n')).not.toBe(getMermaidImageId(source));
    });
});
