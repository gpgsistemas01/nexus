export const buildProductSelectText = (product = {}) => {

    const supplierName = product.supplier?.tradeName || product.supplierName || '';
    const productName = product.productName || product.name || '';
    const productBase = product.productBase ?? product.base;
    const productHeight = product.productHeight ?? product.height;

    if (!productBase || !productHeight) return `${ productName } || ${ supplierName }`;

    return `${ productName } (${ productBase } x ${ productHeight }) || ${ supplierName }`;
};

export const mapProductToSelectData = (product = {}) => ({
    id: product.id,
    text: buildProductSelectText(product),
    productName: product.name,
    presentationName: product.presentation?.name,
    unitMeasureName: product.unitMeasure?.name,
    productBase: product.base,
    productHeight: product.height,
    supplierName: product.supplier?.tradeName,
    supplierId: product.supplier?.id
});


export const mapSupplierProductToSelectData = (supplierProduct = {}) => {

    const product = supplierProduct.product || supplierProduct;

    return {
        id: supplierProduct.supplierProductId,
        text: buildProductSelectText({
            ...product,
            base: supplierProduct.productBase ?? product.base ?? supplierProduct.base,
            height: supplierProduct.productHeight ?? product.height ?? supplierProduct.height,
            supplier: supplierProduct.supplier || product.supplier,
            supplierName: supplierProduct.supplierName
        }),
        presentationName: product.presentation?.name,
        unitMeasureName: product.unitMeasure?.name
    };
};
