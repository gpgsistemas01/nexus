import { describe, expect, it } from 'vitest';
import {
    hasInvalidSvgGeometry,
    normalizeMermaidSource
} from '../../../scripts/mermaidExportUtils.js';

describe('mermaidExportUtils', () => {
    it('normaliza saltos serializados y participantes experimentales', () => {
        expect(normalizeMermaidSource(
            'sequenceDiagram\\n    participant Api@{ "type": "boundary" } as API\\n    Api-->>Api: ok'
        )).toBe('sequenceDiagram\n    participant Api as API\n    Api-->>Api: ok\n');
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
});
