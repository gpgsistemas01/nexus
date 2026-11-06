export const PIECE_QUANTITY_MESSAGE = 'Las cantidades con presentación PIEZA deben ser enteras.';

export const isPiecePresentation = name => /^(PIEZA|PIEZAS)$/.test(String(name ?? '').trim().toLocaleUpperCase('es-MX'));

export const getPieceQuantityError = (value, presentationName) => (
    isPiecePresentation(presentationName)
    && Number.isFinite(Number(value))
    && !Number.isInteger(Number(value))
        ? PIECE_QUANTITY_MESSAGE
        : null
);
