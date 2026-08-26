import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectMocks = vi.hoisted(() => ({
    bindDisabledSelectDependency: vi.fn(),
    initReasonSelect: vi.fn(),
    initWasteMaterialTemplateSelect: vi.fn(),
    setupSupplierSelect: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/plugins/select2/baseSelect.js', () => ({
    bindDisabledSelectDependency: selectMocks.bindDisabledSelectDependency
}));
vi.mock('../../../../../../../src/public/js/plugins/select2/domains/reason.js', () => ({
    initReasonSelect: selectMocks.initReasonSelect,
    toggleReasonOption: vi.fn()
}));
vi.mock('../../../../../../../src/public/js/plugins/select2/domains/supplier.js', () => ({
    setupSupplierSelect: selectMocks.setupSupplierSelect,
    toggleSupplierOption: vi.fn()
}));
vi.mock('../../../../../../../src/public/js/plugins/select2/domains/wasteMaterialTemplate.js', () => ({
    initWasteMaterialTemplateSelect: selectMocks.initWasteMaterialTemplateSelect,
    toggleWasteMaterialTemplateOption: vi.fn()
}));

const { initWasteSelect2 } = await import(
    '../../../../../../../src/public/js/plugins/select2/modules/wasteSelect.js'
);

describe('selectores del CRUD de mermas', () => {
    beforeEach(() => vi.clearAllMocks());

    it('bloquea la búsqueda de material hasta seleccionar un proveedor', () => {
        initWasteSelect2({ modalSelector: '#wasteModal' });

        expect(selectMocks.bindDisabledSelectDependency).toHaveBeenCalledWith(expect.objectContaining({
            sourceSelector: '#wasteModal .supplier-select',
            targetSelector: '#wasteModal #materialInput',
            disabledMessage: 'Seleccione un proveedor antes de buscar material.'
        }));
    });
});
