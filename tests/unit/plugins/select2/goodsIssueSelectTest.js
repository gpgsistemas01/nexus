import { afterEach, describe, expect, it, vi } from 'vitest';

const setupMaterialSelect = vi.fn();
const init = vi.fn();
vi.mock('../../../../src/public/js/plugins/select2/domains/material.js', () => ({
    setupMaterialSelect, toggleMaterialOption: vi.fn()
}));
vi.mock('../../../../src/public/js/plugins/select2/modules/issueHeaderSelect.js', () => ({
    createIssueHeaderSelects: () => ({ init, setOptions: vi.fn(), syncState: vi.fn() })
}));

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('Select2 de salidas', () => {
    it.each(['material', 'consumable'])('consulta el catálogo de %s sin permitir creación', async resource => {
        vi.resetModules();
        vi.stubGlobal('document', { getElementById: () => ({ dataset: { resource } }) });
        const { getGoodsIssueHeaderSelects } = await import('../../../../src/public/js/plugins/select2/modules/goodsIssueSelect.js');
        getGoodsIssueHeaderSelects().init();
        expect(init).toHaveBeenCalled();
        expect(setupMaterialSelect).toHaveBeenCalledWith(expect.objectContaining({ resource, allowCreate: false }));
    });
});
