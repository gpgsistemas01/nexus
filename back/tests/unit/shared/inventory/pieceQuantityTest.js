import { describe, expect, it } from 'vitest';
import { getPieceQuantityError, isPiecePresentation, PIECE_QUANTITY_MESSAGE } from '../../../../src/shared/inventory/pieceQuantity.js';

describe('cantidades físicas de piezas', () => {
    it.each(['PIEZA', ' pieza ', 'Piezas'])('reconoce %s sin depender de mayúsculas', presentation => {
        expect(isPiecePresentation(presentation)).toBe(true);
        expect(getPieceQuantityError(1.5, presentation)).toBe(PIECE_QUANTITY_MESSAGE);
    });

    it.each([0, 1, '2.00', 99999999])('acepta el entero %s sin modificarlo', quantity => {
        expect(getPieceQuantityError(quantity, 'PIEZA')).toBeNull();
    });

    it.each([0.01, 1.000001, '2.5'])('rechaza la fracción %s sin redondearla', quantity => {
        expect(getPieceQuantityError(quantity, 'PIEZA')).toBe(PIECE_QUANTITY_MESSAGE);
    });

    it.each(['ROLLO', 'LITRO', undefined])('conserva fracciones en %s', presentation => {
        expect(getPieceQuantityError(0.5, presentation)).toBeNull();
    });
});
