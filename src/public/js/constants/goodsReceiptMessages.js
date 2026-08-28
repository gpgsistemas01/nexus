export const buildGoodsReceiptInvoiceAlreadyExistsMessage = ({ existingReferenceNumber } = {}) => {
    const reference = existingReferenceNumber
        ? ` (${ existingReferenceNumber })`
        : '';

    return `La factura ya está registrada en otra compra${ reference }. Edita esa compra para agregar los materiales faltantes; crea una compra nueva únicamente cuando corresponda a otra factura o recepción`;
};
