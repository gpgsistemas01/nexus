import { INVENTORY_RESOURCES } from '../../../../constants/inventory.js';

const renderGoodsIssuesPage = ({ req, res, resource }) => {

    const { user } = req;

    return res.render('pages/warehouse/goodsIssues/goodsIssuesPage', {
        currentRoute: `/salidas/${ resource === INVENTORY_RESOURCES.CONSUMABLE ? 'consumibles' : 'materiales' }`,
        inventoryResource: resource,
        user
    });
};

export const getMaterialGoodsIssuesPage = (req, res) => renderGoodsIssuesPage({
    req,
    res,
    resource: INVENTORY_RESOURCES.MATERIAL
});

export const getConsumableGoodsIssuesPage = (req, res) => renderGoodsIssuesPage({
    req,
    res,
    resource: INVENTORY_RESOURCES.CONSUMABLE
});
