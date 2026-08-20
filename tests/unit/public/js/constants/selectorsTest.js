import { describe, expect, it } from 'vitest';
import {
    BUTTON_SELECTORS,
    FORM_SELECTORS,
    HEADING_SELECTORS,
    INPUT_SELECTORS,
    MODAL_SELECTORS,
    SELECT_SELECTORS
} from '../../../../../src/public/js/constants/selectors.js';

describe('selectores compartidos de los CRUD', () => {
    it('separa formularios, modales y controles por tipo de elemento', () => {
        expect(FORM_SELECTORS.GOODS_RECEIPT_CORRECTION).toBe('#goodsReceiptCorrectionForm');
        expect(MODAL_SELECTORS.GOODS_RECEIPT_CORRECTION).toBe('#goodsReceiptCorrectionModal');
        expect(INPUT_SELECTORS.QUANTITY).toBe('#quantityInput');
        expect(SELECT_SELECTORS.MATERIAL).toBe('#materialInput');
        expect(BUTTON_SELECTORS.ADD_MATERIAL).toBe('#addMaterialBtn');
        expect(HEADING_SELECTORS.MODAL_TITLE).toBe('#modalTitle');
    });

    it('mantiene nombres de recurso uniformes para los formularios CRUD', () => {
        expect(FORM_SELECTORS).toMatchObject({
            CLIENT: '#clientForm',
            MATERIAL: '#materialForm',
            PERSON: '#personForm',
            SUPPLIER: '#supplierForm',
            USER: '#userForm',
            WASTE: '#wasteForm'
        });
    });
});
