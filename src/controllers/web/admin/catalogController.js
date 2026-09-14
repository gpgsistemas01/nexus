import { getManagedCatalog } from '../../../services/admin/catalogService.js';

export const getCatalogsPage = async (req, res) => res.render('pages/admin/catalogs/catalogsPage', {
    currentRoute: `/catalogos/${ req.params.catalog }`,
    catalog: getManagedCatalog(req.params.catalog),
    user: req.user
});
