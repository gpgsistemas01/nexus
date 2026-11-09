// Encabezado, campo del reporte y campo de captura. Mantiene el orden familiar de consulta.
export const INVENTORY_SPREADSHEET_COLUMNS = Object.freeze([
    ['Proveedor', 'supplier', 'supplierName'],
    ['Material', 'name', 'name'],
    ['Base', 'base', 'base'],
    ['Altura', 'height', 'height'],
    ['Stock actual', 'currentStock', 'currentStock'],
    ['Stock mínimo', 'minStock', 'minStock'],
    ['Presentación', 'presentation', 'presentationName'],
    ['Conversión', 'convertedQuantity', 'convertedQuantity'],
    ['Unidad', 'unitMeasure', 'unitLabel'],
    ['Costo unitario', 'maxUnitCost', 'maxUnitCost']
].map(column => Object.freeze(column)));
