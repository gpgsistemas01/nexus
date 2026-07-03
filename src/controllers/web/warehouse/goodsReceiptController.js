export const getGoodsReceiptsPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/warehouse/goodsReceipts/goodsReceiptsPage', {
        currentRoute: '/compras',
        user
    });
}