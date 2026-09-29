import { describe, expect, it } from 'vitest';

import {
    getFigureSizeAttribute,
    getPngDimensions
} from '../../../scripts/documentExportImageUtils.js';

const pngHeader = (width, height) => {
    const image = Buffer.alloc(24);
    Buffer.from('89504e470d0a1a0a', 'hex').copy(image);
    image.writeUInt32BE(width, 16);
    image.writeUInt32BE(height, 20);
    return image;
};

describe('documentExportImageUtils', () => {
    it('lee las dimensiones declaradas en una imagen PNG', () => {
        expect(getPngDimensions(pngHeader(1200, 1800))).toEqual({ width: 1200, height: 1800 });
        expect(getPngDimensions(Buffer.from('not a png'))).toBeNull();
    });

    it('limita por altura las figuras verticales sin fijar también su ancho', () => {
        expect(getFigureSizeAttribute({ width: 1200, height: 1800 })).toBe('height=7in');
    });

    it('mantiene el límite de ancho para figuras horizontales y formatos desconocidos', () => {
        expect(getFigureSizeAttribute({ width: 1440, height: 1000 })).toBe('width=90%');
        expect(getFigureSizeAttribute(null)).toBe('width=90%');
    });
});
