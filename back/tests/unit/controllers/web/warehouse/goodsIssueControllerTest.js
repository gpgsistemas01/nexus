import { describe, expect, it, vi } from 'vitest';
import ejs from 'ejs';
import { getMaterialGoodsIssuesPage, getConsumableGoodsIssuesPage } from '../../../../../src/controllers/web/warehouse/goodsIssues/goodsIssueController.js';

const navPath = 'src/views/layout/ui/navList.ejs';

describe('páginas de salidas por recurso', () => {
    it.each([
        ['materiales', 'material'],
        ['consumibles', 'consumable']
    ])('renderiza el contexto y la navegación de %s', async (path, resource) => {
        const user = { id: 'user-1' };
        const render = vi.fn();
        const handler = resource === 'consumable' ? getConsumableGoodsIssuesPage : getMaterialGoodsIssuesPage;
        await handler({ baseUrl: `/salidas/${path}`, user }, { render });
        expect(render).toHaveBeenCalledWith('pages/warehouse/goodsIssues/goodsIssuesPage', {
            currentRoute: `/salidas/${path}`, inventoryResource: resource, user
        });
    });

    it.each([true, false])('mantiene la opción activa en navegación con etiquetas=%s', async showLabels => {
        const html = await ejs.renderFile(navPath, {
            currentRoute: '/salidas/consumibles', user: {}, listClass: '', showLabels,
            hasPermission: (_, permission) => permission === 'goods:issues-page-view'
        });
        expect(html).toMatch(/class="[^"]*active[^"]*" href="\/salidas\/consumibles"\s+aria-current="page"/);
        expect(html).toContain('Consumibles');
    });

    it('oculta el acceso a salidas de consumibles sin permiso', async () => {
        const html = await ejs.renderFile(navPath, {
            currentRoute: '/salidas/consumibles', user: {}, listClass: '',
            hasPermission: () => false
        });
        expect(html).not.toContain('/salidas/consumibles');
    });
});
