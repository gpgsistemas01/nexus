import { INVENTORY_RESOURCES } from '../../../../constants/inventory.js';

const renderGoodsReceiptsPage = ({ req, res, resource }) => {

    const { user } = req;

    return res.render('pages/warehouse/goodsReceipts/goodsReceiptsPage', {
        currentRoute: `/compras/${ resource === INVENTORY_RESOURCES.CONSUMABLE ? 'consumibles' : 'materiales' }`,
        inventoryResource: resource,
        user
    });
};

export const getMaterialGoodsReceiptsPage = (req, res) => renderGoodsReceiptsPage({
    req,
    res,
    resource: INVENTORY_RESOURCES.MATERIAL
});

export const getConsumableGoodsReceiptsPage = (req, res) => renderGoodsReceiptsPage({
    req,
    res,
    resource: INVENTORY_RESOURCES.CONSUMABLE
});
