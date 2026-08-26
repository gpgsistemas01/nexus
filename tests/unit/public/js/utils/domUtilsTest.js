import { describe, expect, it } from 'vitest';
import { scopeSelectors } from '../../../../../src/public/js/utils/domUtils.js';

describe('utilidades DOM compartidas por los CRUD', () => {
    it('limita un mapa de selectores al modal que compone el formulario', () => {
        expect(scopeSelectors({
            scopeSelector: '#wasteModal',
            selectors: {
                supplier: '.supplier-select',
                material: '#materialInput'
            }
        })).toEqual({
            supplier: '#wasteModal .supplier-select',
            material: '#wasteModal #materialInput'
        });
    });
});
