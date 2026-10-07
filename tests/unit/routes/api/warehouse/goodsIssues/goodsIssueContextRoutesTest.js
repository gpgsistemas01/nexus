import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
const authorizeUserApi = vi.fn(permission => `authorize:${permission}`);
const verifyApiTokenRequired = vi.fn();
const validate = vi.fn();
const handlers = vi.hoisted(() => Object.fromEntries(['Material', 'Consumable'].flatMap(label => [
    `getAll${label}GoodsIssues`, `register${label}GoodsIssue`, `edit${label}GoodsIssue`,
    `edit${label}GoodsIssueHeader`, `edit${label}GoodsIssueDetails`, `register${label}GoodsIssueDetailReturn`
].map(name => [name, vi.fn()]))));

vi.mock('express', () => ({ default: { Router: () => ({ get, post, patch }) } }));
vi.mock('../../../../../../src/middleware/authMiddleware.js', () => ({ authorizeUserApi, verifyApiTokenRequired }));
vi.mock('../../../../../../src/middleware/validatorMiddleware.js', () => ({ validate }));
vi.mock('../../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js', () => handlers);
vi.mock('../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js', () => handlers);

const validators = await import('../../../../../../src/validators/forms/goodsIssueValidations.js');
await import('../../../../../../src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js');
await import('../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js');
const { PERMISSIONS } = await import('../../../../../../src/constants/permissions.js');

describe('rutas de salida separadas por contexto', () => {
    it.each([['materials', 'Material'], ['consumables', 'Consumable']])('registra el flujo completo de %s con permisos y validadores', (path, label) => {
        const manage = `authorize:${PERMISSIONS.GOODS_ISSUES_MANAGE}`;
        const supply = `authorize:${PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE}`;
        expect(get).toHaveBeenCalledWith('/', verifyApiTokenRequired, manage, handlers[`getAll${label}GoodsIssues`]);
        expect(post).toHaveBeenCalledWith('/', verifyApiTokenRequired, validators.goodsIssueValidation, validate, manage, handlers[`register${label}GoodsIssue`]);
        for (const [suffix, validation, permission, handler] of [
            ['', validators.goodsIssueUpdateValidation, manage, `edit${label}GoodsIssue`],
            ['/header', validators.goodsIssueHeaderValidation, manage, `edit${label}GoodsIssueHeader`],
            ['/details', validators.goodsIssueDetailsValidation, supply, `edit${label}GoodsIssueDetails`],
            ['/details/:detailId/returns', validators.goodsIssueReturnValidation, supply, `register${label}GoodsIssueDetailReturn`]
        ]) {
            expect(patch).toHaveBeenCalledWith(`/:id${suffix}`, verifyApiTokenRequired, validation, validate, permission, handlers[handler]);
        }
    });
});
